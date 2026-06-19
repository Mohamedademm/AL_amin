import app from './app';
import { ENV } from './config/env';

// Local/long-running entrypoint — Vercel uses api/index.ts instead (serverless).
const PORT = Number(ENV.PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});
