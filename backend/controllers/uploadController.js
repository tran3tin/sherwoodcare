const { bucket, isConfigured } = require("../config/firebase");
const pool = require("../config/db");

/**
 * Upload file lên Firebase Storage và lưu URL vào Supabase
 * @param {Object} req - Express request với file từ multer
 * @param {Object} res - Express response
 */
const uploadFile = async (req, res) => {
  try {
    // Kiểm tra Firebase đã được cấu hình chưa
    if (!isConfigured || !bucket) {
      return res.status(503).json({
        success: false,
        error:
          "Firebase Storage chưa được cấu hình. Vui lòng xem FIREBASE_SETUP.md",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng chọn file!",
      });
    }

    // 1. Tạo tên file duy nhất (để tránh bị trùng)
    const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // 2. Upload lên Firebase Storage
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      console.error("Firebase upload error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    });

    blobStream.on("finish", async () => {
      try {
        // 3. Làm cho file public và lấy URL
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // 4. Lưu thông tin vào Supabase
        // Giả sử bạn có bảng 'documents' với cột 'name' và 'file_url'
        const query =
          "INSERT INTO documents (name, file_url, created_at) VALUES ($1, $2, NOW()) RETURNING *";
        const values = [req.file.originalname, publicUrl];

        const result = await pool.query(query, values);

        res.status(200).json({
          success: true,
          message: "Upload thành công!",
          data: result.rows[0],
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(500).json({
          success: false,
          error: "Lỗi khi lưu vào database: " + dbError.message,
        });
      }
    });

    // Bắt đầu upload
    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách file từ Supabase
 */
const getFiles = async (req, res) => {
  try {
    const query = "SELECT * FROM documents ORDER BY created_at DESC";
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Xóa file khỏi Firebase Storage và Supabase
 */
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Lấy thông tin file từ database
    const fileQuery = "SELECT * FROM documents WHERE id = $1";
    const fileResult = await pool.query(fileQuery, [id]);

    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "File không tồn tại",
      });
    }

    const file = fileResult.rows[0];

    // 2. Extract file path from URL
    // URL format: https://storage.googleapis.com/bucket-name/uploads/filename
    const urlParts = file.file_url.split("/");
    const filePath = urlParts.slice(4).join("/"); // Get path after bucket name

    // 3. Xóa file khỏi Firebase Storage
    try {
      await bucket.file(filePath).delete();
    } catch (storageError) {
      console.warn("Firebase delete warning:", storageError.message);
      // Tiếp tục xóa trong database ngay cả khi file không tồn tại trên Firebase
    }

    // 4. Xóa record khỏi database
    const deleteQuery = "DELETE FROM documents WHERE id = $1 RETURNING *";
    const deleteResult = await pool.query(deleteQuery, [id]);

    res.status(200).json({
      success: true,
      message: "Xóa file thành công",
      data: deleteResult.rows[0],
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile,
};
