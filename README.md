# Al Amine Management System

A high-end B2C E-commerce and Distributed Inventory Management System designed for professional operational control, flexible pricing, and smart logistics.

![Project Status](https://img.shields.io/badge/Status-Sprint_3_Complete-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_Node.js_|_Prisma_|_PostgreSQL-10b981)
![Theme](https://img.shields.io/badge/UI-Light_%2B_Dark-10b981)

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
| **Database** | PostgreSQL 16 (Docker) |
| **Security** | JWT authentication + bcrypt + RBAC |
| **Runtime** | tsx / Vite |

## 🎨 Visual Identity: Cyber Serif · Surgical Emerald
A modern, professional design system with full **light + dark mode** (toggle persisted to `localStorage`, system-preference aware, no flash on load).

- **Palette** (semantic tokens via CSS variables):
  - Accent: `#10b981` (Surgical Emerald) → `#34d399` highlight
  - Dark surfaces: `#0A0A0B` / `#131316` · Light surfaces: `#FAFAFA` / `#FFFFFF`
  - Neutrals: Slate scale
- **Typography**: `Newsreader` (serif headlines), `Inter` (body), `Space Grotesk` (mono labels).
- **Motion**: scroll-reveal (IntersectionObserver), float/shimmer/pulse ambient animations, weighted cubic-bezier transitions.
- **Brand**: custom SVG "A" monogram logo with a network node accent.

## 🏁 Getting Started

### Prerequisites
- Node.js v20+
- Docker (for PostgreSQL) — or a local PostgreSQL on port `5433`

### 1. Database
```bash
docker compose up -d   # starts PostgreSQL 16 on host port 5433
```

### 2. Server
```bash
cd server
npm install
cp .env.example .env          # defaults match docker-compose
npx prisma generate
npx prisma migrate deploy      # or: npx prisma migrate dev
npx tsx prisma/seed.ts         # realistic demo data
npm run dev                    # http://localhost:5000
```

### 3. Client
```bash
cd client
npm install
npm run dev                    # http://localhost:5173
```

### 🔑 Demo accounts
All seeded accounts share the password **`Password123!`**:

| Role | Email |
| :--- | :--- |
| Admin | `admin@alamine.com` |
| Manager | `manager@alamine.com` |
| Worker | `worker@alamine.com` |
| Client | `client@alamine.com` |

## 📡 API Reference (base `/api`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Public | Create a client account |
| POST | `/auth/login` | Public | Log in, returns JWT |
| GET | `/auth/me` | Auth | Current user |
| GET | `/products` · `/products/:id` | Public | List / get products |
| POST·PATCH·DELETE | `/products` … | Admin/Manager | Product CRUD |
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
- [ ] Advanced distribution routing (next).
