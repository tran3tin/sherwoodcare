const db = require("./config/db");

async function testEmployeeNotes() {
  try {
    console.log("Testing database connection...");

    // Test 1: Check if table exists
    console.log("\n1. Checking if employee_notes table exists...");
    const [tables] = await db.pool.query("SHOW TABLES LIKE 'employee_notes'");
    console.log("Tables found:", tables);

    // Test 2: Describe table structure
    console.log("\n2. Describing employee_notes table...");
    const [structure] = await db.pool.query("DESCRIBE employee_notes");
    console.log("Table structure:", structure);

    // Test 3: Try to fetch notes for employee 29
    console.log("\n3. Fetching notes for employee 29...");
    const [notes] = await db.pool.query(
      "SELECT * FROM employee_notes WHERE employee_id = ?",
      [29]
    );
    console.log("Notes found:", notes);

    // Test 4: Try to insert a test note
    console.log("\n4. Inserting test note...");
    try {
      const [result] = await db.pool.query(
        `INSERT INTO employee_notes 
         (employee_id, title, content, priority) 
         VALUES (?, ?, ?, ?)`,
        [29, "Test Note", "Test Content", "medium"]
      );
      console.log("Insert result:", result);

      // Delete the test note
      await db.pool.query("DELETE FROM employee_notes WHERE note_id = ?", [
        result.insertId,
      ]);
      console.log("Test note deleted");
    } catch (insertError) {
      console.error("Insert error:", insertError.message);
    }

    console.log("\n✅ All tests completed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

testEmployeeNotes();
