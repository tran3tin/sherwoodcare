const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function runAutoMigrations() {
  console.log("\n🔄 Bắt đầu tự động tạo database...");

  const runFile = async (filename, label) => {
    const filePath = path.join(__dirname, "..", "migrations", filename);
    if (!fs.existsSync(filePath)) return;

    try {
      console.log(`📝 Chạy migration: ${label || filename}`);
      const sql = fs.readFileSync(filePath, "utf8");
      await db.pool.query(sql);
      console.log(`✅ OK: ${label || filename}`);
    } catch (error) {
      const message = (error && error.message) || "";
      if (message.includes("already exists")) {
        console.log(`ℹ️  Bỏ qua (already exists): ${label || filename}`);
        return;
      }
      console.error(`❌ Lỗi migration (${label || filename}):`, message);
      throw error;
    }
  };

  await runFile("00_init_all_tables.sql", "00_init_all_tables.sql");
  await runFile(
    "01_alter_customers_add_new_fields.sql",
    "01_alter_customers_add_new_fields.sql"
  );
  await runFile(
    "02_alter_notes_add_pinning.sql",
    "02_alter_notes_add_pinning.sql"
  );
  await runFile(
    "03_alter_tasks_kanban_schema.sql",
    "03_alter_tasks_kanban_schema.sql"
  );

  await runFile("04_create_general_notes.sql", "04_create_general_notes.sql");
  await runFile(
    "05_alter_tasks_add_pinning.sql",
    "05_alter_tasks_add_pinning.sql"
  );

  console.log("✅ Database migrations finished.\n");
}

module.exports = runAutoMigrations;
