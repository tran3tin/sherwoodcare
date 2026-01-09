const db = require("../config/db");

async function alterCustomerNotesTable() {
  try {
    console.log("Altering customer_notes table to add missing columns...");

    // Add title column
    await db.pool.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '' AFTER customer_id
    `);
    console.log("✅ Added title column");

    // Add priority column
    await db.pool.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium' AFTER content
    `);
    console.log("✅ Added priority column");

    // Add due_date column
    await db.pool.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN due_date DATE NULL AFTER priority
    `);
    console.log("✅ Added due_date column");

    // Add attachment_url column
    await db.pool.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN attachment_url VARCHAR(500) NULL AFTER due_date
    `);
    console.log("✅ Added attachment_url column");

    // Add attachment_name column
    await db.pool.query(`
      ALTER TABLE customer_notes 
      ADD COLUMN attachment_name VARCHAR(255) NULL AFTER attachment_url
    `);
    console.log("✅ Added attachment_name column");

    // Add indexes for performance
    await db.pool.query(`
      ALTER TABLE customer_notes 
      ADD INDEX idx_customer_id (customer_id),
      ADD INDEX idx_is_completed (is_completed),
      ADD INDEX idx_priority (priority),
      ADD INDEX idx_due_date (due_date)
    `);
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
