const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

// Create new Customer
router.post("/", createCustomer);

// Get all Customers
router.get("/", getAllCustomers);

// Get single Customer
router.get("/:id", getCustomer);

// Update Customer
router.put("/:id", updateCustomer);

// Delete Customer
router.delete("/:id", deleteCustomer);

module.exports = router;

