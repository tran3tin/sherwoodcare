const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const trainingArticleController = require("../controllers/trainingArticleController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "public", "uploads", "training");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `training-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

router.get("/", trainingArticleController.getAllArticles);
router.post(
  "/",
  upload.single("attachment"),
  trainingArticleController.createArticle,
);
router.put(
  "/:articleId",
  upload.single("attachment"),
  trainingArticleController.updateArticle,
);
router.delete("/:articleId", trainingArticleController.deleteArticle);

module.exports = router;
