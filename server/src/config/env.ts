import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment variable configuration.
 * Ensures that required variables are present at startup.
 */
export const ENV = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET || 'your_default_secret_change_this_in_production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Allowed browser origin for CORS (the Vite client).
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate critical environment variables
const missingVars = Object.entries(ENV)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing critical environment variables: ${missingVars.join(', ')}`);
}
