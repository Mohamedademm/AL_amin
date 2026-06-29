import app from "./app";
import { ENV } from "./config/env";
import { logger } from "./lib/logger";
import { startOrderCleanup } from "./modules/order/cleanup";

// Local/long-running entrypoint — Vercel uses api/index.ts instead (serverless).
const PORT = Number(ENV.PORT);

// Background order-expiry sweep — only on the long-running local server, not on
// serverless (where setInterval can't persist between invocations).
startOrderCleanup();

app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
  logger.info(`🔗 API base URL: http://localhost:${PORT}/api`);
});
