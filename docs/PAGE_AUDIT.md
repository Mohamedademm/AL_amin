# Al Amine — Page-by-Page Audit & Improvement Plan

A deep review of every page: current state, functional gaps, design gaps, and a
prioritized plan. Priorities **P0** (critical) · **P1** (high) · **P2** (polish).
This complements [TODO.md](../TODO.md) (system-wide) with **per-page** detail.

Legend: ✅ done · 🔝 high-priority next · ⬜ planned

---

## A. Public / storefront

### A1. Home (`/`)
- **Now:** animated hero, stats strip, features, featured products, steps, CTA.
- **Functional gaps:** no newsletter capture; featured list isn't curated (just first 8);
  no “shop by category” entry points; no testimonials/social proof.
- **Design gaps:** hero image is a single asset; no parallax; CTA band could use motion.
- **Plan:** ⬜ P1 add category tiles + “new arrivals/discounted” rails ·
  ⬜ P2 newsletter section · ⬜ P2 subtle parallax/scroll progress.

### A2. Catalog (`/catalog`)
- **Now:** search, category chips, responsive grid, discount badges.
- **Functional gaps:** no **sort** (price/name/newest), no **price range** filter, no
  “in stock only”, no pagination/infinite scroll, no URL-synced filters.
- **Design gaps:** no skeleton loaders; grid has no quick-view.
- **Plan:** ⬜ P1 sort + price filter + stock filter · ⬜ P1 skeletons ·
  ⬜ P2 URL query sync · ⬜ P2 quick-view modal.

### A3. Product detail (`/product/:id`)
- **Now:** image, discounted price, qty, add/buy, related.
- **Functional gaps:** **single image** (no gallery), no reviews/ratings, no live
  per-spot stock display, no breadcrumb.
- **Plan:** ⬜ P1 stock availability + breadcrumb · ⬜ P2 image gallery · ⬜ P2 reviews.

### A4. Cart (`/cart`)
- **Now:** qty steppers, remove, discounted totals, summary.
- **Functional gaps:** no “save for later”, no per-item stock check, no promo code box.
- **Plan:** ⬜ P1 stock validation before checkout · ⬜ P2 promo code · ⬜ P2 move-to-wishlist.

### A5. Checkout (`/checkout`)
- **Now:** address/phone, spot select (auto routing), summary, place order.
- **Functional gaps:** no **multi-step** flow, no saved addresses, no order review step,
  no payment method (cash-on-delivery only implied).
- **Plan:** ⬜ P1 review step + clearer routing explanation · ⬜ P2 saved addresses.

### A6. Client Orders (`/orders`)
- **Now:** list with status, items preview, total, success banner.
- **Functional gaps:** **no order detail page**, no **cancel** for PENDING, no reorder,
  no tracking timeline.
- **Plan:** 🔝 P1 order **detail** + status **timeline** · P1 **cancel** PENDING · ⬜ P2 reorder.

### A7. Profile (`/profile`)
- **Now:** read-only account info + logout.
- **Functional gaps:** **not editable**, no password change, no addresses, no avatar.
- **Plan:** ⬜ P1 **edit profile** + change password · ⬜ P2 avatar + address book.

### A8. Auth — Login / Register
- **Now:** branded split layout, demo accounts, role-based redirect, validation errors.
- **Functional gaps:** no “forgot password”, no show/hide password toggle, no “remember me”.
- **Plan:** ⬜ P1 show/hide password · ⬜ P2 forgot-password flow.

### A9. 404
- **Now:** branded not-found. ✅ adequate. ⬜ P2 add “popular links”.

---

## B. Staff / operations

### B1. Staff Dashboard (`/staff/dashboard`)
- **Now:** KPI cards, order pipeline bars, recent orders.
- **Functional gaps:** no **time-series chart**, no low-stock list, no quick actions.
- **Plan:** ⬜ P1 low-stock widget + revenue trend chart · ⬜ P2 date-range filter.

### B2. Staff Orders (`/staff/orders`)
- **Now:** filter chips, state-machine actions, toasts, stock-aware accept.
- **Functional gaps:** no **search**, no **pagination**, no **order detail** drawer,
  no client contact shown.
- **Plan:** 🔝 P1 search + pagination (shared DataTable) · P1 order detail drawer.

### B3. Inventory (`/staff/inventory`)
- **Now:** per-spot stock table, inline qty edit, low-stock badge.
- **Functional gaps:** no **search**, no pagination, no bulk restock, no “transfer between spots”.
- **Plan:** 🔝 P1 search + pagination · ⬜ P1 low-stock filter · ⬜ P2 stock transfer.

### B4. Product Management (`/staff/products`)
- **Now:** table, create/edit/delete modal, image preview.
- **Functional gaps:** no **search/sort/pagination**, no bulk actions, no image upload,
  no stock column.
- **Plan:** 🔝 P1 shared DataTable (search/sort/pagination) · ⬜ P2 image upload.

---

## C. Admin

### C1. Admin Dashboard (`/admin/dashboard`)
- **Now:** revenue/orders/users/products + network KPIs + pipeline + recent orders.
- **Plan:** ⬜ P1 revenue trend + orders-by-day charts · ⬜ P2 export.

### C2. User Directory (`/admin/users`) ✅
- **Done:** create/edit users, stats cards, search, role filter, role badges,
  status toggle, pagination, toasts + confirm. **Reference implementation** for tables.

### C3. Staff Management (`/admin/staff`)
- **Now:** staff cards, create staff modal.
- **Functional gaps:** no search, no edit, no activity/last-login.
- **Plan:** ⬜ P1 align with User Directory (search + edit) · ⬜ P2 last-login.

### C4. Pricing (`/admin/pricing`)
- **Now:** create category/product discounts with stealth constraints, toggle, delete.
- **Functional gaps:** no edit, no schedule preview, no “maxQuantity” enforcement display.
- **Plan:** ⬜ P1 edit discount · ⬜ P2 usage counter vs maxQuantity.

### C5. Audit (`/admin/audit`)
- **Now:** table of actions, colour-coded, user + change.
- **Functional gaps:** no filter by action/entity, no pagination, no date range.
- **Plan:** ⬜ P1 filters + pagination · ⬜ P2 export.

### C6. Settings (`/admin/settings`)
- **Now:** categories + spots CRUD, system info.
- **Functional gaps:** no edit (only add/delete), no spot map, no general settings.
- **Plan:** ⬜ P1 edit category/spot · ⬜ P2 branding/theme defaults.

---

## D. Cross-cutting (applies to many pages)
- ⬜ **P1 Shared `DataTable`** (search + sort + pagination + empty/loading) → Products,
  Inventory, Orders, Audit, Staff.
- ⬜ **P1 Skeleton loaders** instead of spinners on lists.
- ⬜ **P1 Order detail** component reused by client + staff.
- ⬜ **P2 Error boundary** page + offline handling.
- ⬜ **P2 a11y pass** (focus trap in modals, ARIA, axe audit).

## Execution order (recommended)
1. Shared `DataTable` + skeletons → upgrades Products/Inventory/Orders/Audit at once.
2. Order detail + cancel (client) and order drawer (staff).
3. Editable profile + auth password toggle.
4. Catalog sort/filters + Product stock display.
5. Dashboard charts.

> Test plan & results: see [TEST_REPORT.md](TEST_REPORT.md).
