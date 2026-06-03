# Jemla POS — Project Rules

1. **No TypeScript.** All code is plain `.js` / `.jsx`.

2. **No external state management.** Use React `useState` + `useEffect`. `AuthContext` is the only global context.

3. **No ORM.** Raw SQL queries via the `db.js` helpers (`queryAll`, `queryOne`, `execute`).

4. **No tests.** Do not add test runners, test files, or testing dependencies.

5. **No JWT, no WebSockets, no Docker.** Session-based auth via Passport + express-session. HTTP polling for notifications. Single-machine deployment.

6. **comments in code.** comments only when necessery

7. **All styling via Tailwind utility classes.** Use the project's semantic design tokens (`bg-background`, `text-foreground`, `bg-primary`, etc.), not raw hex values. Dark mode via `dark:` variants on every component.

8. **All UI strings must use i18n translation keys** via `t('key')`. Every key must exist in both `fr.json` and `ar.json`. The app supports French (default) and Arabic (with RTL layout).

9. **All API calls go through `src/services/api.js`** — never use raw `fetch` in components. Data fetching pattern: `.then().catch(console.error).finally()` inside `useEffect`. After create/update/delete, always refetch the list.

10. **Never add a new npm dependency without asking first.** Check existing `package.json` files. The project has strict, minimal dependencies.

11:push to gh when big changes happen
