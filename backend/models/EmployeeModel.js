const db = require("../config/db");

class EmployeeModel {
  // Create a new employee
  static async create({ lastName, firstName, preferredName, level }) {
    const sql = `INSERT INTO employees (last_name, first_name, preferred_name, level) 
           VALUES ($1, $2, $3, $4) RETURNING employee_id`;

    const { rows } = await db.query(sql, [
      lastName,
      firstName,
      preferredName || null,
      level,
    ]);

    return rows[0].employee_id;
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
    const sql = `SELECT 
            employee_id,
            last_name,
            first_name,
            preferred_name,
            level,
            created_at,
            updated_at
           FROM employees
           WHERE employee_id = $1`;

    const { rows } = await db.query(sql, [employeeId]);
    return rows[0] || null;
  }

  // Update employee
  static async update(
    employeeId,
    { lastName, firstName, preferredName, level }
  ) {
    const sql = `UPDATE employees 
           SET last_name = $1, first_name = $2, preferred_name = $3, level = $4, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE employee_id = $5`;

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
    const sql = `DELETE FROM employees WHERE employee_id = $1`;
    await db.query(sql, [employeeId]);
  }
}

module.exports = EmployeeModel;
