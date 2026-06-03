# Jemla POS — Technical Context

## Architecture Overview

```
┌─────────────────────────────┐     HTTP (proxy)     ┌──────────────────────────────┐
│   Frontend (Vite SPA)       │ ◄──────────────────► │   Backend (Express API)      │
│                             │    localhost:5173     │                              │
│   React 18 + React Router   │    ───► /api/*        │   Port 3001                  │
│   Tailwind CSS 3 + shadcn   │    ◄─── JSON          │                              │
│   i18next (fr/ar)           │                      │   sql.js (SQLite WASM)       │
│   next-themes               │                      │   Passport.js (session auth) │
│   Recharts                  │                      │   bcrypt                    │
└──────────────┬──────────────┘                      └──────────────┬───────────────┘
               │                                                     │
               │                                                     │
               ▼                                                     ▼
        Browser Cache                                          jemla.db
                                                          (SQLite file on disk)
```

---

## Frontend

### Tech Stack

| Technology        | Purpose                          | Version |
|-------------------|----------------------------------|---------|
| React             | UI library                       | 18      |
| Vite              | Build tool + dev server          | 5       |
| React Router DOM  | Client-side routing              | 6       |
| Tailwind CSS      | Utility-first CSS framework      | 3.4     |
| shadcn/ui         | Component patterns (Radix + CVA) | —       |
| Radix UI          | Accessible headless primitives   | —       |
| recharts          | Charts (AreaChart, PieChart)     | 3       |
| i18next           | Internationalization             | 26      |
| next-themes       | Dark/light theme                 | 0.4     |
| sonner            | Toast notifications              | 2       |
| lucide-react      | Icons (secondary)                | 0.46    |
| class-variance-authority | Component variants        | 0.7     |
| clsx + tailwind-merge | Class merging               | —       |

### No TypeScript

The entire frontend is plain `.jsx`/`.js`. There is no TypeScript configuration. This is a deliberate choice to keep the barrier to modification low for non-TypeScript developers.

### State Management

- **Global state**: `AuthContext` (React Context) for the current user session
- **Local state**: `useState` + `useEffect` in each page component
- **No state library**: No Redux, Zustand, or any external state management. The app has ~12 independent pages with minimal cross-page state.

### Routing (React Router v6)

| Path         | Component   | Access     |
|--------------|-------------|------------|
| `/login`     | Login       | Guest only |
| `/dashboard` | Dashboard   | Authenticated |
| `/pos`       | POS         | Authenticated |
| `/products`  | Products    | Authenticated |
| `/customers` | Customers   | Authenticated |
| `/suppliers` | Suppliers   | Authenticated |
| `/purchases` | Purchases   | Authenticated |
| `/sales`     | Sales       | Authenticated |
| `/returns`   | Returns     | Authenticated |
| `/inventory` | Inventory   | Authenticated |
| `/debts`     | Debts       | Authenticated |
| `/reports`   | Reports     | Authenticated |
| `/settings`  | Settings    | Authenticated |

All authenticated routes are wrapped in `ProtectedRoute` which redirects to `/login` if no user session exists. `AppLayout` (sidebar + header) wraps all authenticated pages.

### Key Frontend Files

| File | Purpose |
|------|---------|
| `src/main.jsx` | Entry point — renders `<ThemeProvider>` → `<AuthProvider>` → `<App>` |
| `src/App.jsx` | Router config, RTL direction management, loading screen |
| `src/index.css` | CSS variables (light/dark), Tailwind directives, scrollbar styles |
| `src/i18n.js` | i18next setup with localStorage detection |
| `src/lib/utils.js` | `cn()` utility for class merging |
| `src/services/api.js` | Centralized fetch wrapper — all API calls go through this |
| `src/context/AuthContext.jsx` | Auth state provider |
| `src/components/layout/AppLayout.jsx` | Main layout wrapper (sidebar + header + content) |
| `src/components/layout/Sidebar.jsx` | Collapsible sidebar with nav items |
| `src/components/layout/Header.jsx` | Top bar with search, theme/lang toggles, notifications, user menu |
| `src/pages/POS.jsx` | Point-of-Sale terminal (most complex page, ~1375 lines) |
| `src/components/ui/NumpadModal.jsx` | Numeric keypad for quick quantity/price entry |

### Project File Conventions

- Path alias `@` → `./src` (configured in `vite.config.js` and `jsconfig.json`)
- All shadcn-style UI components in `src/components/ui/`
- Page components in `src/pages/`
- Layout components in `src/components/layout/`
- Translations in `src/locales/{fr,ar}.json` (440 keys each)
- Backend routes in `server/src/routes/`

---

## Backend

### Tech Stack

| Technology     | Purpose                          | Version |
|----------------|----------------------------------|---------|
| Express        | HTTP server framework            | 4       |
| sql.js         | SQLite compiled to WASM          | 1.11    |
| Passport.js    | Authentication (local strategy)  | 0.7     |
| bcrypt         | Password hashing                 | 5       |
| express-session| Session management               | 1.18    |
| cors           | Cross-origin requests            | 2.8     |

### Database: SQLite via sql.js

- **No database server**: sql.js runs SQLite in-process via WebAssembly
- **Database file**: `server/data/jemla.db`
- **WAL mode**: `PRAGMA journal_mode=WAL` for concurrent read performance
- **Foreign keys**: `PRAGMA foreign_keys=ON`
- **Schema migrations**: Done via `addColumnIfMissing()` helper — columns are added with ALTER TABLE if they don't exist in `PRAGMA table_info`. This means the schema is auto-migrated on every server start.

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `users` | id, username, password (bcrypt), name, role (admin/cashier) | Auth |
| `products` | id, name, category, price, unit, stock, barcode, price_wholesale, wholesale_min_qty, image_url | Catalog |
| `customers` | id, name, phone, email, address, debt_balance, delivery_address | CRM |
| `sales` | id, customer_id, user_id, total, tax, status, payment_method, payment_status, amount_paid, change_due, discount_total, delivery_address, delivery_date, delivery_fee | Orders |
| `sale_items` | id, sale_id, product_id, product_name (denormalized), price, qty, unit, discount, original_price, tax_rate | Line items |
| `purchases` | id, product_id, supplier, qty, unit_price, total | Stock-in |
| `returns` | id, sale_id, product_id, qty, reason | Returns |
| `inventory_log` | id, product_id, change_qty, reason | Audit trail |
| `expenses` | id, description, amount, category | Expenses |
| `suppliers` | id, name, phone, email, address | Supplier list |
| `product_favorites` | user_id, product_id (composite PK) | User favorites |
| `settings` | key (PK), value | Key-value app config |

### Database Layer (server/src/db.js)

Helper functions for raw SQL:

| Function | Description |
|----------|-------------|
| `initDb()` | Initialize SQLite, create tables, seed admin user |
| `getDb()` | Get the db instance |
| `saveDb()` | Export database to file |
| `queryAll(sql, params)` | Run SELECT, return array of objects |
| `queryOne(sql, params)` | Run SELECT, return single object or null |
| `execute(sql, params)` | Run INSERT/UPDATE/DELETE |
| `getLastInsertId()` | Get last inserted row ID |

### API Endpoints

All under `/api`. Every endpoint except `/auth/login` and `/health` requires authentication.

**Auth**: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

**Dashboard**: `GET /dashboard/stats`, `/dashboard/sales-trend`, `/dashboard/top-products`, `/dashboard/top-customers`, `/dashboard/recent-transactions`

**CRUD**: Products, Customers, Suppliers, Users (admin-only for create/delete)

**Sales**: CRUD + stats, recent, hold/restore

**Other**: Purchases, Returns, Inventory (+log), Reports, Favorites, Settings, Backup (admin-only download), Notifications

### Authentication Flow

1. User submits username/password to `POST /api/auth/login`
2. Passport local strategy verifies credentials against `users` table with bcrypt
3. On success, user ID is serialized into session
4. Session cookie (httpOnly, 24h) sent to client
5. On page load, `AuthContext` calls `GET /api/auth/me` to restore session
6. Protected routes check for `user` in context; protected API routes use `ensureAuthenticated` middleware
7. Admin-only operations (user management, backup) use `ensureRole('admin')`

---

## Running the Project

```bash
# Terminal 1: Backend
cd server && npm run dev
# → starts on port 3001 with Node --watch auto-reload

# Terminal 2: Frontend
npm run dev
# → starts on port 5173, proxies /api/* to :3001
```

### Dev Server Features

- **Vite HMR**: Instant hot module replacement for React components
- **Node --watch**: Auto-restart backend on file changes (Node 18+ built-in)
- **API proxy**: Vite proxies `/api` to `localhost:3001` during development

### Default Credentials

| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Cashier | cashier  | cashier123 |

---

## Seed Data

The seed script (`server/src/seed.js`) populates:
- 25 products (fruits & vegetables with Unsplash images)
- 5 suppliers, 10 customers (some with debts)
- ~70 sales over 15 days
- Correlated purchase records

Run standalone: `node server/src/seed.js`

---

## Important Patterns & Conventions

### 1. API client (`src/services/api.js`)
Single module exporting an `api` object with namespaced methods. Every component uses this — never raw `fetch`.

### 2. cart state in POS.jsx
The POS page is the most complex file (~1375 lines). Cart state is managed entirely in `useState` within the component. If this needs to be extracted, it should become a custom hook.

### 3. No ORM
All SQL queries are written raw. `db.js` provides thin wrappers (`queryAll`, `queryOne`, `execute`). This keeps database interactions transparent and avoids ORM complexity.

### 4. Denormalized product names in sale_items
When a sale is created, `product_name` is copied from the products table. This ensures historical invoices remain accurate even if product names change later.

### 5. Server-side state for settings
The `settings` table is a simple key-value store. There's no schema-coupling — every setting is stored and retrieved as a string. The frontend parses numeric/boolean values as needed.

### 6. Responsive design patterns
- Sidebar: desktop (hover expand 60→240px) / mobile (slide-over drawer)
- POS: desktop (side-by-side panels) / mobile (bottom cart button → fullscreen cart drawer)
- Tables: horizontal scroll on small screens
- Dialogs: full-width on mobile, centered with max-width on desktop

### 7. CVA for component variants
Every UI component that needs variants uses `class-variance-authority`. This ensures consistent variant definitions across the codebase.

### 8. No tests
The project has **zero tests**. No testing framework is configured. This is a known gap.

---

## Deployment Considerations

- **Single machine**: The entire app runs on one machine. Frontend is built with `npm run build` and can be served by the Express backend (add static middleware) or separately.
- **Database backup**: Admin can download the database file via settings. The backup endpoint reads the file directly.
- **Session secret**: Change `SESSION_SECRET` environment variable in production.
- **No Docker**: No Docker configuration exists. Could be containerized as a single image with the built frontend and Express server.
- **Network**: For multi-terminal setups, the backend can run on one machine and frontends connect over LAN (update `cors` origin accordingly).

---

## Codebase Map for AI Agents

When working on this codebase as an AI agent, here are the key entry points:

| Task | Start Here |
|------|------------|
| Add/change a UI component | `src/components/ui/` + `tailwind.config.js` (if new tokens needed) |
| Add a page | Create in `src/pages/`, add route in `src/App.jsx` |
| Add an API endpoint | Create route in `server/src/routes/`, add to `server/src/index.js` |
| Add a translation key | Add to both `src/locales/fr.json` and `src/locales/ar.json` |
| Change database schema | Use `addColumnIfMissing()` in `server/src/db.js` |
| Change auth logic | `server/src/passport.js` + `server/src/middleware/auth.js` |
| Change theme | `src/index.css` CSS variables + `tailwind.config.js` |
| Change styling | `tailwind.config.js` (tokens) + `src/index.css` (CSS vars) |
| Add a chart | `src/pages/Dashboard.jsx` uses recharts |
| Add settings | Add key to defaults in `server/src/db.js` + UI in `src/pages/Settings.jsx` |
