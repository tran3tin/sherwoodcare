const db = require("../config/db");

async function createTasksTable() {
  try {
    console.log("Creating tasks table...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'review', 'done')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        due_date DATE NULL,
        assigned_to VARCHAR(100) NULL,
        position INT DEFAULT 0,
        attachment_url TEXT NULL,
        attachment_name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position)`
    );

    console.log("✅ tasks table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createTasksTable();
