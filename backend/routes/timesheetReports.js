const express = require("express");
const router = express.Router();
const timesheetReportController = require("../controllers/timesheetReportController");

router.post("/", timesheetReportController.createReport);
router.get("/", timesheetReportController.getAllReports);
router.get("/:id", timesheetReportController.getReportById);
router.put("/:id", timesheetReportController.updateReport);
router.delete("/:id", timesheetReportController.deleteReport);
router.post("/:id/entries", timesheetReportController.saveEntries);

module.exports = router;
