# Al Amine — Test Report

Snapshot of the testing performed on the platform, how to reproduce it, and the
results. Last run: **2026-06-19**. Overall: **✅ all green (32 automated tests + checks)**.

---

## 1. Test types & coverage

| # | Type | Tooling | Scope | Result |
| :- | :-- | :-- | :-- | :-- |
| 1 | **Backend integration** | `node:test` (built-in) | Full API: auth, RBAC, pricing, orders, inventory, audit, security | **18/18 ✅** |
| 2 | **Frontend unit/component** | Vitest + Testing Library (jsdom) | utils, helpers, UI components | **14/14 ✅** |
| 3 | **Static typing** | `tsc --noEmit` / `tsc -b` | client + server | **0 errors ✅** |
| 4 | **Production build** | `vite build` / `tsc` | client + server | **Pass ✅** |
| 5 | **Manual E2E** | Preview browser (`preview_eval`) | login → dashboards, theme, catalog, discounts, user CRUD | **Pass ✅** |
| 6 | **Security checks** | curl + integration tests | headers, validation, RBAC, rate-limit | **Pass ✅** |

---

## 2. How to run

```bash
# Backend integration tests (server + DB must be running)
cd server && npm test            # node --test tests/api.test.mjs

# Frontend unit/component tests
cd client && npm test            # vitest run

# Type-check
cd client && npm run build       # tsc -b && vite build
cd server && npx tsc --noEmit
```

---

## 3. Backend integration tests (18) — `server/tests/api.test.mjs`
Validates the live API end-to-end against the seeded database. Also covers
self-service **profile update / password change**, client **order cancel**
(owner + state guards), and **dashboard trends** (14-day series).

**Health & security**
- ✅ `/health` responds 200 OK
- ✅ Helmet headers present (`x-content-type-options`, `x-frame-options`)
- ✅ Auth endpoints expose `RateLimit` headers

**Authentication & validation**
- ✅ Register rejects a weak password (400)
- ✅ Register rejects a malformed email (400)
- ✅ Login with wrong password → 401
- ✅ `/auth/me` returns the user **without leaking the password hash**

**RBAC**
- ✅ Protected route without token → 401
- ✅ CLIENT on an admin route → 403

**Catalog & pricing**
- ✅ Products are public and carry `discountPercent` + `discountedPrice`
- ✅ A category discount lowers the effective price (and is cleaned up)

**Orders — state machine & inventory integrity**
- ✅ Illegal transition `PENDING → ACCEPTED` is rejected (400)
- ✅ Legal path `PENDING → VERIFYING → ACCEPTED` **decrements boutique stock** by the ordered qty
- ✅ A client only sees their own orders

**Admin tooling**
- ✅ Admin can read the audit trail
- ✅ Dashboard stats are aggregated correctly

## 4. Frontend tests (14) — Vitest
- `utils/format.test.ts` — `formatPrice` (number/string/NaN), `initials`, `effectivePrice`
  (discount vs base), `formatDate`.
- `lib/cn.test.ts` — class joining, falsy filtering, empty case.
- `components/ui/Badge.test.tsx` — `Badge` renders children, `StatusBadge` renders the label.

## 5. Manual E2E (preview browser)
- ✅ Session restore + role-based redirect (admin → HQ Overview with live data).
- ✅ Light/dark toggle flips palette and persists to `localStorage`.
- ✅ Catalog renders 16 products + images + category filters; discount badges + struck prices.
- ✅ Admin Pricing creates a discount; Audit shows `DISCOUNT_APPLIED`.
- ✅ User Directory: create + delete round-trip (4→5→4).

---

## 6. Findings & fixes
- **No regressions found.** The integration suite specifically re-validates the
  fixes shipped earlier — stock decrement on order acceptance, RBAC boundaries,
  discount pricing, and the order state machine — and all pass.
- Earlier in development the suite-style checks surfaced and we fixed: missing
  `discount` Prisma client (regenerate), strict `exactOptionalPropertyTypes` on
  discount create, and the lucide v1 brand-icon import crash. These are now green.

## 7. Coverage gaps / next test work
- ⬜ Browser **E2E automation** (Playwright) for full user journeys.
- ⬜ **Coverage reporting** (`vitest --coverage`) + thresholds.
- ⬜ More component tests (forms, ProductCard with cart context, ProtectedRoute guards).
- ✅ **CI** (GitHub Actions): client build+tests and server typecheck+integration
  tests (with a Postgres service) on push/PR — see `.github/workflows/ci.yml`.
- ⬜ Load/perf testing (k6) on catalog + dashboard endpoints.
