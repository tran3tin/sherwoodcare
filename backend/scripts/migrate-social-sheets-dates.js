require("dotenv").config();
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("Running migration: add_dates_to_social_sheets.sql");

    const sqlPath = path.join(
      __dirname,
      "../migrations/add_dates_to_social_sheets.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    await db.query(sql);

    console.log("✅ Migration completed successfully!");
    console.log("Added start_date and end_date columns to social_sheets table");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
