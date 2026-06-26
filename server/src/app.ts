import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { ENV } from "./config/env";
import { errorHandler, AppError } from "./middleware/errorHandler";
import passport from "./config/passport";

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

const app = express();

// Trust the Vercel/proxy hop so secure cookies + rate-limit see the real IP.
app.set("trust proxy", 1);

// Security headers.
app.use(helmet());

// Build the CORS allowlist from CLIENT_URL (comma-separated) and also accept
// any preview/production deployment on the same Vercel account (*.vercel.app).
const staticOrigins = ENV.CLIENT_URL.split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const isAllowedOrigin = (origin?: string) =>
  !origin ||
  staticOrigins.includes(origin) ||
  /\.vercel\.app$/.test(new URL(origin).hostname);

app.use(
  cors({
    origin: (origin, cb) =>
      isAllowedOrigin(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS")),
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" })); // cap request body size
app.use(cookieParser()); // parse the httpOnly auth cookie
app.use(passport.initialize()); // Google OAuth strategy

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

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
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

// 404 Handler
app.use((req, res, next) => {
  next(new AppError("Resource not found", 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
