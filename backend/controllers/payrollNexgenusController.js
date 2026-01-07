const PayrollNexgenusModel = require("../models/PayrollNexgenusModel");

// Create new payroll
exports.createPayroll = async (req, res) => {
  try {
    const { start_date, entries } = req.body;

    if (!start_date) {
      return res.status(400).json({ error: "start_date is required" });
    }

    // Create payroll record
    const payroll = await PayrollNexgenusModel.create({ start_date });

    // Save entries if provided
    if (entries && entries.length > 0) {
      await PayrollNexgenusModel.saveEntries(payroll.id, entries);
    }

    // Get complete payroll with entries
    const savedEntries = await PayrollNexgenusModel.getEntries(payroll.id);

    res.status(201).json({
      payroll,
      entries: savedEntries,
    });
  } catch (error) {
    console.error("Error creating payroll:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all payrolls
exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await PayrollNexgenusModel.findAll();
    res.json(payrolls);
  } catch (error) {
    console.error("Error getting payrolls:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get payroll by ID with entries
exports.getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await PayrollNexgenusModel.findById(id);

    if (!payroll) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    const entries = await PayrollNexgenusModel.getEntries(id);

    res.json({
      payroll,
      entries,
    });
  } catch (error) {
    console.error("Error getting payroll:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update payroll
exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, entries } = req.body;

    if (!start_date) {
      return res.status(400).json({ error: "start_date is required" });
    }

    // Check if payroll exists
    const existing = await PayrollNexgenusModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    // Update payroll record
    const payroll = await PayrollNexgenusModel.update(id, { start_date });

    // Update entries if provided
    if (entries) {
      await PayrollNexgenusModel.saveEntries(id, entries);
    }

    // Get updated entries
    const updatedEntries = await PayrollNexgenusModel.getEntries(id);

    res.json({
      payroll,
      entries: updatedEntries,
    });
  } catch (error) {
    console.error("Error updating payroll:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete payroll
exports.deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PayrollNexgenusModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    res.json({ message: "Payroll deleted successfully", payroll: deleted });
  } catch (error) {
    console.error("Error deleting payroll:", error);
    res.status(500).json({ error: error.message });
  }
};

// Save/update entries for a payroll
exports.saveEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const { entries } = req.body;

    // Check if payroll exists
    const payroll = await PayrollNexgenusModel.findById(id);
    if (!payroll) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    // Save entries
    const savedEntries = await PayrollNexgenusModel.saveEntries(id, entries);

    res.json({
      message: "Entries saved successfully",
      entries: savedEntries,
    });
  } catch (error) {
    console.error("Error saving entries:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
