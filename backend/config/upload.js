const path = require("path");
const fs = require("fs");

/**
 * Local disk storage for Coolify / self-hosted deploys.
 * No Firebase — files live under UPLOAD_DIR (default: backend/public/uploads).
 *
 * On Coolify, mount a Persistent Volume to the same path so files survive redeploys.
 */

const DEFAULT_UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

function resolveUploadDir() {
  const raw = process.env.UPLOAD_DIR;
  if (raw && String(raw).trim()) {
    return path.isAbsolute(raw)
      ? path.normalize(raw)
      : path.resolve(process.cwd(), raw);
  }
  return DEFAULT_UPLOAD_DIR;
}

const uploadDir = resolveUploadDir();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

ensureDir(uploadDir);

/** Subfolder helpers (created on demand) */
function subdir(...parts) {
  return ensureDir(path.join(uploadDir, ...parts));
}

/**
 * Public base URL of this backend (no trailing slash).
 * Used to build absolute file URLs: `${backendPublicUrl()}/uploads/...`
 */
function backendPublicUrl() {
  const raw =
    process.env.BACKEND_URL ||
    process.env.PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 3000}`;
  return String(raw).replace(/\/$/, "");
}

/**
 * Build a public URL for a file stored under uploadDir.
 * @param {string} relativePath path relative to upload root, e.g. "file-123.pdf" or "training/x.pdf"
 */
function publicUrlFor(relativePath) {
  const cleaned = String(relativePath || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  return `${backendPublicUrl()}/uploads/${cleaned}`;
}

/**
 * Absolute filesystem path for a stored relative path / filename.
 */
function absolutePathFor(relativePath) {
  const cleaned = String(relativePath || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  return path.join(uploadDir, cleaned);
}

module.exports = {
  uploadDir,
  ensureDir,
  subdir,
  backendPublicUrl,
  publicUrlFor,
  absolutePathFor,
};
