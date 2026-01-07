const db = require("../config/db");

class PayrollNexgenusModel {
  // Create new payroll record
  static async create({ start_date }) {
    if (db.client === "mysql") {
      const sql = `
        INSERT INTO payroll_nexgenus (start_date)
        VALUES (?)
      `;
      const result = await db.query(sql, [start_date]);
      const insertId = result.rows.insertId;
      return this.findById(insertId);
    } else {
      const sql = `
        INSERT INTO payroll_nexgenus (start_date)
        VALUES ($1)
        RETURNING *
      `;
      const { rows } = await db.query(sql, [start_date]);
      return rows[0];
    }
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
    const sql =
      db.client === "mysql"
        ? `SELECT * FROM payroll_nexgenus WHERE id = ?`
        : `SELECT * FROM payroll_nexgenus WHERE id = $1`;
    const { rows } = await db.query(sql, [id]);
    return rows[0];
  }

  // Update payroll
  static async update(id, { start_date }) {
    if (db.client === "mysql") {
      const sql = `
        UPDATE payroll_nexgenus
        SET start_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await db.query(sql, [start_date, id]);
      return this.findById(id);
    } else {
      const sql = `
        UPDATE payroll_nexgenus
        SET start_date = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const { rows } = await db.query(sql, [start_date, id]);
      return rows[0];
    }
  }

  // Delete payroll
  static async delete(id) {
    const payroll = await this.findById(id);
    if (!payroll) return null;

    const sql =
      db.client === "mysql"
        ? `DELETE FROM payroll_nexgenus WHERE id = ?`
        : `DELETE FROM payroll_nexgenus WHERE id = $1`;
    await db.query(sql, [id]);
    return payroll;
  }

  // Get entries for a payroll
  static async getEntries(payrollId) {
    const sql =
      db.client === "mysql"
        ? `SELECT * FROM payroll_nexgenus_entries WHERE payroll_id = ? ORDER BY row_number ASC`
        : `SELECT * FROM payroll_nexgenus_entries WHERE payroll_id = $1 ORDER BY row_number ASC`;
    const { rows } = await db.query(sql, [payrollId]);
    return rows;
  }

  // Save/update entries for a payroll
  static async saveEntries(payrollId, entries) {
    // Delete existing entries
    const deleteSql =
      db.client === "mysql"
        ? "DELETE FROM payroll_nexgenus_entries WHERE payroll_id = ?"
        : "DELETE FROM payroll_nexgenus_entries WHERE payroll_id = $1";
    await db.query(deleteSql, [payrollId]);

    // Insert new entries
    if (entries && entries.length > 0) {
      if (db.client === "mysql") {
        const values = [];
        const placeholders = [];

        entries.forEach((entry) => {
          placeholders.push("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
          values.push(
            payrollId,
            entry.row_number,
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

        const sql = `
          INSERT INTO payroll_nexgenus_entries (
            payroll_id, row_number, code, total_income,
            employee_bhxh, employee_bhyt, employee_bhtn,
            employer_bhxh, employer_tnld, employer_bhyt, employer_bhtn, employer_kpcd,
            pit
          ) VALUES ${placeholders.join(", ")}
        `;

        await db.query(sql, values);
      } else {
        const values = [];
        const placeholders = [];
        let paramIndex = 1;

        entries.forEach((entry) => {
          placeholders.push(
            `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${
              paramIndex + 3
            }, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${
              paramIndex + 7
            }, $${paramIndex + 8}, $${paramIndex + 9}, $${paramIndex + 10}, $${
              paramIndex + 11
            }, $${paramIndex + 12})`
          );
          values.push(
            payrollId,
            entry.row_number,
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
          paramIndex += 13;
        });

        const sql = `
          INSERT INTO payroll_nexgenus_entries (
            payroll_id, row_number, code, total_income,
            employee_bhxh, employee_bhyt, employee_bhtn,
            employer_bhxh, employer_tnld, employer_bhyt, employer_bhtn, employer_kpcd,
            pit
          ) VALUES ${placeholders.join(", ")}
        `;

        await db.query(sql, values);
      }
    }

    return this.getEntries(payrollId);
  }
}

module.exports = PayrollNexgenusModel;
