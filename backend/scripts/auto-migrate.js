const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function runAutoMigrations() {
  try {
    console.log("\n🔄 Bắt đầu tự động tạo database...");

    // Run the main initialization file
    const initFile = path.join(
      __dirname,
      "..",
      "migrations",
      "00_init_all_tables.sql"
    );

    if (!fs.existsSync(initFile)) {
      console.log("❌ Không tìm thấy file migration!");
      return;
    }

    console.log("📝 Chạy migration: 00_init_all_tables.sql");
    const initSql = fs.readFileSync(initFile, "utf8");
    await db.pool.query(initSql);
    console.log("✅ Khởi tạo bảng thành công!");

    // Run the alter table migration for new fields
    const alterFile = path.join(
      __dirname,
      "..",
      "migrations",
      "01_alter_customers_add_new_fields.sql"
    );

    if (fs.existsSync(alterFile)) {
      console.log("📝 Chạy migration: 01_alter_customers_add_new_fields.sql");
      const alterSql = fs.readFileSync(alterFile, "utf8");
      await db.pool.query(alterSql);
      console.log("✅ Cập nhật các trường mới thành công!");
    }

    // Run the alter table migration for pinning notes
    const pinNotesFile = path.join(
      __dirname,
      "..",
      "migrations",
      "02_alter_notes_add_pinning.sql"
    );

    if (fs.existsSync(pinNotesFile)) {
      console.log("📝 Chạy migration: 02_alter_notes_add_pinning.sql");
      const pinNotesSql = fs.readFileSync(pinNotesFile, "utf8");
      await db.pool.query(pinNotesSql);
      console.log("✅ Cập nhật pin notes thành công!");
    }

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
