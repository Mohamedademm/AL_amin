# Al Amine — Improvement Roadmap (TODO)

Prioritized backlog from a code-level audit. Priorities: **P0** = critical (security/data
integrity), **P1** = high (professionalism/performance), **P2** = nice-to-have.
Items checked `[x]` are done; `[~]` in progress.

---

## 🔐 Security
- [x] **P0** Add `helmet` (security headers) — *done*
- [x] **P0** Restrict CORS to an allowlist via `CLIENT_URL` env (was `cors()` open to all) — *done*
- [x] **P0** Rate-limit auth endpoints (`/auth/login`, `/auth/register`) against brute force — *done*
- [x] **P0** Limit JSON body size (`express.json({ limit })`) — *done*
- [x] **P1** Server-side password policy (min length + complexity) on register/staff create — *done*
- [ ] **P1** Replace `localStorage` JWT with httpOnly cookie + short-lived access + refresh token
- [x] **P1** Full input validation with `zod` schemas on every endpoint — *done (all routes: auth, user, product, category, order, spot, inventory, discount)*
- [x] **P1** Account lockout / exponential backoff after repeated failed logins — *done (failedAttempts + lockedUntil in auth/service.ts, migration add_account_lockout)*
- [x] **P2** Audit-log auth events (login success/failure, role changes) — *done (AuditService in auth/service.ts)*
- [x] **P0** Remove the hard-coded `JWT_SECRET` fallback; fail fast if missing/<32 chars — *done*
- [x] **P1** Mask internal 5xx error messages in production (no stack/DB leak) — *done*
- [x] **P2** Add CSP fine-tuning + HSTS in production — *done (helmet HSTS in app.ts, production-only)*

## ⚙️ Functional requirements (new / fixed)
- [x] **P0** Decrement boutique stock when an order is **ACCEPTED**; reject if insufficient — *done*
- [x] **P1** Harden stock decrement against the check-to-update race (atomic conditional `updateMany`, no oversell) — *done*
- [x] **P1** Enforce discount `maxQuantity` (stealth cap) — *done (usedQuantity column; incremented atomically on order create; auto-disables when cap hit)*
- [x] **P1** Client order **detail** page + ability to **cancel** a `PENDING` order — *done*
- [x] **P1** Advanced distribution routing: auto-pick in-stock boutique (LOCAL) vs central warehouse (REMOTE) + ETA — *done*
- [x] **P1** Low-stock **alerts** (dashboard banner + optional email) — *done (GET /api/dashboard/low-stock + amber banner in Dashboard.tsx)*
- [ ] **P2** Product image **upload** (not just URL) with storage
- [ ] **P2** Wishlist / favourites for clients
- [ ] **P2** Order invoices (PDF) + email notifications
- [ ] **P2** Promo codes at checkout

## 🛠 Admin actions (more powerful)
- [x] **P1** Replace native `confirm()` with a styled confirm dialog (6 call sites) — *done*
- [x] **P1** Toast notifications for success/error on every admin mutation — *done*
- [x] **P1** Admin can **create users** (any role) + edit users — *done (User Directory)*
- [x] **P1** **Search + pagination + sort** on admin tables — *done (shared DataTable: Users, Products, Inventory, Orders, Audit)*
- [x] **P1** Admin **order management** view — *done (/admin/orders route, reuses StaffOrders with full pipeline controls)*
- [x] **P1** **CSV export** for orders — *done (GET /api/orders/export + Download button in staff Orders page)*
- [ ] **P2** Bulk actions (multi-select delete / status change)
- [ ] **P2** Admin **activity feed** + richer dashboard **charts** (trends over time)
- [ ] **P2** User detail drawer (orders history, impersonate for support)
- [x] **P2** Editable profile + change password — *done*

## ⚡ Performance
- [x] **P1** Route-level **code splitting** (`React.lazy`) for staff/admin bundles — *done*
- [ ] **P1** Pagination on product/order lists (server-side) for scale
- [x] **P1** DB indexes on hot columns (Order.status/clientId/spotId/createdAt, Inventory.spotId, OrderItem, Product.categoryId, AuditLog) — *done (migration `add_performance_indexes`)*
- [ ] **P2** Responsive image `srcset` + blur-up placeholders
- [ ] **P2** HTTP caching headers / ETag on public GETs; optional Redis cache for catalog
- [ ] **P2** Bundle analysis + tree-shake lucide imports

## 🎨 UX / Polish
- [ ] **P1** Global toast provider used app-wide (not only admin)
- [x] **P2** Skeleton loaders instead of spinners on lists — *done (Skeleton + DataTable + catalog)*
- [ ] **P2** Form-level validation messages + disabled-until-valid
- [ ] **P2** Keyboard/focus trap in modals; full a11y pass (axe)
- [ ] **P2** Empty-state illustrations
- [x] **P1** Global React **ErrorBoundary** + 500 fallback page (catches any render crash) — *done*

## 🧪 Quality / DevOps
- [x] **P1** Tests: Vitest (client, 14) + backend integration suite (node:test, 22) — *done*; see [docs/TEST_REPORT.md](docs/TEST_REPORT.md)
- [ ] **P1** Browser E2E automation (Playwright) + coverage thresholds
- [x] **P1** CI (GitHub Actions): typecheck + build + test on PR — *done (`.github/workflows/ci.yml`)*
- [x] **P2** ESLint on server — *done (eslint.config.js, `npm run lint` in CI)*
- [ ] **P2** Dockerfile for client + server; full `docker compose` app stack
- [x] **P2** Error monitoring (Sentry) + structured logging (pino) — *done (pino + pino-http replacing morgan; sensitive fields redacted)*

## 🚀 Innovation roadmap (high-end features)
**Phase 1 — zero external deps**
- [x] **P1** **Smart Restock** — predict per-boutique stockout date from sales velocity + suggested reorder-up-to qty — *done (`GET /api/restock/forecast`, control-tower widget on the admin dashboard, manager-scoped)*
- [ ] **P1** Loyalty tiers (Bronze/Silver/Gold) auto-computed from lifetime spend → auto-discounts
- [ ] **P2** Surge / auto-pricing rules (overstock liquidation, scarcity markup) on the discount engine
- [ ] **P2** Branded PDF invoices on order ACCEPTED (pdfkit)

**Phase 2 — free libs + migrations**
- [ ] **P2** Interactive map of vending spots (Leaflet + OSM; needs `lat/lng` migration + geocoding)
- [ ] **P2** PWA + web-push notifications (VAPID, self-hosted)
- [ ] **P2** QR scanner for order pickup / inventory (html5-qrcode)

**Phase 3 — external accounts (keys required)**
- [ ] **P2** Multichannel alerts (Resend email / Twilio SMS) + invoice email delivery

---

### ✅ Shipped in this session
Security headers (helmet), CORS allowlist, auth rate-limiting, JSON body limit,
server password policy, **stock decrement on order acceptance**, toast system,
styled confirm dialog (replacing 6 native `confirm()`), and route code-splitting.

See [docs/PROJECT.md](docs/PROJECT.md) for the full project knowledge base.
