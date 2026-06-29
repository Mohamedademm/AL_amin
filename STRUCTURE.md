# Project Structure

High-level map of the project's file organization. Update whenever files or
directories are added, removed, or moved.

## Directory Map

- `client/`: Frontend (Vite + React 19 + TypeScript + Tailwind)
  - `src/`
    - `assets/`: Static images (e.g. `hero.png`)
    - `components/`
      - `brand/`: Logo mark + wordmark
      - `ui/`: Design-system primitives (Button, Card, Input, Badge, Modal, Spinner, StatCard, PageHeader, Reveal, ThemeToggle, ErrorBoundary)
      - `common/`: Composite pieces (ProductCard, ProductImage)
      - `layout/`: Shells (MainLayout, DashboardLayout, AuthShell, Navbar, Footer; StaffLayout/AdminLayout re-export DashboardLayout)
    - `context/`: Global providers — `ThemeContext` (light/dark), `AuthContext` (session), `CartContext`, `ToastContext` (notifications), `ConfirmContext` (dialog)
    - `hooks/`: Custom hooks (`useInView` for scroll reveals)
    - `lib/`: Tiny utilities (`cn` classnames helper)
    - `pages/`: Route components by area — `public/`, `auth/` (incl. `GoogleCallback`), `staff/` (incl. `CategoryManagement`), `admin/`
    - `routes/`: Route guards (`ProtectedRoute`)
    - `services/`: API layer — `axios` instance (Bearer JWT) + typed `api` functions (product image upload via multipart)
    - `types/`: Shared TypeScript domain types
    - `utils/`: Helpers (`format` for price/date/initials)
  - `public/`: Static assets served as-is (`favicon.svg`, `logo.png`)
  - `index.html`, `tailwind.config.js`, `postcss.config.js`, `vite.config.ts`
  - `vercel.json`: SPA rewrite (all paths → `index.html`) for client-side routing
- `server/`: Backend (Node + Express 5 + Prisma 7 + PostgreSQL)
  - `src/`
    - `config/`: Env + Prisma client + Google OAuth (passport) + Multer file upload (`database.ts`, `env.ts`, `passport.ts`, `upload.ts`)
    - `lib/`: Cross-cutting logic (`pricing.ts` — discount engine; `validation.ts` — Zod schemas + `validate` middleware + email/password rules; `logger.ts` — pino structured logger; `csv.ts` — RFC-4180 CSV serializer; `requestContext.ts` — AsyncLocalStorage for audit)
    - `middleware/`: `auth` (JWT via cookie or Bearer + RBAC), `errorHandler`
    - `modules/`: Domain modules, each with `routes` / `controller` / `service` (`auth`, `product`, `category`, `order`, `inventory`, `spot`, `user`, `dashboard`, `discount`, `audit`; `order` also has `cleanup.ts` — interval-based order expiry, started by the local server only)
    - `app.ts`: Builds & exports the configured Express app (no `listen`) — shared by local + serverless; mounts passport + `/uploads` static
    - `server.ts`: Local entry — imports `app`, starts the cleanup interval, calls `listen`
  - `api/index.ts`: Vercel serverless function — `export default app`
  - `prisma/`: `schema.prisma`, `migrations/`, `seed.ts`
  - `vercel.json`: Rewrites every path → `/api/index`; function memory/duration config
  - `.env` / `.env.example`
- `docs/`: Project documentation (`PROJECT.md` — full knowledge base, `DEPLOYMENT.md` — Vercel+Neon runbook, `PAGE_AUDIT.md`, `TEST_REPORT.md`, `sprint-1-plan.md`)
- `package.json` (root): monorepo convenience scripts (`install:all`, `dev`, `build`, `db:setup`, `test`) + husky/lint-staged
- `docker-compose.yml`: PostgreSQL 16 service (host port 5433) — optional local DB alternative to Neon
- `CLAUDE.md`: Project guidelines
- `TODO.md`: Prioritized improvement roadmap
- `STRUCTURE.md`: This map
