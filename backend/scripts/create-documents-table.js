const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

async function createDocumentsTable() {
  try {
    console.log("📦 Creating documents table...");

    const sqlPath = path.join(
      __dirname,
      "..",
      "migrations",
      "create_documents_table.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    await pool.query(sql);

    console.log("✅ Documents table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating documents table:", error.message);
    process.exit(1);
  }
}

createDocumentsTable();
