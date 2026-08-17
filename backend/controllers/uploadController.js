const path = require("path");
const fs = require("fs");
const { query: dbQuery } = require("../config/db");
const { publicUrlFor, absolutePathFor } = require("../config/upload");

/**
 * Upload file to local Coolify volume / disk and store URL in `documents`.
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng chọn file!",
      });
    }

    // Public URL served by express.static("/uploads", ...)
    const publicUrl = publicUrlFor(req.file.filename);

    const sql =
      "INSERT INTO documents (name, file_url, created_at) VALUES (?, ?, NOW())";
    const values = [req.file.originalname, publicUrl];

    const result = await dbQuery(sql, values);

    const inserted = await dbQuery("SELECT * FROM documents WHERE id = ?", [
      result.insertId,
    ]);
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
 * List uploaded documents.
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
 * Delete file from disk + database.
 */
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

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

    // Remove from disk (best-effort)
    try {
      const filename = path.basename(file.file_url || "");
      if (filename) {
        const filePath = absolutePathFor(filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fsError) {
      console.warn("File delete warning:", fsError.message);
    }

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
