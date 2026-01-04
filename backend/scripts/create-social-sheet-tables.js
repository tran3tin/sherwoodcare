require("dotenv").config();
const db = require("../config/db");

async function createSocialSheetTables() {
  try {
    console.log(`Creating social sheet tables for ${db.client}...`);

    if (db.client === "pg") {
      await db.query(`
        CREATE TABLE IF NOT EXISTS social_sheets (
          sheet_id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          rows_json TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      await db.query(`
        CREATE TABLE IF NOT EXISTS social_sheets (
          sheet_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NULL,
          rows_json LONGTEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_social_sheets_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    console.log("✅ Social sheet tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating social sheet tables:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

createSocialSheetTables();
