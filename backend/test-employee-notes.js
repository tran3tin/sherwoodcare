const db = require("./config/db");

async function testEmployeeNotes() {
  try {
    console.log("Testing database connection...");

    // Test 1: Check if table exists (PostgreSQL)
    console.log("\n1. Checking if employee_notes table exists...");
    const { rows: tables } = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employee_notes'"
    );
    console.log("Tables found:", tables);

    // Test 2: Describe table structure (PostgreSQL)
    console.log("\n2. Describing employee_notes table...");
    const { rows: structure } = await db.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'employee_notes'"
    );
    console.log("Table structure:", structure);

    // Test 3: Try to fetch notes for employee 29
    console.log("\n3. Fetching notes for employee 29...");
    const { rows: notes } = await db.query(
      "SELECT * FROM employee_notes WHERE employee_id = $1",
      [29]
    );
    console.log("Notes found:", notes);

    // Test 4: Try to insert a test note
    console.log("\n4. Inserting test note...");
    try {
      const { rows: result } = await db.query(
        `INSERT INTO employee_notes 
         (employee_id, title, content, priority) 
         VALUES ($1, $2, $3, $4) RETURNING note_id`,
        [29, "Test Note", "Test Content", "medium"]
      );
      console.log("Insert result:", result);

      // Delete the test note
      await db.query("DELETE FROM employee_notes WHERE note_id = $1", [
        result[0].note_id,
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
