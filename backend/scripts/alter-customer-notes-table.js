const db = require("../config/db");

async function alterCustomerNotesTable() {
  try {
    console.log("Altering customer_notes table to add missing columns...");

    // Add title column (PostgreSQL)
    await db.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT ''
    `);
    console.log("✅ Added title column");

    // Add priority column (PostgreSQL - using CHECK constraint instead of ENUM)
    await db.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'))
    `);
    console.log("✅ Added priority column");

    // Add due_date column
    await db.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN IF NOT EXISTS due_date DATE NULL
    `);
    console.log("✅ Added due_date column");

    // Add attachment_url column
    await db.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500) NULL
    `);
    console.log("✅ Added attachment_url column");

    // Add attachment_name column
    await db.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) NULL
    `);
    console.log("✅ Added attachment_name column");

    // Add indexes for performance (PostgreSQL)
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_customer_notes_is_completed ON customer_notes(is_completed)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_customer_notes_priority ON customer_notes(priority)`
    );
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_customer_notes_due_date ON customer_notes(due_date)`
    );
    console.log("✅ Added indexes");

    console.log("\n✅ customer_notes table altered successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error altering table:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

alterCustomerNotesTable();
