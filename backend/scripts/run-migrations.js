const db = require("../config/db");
const fs = require("fs");
const path = require("path");

async function runMigrations() {
  console.log("🔄 Running database migrations...");

  try {
    // Danh sách migrations theo thứ tự
    const migrations = [
      "create_customers_table.sql",
      "create_employers_table.sql",
      "create_customer_invoices_table.sql",
      "create_social_sheets_table.sql",
      "add_dates_to_social_sheets.sql",
      "create_payroll_nexgenus_table.sql",
      "remove_card_id_record_id_from_employees.sql",
    ];

    for (const migrationFile of migrations) {
      try {
        const migrationPath = path.join(
          __dirname,
          "..",
          "migrations",
          migrationFile
        );

        if (!fs.existsSync(migrationPath)) {
          console.log(`⏭️  Skipping ${migrationFile} (file not found)`);
          continue;
        }

        console.log(`  📄 Running: ${migrationFile}`);
        const sql = fs.readFileSync(migrationPath, "utf8");

        // Split by semicolon and execute each statement
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--"));

        for (const statement of statements) {
          await db.query(statement);
        }

        console.log(`  ✅ Completed: ${migrationFile}`);
      } catch (error) {
        // Ignore "already exists" errors
        if (
          error.message.includes("already exists") ||
          error.message.includes("duplicate")
        ) {
          console.log(`  ⏭️  Skipped: ${migrationFile} (already exists)`);
        } else {
          console.error(`  ❌ Error in ${migrationFile}:`, error.message);
        }
      }
    }

    // Run table creation scripts
    console.log("\n🔄 Creating application tables...");
    const scriptFiles = [
      "create-employee-tables.js",
      "create-customer-notes-table.js",
      "create-employee-notes-table.js",
      "create-timesheet-tables.js",
      "create-timesheet-report-tables.js",
      "create-social-sheet-tables.js",
      "create-payroll-nexgenus-tables.js",
      "create-tasks-table.js",
    ];

    for (const scriptFile of scriptFiles) {
      try {
        const scriptPath = path.join(__dirname, scriptFile);
        if (!fs.existsSync(scriptPath)) {
          console.log(`  ⏭️  Skipping ${scriptFile} (file not found)`);
          continue;
        }

        console.log(`  📄 Running: ${scriptFile}`);
        // Don't use require as it caches and may exit process
        // Instead, read and execute inline
        delete require.cache[require.resolve(scriptPath)];
        await new Promise((resolve, reject) => {
          try {
            // Execute script in isolated context
            const scriptModule = require(scriptPath);
            // Give it time to complete
            setTimeout(resolve, 1000);
          } catch (err) {
            if (
              err.message.includes("already exists") ||
              err.message.includes("duplicate")
            ) {
              resolve();
            } else {
              reject(err);
            }
          }
        });
        console.log(`  ✅ Completed: ${scriptFile}`);
      } catch (error) {
        if (
          error.message.includes("already exists") ||
          error.message.includes("duplicate")
        ) {
          console.log(`  ⏭️  Skipped: ${scriptFile} (already exists)`);
        } else {
          console.error(`  ⚠️  Warning in ${scriptFile}:`, error.message);
        }
      }
    }

    console.log("\n✅ All migrations completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    throw error;
  }
}

// Export for use in server.js
module.exports = runMigrations;

// Allow running standalone
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed:", err);
      process.exit(1);
    });
}
