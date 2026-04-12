const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function runAutoMigrations() {
  console.log("\n🔄 Bắt đầu tự động tạo database...");

  const runFile = async (filename, label) => {
    const filePath = path.join(__dirname, "..", "migrations", filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File không tồn tại: ${filename}`);
      return;
    }

    try {
      console.log(`📝 Chạy migration: ${label || filename}`);
      const sql = fs.readFileSync(filePath, "utf8");
      await db.pool.query(sql);
      console.log(`✅ OK: ${label || filename}`);
    } catch (error) {
      const message = (error && error.message) || "";
      // Skip if already exists or duplicate
      if (
        message.includes("already exists") ||
        message.includes("duplicate key") ||
        message.includes("already a partition")
      ) {
        console.log(`ℹ️  Bỏ qua (already exists): ${label || filename}`);
        return;
      }
      console.error(`❌ Lỗi migration (${label || filename}):`, message);
      // Don't throw - continue with other migrations
      console.log(`⚠️  Tiếp tục với các migrations khác...`);
    }
  };

  try {
    // Test database connection first
    console.log("🔌 Kiểm tra kết nối database...");
    await db.pool.query("SELECT 1");
    console.log("✅ Kết nối database OK");
  } catch (connError) {
    console.error("❌ Không thể kết nối database:", connError.message);
    throw connError;
  }

  await runFile("00_init_all_tables.sql", "00_init_all_tables.sql");
  await runFile(
    "01_alter_customers_add_new_fields.sql",
    "01_alter_customers_add_new_fields.sql",
  );
  await runFile(
    "02_alter_notes_add_pinning.sql",
    "02_alter_notes_add_pinning.sql",
  );
  await runFile(
    "03_alter_tasks_kanban_schema.sql",
    "03_alter_tasks_kanban_schema.sql",
  );

  await runFile("04_create_general_notes.sql", "04_create_general_notes.sql");
  await runFile(
    "05_alter_tasks_add_pinning.sql",
    "05_alter_tasks_add_pinning.sql",
  );
  await runFile(
    "06_create_task_attachments.sql",
    "06_create_task_attachments.sql",
  );
  await runFile(
    "07_alter_employees_social_level.sql",
    "07_alter_employees_social_level.sql",
  );
  await runFile(
    "08_create_training_articles.sql",
    "08_create_training_articles.sql",
  );
  await runFile(
    "09_add_training_article_attachments.sql",
    "09_add_training_article_attachments.sql",
  );

  console.log("✅ Database migrations finished.\n");
}

module.exports = runAutoMigrations;

