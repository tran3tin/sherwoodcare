require("dotenv").config();
const db = require("../config/db");

async function createEmployeeTables() {
  try {
    console.log(`Creating employee tables for ${db.client}...`);

    if (db.client === "pg") {
      // PostgreSQL schema
      await db.query(`
        CREATE TABLE IF NOT EXISTS employees (
          employee_id SERIAL PRIMARY KEY,
          last_name VARCHAR(100) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          preferred_name VARCHAR(100),
          level VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      // MySQL schema
      await db.query(`
        CREATE TABLE IF NOT EXISTS employees (
          employee_id INT AUTO_INCREMENT PRIMARY KEY,
          last_name VARCHAR(100) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          preferred_name VARCHAR(100),
          level VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    console.log("✅ Employee tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating employee tables:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

createEmployeeTables();
