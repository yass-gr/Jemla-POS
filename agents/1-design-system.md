# Jemla POS — Design System

## Overview

The design system is built on **Tailwind CSS 3.4** extended with custom design tokens using **CSS custom properties (HSL)**. It follows the **shadcn/ui** philosophy: unstyled Radix UI primitives wrapped with Tailwind utility classes. The system supports full **light/dark mode** via `next-themes` and **RTL layout** for Arabic.

---

## Theme System

- **Library**: `next-themes` with `class` strategy (toggles `.dark` class on `<html>`)
- **Storage key**: `jemla-theme`
- **Provider**: `ThemeProvider` wraps the entire app in `main.jsx`
- **Variables**: All colors defined in `:root` (light) and `.dark` in `src/index.css` as HSL values
- **Transition**: `background-color` and `color` have `0.2s ease` transitions

### CSS Variable → Tailwind Mapping (tailwind.config.js)

| Tailwind Class   | CSS Variable              | Light                    | Dark                     |
|------------------|---------------------------|--------------------------|--------------------------|
| `bg-background`  | `--background`            | `0 0% 100%`             | `240 6% 4%`             |
| `text-foreground`| `--foreground`            | `222 47% 11%`           | `0 0% 96%`              |
| `bg-primary`     | `--primary`               | `174 100% 29%` (teal)   | `174 60% 45%` (teal)    |
| `bg-card`        | `--card`                  | `0 0% 100%`             | `240 3% 10%`            |
| `bg-muted`       | `--muted`                 | `210 40% 96%`           | `240 3% 14%`             |
| `bg-accent`      | `--accent`                | `210 40% 96%`           | `174 30% 14%`            |
| `bg-destructive` | `--destructive`           | `0 84% 60%`             | `0 70% 35%`              |
| `bg-success`     | `--success`               | `142 76% 36%`           | `142 50% 40%`            |
| `bg-warning`     | `--warning`               | `38 92% 50%`            | `38 70% 45%`             |
| `border-border`  | `--border`                | `210 40% 96%`           | `240 3% 15%`            |
| `ring-ring`      | `--ring`                  | `174 100% 29%`           | `174 60% 45%`            |

**Additional named colors** (not using CSS variables, set directly in tailwind config): `surface-container-lowest`, `surface`, `surface-container`, `surface-container-high`, `surface-container-highest`, `surface-dim`, `surface-bright`, `outline`, `outline-variant`, `error-container`, `primary-container`, `secondary-container`, `tertiary` and their `on-*` variants. These follow **Material Design 3 naming** conventions.

---

## Typography

### Font Families

| Name             | Font                  | Usage                     |
|------------------|-----------------------|---------------------------|
| `font-sans`      | Inter                 | Body text, UI labels      |
| `font-arabic`    | Noto Kufi Arabic      | Arabic text (switched via `html[lang="ar"]`) |
| `font-display-lg`| Hanken Grotesk        | Large display headings    |
| `font-headline-lg`| Hanken Grotesk       | Headlines                 |

Loaded via Google Fonts in `index.html`.

### Type Scale

| Token       | Size  | Weight | Line Height | Letter Spacing | Usage                    |
|-------------|-------|--------|-------------|----------------|--------------------------|
| `display-lg`| 48px  | 800    | 1.1         | -0.03em        | Hero/landing text        |
| `headline-lg` | 22px | 700  | 28px        | -0.02em        | Page titles, dialog titles |
| `headline-md` | 18px | 600  | 24px        | -0.01em        | Section headers          |
| `headline-sm` | 15px | 600  | 20px        | —              | Card titles              |
| `title-lg`  | 20px   | 600    | 1.5         | -0.01em        | Sidebar brand, KPIs       |
| `body-lg`   | 14px   | 400    | 20px        | —              | Body text                 |
| `body-md`   | 13px   | 400    | 18px        | —              | Secondary text, table cells |
| `label-lg`  | 12px   | 600    | 1           | 0.06em         | Badges, labels            |
| `label-md`  | 11px   | 600    | 14px        | 0.05em         | Small labels              |
| `label-sm`  | 11px   | 600    | 1           | 0.04em         | Tiny labels               |

---

## Spacing

Semantic scale (can be used as `p-gutter`, `gap-gutter`, `m-sm`, etc.):

| Token  | Value  |
|--------|--------|
| `base` | 4px    |
| `xs`   | 12px   |
| `sm`   | 20px   |
| `gutter`| 24px  |
| `md`   | 28px   |
| `lg`   | 40px   |
| `xl`   | 56px   |
| `margin`| 32px   |

---

## Border Radius

| Token | Value  |
|-------|--------|
| `lg`  | 0.5rem |
| `xl`  | 0.75rem|
| `2xl` | 1rem   |
| `3xl` | 1.5rem |

Buttons default to `rounded-xl`. Cards to `rounded-2xl`. Dialogs to `rounded-3xl`.

---

## Component Architecture

### Pattern

Every UI component follows the **shadcn/ui** pattern:

1. Based on **Radix UI** primitives (accessible, headless)
2. Styled with **Tailwind** utility classes
3. Uses **`class-variance-authority`** (CVA) for variant management
4. Uses **`cn()`** utility for class merging
5. Supports **dark mode** via `dark:` variants
6. Written as **`.jsx`** (no TypeScript)

### The `cn()` Utility

Located in `src/lib/utils.js`. Merges `clsx` + `tailwind-merge` for conflict-free class composition.

### Components

**shadcn/ui components** (in `src/components/ui/`):

| Component       | Library/Base                   | Variants                                                                 |
|-----------------|--------------------------------|--------------------------------------------------------------------------|
| Button          | Radix Slot + CVA               | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`       |
| Badge           | CVA                            | `default`, `secondary`, `destructive`, `outline`, `success`, `warning`  |
| Card            | Plain div                      | Sub-components: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| Input           | Plain `<input>`                | —                                                                        |
| Select          | Radix Select                   | —                                                                        |
| Dialog          | Radix Dialog                   | `DialogContent`, `DialogHeader`, `DialogFooter`, etc.                    |
| AlertDialog     | Radix AlertDialog              | —                                                                        |
| DropdownMenu    | Radix DropdownMenu             | —                                                                        |
| Switch          | Radix Switch                   | —                                                                        |
| Table           | Plain `<table>`                | —                                                                        |
| Avatar          | Radix Avatar                   | —                                                                        |
| Sonner          | `sonner` toast library         | —                                                                        |
| NumpadModal     | Custom                         | Numeric input modal for POS                                              |

---

## Icons

### Primary: Google Material Symbols
Loaded from Google Fonts CDN. Used as `<span class="material-symbols-outlined">icon_name</span>`. Supports `FILL` font variation settings.

### Secondary: lucide-react
Used in select, dropdown-menu, and some UI components.

---

## RTL (Right-to-Left) Support

- Direction switched via `document.documentElement.dir = 'ltr' | 'rtl'` in `App.jsx`
- Arabic font (`Noto Kufi Arabic`) applied via `html[lang="ar"]` CSS selector
- Sidebar chevrons flip rotation based on language
- All layouts use logical CSS properties where possible

---

## Animations

- **`tailwindcss-animate`** plugin provides `animate-in`, `animate-out`, `fade-in`, `zoom-in`, `slide-in` utilities
- Dialog overlays use `fade-in`/`fade-out`
- Dialog content uses `zoom-in-95`/`zoom-out-95` + `slide-in-from-top`
- Buttons have `active:scale-95` press effect
- Sidebar has `transition-all duration-300 ease-out` for expand/collapse
- Theme switch has `transition: background-color 0.2s ease, color 0.2s ease`

---

## Interactive States

| State    | Implementation                                                                 |
|----------|--------------------------------------------------------------------------------|
| Focus    | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` |
| Disabled | `disabled:pointer-events-none disabled:opacity-50`                             |
| Active   | `active:scale-95` (buttons)                                                    |
| Hover    | Varied: `hover:bg-accent`, `hover:brightness-110`, `hover:shadow-lg`          |

---

## Page Layout Pattern

All authenticated pages follow a consistent structure:

```
PageTitle + Subtitle
├── KPI Stat Cards (grid, 1-3 columns)
├── Search/Filter bar
├── Data Table (10 items/page, server-side or client-side)
└── CRUD Dialogs (add/edit)
```

The **AppLayout** wraps all authed pages:
- `Sidebar`: collapsible (60px → 240px), 11 nav items + settings, mobile drawer
- `Header`: sticky top bar with search, theme toggle, language toggle, notifications (polled), user dropdown
- `Main`: `p-gutter` padding, `space-y-gutter` spacing
