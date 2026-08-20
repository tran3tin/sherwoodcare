const FullNoteModel = require("../models/FullNoteModel");

const getAllNotes = async (req, res) => {
  try {
    const status = (req.query.status || "all").toString().toLowerCase();
    const type = (req.query.type || "all").toString().toLowerCase();

    const notes = await FullNoteModel.getAll({ status, type });
    res.json({ success: true, data: notes });
  } catch (error) {
    // Log full SQL message — production Coolify logs are the only signal
    // when general_notes silently disappears from the UNION.
    console.error(
      "Error fetching full notes:",
      error && error.message ? error.message : error,
      error && error.sql ? `\nSQL: ${error.sql}` : ""
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch notes",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

module.exports = {
  getAllNotes,
};
