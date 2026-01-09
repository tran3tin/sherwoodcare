const db = require("../config/db");

class EmployeeModel {
  // Create a new employee
  static async create({ lastName, firstName, preferredName, level }) {
    const sql =
      db.client === "pg"
        ? `INSERT INTO employees (last_name, first_name, preferred_name, level) 
           VALUES ($1, $2, $3, $4) RETURNING employee_id`
        : `INSERT INTO employees (last_name, first_name, preferred_name, level) 
           VALUES (?, ?, ?, ?)`;

    const { rows } = await db.query(sql, [
      lastName,
      firstName,
      preferredName || null,
      level,
    ]);

    if (db.client === "pg") {
      return rows[0].employee_id;
    } else {
      return rows.insertId;
    }
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
    const sql =
      db.client === "pg"
        ? `SELECT 
            employee_id,
            last_name,
            first_name,
            preferred_name,
            level,
            created_at,
            updated_at
           FROM employees
           WHERE employee_id = $1`
        : `SELECT 
            employee_id,
            last_name,
            first_name,
            preferred_name,
            level,
            created_at,
            updated_at
           FROM employees
           WHERE employee_id = ?`;

    const { rows } = await db.query(sql, [employeeId]);
    return rows[0] || null;
  }

  // Update employee
  static async update(
    employeeId,
    { lastName, firstName, preferredName, level }
  ) {
    const sql =
      db.client === "pg"
        ? `UPDATE employees 
           SET last_name = $1, first_name = $2, preferred_name = $3, level = $4, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE employee_id = $5`
        : `UPDATE employees 
           SET last_name = ?, first_name = ?, preferred_name = ?, level = ? 
           WHERE employee_id = ?`;

    await db.query(sql, [
      lastName,
      firstName,
      preferredName || null,
      level,
      employeeId,
    ]);
  }

  // Delete employee
  static async delete(employeeId) {
    const sql =
      db.client === "pg"
        ? `DELETE FROM employees WHERE employee_id = $1`
        : `DELETE FROM employees WHERE employee_id = ?`;
    await db.query(sql, [employeeId]);
  }
}

module.exports = EmployeeModel;
