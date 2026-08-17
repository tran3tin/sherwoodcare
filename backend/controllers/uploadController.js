const path = require("path");
const fs = require("fs");
const { query: dbQuery } = require("../config/db");

/**
 * Upload file lên Railway Volume (local disk) và lưu URL vào database
 * @param {Object} req - Express request với file từ multer
 * @param {Object} res - Express response
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng chọn file!",
      });
    }

    // File đã được lưu vào disk bởi Multer
    // Tạo URL public để truy cập file
    const backendUrl =
      process.env.BACKEND_URL || `https://sherwoodcare-backend.up.railway.app`;
    const publicUrl = `${backendUrl}/uploads/${req.file.filename}`;

    // Lưu thông tin vào database
    const sql =
      "INSERT INTO documents (name, file_url, created_at) VALUES (?, ?, NOW())";
    const values = [req.file.originalname, publicUrl];

    const result = await dbQuery(sql, values);

    // Fetch the inserted row so the response keeps its shape
    const inserted = await dbQuery(
      "SELECT * FROM documents WHERE id = ?",
      [result.insertId],
    );
    const row = inserted.rows && inserted.rows[0] ? inserted.rows[0] : null;

    res.status(200).json({
      success: true,
      message: "Upload thành công!",
      data: row,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách file từ database
 */
const getFiles = async (req, res) => {
  try {
    const result = await dbQuery(
      "SELECT * FROM documents ORDER BY created_at DESC",
    );

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
 * Xóa file khỏi Railway Volume và database
 */
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Lấy thông tin file từ database
    const fileResult = await dbQuery("SELECT * FROM documents WHERE id = ?", [
      id,
    ]);

    if (!fileResult.rows || fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "File không tồn tại",
      });
    }

    const file = fileResult.rows[0];

    // 2. Xóa file khỏi disk
    try {
      const filename = path.basename(file.file_url);
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        filename,
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsError) {
      console.warn("File delete warning:", fsError.message);
    }

    // 3. Xóa record khỏi database
    await dbQuery("DELETE FROM documents WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Xóa file thành công",
      data: file,
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
