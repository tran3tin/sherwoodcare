require("dotenv").config();
const db = require("../config/db");

async function removeCardIdRecordId() {
  try {
    console.log(
      "Removing card_id and record_id columns from employees table..."
    );

    // PostgreSQL
    await db.query(`DROP INDEX IF EXISTS idx_employees_card_id`);
    await db.query(`DROP INDEX IF EXISTS idx_employees_record_id`);
    await db.query(`ALTER TABLE employees DROP COLUMN IF EXISTS card_id`);
    await db.query(`ALTER TABLE employees DROP COLUMN IF EXISTS record_id`);

    console.log("✅ Columns removed successfully!");
  } catch (error) {
    console.error("❌ Error removing columns:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

removeCardIdRecordId();
