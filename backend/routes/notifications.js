const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Get all due notes for notifications
router.get("/due-notes", notificationController.getDueNotes);

module.exports = router;
