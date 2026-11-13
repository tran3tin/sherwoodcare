const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { subdir, absolutePathFor } = require("../config/upload");
const NoteAttachmentModel = require("../models/NoteAttachmentModel");

/**
 * Shared upload + attachment handling for customer / employee / general notes.
 * A note can carry any number of files (10MB each).
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

/**
 * Express middleware accepting any number of files in the "attachments"
 * field (and the old single "attachment" field, for older clients).
 * @param {string} folder subfolder of the upload dir, e.g. "customer-notes"
 */
function noteUpload(folder) {
  const uploadDir = subdir(folder);

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `note-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
      cb(
        new Error(
          `Invalid file type (${file.originalname}). Only images and documents are allowed.`
        ),
        false
      );
    },
    limits: { fileSize: MAX_FILE_SIZE },
  }).fields([{ name: "attachments" }, { name: "attachment" }]);

  // Report upload problems as JSON the UI can show instead of a bare 500
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (!err) return next();
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large (max 10MB per file)"
          : err.message || "File upload failed";
      res.status(400).json({ success: false, error: message });
    });
  };
}

// multer hands multipart filenames over as latin1, which garbles UTF-8 names
// (e.g. Vietnamese). Re-decode only when that is provably what happened.
function decodeFileName(name) {
  const raw = String(name || "");
  // Any char above 0xFF means the name is already real Unicode
  if ([...raw].some((ch) => ch.charCodeAt(0) > 0xff)) return raw;
  const decoded = Buffer.from(raw, "latin1").toString("utf8");
  return decoded.includes(String.fromCharCode(0xfffd)) ? raw : decoded;
}

/** Files of the current request as [{ url, name }] */
function uploadedFiles(req, folder) {
  const files = [
    ...(req.files?.attachments || []),
    ...(req.files?.attachment || []),
  ];
  return files.map((file) => ({
    url: `/uploads/${folder}/${file.filename}`,
    name: decodeFileName(file.originalname),
  }));
}

/** Remove a stored file given its public "/uploads/..." url. Never throws. */
function deleteStoredFile(url) {
  if (!url || !String(url).startsWith("/uploads/")) return;
  try {
    const filePath = absolutePathFor(String(url).replace(/^\/uploads\//, ""));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Failed to delete attachment file:", url, err.message);
  }
}

/** Parse the remove_attachment_ids form field (JSON array) */
function parseRemoveIds(raw) {
  if (!raw) return [];
  try {
    const ids = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(ids) ? ids : [];
  } catch (_) {
    return [];
  }
}

/**
 * Apply the attachment changes of an update request.
 * Returns the legacy attachment columns to store on the note row.
 */
async function applyAttachmentChanges(req, noteType, folder, existingNote) {
  const noteId = existingNote.note_id;
  const removeIds = parseRemoveIds(req.body.remove_attachment_ids);

  const removed = await NoteAttachmentModel.remove(noteType, noteId, removeIds);
  removed.forEach((att) => deleteStoredFile(att.url));

  let attachment_url = existingNote.attachment_url;
  let attachment_name = existingNote.attachment_name;
  const removeLegacy =
    req.body.remove_attachment === "true" ||
    removeIds.includes(NoteAttachmentModel.LEGACY_ID);
  if (removeLegacy && attachment_url) {
    deleteStoredFile(attachment_url);
    attachment_url = null;
    attachment_name = null;
  }

  await NoteAttachmentModel.add(noteType, noteId, uploadedFiles(req, folder));

  return { attachment_url, attachment_name };
}

/** Delete every file (legacy + table) of a note that is being deleted */
async function deleteAllAttachments(noteType, note) {
  deleteStoredFile(note.attachment_url);
  const removed = await NoteAttachmentModel.removeAll(noteType, note.note_id);
  removed.forEach((att) => deleteStoredFile(att.url));
}

module.exports = {
  noteUpload,
  uploadedFiles,
  deleteStoredFile,
  applyAttachmentChanges,
  deleteAllAttachments,
};
