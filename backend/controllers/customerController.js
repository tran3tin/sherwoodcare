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
      full_name,
      rent_monthly,
      rent_monthly_email,
      rent_fortnightly,
      rent_fortnightly_email,
      da_weekly,
      da_weekly_email,
      social_fortnightly,
      social_fortnightly_email,
    } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const customer = await CustomerModel.create({
      full_name: full_name.trim(),
      rent_monthly,
      rent_monthly_email,
      rent_fortnightly,
      rent_fortnightly_email,
      da_weekly,
      da_weekly_email,
      social_fortnightly,
      social_fortnightly_email,
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
      full_name,
      rent_monthly,
      rent_monthly_email,
      rent_fortnightly,
      rent_fortnightly_email,
      da_weekly,
      da_weekly_email,
      social_fortnightly,
      social_fortnightly_email,
    } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const customer = await CustomerModel.update(id, {
      full_name: full_name.trim(),
      rent_monthly,
      rent_monthly_email,
      rent_fortnightly,
      rent_fortnightly_email,
      da_weekly,
      da_weekly_email,
      social_fortnightly,
      social_fortnightly_email,
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
