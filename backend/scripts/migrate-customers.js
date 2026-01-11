const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function runMigration() {
  try {
    console.log("🔄 Starting customer table migration...");

    // Check if first_name column exists
    const checkColumn = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'customers' 
            AND column_name = 'first_name'
        `);

    if (checkColumn.rows.length > 0) {
      console.log("✅ Columns already exist, skipping migration");
      process.exit(0);
    }

    console.log("📝 Running migration: 01_alter_customers_add_new_fields.sql");
    const sqlPath = path.join(
      __dirname,
      "../migrations/01_alter_customers_add_new_fields.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    await db.query(sql);

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
