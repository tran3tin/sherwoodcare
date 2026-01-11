const CustomerModel = require("../models/CustomerModel");

// Get all customers
async function getAllCustomers(req, res) {
  try {
    const customers = await CustomerModel.getAll();
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
}

// Get single customer
async function getCustomer(req, res) {
  try {
    const { id } = req.params;
    const customer = await CustomerModel.getById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
}

// Create new customer
async function createCustomer(req, res) {
  try {
    const {
      first_name,
      last_name,
      reference,
      room,
      payment_method_1,
      payment_method_2,
      note,
    } = req.body;

    if (!first_name || !first_name.trim()) {
      return res.status(400).json({ error: "First name is required" });
    }
    if (!last_name || !last_name.trim()) {
      return res.status(400).json({ error: "Last name is required" });
    }

    const customer = await CustomerModel.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      reference,
      room,
      payment_method_1,
      payment_method_2,
      note,
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
}

// Update customer
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      reference,
      room,
      payment_method_1,
      payment_method_2,
      note,
    } = req.body;

    if (!first_name || !first_name.trim()) {
      return res.status(400).json({ error: "First name is required" });
    }
    if (!last_name || !last_name.trim()) {
      return res.status(400).json({ error: "Last name is required" });
    }

    const customer = await CustomerModel.update(id, {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      reference,
      room,
      payment_method_1,
      payment_method_2,
      note,
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
}

// Delete customer
async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    await CustomerModel.delete(id);
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
}

module.exports = {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
