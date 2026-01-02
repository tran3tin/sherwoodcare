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

    const sql =
      db.client === "pg"
        ? `INSERT INTO timesheetreport (start_date, num_days, num_rows, name, processed_data, date_headers)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING report_id`
        : `INSERT INTO timesheetreport (start_date, num_days, num_rows, name, processed_data, date_headers)
           VALUES (?, ?, ?, ?, ?, ?)`;

    const { rows } = await db.query(sql, [
      start_date,
      num_days,
      num_rows,
      name,
      processedJson,
      headersJson,
    ]);
    return db.client === "pg" ? rows[0].report_id : rows.insertId;
  }

  static async getAllReports() {
    const sql =
      db.client === "pg"
        ? `
      SELECT
        report_id,
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        num_days,
        num_rows,
        name,
        created_at,
        updated_at
      FROM timesheetreport
      ORDER BY start_date DESC, created_at DESC
    `
        : `
      SELECT
        report_id,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        num_days,
        num_rows,
        name,
        created_at,
        updated_at
      FROM timesheetreport
      ORDER BY start_date DESC, created_at DESC
    `;

    const { rows } = await db.query(sql);
    return rows;
  }

  static async getReportById(reportId) {
    const sql =
      db.client === "pg"
        ? `
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
    `
        : `
      SELECT
        report_id,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        num_days,
        num_rows,
        name,
        processed_data,
        date_headers,
        created_at,
        updated_at
      FROM timesheetreport
      WHERE report_id = ?
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

    const sql =
      db.client === "pg"
        ? `UPDATE timesheetreport
           SET start_date = $1, num_days = $2, num_rows = $3, name = $4, processed_data = $5, date_headers = $6, updated_at = CURRENT_TIMESTAMP
           WHERE report_id = $7`
        : `UPDATE timesheetreport
           SET start_date = ?, num_days = ?, num_rows = ?, name = ?, processed_data = ?, date_headers = ?
           WHERE report_id = ?`;

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
    const sql =
      db.client === "pg"
        ? `DELETE FROM timesheetreport WHERE report_id = $1`
        : `DELETE FROM timesheetreport WHERE report_id = ?`;
    await db.query(sql, [reportId]);
  }

  static async saveEntries(reportId, entries) {
    const deleteSql =
      db.client === "pg"
        ? `DELETE FROM timesheetreport_entries WHERE report_id = $1`
        : `DELETE FROM timesheetreport_entries WHERE report_id = ?`;
    await db.query(deleteSql, [reportId]);

    for (const entry of entries) {
      const { row_number, note, period, hrs, days } = entry;

      const insertEntrySql =
        db.client === "pg"
          ? `INSERT INTO timesheetreport_entries (report_id, row_number, note, period, hrs)
             VALUES ($1, $2, $3, $4, $5) RETURNING entry_id`
          : `INSERT INTO timesheetreport_entries (report_id, row_number, note, period, hrs)
             VALUES (?, ?, ?, ?, ?)`;

      const { rows } = await db.query(insertEntrySql, [
        reportId,
        row_number,
        note || "",
        period || "",
        hrs || "",
      ]);

      const entryId = db.client === "pg" ? rows[0].entry_id : rows.insertId;

      if (days && days.length > 0) {
        for (const day of days) {
          if (day.staff_name && day.staff_name.trim()) {
            const insertDaySql =
              db.client === "pg"
                ? `INSERT INTO timesheetreport_days (entry_id, day_index, staff_name)
                   VALUES ($1, $2, $3)`
                : `INSERT INTO timesheetreport_days (entry_id, day_index, staff_name)
                   VALUES (?, ?, ?)`;

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
    const entriesSql =
      db.client === "pg"
        ? `SELECT entry_id, row_number, note, period, hrs
           FROM timesheetreport_entries
           WHERE report_id = $1
           ORDER BY row_number`
        : `SELECT entry_id, row_number, note, period, hrs
           FROM timesheetreport_entries
           WHERE report_id = ?
           ORDER BY row_number`;

    const { rows: entries } = await db.query(entriesSql, [reportId]);

    for (const entry of entries) {
      const daysSql =
        db.client === "pg"
          ? `SELECT day_index, staff_name FROM timesheetreport_days WHERE entry_id = $1 ORDER BY day_index`
          : `SELECT day_index, staff_name FROM timesheetreport_days WHERE entry_id = ? ORDER BY day_index`;

      const { rows: days } = await db.query(daysSql, [entry.entry_id]);
      entry.days = days;
    }

    return entries;
  }
}

module.exports = TimesheetReportModel;
