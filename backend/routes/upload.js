const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadFile,
  getFiles,
  deleteFile,
} = require("../controllers/uploadController");
const { uploadDir } = require("../config/upload");

const router = express.Router();

// Multer → Coolify / local disk (UPLOAD_DIR or backend/public/uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// 'file' = field name from frontend FormData
router.post("/", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.delete("/:id", deleteFile);

module.exports = router;
