const SocialSheetModel = require("../models/SocialSheetModel");

exports.createSheet = async (req, res) => {
  try {
    const { name, start_date, end_date, rows } = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid rows data" });
    }

    const sheetId = await SocialSheetModel.createSheet({
      name: name || null,
      start_date: start_date || null,
      end_date: end_date || null,
      rows,
    });

    res.status(201).json({
      success: true,
      sheet_id: sheetId,
      message: "Social sheet created successfully",
    });
  } catch (error) {
    console.error("Error creating social sheet:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSheets = async (req, res) => {
  try {
    const sheets = await SocialSheetModel.getAllSheets();
    res.json({ success: true, data: sheets });
  } catch (error) {
    console.error("Error fetching social sheets:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const sheet = await SocialSheetModel.getSheetById(id);

    if (!sheet) {
      return res.status(404).json({ error: "Social sheet not found" });
    }

    res.json({ success: true, data: sheet });
  } catch (error) {
    console.error("Error fetching social sheet:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date, rows } = req.body;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid rows data" });
    }

    const existing = await SocialSheetModel.getSheetById(id);
    if (!existing) {
      return res.status(404).json({ error: "Social sheet not found" });
    }

    await SocialSheetModel.updateSheet(id, {
      name: name !== undefined ? name : existing.name,
      start_date: start_date !== undefined ? start_date : existing.start_date,
      end_date: end_date !== undefined ? end_date : existing.end_date,
      rows,
    });

    res.json({ success: true, message: "Social sheet updated successfully" });
  } catch (error) {
    console.error("Error updating social sheet:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSheet = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await SocialSheetModel.getSheetById(id);
    if (!existing) {
      return res.status(404).json({ error: "Social sheet not found" });
    }

    await SocialSheetModel.deleteSheet(id);
    res.json({ success: true, message: "Social sheet deleted successfully" });
  } catch (error) {
    console.error("Error deleting social sheet:", error);
    res.status(500).json({ error: error.message });
  }
};
