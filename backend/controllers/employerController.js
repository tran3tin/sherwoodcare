const EmployerModel = require("../models/EmployerModel");

// Get all employers
async function getAllEmployers(req, res) {
  try {
    const employers = await EmployerModel.getAll();
    res.json({ success: true, data: employers });
  } catch (error) {
    console.error("Error fetching employers:", error);
    res.status(500).json({ error: "Failed to fetch employers" });
  }
}

// Get single employer
async function getEmployer(req, res) {
  try {
    const { id } = req.params;
    const employer = await EmployerModel.getById(id);
    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }
    res.json({ success: true, data: employer });
  } catch (error) {
    console.error("Error fetching employer:", error);
    res.status(500).json({ error: "Failed to fetch employer" });
  }
}

// Create new employer
async function createEmployer(req, res) {
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

    const employer = await EmployerModel.create({
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

    res.status(201).json({ success: true, data: employer });
  } catch (error) {
    console.error("Error creating employer:", error);
    res.status(500).json({ error: "Failed to create employer" });
  }
}

// Update employer
async function updateEmployer(req, res) {
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

    const employer = await EmployerModel.update(id, {
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

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    res.json({ success: true, data: employer });
  } catch (error) {
    console.error("Error updating employer:", error);
    res.status(500).json({ error: "Failed to update employer" });
  }
}

// Delete employer
async function deleteEmployer(req, res) {
  try {
    const { id } = req.params;
    await EmployerModel.delete(id);
    res.json({ success: true, message: "Employer deleted successfully" });
  } catch (error) {
    console.error("Error deleting employer:", error);
    res.status(500).json({ error: "Failed to delete employer" });
  }
}

module.exports = {
  getAllEmployers,
  getEmployer,
  createEmployer,
  updateEmployer,
  deleteEmployer,
};
