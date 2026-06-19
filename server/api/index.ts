// Vercel serverless entrypoint — exports the Express app as the function handler.
// All routes are rewritten to this file via vercel.json, so Express still sees
// the original /api/... path and matches its routers unchanged.
import app from '../src/app';

export default app;
