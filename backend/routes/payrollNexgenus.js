const express = require("express");
const router = express.Router();
const payrollNexgenusController = require("../controllers/payrollNexgenusController");

// Create new payroll
router.post("/", payrollNexgenusController.createPayroll);

// Get all payrolls
router.get("/", payrollNexgenusController.getAllPayrolls);

// Get single payroll with entries
router.get("/:id", payrollNexgenusController.getPayrollById);

// Update payroll
router.put("/:id", payrollNexgenusController.updatePayroll);

// Delete payroll
router.delete("/:id", payrollNexgenusController.deletePayroll);

// Save/update entries for a payroll
router.post("/:id/entries", payrollNexgenusController.saveEntries);

module.exports = router;
