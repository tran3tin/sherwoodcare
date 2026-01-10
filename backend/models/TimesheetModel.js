const db = require("../config/db");

class TimesheetModel {
  // Create a new timesheet period
  static async createPeriod({ start_date, num_days, num_rows, name }) {
    const sql = `INSERT INTO timesheet_periods (start_date, num_days, num_rows, name) 
           VALUES ($1, $2, $3, $4) RETURNING period_id`;

    const { rows } = await db.query(sql, [
      start_date,
      num_days,
      num_rows,
      name,
    ]);

    return rows[0].period_id;
  }

  // Get all timesheet periods
  static async getAllPeriods() {
    const sql = `
      SELECT 
        p.period_id,
        to_char(p.start_date, 'YYYY-MM-DD') AS start_date,
        p.num_days,
        p.num_rows,
        p.name,
        p.created_at,
        p.updated_at,
        COALESCE(COUNT(DISTINCT NULLIF(BTRIM(td.staff_name), '')), 0) AS employee_count,
        COALESCE(
          SUM(
            CASE
              WHEN td.entry_id IS NULL THEN 0
              ELSE COALESCE(NULLIF(te.hrs, ''), '0')::numeric
            END
          ),
          0
        ) AS total_hours
      FROM timesheet_periods p
      LEFT JOIN timesheet_entries te ON te.period_id = p.period_id
      LEFT JOIN timesheet_days td ON td.entry_id = te.entry_id
      GROUP BY p.period_id, p.start_date, p.num_days, p.num_rows, p.name, p.created_at, p.updated_at
      ORDER BY p.start_date DESC, p.created_at DESC
    `;
    const { rows } = await db.query(sql);
    return rows;
  }

  // Get single period by ID
  static async getPeriodById(periodId) {
    const sql = `
      SELECT 
        period_id,
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        num_days,
        num_rows,
        name,
        created_at,
        updated_at
      FROM timesheet_periods
      WHERE period_id = $1
    `;
    const { rows } = await db.query(sql, [periodId]);
    return rows[0] || null;
  }

  // Update period metadata
  static async updatePeriod(
    periodId,
    { start_date, num_days, num_rows, name }
  ) {
    const sql = `UPDATE timesheet_periods 
           SET start_date = $1, num_days = $2, num_rows = $3, name = $4, updated_at = CURRENT_TIMESTAMP 
           WHERE period_id = $5`;

    await db.query(sql, [start_date, num_days, num_rows, name, periodId]);
  }

  // Delete period (cascade deletes entries and days)
  static async deletePeriod(periodId) {
    const sql = `DELETE FROM timesheet_periods WHERE period_id = $1`;
    await db.query(sql, [periodId]);
  }

  // Save entries (bulk insert/update with transaction)
  static async saveEntries(periodId, entries) {
    // entries = [{ row_number, note, period, hrs, days: [{day_index, staff_name}] }]

    // First, delete existing entries for this period
    const deleteSql = `DELETE FROM timesheet_entries WHERE period_id = $1`;
    await db.query(deleteSql, [periodId]);

    // Insert new entries
    for (const entry of entries) {
      const { row_number, note, period, hrs, days } = entry;

      const insertEntrySql = `INSERT INTO timesheet_entries (period_id, row_number, note, period, hrs) 
             VALUES ($1, $2, $3, $4, $5) RETURNING entry_id`;

      const { rows } = await db.query(insertEntrySql, [
        periodId,
        row_number,
        note || "",
        period || "",
        hrs || "",
      ]);

      const entryId = rows[0].entry_id;

      // Insert days for this entry
      if (days && days.length > 0) {
        for (const day of days) {
          if (day.staff_name && day.staff_name.trim()) {
            const insertDaySql = `INSERT INTO timesheet_days (entry_id, day_index, staff_name) 
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

  // Get all entries for a period
  static async getEntries(periodId) {
    const entriesSql = `SELECT entry_id, row_number, note, period, hrs 
           FROM timesheet_entries 
           WHERE period_id = $1 
           ORDER BY row_number`;

    const { rows: entries } = await db.query(entriesSql, [periodId]);

    // For each entry, get its days
    for (const entry of entries) {
      const daysSql = `SELECT day_index, staff_name FROM timesheet_days WHERE entry_id = $1 ORDER BY day_index`;

      const { rows: days } = await db.query(daysSql, [entry.entry_id]);
      entry.days = days;
    }

    return entries;
  }
}

module.exports = TimesheetModel;
