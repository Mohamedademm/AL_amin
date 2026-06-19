# Deployment Guide — Vercel + Neon

Production deployment of **Al Amine** as **two Vercel projects** (frontend + backend
serverless API) backed by a **Neon** serverless PostgreSQL database, all from the
single GitHub repo [`Mohamedademm/AL_amin`](https://github.com/Mohamedademm/AL_amin).

```
                         ┌─────────────────────────────┐
  Browser ──HTTPS──▶     │  al-amin (frontend)          │   Vite static SPA
                         │  *.vercel.app                │   VITE_API_URL ─┐
                         └─────────────────────────────┘                 │
                                                                          ▼
                         ┌─────────────────────────────┐   Express on @vercel/node
  XHR /api/* ──HTTPS──▶  │  al-amin-api (backend)       │   api/index.ts → src/app.ts
                         │  *.vercel.app                │   DATABASE_URL ─┐
                         └─────────────────────────────┘                 │
                                                                          ▼
                         ┌─────────────────────────────┐   pooled (PgBouncer)
                         │  Neon PostgreSQL             │   *-pooler...neon.tech
                         └─────────────────────────────┘
```

> Auth uses a **Bearer JWT** (stored client-side), which works cleanly across the
> two different `*.vercel.app` domains — no cross-site cookie configuration needed.

---

## Step 1 — Create the Neon database

1. Go to <https://console.neon.tech> → **New Project** (region close to your Vercel
   region, e.g. Frankfurt / `eu-central`).
2. After creation, open **Connection Details** and copy the **Pooled connection**
   string (the host contains `-pooler`). It looks like:
   ```
   postgresql://<user>:<password>@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   Keep this — it is your production `DATABASE_URL`.

## Step 2 — Apply the schema + seed (one time, from your machine)

Point your local CLI at Neon and push the schema + demo data:

```bash
cd server
# Use the Neon pooled URL just for these commands:
#   PowerShell:  $env:DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
#   bash:        export DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
npx prisma migrate deploy     # creates all tables on Neon
npx tsx prisma/seed.ts        # 16 products, 3 spots, 4 demo users
```

Demo logins (password `Password123!`): `admin@alamine.com`, `manager@alamine.com`,
`worker@alamine.com`, `client@alamine.com`.

## Step 3 — Deploy the BACKEND (al-amin-api)

1. <https://vercel.com/mohamed-adems-projects> → **Add New… → Project**.
2. Import the GitHub repo **`Mohamedademm/AL_amin`**.
3. **Root Directory** → click *Edit* → select **`server`**.
4. Framework Preset: **Other** (Vercel auto-detects the `api/` serverless function).
5. **Environment Variables** (Production + Preview):

   | Key | Value |
   | :-- | :-- |
   | `DATABASE_URL` | the Neon **pooled** URL from Step 1 |
   | `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | leave blank for now — set after Step 4 |

6. **Deploy**. When done, copy the URL, e.g. `https://al-amin-api.vercel.app`.
7. Verify: open `https://al-amin-api.vercel.app/health` → should return
   `{"status":"OK",...}`. Then `…/api/products` should return the seeded catalog.

## Step 4 — Deploy the FRONTEND (al-amin)

1. Again **Add New… → Project** → import the **same** repo `Mohamedademm/AL_amin`.
2. **Root Directory** → **`client`**.
3. Framework Preset: **Vite** (auto-detected). Build = `npm run build`, Output = `dist`.
4. **Environment Variables**:

   | Key | Value |
   | :-- | :-- |
   | `VITE_API_URL` | `https://al-amin-api.vercel.app/api` (backend URL **+ `/api`**) |

5. **Deploy**. Copy the frontend URL, e.g. `https://al-amin.vercel.app`.

## Step 5 — Close the CORS loop

1. Back in the **al-amin-api** project → **Settings → Environment Variables**.
2. Set `CLIENT_URL` = `https://al-amin.vercel.app` (your frontend URL).
   > Any `*.vercel.app` origin is already allowed by the app, so preview
   > deployments work too — this just pins the canonical production origin.
3. **Redeploy** the backend (Deployments → ⋯ → Redeploy) so the new env var loads.

## Step 6 — Smoke test in the browser

- Open the frontend URL, log in as `admin@alamine.com` / `Password123!`.
- Catalog loads products, dashboard shows KPIs, place + track an order.
- DevTools → Network: requests go to `https://al-amin-api.vercel.app/api/...` → `200`.

---

## How the serverless wiring works

| File | Role |
| :-- | :-- |
| `server/src/app.ts` | Builds & exports the configured Express app (no `listen`). |
| `server/src/server.ts` | Local entrypoint — imports the app and calls `listen`. |
| `server/api/index.ts` | Vercel function — `export default app`. |
| `server/vercel.json` | Rewrites every path to `/api/index` so Express routes still match. |
| `server/package.json` | `postinstall`/`vercel-build` run `prisma generate` on each build. |
| `client/vercel.json` | SPA rewrite — all paths → `index.html` for client-side routing. |

## Auto-deploys

Both projects are linked to `Mohamedademm/AL_amin`. Every push to **`main`**
triggers a production redeploy; pushes to other branches create preview URLs.

## Troubleshooting

| Symptom | Fix |
| :-- | :-- |
| `500` on every API call | Check `DATABASE_URL` is the **pooled** Neon URL with `?sslmode=require`. |
| `CORS` error in console | Set `CLIENT_URL` on the backend to the exact frontend origin, then redeploy. |
| Frontend 404 on refresh of a sub-route | Ensure `client/vercel.json` SPA rewrite is present. |
| `PrismaClientInitializationError` | Confirm `postinstall` ran (`prisma generate`) in the backend build logs. |
| API works but `/health` 404 | You opened the frontend URL — use the **backend** project URL. |
