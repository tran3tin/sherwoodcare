const axios = require("axios");

async function testAPI() {
  try {
    // Test 1: Get notes for employee 29
    console.log("Test 1: Getting notes for employee 29...");
    const response1 = await axios.get(
      "http://localhost:3000/api/employee-notes/employee/29"
    );
    console.log("✅ Success:", response1.data);

    // Test 2: Create a new note
    console.log("\nTest 2: Creating a new note...");
    const formData = new FormData();
    formData.append("employee_id", "29");
    formData.append("title", "API Test Note");
    formData.append("content", "This is a test note from API");
    formData.append("priority", "medium");

    const response2 = await axios.post(
      "http://localhost:3000/api/employee-notes",
      {
        employee_id: 29,
        title: "API Test Note",
        content: "This is a test note from API",
        priority: "medium",
      }
    );
    console.log("✅ Success:", response2.data);

    console.log("\n✅ All API tests passed!");
  } catch (error) {
    console.error("\n❌ Error:", error.response?.data || error.message);
  }
}

testAPI();
