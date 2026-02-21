const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadFile,
  getFiles,
  deleteFile,
} = require("../controllers/uploadController");

const router = express.Router();

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer - lưu vào Railway Volume
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
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  },
});

// Upload file
// 'file' là tên trường dữ liệu Frontend gửi lên (FormData)
router.post("/", upload.single("file"), uploadFile);

// Lấy danh sách file
router.get("/", getFiles);

// Xóa file
router.delete("/:id", deleteFile);

module.exports = router;
