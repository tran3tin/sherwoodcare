const EmployeeModel = require("../models/EmployeeModel");

// Create a new employee
async function createEmployee(req, res) {
  try {
    const { lastName, firstName, preferredName, level, cardId, recordId } =
      req.body;

    // Validation
    if (!lastName || !firstName || !level || !cardId || !recordId) {
      return res.status(400).json({
        error:
          "Missing required fields: lastName, firstName, level, cardId, recordId",
      });
    }

    // Check if card ID already exists
    const existingCard = await EmployeeModel.getByCardId(cardId);
    if (existingCard) {
      return res.status(400).json({
        error: "Card ID already exists",
      });
    }

    // Check if record ID already exists
    const existingRecord = await EmployeeModel.getByRecordId(recordId);
    if (existingRecord) {
      return res.status(400).json({
        error: "Record ID already exists",
      });
    }

    // Create employee
    const employeeId = await EmployeeModel.create({
      lastName,
      firstName,
      preferredName,
      level,
      cardId,
      recordId,
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee_id: employeeId,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Failed to create employee" });
  }
}

// Get all employees
async function getAllEmployees(req, res) {
  try {
    const employees = await EmployeeModel.getAll();
    res.json({ data: employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
}

// Get single employee
async function getEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await EmployeeModel.getById(id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ data: employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
}

// Update employee
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { lastName, firstName, preferredName, level, cardId, recordId } =
      req.body;

    // Check if employee exists
    const employee = await EmployeeModel.getById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Validation
    if (!lastName || !firstName || !level || !cardId || !recordId) {
      return res.status(400).json({
        error:
          "Missing required fields: lastName, firstName, level, cardId, recordId",
      });
    }

    // Check if card ID is used by another employee
    const existingCard = await EmployeeModel.getByCardId(cardId);
    if (existingCard && existingCard.employee_id !== parseInt(id)) {
      return res.status(400).json({
        error: "Card ID already exists",
      });
    }

    // Check if record ID is used by another employee
    const existingRecord = await EmployeeModel.getByRecordId(recordId);
    if (existingRecord && existingRecord.employee_id !== parseInt(id)) {
      return res.status(400).json({
        error: "Record ID already exists",
      });
    }

    // Update employee
    await EmployeeModel.update(id, {
      lastName,
      firstName,
      preferredName,
      level,
      cardId,
      recordId,
    });

    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Failed to update employee" });
  }
}

// Delete employee
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employee = await EmployeeModel.getById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await EmployeeModel.delete(id);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
}

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
