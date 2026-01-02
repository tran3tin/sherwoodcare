const TimesheetReportModel = require("../models/TimesheetReportModel");

const VN_TZ = "Asia/Ho_Chi_Minh";

function ymdFromDateInTimeZone(date, timeZone = VN_TZ) {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
}

function normalizeDateOnly(value) {
  if (!value) return value;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (typeof value === "string") {
    const d = new Date(value);
    if (Number.isFinite(d.getTime())) {
      return ymdFromDateInTimeZone(d) || value.slice(0, 10);
    }
    return value.slice(0, 10);
  }

  try {
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return value;
    return ymdFromDateInTimeZone(d) || value;
  } catch {
    return value;
  }
}

exports.createReport = async (req, res) => {
  try {
    const {
      start_date,
      num_days,
      num_rows,
      name,
      processed_data,
      date_headers,
    } = req.body;

    if (!start_date || !num_days || !num_rows) {
      return res.status(400).json({
        error: "Missing required fields: start_date, num_days, num_rows",
      });
    }

    const reportId = await TimesheetReportModel.createReport({
      start_date: normalizeDateOnly(start_date),
      num_days,
      num_rows,
      name: name || null,
      processed_data: processed_data || null,
      date_headers: date_headers || null,
    });

    res.status(201).json({
      success: true,
      report_id: reportId,
      message: "Timesheet report created successfully",
    });
  } catch (error) {
    console.error("Error creating timesheet report:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await TimesheetReportModel.getAllReports();
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching timesheet reports:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await TimesheetReportModel.getReportById(id);

    if (!report) {
      return res.status(404).json({ error: "Timesheet report not found" });
    }

    // Return processed_data and date_headers directly
    res.json({
      success: true,
      data: {
        period: {
          period_id: report.report_id,
          start_date: report.start_date,
          num_days: report.num_days,
          num_rows: report.num_rows,
          name: report.name,
          created_at: report.created_at,
          updated_at: report.updated_at,
        },
        processed_data: report.processed_data || [],
        date_headers: report.date_headers || [],
      },
    });
  } catch (error) {
    console.error("Error fetching timesheet report:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      start_date,
      num_days,
      num_rows,
      name,
      processed_data,
      date_headers,
    } = req.body;

    const report = await TimesheetReportModel.getReportById(id);
    if (!report) {
      return res.status(404).json({ error: "Timesheet report not found" });
    }

    await TimesheetReportModel.updateReport(id, {
      start_date: normalizeDateOnly(start_date || report.start_date),
      num_days: num_days || report.num_days,
      num_rows: num_rows || report.num_rows,
      name: name !== undefined ? name : report.name,
      processed_data:
        processed_data !== undefined ? processed_data : report.processed_data,
      date_headers:
        date_headers !== undefined ? date_headers : report.date_headers,
    });

    res.json({
      success: true,
      message: "Timesheet report updated successfully",
    });
  } catch (error) {
    console.error("Error updating timesheet report:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await TimesheetReportModel.getReportById(id);
    if (!report) {
      return res.status(404).json({ error: "Timesheet report not found" });
    }

    await TimesheetReportModel.deleteReport(id);

    res.json({
      success: true,
      message: "Timesheet report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timesheet report:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.saveEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: "Invalid entries data" });
    }

    const report = await TimesheetReportModel.getReportById(id);
    if (!report) {
      return res.status(404).json({ error: "Timesheet report not found" });
    }

    await TimesheetReportModel.saveEntries(id, entries);

    res.json({ success: true, message: "Entries saved successfully" });
  } catch (error) {
    console.error("Error saving report entries:", error);
    res.status(500).json({ error: error.message });
  }
};
