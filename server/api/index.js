// Vercel serverless entrypoint (plain CommonJS so Vercel ships it as-is).
// The whole Express app is pre-bundled by `npm run build:api` (esbuild) into
// dist/app.cjs, which avoids Vercel's per-file TS handling that can't resolve
// our cross-directory src/ imports at runtime.
const mod = require('../dist/app.cjs');

module.exports = mod.default || mod;
