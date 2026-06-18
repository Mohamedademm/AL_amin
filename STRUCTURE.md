# Project Structure

High-level map of the project's file organization. Update whenever files or
directories are added, removed, or moved.

## Directory Map

- `client/`: Frontend (Vite + React 19 + TypeScript + Tailwind)
  - `src/`
    - `assets/`: Static images (e.g. `hero.png`)
    - `components/`
      - `brand/`: Logo mark + wordmark
      - `ui/`: Design-system primitives (Button, Card, Input, Badge, Modal, Spinner, StatCard, PageHeader, Reveal, ThemeToggle)
      - `common/`: Composite pieces (ProductCard, ProductImage)
      - `layout/`: Shells (MainLayout, DashboardLayout, AuthShell, Navbar, Footer; StaffLayout/AdminLayout re-export DashboardLayout)
    - `context/`: Global providers — `ThemeContext` (light/dark), `AuthContext` (session), `CartContext`, `ToastContext` (notifications), `ConfirmContext` (dialog)
    - `hooks/`: Custom hooks (`useInView` for scroll reveals)
    - `lib/`: Tiny utilities (`cn` classnames helper)
    - `pages/`: Route components by area — `public/`, `auth/`, `staff/`, `admin/`
    - `routes/`: Route guards (`ProtectedRoute`)
    - `services/`: API layer — `axios` instance + typed `api` functions
    - `types/`: Shared TypeScript domain types
    - `utils/`: Helpers (`format` for price/date/initials)
  - `public/`: Static assets served as-is (`favicon.svg`)
  - `index.html`, `tailwind.config.js`, `postcss.config.js`, `vite.config.ts`
- `server/`: Backend (Node + Express 5 + Prisma 7 + PostgreSQL)
  - `src/`
    - `config/`: Env + Prisma client (`database.ts`)
    - `lib/`: Cross-cutting logic (`pricing.ts` — discount engine; `validation.ts` — email/password rules)
    - `middleware/`: `auth` (JWT + RBAC), `errorHandler`
    - `modules/`: Domain modules, each with `routes` / `controller` / `service` (`auth`, `product`, `category`, `order`, `inventory`, `spot`, `user`, `dashboard`, `discount`, `audit`)
    - `server.ts`: App entry + route mounting
  - `prisma/`: `schema.prisma`, `migrations/`, `seed.ts`
  - `.env` / `.env.example`
- `docs/`: Project documentation (`PROJECT.md` — full knowledge base, `sprint-1-plan.md`)
- `docker-compose.yml`: PostgreSQL 16 service (host port 5433)
- `CLAUDE.md`: Project guidelines
- `TODO.md`: Prioritized improvement roadmap
- `STRUCTURE.md`: This map
