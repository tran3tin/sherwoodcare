const express = require("express");
const router = express.Router();
const {
  createEmployer,
  getAllEmployers,
  getEmployer,
  updateEmployer,
  deleteEmployer,
} = require("../controllers/employerController");

// Create new employer
router.post("/", createEmployer);

// Get all employers
router.get("/", getAllEmployers);

// Get single employer
router.get("/:id", getEmployer);

// Update employer
router.put("/:id", updateEmployer);

// Delete employer
router.delete("/:id", deleteEmployer);

module.exports = router;
