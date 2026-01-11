const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function runAutoMigrations() {
  try {
    console.log("\n🔄 Bắt đầu tự động tạo database...");

    const migrationFile = path.join(
      __dirname,
      "..",
      "migrations",
      "00_init_all_tables.sql"
    );

    if (!fs.existsSync(migrationFile)) {
      console.log("❌ Không tìm thấy file migration!");
      return;
    }

    const sql = fs.readFileSync(migrationFile, "utf8");

    // Execute the migration SQL
    await db.pool.query(sql);

    console.log("✅ Database đã được tạo thành công!");
    console.log("✅ Tất cả các bảng đã sẵn sàng.\n");
  } catch (error) {
    // If error is "already exists", that's OK
    if (error.message.includes("already exists")) {
      console.log("ℹ️  Database đã tồn tại - bỏ qua migration.\n");
    } else {
      console.error("❌ Lỗi khi tạo database:", error.message);
      throw error;
    }
  }
}

module.exports = runAutoMigrations;
