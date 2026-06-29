import pino from "pino";
import { ENV } from "../config/env";

// Single structured logger for the whole server. Pretty, colourised output in
// development; compact JSON (one line per event) in production so logs are
// machine-parseable by Vercel / any log drain.
export const logger = pino({
  level: process.env.LOG_LEVEL || (ENV.NODE_ENV === "production" ? "info" : "debug"),
  ...(ENV.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
      }
    : {}),
  // Never let a token or password reach the logs.
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password"],
});

export default logger;
