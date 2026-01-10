const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const employeeNoteController = require("../controllers/employeeNoteController");

// Ensure upload directory exists
const uploadDir = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "employee-notes"
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
  // Allow images and common document types
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Routes
router.get(
  "/employee/:employeeId",
  employeeNoteController.getNotesByEmployeeId
);
router.get("/employee/:employeeId/count", employeeNoteController.getNotesCount);
router.get("/:noteId", employeeNoteController.getNoteById);
router.post(
  "/",
  upload.single("attachment"),
  employeeNoteController.createNote
);
router.put(
  "/:noteId",
  upload.single("attachment"),
  employeeNoteController.updateNote
);
router.patch("/:noteId/toggle", employeeNoteController.toggleNoteComplete);
router.delete("/:noteId", employeeNoteController.deleteNote);

module.exports = router;
