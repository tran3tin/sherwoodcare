const express = require("express");
const router = express.Router();

const {
  getAllCustomerInvoices,
  getCustomerInvoice,
  createCustomerInvoice,
  updateCustomerInvoice,
  deleteCustomerInvoice,
} = require("../controllers/customerInvoiceController");

// List invoices (optional filter: ?customer_id=1)
router.get("/", getAllCustomerInvoices);

// Get invoice
router.get("/:id", getCustomerInvoice);

// Create invoice
router.post("/", createCustomerInvoice);

// Update invoice
router.put("/:id", updateCustomerInvoice);

// Delete invoice
router.delete("/:id", deleteCustomerInvoice);

module.exports = router;
