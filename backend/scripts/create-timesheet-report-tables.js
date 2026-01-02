require("dotenv").config();
const db = require("../config/db");

async function createTimesheetReportTables() {
  try {
    console.log(`Creating timesheet report tables for ${db.client}...`);

    if (db.client === "pg") {
      await db.query(`
        CREATE TABLE IF NOT EXISTS timesheetreport (
          report_id SERIAL PRIMARY KEY,
          start_date DATE NOT NULL,
          num_days INTEGER NOT NULL CHECK (num_days IN (7,14,21,30)),
          num_rows INTEGER NOT NULL CHECK (num_rows BETWEEN 1 AND 200),
          name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS timesheetreport_entries (
          entry_id SERIAL PRIMARY KEY,
          report_id INTEGER REFERENCES timesheetreport(report_id) ON DELETE CASCADE,
          row_number INTEGER NOT NULL,
          note VARCHAR(255),
          period VARCHAR(100),
          hrs VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (report_id, row_number)
        )
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS timesheetreport_days (
          day_id SERIAL PRIMARY KEY,
          entry_id INTEGER REFERENCES timesheetreport_entries(entry_id) ON DELETE CASCADE,
          day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 29),
          staff_name VARCHAR(255),
          UNIQUE (entry_id, day_index)
        )
      `);

      await db.query(
        `CREATE INDEX IF NOT EXISTS idx_report_entries_report ON timesheetreport_entries(report_id)`
      );

      await db.query(
        `CREATE INDEX IF NOT EXISTS idx_report_days_entry ON timesheetreport_days(entry_id)`
      );
    } else {
      await db.query(`
        CREATE TABLE IF NOT EXISTS timesheetreport (
          report_id INT AUTO_INCREMENT PRIMARY KEY,
          start_date DATE NOT NULL,
          num_days INT NOT NULL,
          num_rows INT NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CHECK (num_days IN (7,14,21,30)),
          CHECK (num_rows BETWEEN 1 AND 200)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS timesheetreport_entries (
          entry_id INT AUTO_INCREMENT PRIMARY KEY,
          report_id INT NOT NULL,
          row_number INT NOT NULL,
          note VARCHAR(255),
          period VARCHAR(100),
          hrs VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_report_row (report_id, row_number),
          FOREIGN KEY (report_id) REFERENCES timesheetreport(report_id) ON DELETE CASCADE,
          INDEX idx_entries_report (report_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS timesheetreport_days (
          day_id INT AUTO_INCREMENT PRIMARY KEY,
          entry_id INT NOT NULL,
          day_index INT NOT NULL,
          staff_name VARCHAR(255),
          UNIQUE KEY unique_entry_day (entry_id, day_index),
          FOREIGN KEY (entry_id) REFERENCES timesheetreport_entries(entry_id) ON DELETE CASCADE,
          INDEX idx_days_entry (entry_id),
          CHECK (day_index BETWEEN 0 AND 29)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    console.log("✅ Timesheet report tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating timesheet report tables:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

createTimesheetReportTables();
