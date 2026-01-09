// Test notification API
const db = require("./config/db");
const EmployeeNoteModel = require("./models/EmployeeNoteModel");
const CustomerNoteModel = require("./models/CustomerNoteModel");

async function testNotifications() {
  try {
    console.log("Testing notification system...\n");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("Today:", today.toISOString());
    console.log("\n1. Testing EmployeeNoteModel.getDueNotes...");
    const employeeNotes = await EmployeeNoteModel.getDueNotes(today);
    console.log(`Found ${employeeNotes.length} employee notes`);
    if (employeeNotes.length > 0) {
      console.log("Sample:", JSON.stringify(employeeNotes[0], null, 2));
    }

    console.log("\n2. Testing CustomerNoteModel.getDueNotes...");
    const customerNotes = await CustomerNoteModel.getDueNotes(today);
    console.log(`Found ${customerNotes.length} customer notes`);
    if (customerNotes.length > 0) {
      console.log("Sample:", JSON.stringify(customerNotes[0], null, 2));
    }

    console.log("\n✅ All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

testNotifications();
