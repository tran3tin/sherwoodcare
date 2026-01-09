require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow multiple origins for development
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow whitelisted origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, allow all origins
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      // Block unknown origins in production
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
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

// Timesheet report routes
const timesheetReportRoutes = require("./routes/timesheetReports");
app.use("/api/timesheetreports", timesheetReportRoutes);

// Employee routes
const employeeRoutes = require("./routes/employees");
app.use("/api/employees", employeeRoutes);

// Customer routes
const customerRoutes = require("./routes/customers");
app.use("/api/customers", customerRoutes);

// Customer invoice routes
const customerInvoiceRoutes = require("./routes/customerInvoices");
app.use("/api/customer-invoices", customerInvoiceRoutes);

// AI routes (OpenAI)
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);

// Social sheet routes
const socialSheetRoutes = require("./routes/socialSheets");
app.use("/api/social-sheets", socialSheetRoutes);

// Payroll NexGenus routes
const payrollNexgenusRoutes = require("./routes/payrollNexgenus");
app.use("/api/payroll-nexgenus", payrollNexgenusRoutes);

// Customer notes routes
const customerNoteRoutes = require("./routes/customerNotes");
app.use("/api/customer-notes", customerNoteRoutes);

// Employee notes routes
const employeeNoteRoutes = require("./routes/employeeNotes");
app.use("/api/employee-notes", employeeNoteRoutes);

// Notification routes
const notificationRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationRoutes);

// Task routes (Kanban board)
const taskRoutes = require("./routes/tasks");
app.use("/api/tasks", taskRoutes);

// Chatbot routes (AI with database access)
const chatbotRoutes = require("./routes/chatbot");
app.use("/api/chatbot", chatbotRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
