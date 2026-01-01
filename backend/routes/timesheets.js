const express = require("express");
const router = express.Router();
const timesheetController = require("../controllers/timesheetController");

// Create new timesheet
router.post("/", timesheetController.createTimesheet);

// Get all timesheets
router.get("/", timesheetController.getAllTimesheets);

// Get single timesheet with entries
router.get("/:id", timesheetController.getTimesheetById);

// Update timesheet
router.put("/:id", timesheetController.updateTimesheet);

// Delete timesheet
router.delete("/:id", timesheetController.deleteTimesheet);

// Save/update entries for a timesheet
router.post("/:id/entries", timesheetController.saveEntries);

module.exports = router;
