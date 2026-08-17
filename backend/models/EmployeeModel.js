const db = require("../config/db");

class EmployeeModel {
  // Create a new employee
  static async create({
    lastName,
    firstName,
    preferredName,
    level,
    socialLevel,
  }) {
    const sql = `INSERT INTO employees (last_name, first_name, preferred_name, level, social_level)
           VALUES (?, ?, ?, ?, ?)`;

    const { insertId } = await db.query(sql, [
      lastName,
      firstName,
      preferredName || null,
      level || null,
      socialLevel || null,
    ]);

    return insertId;
  }

  // Get all employees
  static async getAll() {
    const sql = `
      SELECT
        employee_id,
        last_name,
        first_name,
        preferred_name,
        level,
        social_level,
        created_at,
        updated_at
      FROM employees
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(sql);
    return rows;
  }

  // Get single employee by ID
  static async getById(employeeId) {
    const sql = `
      SELECT
        employee_id,
        last_name,
        first_name,
        preferred_name,
        level,
        social_level,
        created_at,
        updated_at
      FROM employees
      WHERE employee_id = ?
    `;

    const { rows } = await db.query(sql, [employeeId]);
    return rows[0] || null;
  }

  // Update employee
  static async update(
    employeeId,
    { lastName, firstName, preferredName, level, socialLevel },
  ) {
    const sql = `UPDATE employees
           SET last_name = ?, first_name = ?, preferred_name = ?, level = ?, social_level = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE employee_id = ?`;

    await db.query(sql, [
      lastName,
      firstName,
      preferredName || null,
      level || null,
      socialLevel || null,
      employeeId,
    ]);
  }

  // Delete employee
  static async delete(employeeId) {
    const sql = `DELETE FROM employees WHERE employee_id = ?`;
    await db.query(sql, [employeeId]);
  }
}

module.exports = EmployeeModel;