const db = require("../config/db");

async function createCustomerNotesTable() {
  try {
    console.log("Creating customer_notes table...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_notes (
        note_id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        attachment_url VARCHAR(500) NULL,
        attachment_name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_cn_customer_id ON customer_notes(customer_id)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_cn_is_completed ON customer_notes(is_completed)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_cn_priority ON customer_notes(priority)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_cn_due_date ON customer_notes(due_date)`
    );

    console.log("✅ customer_notes table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createCustomerNotesTable();
