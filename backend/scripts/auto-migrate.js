const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function runAutoMigrations() {
  console.log("\n🔄 Bắt đầu tự động tạo database...");

  const schemaPath = path.join(__dirname, "..", "migrations", "schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.log(`⚠️  File không tồn tại: ${schemaPath}`);
    throw new Error("schema.sql not found");
  }

  try {
    // Test database connection first
    console.log("🔌 Kiểm tra kết nối database...");
    await db.pool.query("SELECT 1");
    console.log("✅ Kết nối database OK");
  } catch (connError) {
    console.error("❌ Không thể kết nối database:", connError.message);
    throw connError;
  }

  try {
    console.log("📝 Chạy migration: schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    // schema.sql is a multi-statement script; multipleStatements is enabled in
    // the pool config, so the whole file can be sent in one call.
    await db.pool.query(sql);
    console.log("✅ OK: schema.sql");
  } catch (error) {
    const message = (error && error.message) || "";
    if (
      message.includes("already exists") ||
      message.includes("duplicate key") ||
      message.includes("Duplicate column")
    ) {
      console.log(`ℹ️  Bỏ qua (already exists): schema.sql`);
    } else {
      console.error(`❌ Lỗi migration (schema.sql):`, message);
      throw error;
    }
  }

  console.log("✅ Database migrations finished.\n");
}

module.exports = runAutoMigrations;

// Allow running standalone (npm run migrate)
if (require.main === module) {
  runAutoMigrations()
    .then(() => {
      console.log("✅ Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Failed:", err && err.message ? err.message : err);
      process.exit(1);
    });
}