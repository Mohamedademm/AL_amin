// Integration tests for the Al Amine API (zero-dependency, Node's built-in test
// runner). Requires the dev server (:5000) + seeded database to be running.
// Run with:  npm test   (from server/)
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

const API = process.env.API_URL || 'http://localhost:5000';

// Thin fetch wrapper returning { status, json, headers }.
async function call(path, { method = 'GET', body, token, origin } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (origin) headers.Origin = origin;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let json = null;
  try { json = await res.json(); } catch { /* no body */ }
  return { status: res.status, json, headers: res.headers };
}

let adminToken, clientToken, clientId;

before(async () => {
  const ping = await call('/health').catch(() => null);
  if (!ping || ping.status !== 200) {
    throw new Error('API not reachable on :5000 — start the server (npm run dev) and seed first.');
  }
  const a = await call('/api/auth/login', { method: 'POST', body: { email: 'admin@alamine.com', password: 'Password123!' } });
  adminToken = a.json?.data?.token;
  const c = await call('/api/auth/login', { method: 'POST', body: { email: 'client@alamine.com', password: 'Password123!' } });
  clientToken = c.json?.data?.token;
  clientId = c.json?.data?.user?.id;
  assert.ok(adminToken && clientToken, 'should obtain admin + client tokens');
});

// ── Health & security ───────────────────────────────────────────────
test('health endpoint responds OK', async () => {
  const r = await call('/health');
  assert.equal(r.status, 200);
  assert.equal(r.json.status, 'OK');
});

test('helmet security headers are present', async () => {
  const r = await call('/health');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(r.headers.get('x-frame-options'));
});

test('auth endpoints expose rate-limit headers', async () => {
  const r = await call('/api/auth/login', { method: 'POST', body: { email: 'admin@alamine.com', password: 'Password123!' } });
  assert.ok(r.headers.get('ratelimit-limit') || r.headers.get('ratelimit'), 'rate-limit header present');
});

// ── Authentication & validation ─────────────────────────────────────
test('register rejects a weak password', async () => {
  const r = await call('/api/auth/register', { method: 'POST', body: { email: `w${Date.now()}@t.com`, password: '123', firstName: 'A', lastName: 'B' } });
  assert.equal(r.status, 400);
});

test('register rejects a malformed email', async () => {
  const r = await call('/api/auth/register', { method: 'POST', body: { email: 'not-an-email', password: 'Valid1234', firstName: 'A', lastName: 'B' } });
  assert.equal(r.status, 400);
});

test('login with wrong password is rejected (401)', async () => {
  const r = await call('/api/auth/login', { method: 'POST', body: { email: 'admin@alamine.com', password: 'nope' } });
  assert.equal(r.status, 401);
});

test('auth/me returns the current user', async () => {
  const r = await call('/api/auth/me', { token: adminToken });
  assert.equal(r.status, 200);
  assert.equal(r.json.data.role, 'ADMIN');
  assert.ok(!('password' in r.json.data), 'must never leak the password hash');
});

// ── RBAC ────────────────────────────────────────────────────────────
test('protected route without a token returns 401', async () => {
  const r = await call('/api/users');
  assert.equal(r.status, 401);
});

test('client is forbidden from an admin route (403)', async () => {
  const r = await call('/api/users', { token: clientToken });
  assert.equal(r.status, 403);
});

// ── Catalog & pricing ───────────────────────────────────────────────
test('products are public and carry live pricing fields', async () => {
  const r = await call('/api/products');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.json.data) && r.json.data.length > 0);
  const p = r.json.data[0];
  assert.ok('discountPercent' in p && 'discountedPrice' in p, 'pricing fields attached');
});

test('a category discount lowers the effective product price', async () => {
  const cats = (await call('/api/categories')).json.data;
  const cat = cats[0];
  const created = await call('/api/discounts', { method: 'POST', token: adminToken, body: { percentage: 25, scope: 'CATEGORY', categoryId: cat.id } });
  assert.equal(created.status, 201);
  try {
    const products = (await call('/api/products')).json.data;
    const target = products.find((p) => p.categoryId === cat.id);
    assert.equal(target.discountPercent, 25);
    assert.ok(target.discountedPrice < Number(target.price), 'discounted price is lower');
  } finally {
    await call(`/api/discounts/${created.json.data.id}`, { method: 'DELETE', token: adminToken });
  }
});

// ── Orders: state machine + inventory integrity ─────────────────────
test('order pipeline: illegal transition is rejected and stock decrements on accept', async () => {
  const products = (await call('/api/products')).json.data;
  const spots = (await call('/api/spots', { token: adminToken })).json.data;
  const product = products[0];
  const spot = spots.find((s) => s.name !== 'Central Warehouse') || spots[0];

  // Ensure there is stock at the chosen spot.
  await call('/api/inventory', { method: 'PUT', token: adminToken, body: { productId: product.id, spotId: spot.id, quantity: 20 } });

  // Client places an order for 2 units.
  const order = await call('/api/orders', { method: 'POST', token: clientToken, body: { items: [{ productId: product.id, quantity: 2 }], address: 'Test Addr', phone: '+216 00', spotId: spot.id } });
  assert.equal(order.status, 201);
  assert.equal(order.json.data.status, 'PENDING');
  const orderId = order.json.data.id;

  // PENDING -> ACCEPTED directly is illegal.
  const illegal = await call(`/api/orders/${orderId}/status`, { method: 'PATCH', token: adminToken, body: { status: 'ACCEPTED' } });
  assert.equal(illegal.status, 400);

  const stockBefore = (await call(`/api/inventory?spotId=${spot.id}`, { token: adminToken })).json.data.find((i) => i.productId === product.id).quantity;

  // Legal path: PENDING -> VERIFYING -> ACCEPTED.
  await call(`/api/orders/${orderId}/status`, { method: 'PATCH', token: adminToken, body: { status: 'VERIFYING' } });
  const accepted = await call(`/api/orders/${orderId}/status`, { method: 'PATCH', token: adminToken, body: { status: 'ACCEPTED' } });
  assert.equal(accepted.json.data.status, 'ACCEPTED');

  const stockAfter = (await call(`/api/inventory?spotId=${spot.id}`, { token: adminToken })).json.data.find((i) => i.productId === product.id).quantity;
  assert.equal(stockAfter, stockBefore - 2, 'accepting an order decrements boutique stock');
});

test('client can cancel their own PENDING order (and not twice)', async () => {
  const products = (await call('/api/products')).json.data;
  const order = await call('/api/orders', { method: 'POST', token: clientToken, body: { items: [{ productId: products[0].id, quantity: 1 }], address: 'A', phone: '+216 0' } });
  const id = order.json.data.id;

  const cancelled = await call(`/api/orders/${id}/cancel`, { method: 'POST', token: clientToken });
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.json.data.status, 'REFUSED');

  // A non-pending order can no longer be cancelled.
  const again = await call(`/api/orders/${id}/cancel`, { method: 'POST', token: clientToken });
  assert.equal(again.status, 400);
});

test('client only sees their own orders', async () => {
  const r = await call('/api/orders', { token: clientToken });
  assert.equal(r.status, 200);
  assert.ok(r.json.data.every((o) => o.clientId === clientId), 'every order belongs to the client');
});

// ── Admin tooling ───────────────────────────────────────────────────
test('admin can read the audit trail', async () => {
  const r = await call('/api/audit', { token: adminToken });
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.json.data));
});

test('admin dashboard stats are aggregated', async () => {
  const r = await call('/api/dashboard/stats', { token: adminToken });
  assert.equal(r.status, 200);
  assert.ok(typeof r.json.data.products === 'number');
  assert.ok(r.json.data.orders && typeof r.json.data.orders.total === 'number');
});
