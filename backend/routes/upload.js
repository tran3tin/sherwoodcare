const express = require("express");
const multer = require("multer");
const {
  uploadFile,
  getFiles,
  deleteFile,
} = require("../controllers/uploadController");

const router = express.Router();

// Cấu hình Multer (Lưu tạm vào RAM để xử lý nhanh)
const upload = multer({
  storage: multer.memoryStorage(),
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
