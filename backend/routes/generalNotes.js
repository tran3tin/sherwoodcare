const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const generalNoteController = require("../controllers/generalNoteController");

// Ensure upload directory exists
const uploadDir = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "general-notes"
);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `note-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
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

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only images and documents are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get("/", generalNoteController.getAllNotes);
router.get("/:noteId", generalNoteController.getNoteById);
router.post("/", upload.single("attachment"), generalNoteController.createNote);
router.put(
  "/:noteId",
  upload.single("attachment"),
  generalNoteController.updateNote
);
router.patch("/:noteId/toggle", generalNoteController.toggleNoteComplete);
router.patch("/:noteId/pin", generalNoteController.toggleNotePin);
router.delete("/:noteId", generalNoteController.deleteNote);

module.exports = router;
