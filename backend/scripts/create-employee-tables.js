require("dotenv").config();
const db = require("../config/db");

async function createEmployeeTables() {
  try {
    console.log(`Creating employee tables for PostgreSQL...`);

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

    console.log("✅ Employee tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating employee tables:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

createEmployeeTables();
