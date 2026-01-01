const TimesheetModel = require("../models/TimesheetModel");

// Create new timesheet
exports.createTimesheet = async (req, res) => {
  try {
    const { start_date, num_days, num_rows, name, entries } = req.body;

    if (!start_date || !num_days || !num_rows) {
      return res.status(400).json({
        error: "Missing required fields: start_date, num_days, num_rows",
      });
    }

    // Create period
    const periodId = await TimesheetModel.createPeriod({
      start_date,
      num_days,
      num_rows,
      name: name || null,
    });

    // Save entries if provided
    if (entries && entries.length > 0) {
      await TimesheetModel.saveEntries(periodId, entries);
    }

    res.status(201).json({
      success: true,
      period_id: periodId,
      message: "Timesheet created successfully",
    });
  } catch (error) {
    console.error("Error creating timesheet:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all timesheets
exports.getAllTimesheets = async (req, res) => {
  try {
    const periods = await TimesheetModel.getAllPeriods();
    res.json({ success: true, data: periods });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single timesheet with entries
exports.getTimesheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const period = await TimesheetModel.getPeriodById(id);

    if (!period) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    const entries = await TimesheetModel.getEntries(id);

    res.json({
      success: true,
      data: {
        period,
        entries,
      },
    });
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update timesheet
exports.updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, num_days, num_rows, name, entries } = req.body;

    // Check if period exists
    const period = await TimesheetModel.getPeriodById(id);
    if (!period) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Update period metadata
    if (start_date || num_days || num_rows || name !== undefined) {
      await TimesheetModel.updatePeriod(id, {
        start_date: start_date || period.start_date,
        num_days: num_days || period.num_days,
        num_rows: num_rows || period.num_rows,
        name: name !== undefined ? name : period.name,
      });
    }

    // Update entries if provided
    if (entries && entries.length > 0) {
      await TimesheetModel.saveEntries(id, entries);
    }

    res.json({
      success: true,
      message: "Timesheet updated successfully",
    });
  } catch (error) {
    console.error("Error updating timesheet:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete timesheet
exports.deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;

    const period = await TimesheetModel.getPeriodById(id);
    if (!period) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    await TimesheetModel.deletePeriod(id);

    res.json({
      success: true,
      message: "Timesheet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
    res.status(500).json({ error: error.message });
  }
};

// Save/update entries for a timesheet
exports.saveEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: "Invalid entries data" });
    }

    const period = await TimesheetModel.getPeriodById(id);
    if (!period) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    await TimesheetModel.saveEntries(id, entries);

    res.json({
      success: true,
      message: "Entries saved successfully",
    });
  } catch (error) {
    console.error("Error saving entries:", error);
    res.status(500).json({ error: error.message });
  }
};
