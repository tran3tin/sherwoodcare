require("dotenv").config();
const db = require("../config/db");

async function createTimesheetTables() {
  try {
    console.log(`Creating timesheet tables for PostgreSQL...`);

    // PostgreSQL schema
    await db.query(`
      CREATE TABLE IF NOT EXISTS timesheet_periods (
        period_id SERIAL PRIMARY KEY,
        start_date DATE NOT NULL,
        num_days INTEGER NOT NULL CHECK (num_days IN (7,14,21,30)),
        num_rows INTEGER NOT NULL CHECK (num_rows BETWEEN 1 AND 200),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS timesheet_entries (
        entry_id SERIAL PRIMARY KEY,
        period_id INTEGER REFERENCES timesheet_periods(period_id) ON DELETE CASCADE,
        row_number INTEGER NOT NULL,
        note VARCHAR(255),
        period VARCHAR(100),
        hrs VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (period_id, row_number)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS timesheet_days (
        day_id SERIAL PRIMARY KEY,
        entry_id INTEGER REFERENCES timesheet_entries(entry_id) ON DELETE CASCADE,
        day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 29),
        staff_name VARCHAR(255),
        UNIQUE (entry_id, day_index)
      )
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_entries_period ON timesheet_entries(period_id)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_days_entry ON timesheet_days(entry_id)
    `);

    console.log("✅ Timesheet tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating timesheet tables:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

createTimesheetTables();
