const db = require("../config/db");

class PayrollNexgenusModel {
  // Create new payroll record
  static async create({ start_date }) {
    const sql = `
      INSERT INTO payroll_nexgenus (start_date)
      VALUES (?)
    `;
    const { insertId } = await db.query(sql, [start_date]);
    return this.findById(insertId);
  }

  // Get all payrolls
  static async findAll() {
    const sql = `
      SELECT * FROM payroll_nexgenus
      ORDER BY start_date DESC, created_at DESC
    `;
    const { rows } = await db.query(sql);
    return rows;
  }

  // Get payroll by ID
  static async findById(id) {
    const sql = `SELECT * FROM payroll_nexgenus WHERE id = ?`;
    const { rows } = await db.query(sql, [id]);
    return rows[0];
  }

  // Update payroll
  static async update(id, { start_date }) {
    const sql = `
      UPDATE payroll_nexgenus
      SET start_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.query(sql, [start_date, id]);
    return this.findById(id);
  }

  // Delete payroll
  static async delete(id) {
    const payroll = await this.findById(id);
    if (!payroll) return null;

    const sql = `DELETE FROM payroll_nexgenus WHERE id = ?`;
    await db.query(sql, [id]);
    return payroll;
  }

  // Get entries for a payroll
  static async getEntries(payrollId) {
    const sql = `SELECT *, row_num AS row_number FROM payroll_nexgenus_entries WHERE payroll_id = ? ORDER BY row_num ASC`;
    const { rows } = await db.query(sql, [payrollId]);
    return rows;
  }

  // Save/update entries for a payroll
  static async saveEntries(payrollId, entries) {
    // Delete existing entries
    const deleteSql =
      "DELETE FROM payroll_nexgenus_entries WHERE payroll_id = ?";
    await db.query(deleteSql, [payrollId]);

    // Insert new entries
    if (entries && entries.length > 0) {
      const values = [];

      entries.forEach((entry) => {
        values.push(
          payrollId,
          entry.row_num ?? entry.row_number,
          entry.code || null,
          entry.totalIncome || null,
          entry.employee?.bhxh || null,
          entry.employee?.bhyt || null,
          entry.employee?.bhtn || null,
          entry.employer?.bhxh || null,
          entry.employer?.tnld || null,
          entry.employer?.bhyt || null,
          entry.employer?.bhtn || null,
          entry.employer?.kpcd || null,
          entry.pit || null
        );
      });

      const rowPlaceholder = "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const placeholders = entries.map(() => rowPlaceholder);

      const sql = `
        INSERT INTO payroll_nexgenus_entries (
          payroll_id, row_num, code, total_income,
          employee_bhxh, employee_bhyt, employee_bhtn,
          employer_bhxh, employer_tnld, employer_bhyt, employer_bhtn, employer_kpcd,
          pit
        ) VALUES ${placeholders.join(", ")}
      `;

      await db.query(sql, values);
    }

    return this.getEntries(payrollId);
  }
}

module.exports = PayrollNexgenusModel;