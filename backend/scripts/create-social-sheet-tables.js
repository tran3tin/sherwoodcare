require("dotenv").config();
const db = require("../config/db");

async function createSocialSheetTables() {
  try {
    console.log("Creating social sheet tables for PostgreSQL...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS social_sheets (
        sheet_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        rows_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_social_sheets_created ON social_sheets(created_at)`
    );

    console.log("✅ Social sheet tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating social sheet tables:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

createSocialSheetTables();
