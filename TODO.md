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
- [ ] **P1** Full input validation with `zod` schemas on every endpoint (currently manual)
- [ ] **P1** Account lockout / exponential backoff after repeated failed logins
- [ ] **P2** Audit-log auth events (login success/failure, role changes)
- [ ] **P2** Generate a strong `JWT_SECRET` per environment; document rotation
- [ ] **P2** Add CSP fine-tuning + HSTS in production

## ⚙️ Functional requirements (new / fixed)
- [x] **P0** Decrement boutique stock when an order is **ACCEPTED**; reject if insufficient — *done*
- [ ] **P1** Enforce discount `maxQuantity` (stealth cap) — track usage and auto-disable
- [ ] **P1** Client order **detail** page + ability to **cancel** a `PENDING` order
- [ ] **P1** Advanced distribution routing: auto-pick nearest spot with stock (local vs remote ETA)
- [ ] **P1** Low-stock **alerts** (dashboard banner + optional email)
- [ ] **P2** Product image **upload** (not just URL) with storage
- [ ] **P2** Wishlist / favourites for clients
- [ ] **P2** Order invoices (PDF) + email notifications
- [ ] **P2** Promo codes at checkout

## 🛠 Admin actions (more powerful)
- [x] **P1** Replace native `confirm()` with a styled confirm dialog (6 call sites) — *done*
- [x] **P1** Toast notifications for success/error on every admin mutation — *done*
- [x] **P1** Admin can **create users** (any role) + edit users — *done (User Directory)*
- [~] **P1** **Search + pagination + sort** on admin tables — *done for Users; products/inventory next*
- [ ] **P1** Admin **order management** view (currently only staff route) + manual override
- [ ] **P1** **CSV export** for users, orders, inventory, audit
- [ ] **P2** Bulk actions (multi-select delete / status change)
- [ ] **P2** Admin **activity feed** + richer dashboard **charts** (trends over time)
- [ ] **P2** User detail drawer (orders history, impersonate for support)
- [ ] **P2** Editable profile (currently read-only)

## ⚡ Performance
- [x] **P1** Route-level **code splitting** (`React.lazy`) for staff/admin bundles — *done*
- [ ] **P1** Pagination on product/order lists (server-side) for scale
- [ ] **P1** DB indexes on hot columns (`Order.status`, `Order.clientId`, `Inventory.spotId`)
- [ ] **P2** Responsive image `srcset` + blur-up placeholders
- [ ] **P2** HTTP caching headers / ETag on public GETs; optional Redis cache for catalog
- [ ] **P2** Bundle analysis + tree-shake lucide imports

## 🎨 UX / Polish
- [ ] **P1** Global toast provider used app-wide (not only admin)
- [ ] **P2** Skeleton loaders instead of spinners on lists
- [ ] **P2** Form-level validation messages + disabled-until-valid
- [ ] **P2** Keyboard/focus trap in modals; full a11y pass (axe)
- [ ] **P2** Empty-state illustrations; 500 error boundary page

## 🧪 Quality / DevOps
- [x] **P1** Tests: Vitest (client, 14) + backend integration suite (node:test, 15) — *done*; see [docs/TEST_REPORT.md](docs/TEST_REPORT.md)
- [ ] **P1** Browser E2E automation (Playwright) + coverage thresholds
- [ ] **P1** CI (GitHub Actions): typecheck + build + test on PR
- [ ] **P2** ESLint/Prettier enforced + pre-commit hook (husky + lint-staged)
- [ ] **P2** Dockerfile for client + server; full `docker compose` app stack
- [ ] **P2** Error monitoring (Sentry) + structured logging (pino)

---

### ✅ Shipped in this session
Security headers (helmet), CORS allowlist, auth rate-limiting, JSON body limit,
server password policy, **stock decrement on order acceptance**, toast system,
styled confirm dialog (replacing 6 native `confirm()`), and route code-splitting.

See [docs/PROJECT.md](docs/PROJECT.md) for the full project knowledge base.
