const db = require("../config/db");

class EmployeeModel {
  // Create a new employee
  static async create({
    lastName,
    firstName,
    preferredName,
    level,
    cardId,
    recordId,
  }) {
    const sql =
      db.client === "pg"
        ? `INSERT INTO employees (last_name, first_name, preferred_name, level, card_id, record_id) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING employee_id`
        : `INSERT INTO employees (last_name, first_name, preferred_name, level, card_id, record_id) 
           VALUES (?, ?, ?, ?, ?, ?)`;

    const { rows } = await db.query(sql, [
      lastName,
      firstName,
      preferredName || null,
      level,
      cardId,
      recordId,
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
        card_id,
        record_id,
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
            card_id,
            record_id,
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
            card_id,
            record_id,
            created_at,
            updated_at
           FROM employees
           WHERE employee_id = ?`;

    const { rows } = await db.query(sql, [employeeId]);
    return rows[0] || null;
  }

  // Get employee by card ID
  static async getByCardId(cardId) {
    const sql =
      db.client === "pg"
        ? `SELECT employee_id FROM employees WHERE card_id = $1`
        : `SELECT employee_id FROM employees WHERE card_id = ?`;

    const { rows } = await db.query(sql, [cardId]);
    return rows[0] || null;
  }

  // Get employee by record ID
  static async getByRecordId(recordId) {
    const sql =
      db.client === "pg"
        ? `SELECT employee_id FROM employees WHERE record_id = $1`
        : `SELECT employee_id FROM employees WHERE record_id = ?`;

    const { rows } = await db.query(sql, [recordId]);
    return rows[0] || null;
  }

  // Update employee
  static async update(
    employeeId,
    { lastName, firstName, preferredName, level, cardId, recordId }
  ) {
    const sql =
      db.client === "pg"
        ? `UPDATE employees 
           SET last_name = $1, first_name = $2, preferred_name = $3, level = $4, 
               card_id = $5, record_id = $6, updated_at = CURRENT_TIMESTAMP 
           WHERE employee_id = $7`
        : `UPDATE employees 
           SET last_name = ?, first_name = ?, preferred_name = ?, level = ?, 
               card_id = ?, record_id = ? 
           WHERE employee_id = ?`;

    await db.query(sql, [
      lastName,
      firstName,
      preferredName || null,
      level,
      cardId,
      recordId,
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
