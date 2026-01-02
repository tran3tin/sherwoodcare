const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

// Create new employee
router.post("/", createEmployee);

// Get all employees
router.get("/", getAllEmployees);

// Get single employee
router.get("/:id", getEmployee);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;
