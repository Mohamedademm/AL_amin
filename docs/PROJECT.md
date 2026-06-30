# Al Amine — Project Knowledge Base (Handover)

> Single source of truth for the project. Read this first to understand the whole
> system without re-reading the code. Pair with [STRUCTURE.md](../STRUCTURE.md),
> [README.md](../README.md) and [TODO.md](../TODO.md).

---

## 1. What it is
A high-end **B2C e-commerce + distributed inventory** platform. A public storefront
sits on top of an internal operations suite that manages a product's lifecycle from a
**central warehouse** out to localized **vending spots (boutiques)**, with flexible
pricing and order fulfilment.

## 2. Tech stack
| Layer | Tech |
| :-- | :-- |
| Frontend | React 19 + TypeScript, Vite, Tailwind, React Router 7, TanStack Query 5, lucide-react, axios |
| Backend | Node + Express 5 + TypeScript, run via **tsx** (not plain node) |
| ORM/DB | Prisma 7 (pg **driver adapter**) + PostgreSQL 16 (Docker) |
| Auth | JWT (7-day) + bcrypt + RBAC |
| Security | helmet, CORS allowlist, express-rate-limit, body-size limit |

## 3. Run it (local)
```bash
docker compose up -d                 # Postgres 16 on host port 5433
cd server && npm install
cp .env.example .env                 # defaults match docker-compose
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts               # demo data
npm run dev                          # API on :5000 (tsx watch)
cd ../client && npm install && npm run dev   # app on :5173
```
**Demo accounts** — password `Password123!` for all:
`admin@` / `manager@` / `worker@` / `client@` `alamine.com`.

## 4. Roles & access (RBAC)
`ADMIN` > `MANAGER` > `WORKER` > `CLIENT`. "Staff" = ADMIN+MANAGER+WORKER.
- **CLIENT**: browse, cart, checkout, own orders, profile.
- **WORKER**: staff dashboard, process orders, edit inventory.
- **MANAGER**: + product/category CRUD, pricing/discounts.
- **ADMIN**: everything + user/staff management, audit log, settings.

Routing guards: `/staff/*` → staff roles, `/admin/*` → ADMIN. Enforced both
client-side (`ProtectedRoute`) and server-side (`authorize([...])` middleware).

## 5. Data model (Prisma)
`User`, `Category`, `Product`, `VendingSpot`, `Inventory` (product×spot unique),
`Order` + `OrderItem` (status state machine), `Discount` (category/product scope,
stealth `endsAt`/`maxQuantity`), `AuditLog`, `Event`.
- **Order status**: `PENDING → VERIFYING → ACCEPTED | REFUSED` (illegal jumps rejected).
- **Accepting an order decrements boutique stock atomically** (fails if insufficient).
- **Pricing**: products carry a live `discountPercent` + `discountedPrice` computed from
  active discounts (product-specific beats category). Orders are charged the discounted
  price. Discount expiry/quantity caps are **never sent to clients**.

## 6. Backend layout (`server/src`)
- `config/` env + Prisma client (pg adapter, reads `DATABASE_URL`).
- `lib/` `pricing.ts` (discount engine), `loyalty.ts` (tier ladder + discount),
  `validation.ts` (email/password rules).
- `middleware/` `auth` (JWT verify + `authorize(roles)`), `errorHandler` (`AppError`).
- `modules/<name>/` each has `routes` + `controller` + `service`:
  `auth, product, category, order, inventory, spot, user, dashboard, discount, audit, restock, loyalty`.
- `restock` = **Smart Restock**: forecasts each boutique's stockout date from recent
  sales velocity (units sold ÷ window) and proposes a reorder-up-to quantity.
- `server.ts` mounts everything under `/api/*`, adds helmet/CORS/rate-limit.

### API (base `/api`, envelope `{ status, data }`)
`POST /auth/register|login`, `GET /auth/me` · `GET /products[/:id]`, CRUD (admin/mgr) ·
`GET /categories`, CRUD · `POST|GET /orders`, `PATCH /orders/:id/status` ·
`GET|PUT /inventory` · `GET /spots`, CRUD · `GET|POST|PATCH|DELETE /users` (admin;
self-guard: an admin cannot change their own role or delete their own account → 400) ·
`GET /dashboard/stats`, `GET /dashboard/low-stock` · `GET /orders/export` (CSV, staff) ·
`GET|POST|PATCH|DELETE /discounts` · `GET /audit` (admin) ·
`GET /restock/forecast` (admin/mgr; predicted stockouts + suggested reorder per spot —
a MANAGER is scoped to the boutique they manage, ADMIN may narrow with `?spotId=`) ·
`GET /loyalty` (any auth; caller's tier, progress + ladder).

**Loyalty:** a client's `lifetimeSpend` grows on each **ACCEPTED** order and maps to a
tier (BRONZE/SILVER/GOLD/PLATINUM). The tier's % stacks on top of product/category
discounts at checkout (applied server-side in `order/service.ts`).

## 7. Frontend layout (`client/src`)
- `context/` `ThemeContext` (light/dark), `AuthContext` (session restore via `/auth/me`),
  `CartContext` (localStorage), `ToastContext` (app-wide toasts), `ConfirmContext`
  (promise-based confirm dialog).
- `services/` `axios` (token interceptor) + `api.ts` (typed functions per domain).
- `components/ui/` design-system kit; `components/common/` ProductCard/ProductImage;
  `components/layout/` MainLayout, DashboardLayout (role-aware sidebar), AuthShell.
- `pages/` by area: `public/`, `auth/`, `staff/`, `admin/`. **All routes are lazy-loaded**
  (`React.lazy` + `Suspense`) → per-page chunks.

## 8. Design system — "Cyber Serif · Surgical Emerald"
- **Light + dark mode** via a single `.dark` class flipping CSS variables (tokens in
  `index.css`, mapped to Tailwind colors `bg/surface/content/muted/line/primary`).
  Anti-flash inline script in `index.html`; toggle persisted to `localStorage.theme`.
- Accent emerald `#10b981`/`#34d399`. Fonts: Newsreader (serif headings), Inter (body),
  Space Grotesk (mono labels). Custom SVG logo (`components/brand/Logo.tsx`).
- Animations: `useInView` scroll reveals + Tailwind keyframes (float/shimmer/pulse).

## 9. Security & performance posture
Security: helmet headers, CORS limited to `CLIENT_URL`, auth rate-limit (30/15min),
1 MB JSON cap, bcrypt(10), server-side email + password-strength validation, audit trail.
Perf: route code-splitting, React Query caching, parallelized dashboard queries.
Open items tracked in [TODO.md](../TODO.md) (httpOnly cookies, zod, pagination, indexes, tests/CI…).

## 10. Gotchas (important!)
- **Postgres is on port 5433** (5432 is taken by another local container).
- **lucide-react is v1.x** here — brand icons (Github/Twitter/Linkedin) were removed.
- **Backend runs via tsx**; server `tsconfig` uses `moduleResolution: bundler`,
  `verbatimModuleSyntax:false`, `noUncheckedIndexedAccess:false` so it type-checks.
- Prisma 7 needs `prisma generate` after schema changes; client uses the **pg adapter**.
- `gh` CLI is **not installed**; open PRs via the GitHub web link.
- The Claude preview `screenshot` tool times out in this sandbox — verify via
  `preview_eval` / `preview_network` instead.

## 11. Status
Sprints 1–3 complete (storefront, operations, dynamic pricing + audit). This session
also added security hardening, the stock-decrement fix, toasts + confirm dialog, and
route code-splitting. Next: advanced distribution routing, tests/CI, pagination.
