# Al Amine Management System

A high-end B2C E-commerce and Distributed Inventory Management System designed for professional operational control, flexible pricing, and smart logistics.

![Project Status](https://img.shields.io/badge/Status-Sprint_3_Complete-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_Node.js_|_Prisma_|_PostgreSQL-10b981)
![Theme](https://img.shields.io/badge/UI-Light_%2B_Dark-10b981)
![Deploy](https://img.shields.io/badge/Deploy-Vercel_%2B_Neon-000000)

## 🌐 Live Demo
| App | URL |
| :-- | :-- |
| **Storefront + Consoles** | https://al-amin-nine.vercel.app |
| **API** | https://al-amin-api.vercel.app |

Demo logins (all password **`Password123!`**): `admin@alamine.com` · `manager@alamine.com` · `worker@alamine.com` · `client@alamine.com`.

## 🌌 Vision
Al Amine blends a sophisticated client-facing storefront with a powerful internal management suite. It manages the full lifecycle of a product from the central industry warehouse to various localized vending spots (boutiques), ensuring optimal stock distribution and high-precision order fulfillment.

## 🚀 Key Features

### Storefront (B2C)
- Animated landing page, product catalog with search + category filters.
- Product detail, shopping cart and a guarded checkout pipeline.
- Client accounts: registration, login, profile and live order tracking.

### Distributed Inventory Logic
- **Central Warehouse** as the master source of truth + localized **Vending Spots**.
- **Smart Routing**: local match → immediate delivery; remote match → ~2-day delivery.
- Per-spot stock matrix with low-stock flagging.

### Operations & Administration
- **Order State Machine**: `PENDING → VERIFYING → ACCEPTED / REFUSED`.
- **RBAC**: `ADMIN`, `MANAGER`, `WORKER`, `CLIENT` each with scoped access.
- Staff console: dashboard KPIs, order processing, inventory and product CRUD.
- Admin console: user directory, staff management, categories & vending spots.

## 🛠 Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 (TypeScript), Tailwind CSS, React Router, TanStack Query |
| **Backend** | Node.js, Express 5, TypeScript |
| **ORM** | Prisma 7 (pg driver adapter) |
| **Database** | PostgreSQL 16 (Docker locally · Neon in production) |
| **Security** | JWT authentication + bcrypt + RBAC |
| **Runtime** | tsx / Vite |
| **Deployment** | Vercel (static SPA + serverless API) — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

## 🎨 Visual Identity: Cyber Serif · Surgical Emerald
A modern, professional design system with full **light + dark mode** (toggle persisted to `localStorage`, system-preference aware, no flash on load).

- **Palette** (semantic tokens via CSS variables):
  - Accent: `#10b981` (Surgical Emerald) → `#34d399` highlight
  - Dark surfaces: `#0A0A0B` / `#131316` · Light surfaces: `#FAFAFA` / `#FFFFFF`
  - Neutrals: Slate scale
- **Typography**: `Newsreader` (serif headlines), `Inter` (body), `Space Grotesk` (mono labels).
- **Motion**: scroll-reveal (IntersectionObserver), float/shimmer/pulse ambient animations, weighted cubic-bezier transitions.
- **Brand**: custom SVG "A" monogram logo with a network node accent.

## 🏁 Getting Started (clone & run locally)

> **TL;DR** — clone → `npm run install:all` → create the two `.env` files → `npm run dev`.

### Prerequisites
- **Node.js v20+** (and npm)
- A **PostgreSQL** database. Easiest: a free **Neon** DB (cloud, no install) — the
  same DB the live demo uses. Alternative: local **Docker** Postgres.

### 1. Clone & install
```bash
git clone https://github.com/Mohamedademm/AL_amin.git
cd AL_amin
npm install            # root tooling (concurrently, husky)
npm run install:all    # installs client/ and server/ dependencies
```

### 2. Configure environment

**`server/.env`** — copy the example and set your database URL:
```bash
cp server/.env.example server/.env
```
Then edit `server/.env` and set `DATABASE_URL`:
- **Option A — Neon (recommended, shared online DB):** paste your connection
  string from <https://console.neon.tech> (your project → *Connect*). Use the
  **direct** string (host **without** `-pooler`) for local dev.
- **Option B — local Docker:** run `docker compose up -d` (Postgres on port 5433),
  then use `postgresql://user:password@localhost:5433/alamin_db?schema=public`.

**`client/.env`** — point the frontend at your local API:
```bash
cp client/.env.example client/.env      # VITE_API_URL=http://localhost:5000/api
```

### 3. Prepare the database (first time only)
```bash
npm run db:setup       # prisma generate + migrate deploy + seed demo data
```
> If you use the shared Neon DB that is **already seeded**, you can skip the seed —
> run only `npm --prefix server run prisma:generate` so the Prisma client exists.

### 4. Run everything
```bash
npm run dev            # starts client (http://localhost:5173) + server (http://localhost:5000)
```
Open **http://localhost:5173** and log in with a demo account below.

> Prefer two terminals? Use `npm run dev:server` and `npm run dev:client` separately.

### 🔑 Demo accounts
All seeded accounts share the password **`Password123!`**:

| Role | Email |
| :--- | :--- |
| Admin | `admin@alamine.com` |
| Manager | `manager@alamine.com` |
| Worker | `worker@alamine.com` |
| Client | `client@alamine.com` |

### 🧰 Useful root scripts
| Command | Does |
| :-- | :-- |
| `npm run install:all` | Install `client/` + `server/` deps |
| `npm run dev` | Run client + server together |
| `npm run build` | Production build of both |
| `npm run db:setup` | Generate Prisma client, apply migrations, seed |
| `npm test` | Run client + server test suites |

## 📡 API Reference (base `/api`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Public | Create a client account (returns JWT + sets cookie) |
| POST | `/auth/login` | Public | Log in (returns JWT + sets cookie; locks after 10 failed attempts) |
| POST | `/auth/logout` | Auth | Clear the auth cookie |
| GET | `/auth/me` | Auth | Current user |
| GET | `/auth/google` · `/auth/google/callback` | Public | Google OAuth sign-in (optional, redirects with `?token=`) |
| GET | `/products` · `/products/:id` | Public | List / get products (incl. `images[]` gallery) |
| POST·PATCH·DELETE | `/products` … | Admin/Manager | Product CRUD (accepts `multipart/form-data` with up to 5 `images`) |
| GET | `/categories` | Public | List categories |
| POST·PATCH·DELETE | `/categories` … | Admin/Manager | Category CRUD |
| POST·GET | `/orders` | Auth | Place / list orders (clients see own) |
| PATCH | `/orders/:id/status` | Staff | Advance order status |
| GET·PUT | `/inventory` | Staff | Stock matrix / set quantity |
| GET | `/spots` | Auth | List vending spots |
| POST·PATCH·DELETE | `/spots` … | Admin/Manager | Spot CRUD |
| GET·POST·PATCH·DELETE | `/users` … | Admin | User management |
| GET | `/dashboard/stats` | Staff | Aggregated KPIs |
| GET·POST·PATCH·DELETE | `/discounts` … | Admin/Manager | Dynamic pricing rules (category/product, stealth constraints) |
| GET | `/audit` | Admin | Audit trail of pricing/discount actions |

All responses use the envelope `{ "status": "success", "data": ... }`. Product
responses also carry a live `discountPercent` and `discountedPrice` (stealth
expiry/quantity caps are never exposed to clients).

## ☁️ Deployment (Vercel + Neon)

The app ships as **two Vercel projects** from this single repo, backed by a **Neon**
serverless PostgreSQL database:

| Project | Root dir | Stack | URL shape |
| :--- | :--- | :--- | :--- |
| `al-amin` (frontend) | `client/` | Vite static SPA | `https://al-amin.vercel.app` |
| `al-amin-api` (backend) | `server/` | Express on serverless functions | `https://al-amin-api.vercel.app` |

The backend Express app is exported from `src/app.ts` and served on Vercel via
`api/index.ts` (a catch-all rewrite in `vercel.json` keeps every `/api/...` route
intact). The frontend reads the API base URL from `VITE_API_URL`.

➡️ **Full step-by-step guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** (Neon setup,
both Vercel imports, env vars, CORS, migrations/seed, troubleshooting).

```bash
# One-time: apply schema + demo data to Neon (pooled connection string)
cd server
export DATABASE_URL="postgresql://...-pooler....neon.tech/neondb?sslmode=require"
npx prisma migrate deploy && npx tsx prisma/seed.ts
```

## 🗺 Roadmap

### Sprint 1: Foundation ✅
- [x] Database schema, JWT auth + RBAC middleware, core inventory logic, project structure.

### Sprint 2: Core Operations ✅
- [x] Auth endpoints (register/login/me) with bcrypt.
- [x] Product & category management, mounted API routes.
- [x] Order placement pipeline + verification workflow.
- [x] Full client storefront, staff & admin consoles.
- [x] Design system with light/dark mode, logo, animations.

### Sprint 3: Advanced Logic ✅
- [x] Dynamic pricing engine & category/product discounts.
- [x] Stealth constraints (hidden expiry + quantity caps).
- [x] Audit logging (discount actions + price changes) with admin viewer.
- [x] Advanced distribution routing (local boutique vs central warehouse + ETA).

### Sprint 4: Cloud Deployment ✅
- [x] Serverless backend adaptation (`app.ts` + `api/index.ts` + `vercel.json`).
- [x] Frontend SPA config for Vercel.
- [x] Neon PostgreSQL (pooled) + production env wiring.
- [x] Full deployment runbook ([docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).
