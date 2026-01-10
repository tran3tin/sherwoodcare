const db = require("./config/db");

async function createTestNote() {
  try {
    console.log("Creating test customer note with due date...\n");

    // Get first customer (PostgreSQL)
    const { rows: customers } = await db.query(
      "SELECT customer_id, full_name FROM customers LIMIT 1"
    );
    if (customers.length === 0) {
      console.log("No customers found. Please create a customer first.");
      process.exit(1);
    }

    const customer = customers[0];
    console.log(
      `Customer: ${customer.full_name} (ID: ${customer.customer_id})`
    );

    // Create note with due date tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split("T")[0];

    const { rows: result } = await db.query(
      `INSERT INTO customer_notes 
       (customer_id, title, content, priority, due_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING note_id`,
      [
        customer.customer_id,
        "Test Notification",
        "This is a test note for notification",
        "high",
        dueDate,
      ]
    );

    console.log(`\n✅ Created test note with ID: ${result[0].note_id}`);
    console.log(`Due date: ${dueDate} (tomorrow)`);
    console.log("\nNow test the notification API!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTestNote();
