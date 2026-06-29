import dotenv from "dotenv";

dotenv.config();

/**
 * Centralized environment variable configuration.
 * Ensures that required variables are present at startup.
 */
export const ENV = {
  PORT: process.env.PORT || "5000",
  DATABASE_URL: process.env.DATABASE_URL as string,
  // No fallback on purpose: a hard-coded default secret lets anyone forge admin
  // JWTs. The validation below fails fast if it is missing or too weak.
  JWT_SECRET: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV || "development",
  // Allowed browser origin for CORS (the Vite client).
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback",
};

// Validate critical environment variables — Google OAuth vars are optional.
const OPTIONAL_KEYS = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
const missingVars = Object.entries(ENV)
  .filter(([key, value]) => !OPTIONAL_KEYS.includes(key) && !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing critical environment variables: ${missingVars.join(", ")}`,
  );
}

// Reject weak JWT secrets so a forgeable token can never reach production.
if (ENV.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters. Generate one with: openssl rand -hex 32",
  );
}
