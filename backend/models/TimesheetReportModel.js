const db = require("../config/db");

class TimesheetReportModel {
  static async createReport({
    start_date,
    num_days,
    num_rows,
    name,
    processed_data,
    date_headers,
  }) {
    const processedJson = processed_data
      ? JSON.stringify(processed_data)
      : null;
    const headersJson = date_headers ? JSON.stringify(date_headers) : null;

    const sql = `INSERT INTO timesheetreport (start_date, num_days, num_rows, name, processed_data, date_headers)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING report_id`;

    const { rows } = await db.query(sql, [
      start_date,
      num_days,
      num_rows,
      name,
      processedJson,
      headersJson,
    ]);
    return rows[0].report_id;
  }

  static async getAllReports() {
    const sql = `
      SELECT
        report_id,
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        num_days,
        num_rows,
        name,
        processed_data,
        created_at,
        updated_at
      FROM timesheetreport
      ORDER BY start_date DESC, created_at DESC
    `;

    const { rows } = await db.query(sql);

    const parseJsonField = (value) => {
      if (!value) return null;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      }
      return value;
    };

    // Calculate employee count and total hours from processed_data
    return rows.map((row) => {
      let employee_count = 0;
      let total_hours = 0;

      try {
        const processedData = parseJsonField(row.processed_data);
        if (Array.isArray(processedData)) {
          employee_count = processedData.length;

          // Sum of all values in job.dayValues
          for (const employee of processedData) {
            const jobs = Array.isArray(employee?.jobs) ? employee.jobs : [];
            for (const job of jobs) {
              const dayValues = Array.isArray(job?.dayValues)
                ? job.dayValues
                : [];
              for (const value of dayValues) {
                const hours = parseFloat(value);
                if (Number.isFinite(hours)) total_hours += hours;
              }
            }
          }
        }
      } catch (error) {
        console.error(
          "Error calculating stats for report",
          row.report_id,
          error
        );
      }

      // Remove processed_data from response to reduce payload size
      const { processed_data, ...reportWithoutData } = row;

      return {
        ...reportWithoutData,
        employee_count,
        total_hours: Math.round(total_hours * 100) / 100, // Round to 2 decimal places
      };
    });
  }

  static async getReportById(reportId) {
    const sql = `
      SELECT
        report_id,
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        num_days,
        num_rows,
        name,
        processed_data,
        date_headers,
        created_at,
        updated_at
      FROM timesheetreport
      WHERE report_id = $1
    `;

    const { rows } = await db.query(sql, [reportId]);
    if (!rows[0]) return null;

    // Parse JSON fields
    const report = rows[0];
    if (report.processed_data && typeof report.processed_data === "string") {
      try {
        report.processed_data = JSON.parse(report.processed_data);
      } catch (e) {
        report.processed_data = null;
      }
    }
    if (report.date_headers && typeof report.date_headers === "string") {
      try {
        report.date_headers = JSON.parse(report.date_headers);
      } catch (e) {
        report.date_headers = null;
      }
    }
    return report;
  }

  static async updateReport(
    reportId,
    { start_date, num_days, num_rows, name, processed_data, date_headers }
  ) {
    const processedJson = processed_data
      ? JSON.stringify(processed_data)
      : null;
    const headersJson = date_headers ? JSON.stringify(date_headers) : null;

    const sql = `UPDATE timesheetreport
           SET start_date = $1, num_days = $2, num_rows = $3, name = $4, processed_data = $5, date_headers = $6, updated_at = CURRENT_TIMESTAMP
           WHERE report_id = $7`;

    await db.query(sql, [
      start_date,
      num_days,
      num_rows,
      name,
      processedJson,
      headersJson,
      reportId,
    ]);
  }

  static async deleteReport(reportId) {
    const sql = `DELETE FROM timesheetreport WHERE report_id = $1`;
    await db.query(sql, [reportId]);
  }

  static async saveEntries(reportId, entries) {
    const deleteSql = `DELETE FROM timesheetreport_entries WHERE report_id = $1`;
    await db.query(deleteSql, [reportId]);

    for (const entry of entries) {
      const { row_number, note, period, hrs, days } = entry;

      const insertEntrySql = `INSERT INTO timesheetreport_entries (report_id, row_number, note, period, hrs)
             VALUES ($1, $2, $3, $4, $5) RETURNING entry_id`;

      const { rows } = await db.query(insertEntrySql, [
        reportId,
        row_number,
        note || "",
        period || "",
        hrs || "",
      ]);

      const entryId = rows[0].entry_id;

      if (days && days.length > 0) {
        for (const day of days) {
          if (day.staff_name && day.staff_name.trim()) {
            const insertDaySql = `INSERT INTO timesheetreport_days (entry_id, day_index, staff_name)
                   VALUES ($1, $2, $3)`;

            await db.query(insertDaySql, [
              entryId,
              day.day_index,
              day.staff_name,
            ]);
          }
        }
      }
    }
  }

  static async getEntries(reportId) {
    const entriesSql = `SELECT entry_id, row_number, note, period, hrs
           FROM timesheetreport_entries
           WHERE report_id = $1
           ORDER BY row_number`;

    const { rows: entries } = await db.query(entriesSql, [reportId]);

    for (const entry of entries) {
      const daysSql = `SELECT day_index, staff_name FROM timesheetreport_days WHERE entry_id = $1 ORDER BY day_index`;

      const { rows: days } = await db.query(daysSql, [entry.entry_id]);
      entry.days = days;
    }

    return entries;
  }
}

module.exports = TimesheetReportModel;
