const db = require("../config/db");

async function createEmployeeNotesTable() {
  try {
    console.log("Creating employee_notes table...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS employee_notes (
        note_id SERIAL PRIMARY KEY,
        employee_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        attachment_url VARCHAR(500) NULL,
        attachment_name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_en_employee_id ON employee_notes(employee_id)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_en_is_completed ON employee_notes(is_completed)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_en_priority ON employee_notes(priority)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_en_due_date ON employee_notes(due_date)`
    );

    console.log("✅ employee_notes table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createEmployeeNotesTable();
