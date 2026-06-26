import multer from "multer";
import path from "path";
import fs from "fs";

// Resolve uploads relative to the server working dir (CJS-safe — no import.meta).
// On Vercel the filesystem is read-only/ephemeral, so uploads only persist in
// local dev; the mkdir is guarded so importing this module never crashes.
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads/products");
try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch {
  /* read-only fs (serverless) — ignore */
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
