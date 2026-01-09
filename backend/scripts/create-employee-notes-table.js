const db = require("../config/db");

async function createEmployeeNotesTable() {
  try {
    console.log("Creating employee_notes table...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS employee_notes (
        note_id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        due_date DATE NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        attachment_url VARCHAR(500) NULL,
        attachment_name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id),
        INDEX idx_is_completed (is_completed),
        INDEX idx_priority (priority),
        INDEX idx_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ employee_notes table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createEmployeeNotesTable();
