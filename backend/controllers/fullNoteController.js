const FullNoteModel = require("../models/FullNoteModel");

const getAllNotes = async (req, res) => {
  try {
    const status = (req.query.status || "all").toString().toLowerCase();
    const type = (req.query.type || "all").toString().toLowerCase();

    const notes = await FullNoteModel.getAll({ status, type });
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error("Error fetching full notes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch notes" });
  }
};

module.exports = {
  getAllNotes,
};
