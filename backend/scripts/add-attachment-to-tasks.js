const db = require("../config/db");

async function addAttachmentToTasks() {
  try {
    console.log("Adding attachment columns to tasks table...");

    await db.query(`
      ALTER TABLE tasks 
      ADD COLUMN attachment_url VARCHAR(500) NULL,
      ADD COLUMN attachment_name VARCHAR(255) NULL
    `);

    console.log("✅ Attachment columns added to tasks table successfully!");
    process.exit(0);
  } catch (error) {
    if (error.message.includes("Duplicate column name")) {
      console.log("⚠️ Columns already exist, skipping...");
      process.exit(0);
    }
    console.error("❌ Error adding columns:", error);
    process.exit(1);
  }
}

addAttachmentToTasks();
