const CustomerInvoiceModel = require("../models/CustomerInvoiceModel");
const CustomerModel = require("../models/CustomerModel");

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function getAllCustomerInvoices(req, res) {
  try {
    const customerId = req.query.customer_id;
    const invoices = await CustomerInvoiceModel.getAll({
      customerId: customerId ? Number(customerId) : undefined,
    });
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    res.status(500).json({ error: "Failed to fetch customer invoices" });
  }
}

async function getCustomerInvoice(req, res) {
  try {
    const { id } = req.params;
    const invoice = await CustomerInvoiceModel.getById(id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching customer invoice:", error);
    res.status(500).json({ error: "Failed to fetch customer invoice" });
  }
}

async function createCustomerInvoice(req, res) {
  try {
    const {
      customer_id,
      invoice_date,
      invoice_no,
      memory,
      amount,
      amount_due,
      note,
    } = req.body;

    const customerIdNum = toNumberOrNull(customer_id);
    if (!customerIdNum) {
      return res.status(400).json({ error: "customer_id is required" });
    }

    if (!invoice_date) {
      return res.status(400).json({ error: "invoice_date is required" });
    }

    const customer = await CustomerModel.getById(customerIdNum);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
    }

    const amountNum = toNumberOrNull(amount);
    const amountDueNum = toNumberOrNull(amount_due);

    if (amountNum === null) {
      return res.status(400).json({ error: "amount must be a number" });
    }

    if (amountDueNum === null) {
      return res.status(400).json({ error: "amount_due must be a number" });
    }

    const invoice = await CustomerInvoiceModel.create({
      customer_id: customerIdNum,
      invoice_date,
      invoice_no,
      memory,
      amount: amountNum,
      amount_due: amountDueNum,
      note,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error creating customer invoice:", error);
    res.status(500).json({ error: "Failed to create customer invoice" });
  }
}

async function updateCustomerInvoice(req, res) {
  try {
    const { id } = req.params;
    const {
      customer_id,
      invoice_date,
      invoice_no,
      memory,
      amount,
      amount_due,
      note,
    } = req.body;

    const existing = await CustomerInvoiceModel.getById(id);
    if (!existing) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const customerIdNum = toNumberOrNull(customer_id);
    if (!customerIdNum) {
      return res.status(400).json({ error: "customer_id is required" });
    }

    if (!invoice_date) {
      return res.status(400).json({ error: "invoice_date is required" });
    }

    const customer = await CustomerModel.getById(customerIdNum);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
    }

    const amountNum = toNumberOrNull(amount);
    const amountDueNum = toNumberOrNull(amount_due);

    if (amountNum === null) {
      return res.status(400).json({ error: "amount must be a number" });
    }

    if (amountDueNum === null) {
      return res.status(400).json({ error: "amount_due must be a number" });
    }

    const invoice = await CustomerInvoiceModel.update(id, {
      customer_id: customerIdNum,
      invoice_date,
      invoice_no,
      memory,
      amount: amountNum,
      amount_due: amountDueNum,
      note,
    });

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error updating customer invoice:", error);
    res.status(500).json({ error: "Failed to update customer invoice" });
  }
}

async function deleteCustomerInvoice(req, res) {
  try {
    const { id } = req.params;
    const existing = await CustomerInvoiceModel.getById(id);
    if (!existing) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await CustomerInvoiceModel.delete(id);
    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer invoice:", error);
    res.status(500).json({ error: "Failed to delete customer invoice" });
  }
}

module.exports = {
  getAllCustomerInvoices,
  getCustomerInvoice,
  createCustomerInvoice,
  updateCustomerInvoice,
  deleteCustomerInvoice,
};
