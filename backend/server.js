require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// If production, optionally serve static frontend from ../frontend/dist
const path = require("path");
const distPath = path.join(__dirname, "..", "frontend", "dist");
const fs = require("fs");
if (process.env.SERVE_STATIC === "true" && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", now: new Date().toISOString() });
});

// Example endpoint returning sample data
app.get("/api/sample", (req, res) => {
  res.json({
    message: "Sample data from backend",
    env: { NODE_ENV: process.env.NODE_ENV || "development" },
  });
});

// DB status endpoint (tests connection to configured DB)
const db = require("./config/db");
app.get("/api/db/status", async (req, res) => {
  try {
    const sql =
      db.client === "mysql"
        ? "SELECT DATABASE() AS db"
        : "SELECT current_database() AS db";
    const { rows } = await db.query(sql);
    const dbName = Array.isArray(rows) ? rows[0].db : rows[0] && rows[0].db;
    res.json({ ok: true, client: db.client, database: dbName });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Timesheet routes
const timesheetRoutes = require("./routes/timesheets");
app.use("/api/timesheets", timesheetRoutes);

// AI routes (OpenAI)
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
