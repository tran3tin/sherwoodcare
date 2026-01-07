const db = require("../config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("Running migration: create_payroll_nexgenus_table.sql");
    console.log(`Using database client: ${db.client}`);

    const migrationPath = path.join(
      __dirname,
      "..",
      "migrations",
      "create_payroll_nexgenus_table.sql"
    );
    let sql = fs.readFileSync(migrationPath, "utf8");

    // If using MySQL, convert PostgreSQL syntax to MySQL
    if (db.client === "mysql") {
      sql = sql
        .replace(/SERIAL PRIMARY KEY/g, "INT AUTO_INCREMENT PRIMARY KEY")
        .replace(
          /TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g,
          "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        )
        .replace(/IF NOT EXISTS/g, "IF NOT EXISTS");
    }

    // Split and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await db.query(statement);
    }

    console.log("✅ Migration completed successfully!");
    console.log("Tables created:");
    console.log("  - payroll_nexgenus");
    console.log("  - payroll_nexgenus_entries");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
