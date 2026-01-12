require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow multiple origins for development and production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  // Production frontend URLs
  "https://sherwoodcare-fontend.onrender.com",
  "https://sherwoodcare.onrender.com",
  process.env.FRONTEND_URL, // Allow custom frontend URL from env
].filter(Boolean); // Remove undefined values

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
      // Log blocked origin for debugging
      console.warn("⚠️ Blocked by CORS:", origin);
      // Block unknown origins in production
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Root endpoint - for Uptime Robot and health monitoring
app.get("/", (req, res) => {
  res.status(200).json({
    message: "SherwoodCare Backend API is running!",
    status: "ok",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      ping: "/ping",
    },
  });
});

// Ping endpoint - simple health check
app.get("/ping", (req, res) => {
  res.status(200).send("Pong!");
});

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
    const sql = "SELECT current_database() AS db";
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
const generalNoteRoutes = require("./routes/generalNotes");

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
app.use("/api/general-notes", generalNoteRoutes);

// Full notes (combined customer + employee)
const fullNotesRoutes = require("./routes/fullNotes");
app.use("/api/full-notes", fullNotesRoutes);

// Notification routes
const notificationRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationRoutes);

// Task routes (Kanban board)
const taskRoutes = require("./routes/tasks");
app.use("/api/tasks", taskRoutes);

// Chatbot routes (AI with database access)
const chatbotRoutes = require("./routes/chatbot");
app.use("/api/chatbot", chatbotRoutes);

// Upload routes (Firebase + Supabase)
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Auto-run migrations on startup (only if AUTO_MIGRATE=true in env)
const runAutoMigrations = require("./scripts/auto-migrate");
const shouldAutoMigrate =
  process.env.AUTO_MIGRATE === "true" || process.env.NODE_ENV === "production";

if (shouldAutoMigrate) {
  console.log("🔄 AUTO_MIGRATE enabled, đang tạo database...");
  runAutoMigrations()
    .then(() => {
      startServer();
    })
    .catch((err) => {
      console.error("❌ Lỗi tạo database:", err.message);
      console.log("⚠️  Server vẫn khởi động (có thể thiếu bảng)...\n");
      startServer();
    });
} else {
  console.log("ℹ️  AUTO_MIGRATE=false - bỏ qua tự động tạo database.\n");
  startServer();
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
