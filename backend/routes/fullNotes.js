const express = require("express");
const router = express.Router();
const fullNoteController = require("../controllers/fullNoteController");
const FullNoteModel = require("../models/FullNoteModel");

router.get("/", fullNoteController.getAllNotes);

// Debug endpoint — verifies general_notes schema + capabilities cache
router.get("/debug", async (_req, res) => {
  try {
    // Force fresh capabilities check (bypass cache)
    FullNoteModel._capabilitiesCache = null;
    FullNoteModel._capabilitiesLoadedAt = 0;
    const caps = await FullNoteModel._getCapabilities();

    // Check row counts
    const db = require("../config/db");
    const tables = ["customer_notes", "employee_notes", "general_notes"];
    const counts = {};
    for (const t of tables) {
      try {
        const { rows } = await db.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
        counts[t] = rows[0].c;
      } catch (e) {
        counts[t] = `error: ${e.message}`;
      }
    }

    res.json({
      success: true,
      capabilities: caps,
      tableCounts: counts,
      cacheState: {
        loadedAt: FullNoteModel._capabilitiesLoadedAt,
        ttlMs: FullNoteModel._capabilitiesTtlMs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
