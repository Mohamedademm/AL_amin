import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { ENV } from "./config/env";
import { errorHandler, AppError } from "./middleware/errorHandler";
import passport from "./config/passport";
import { ctx } from "./lib/requestContext";
import { logger } from "./lib/logger";

import authRoutes from "./modules/auth/routes";
import productRoutes from "./modules/product/routes";
import categoryRoutes from "./modules/category/routes";
import orderRoutes from "./modules/order/routes";
import inventoryRoutes from "./modules/inventory/routes";
import spotRoutes from "./modules/spot/routes";
import userRoutes from "./modules/user/routes";
import dashboardRoutes from "./modules/dashboard/routes";
import discountRoutes from "./modules/discount/routes";
import auditRoutes from "./modules/audit/routes";
import restockRoutes from "./modules/restock/routes";
import loyaltyRoutes from "./modules/loyalty/routes";

const app = express();

// Trust the Vercel/proxy hop so secure cookies + rate-limit see the real IP.
app.set("trust proxy", 1);

// Security headers. In production also force HTTPS for a year (HSTS, with
// preload) so browsers never downgrade to http after the first secure visit.
app.use(
  helmet({
    hsts:
      ENV.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  }),
);

// Build the CORS allowlist from CLIENT_URL (comma-separated) and also accept
// any preview/production deployment on the same Vercel account (*.vercel.app).
const staticOrigins = ENV.CLIENT_URL.split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const isAllowedOrigin = (origin?: string) =>
  !origin ||
  staticOrigins.includes(origin) ||
  /\.vercel\.app$/.test(new URL(origin).hostname) ||
  (ENV.NODE_ENV !== "production" && /^localhost$/i.test(new URL(origin).hostname));

app.use(
  cors({
    origin: (origin, cb) =>
      isAllowedOrigin(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS")),
    credentials: true,
  }),
);

// Structured request logging (replaces morgan): one JSON line per request in
// prod, pretty-printed in dev. Health checks are silenced to avoid noise.
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === "/health" },
  }),
);
app.use(express.json({ limit: "1mb" })); // cap request body size
app.use(cookieParser()); // parse the httpOnly auth cookie
app.use(passport.initialize()); // Google OAuth strategy

// Create an AsyncLocalStorage context for every request so the Prisma audit
// middleware can access the authenticated user's ID set by `authenticate`.
app.use((_req, _res, next) => ctx.run({ userId: "" }, next));

// Serve uploaded product images as static assets (local dev; on Vercel the
// filesystem is read-only so uploads are local-only — the seed uses CDN URLs).
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Throttle authentication endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many attempts, please try again later.",
  },
});

// Health Check — also reports the deployed commit/branch (Vercel injects these
// at build time) so you can verify *which* version is actually live in prod.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "local",
    env: ENV.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/spots", spotRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/restock", restockRoutes);
app.use("/api/loyalty", loyaltyRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError("Resource not found", 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
