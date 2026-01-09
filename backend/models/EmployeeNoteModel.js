const db = require("../config/db");

class EmployeeNoteModel {
  // Get all notes for an employee
  static async getByEmployeeId(employeeId) {
    const { rows } = await db.query(
      `SELECT * FROM employee_notes 
       WHERE employee_id = ? 
       ORDER BY is_completed ASC, created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  // Get single note by ID
  static async getById(noteId) {
    const { rows } = await db.query(
      `SELECT * FROM employee_notes WHERE note_id = ?`,
      [noteId]
    );
    return rows[0];
  }

  // Create new note
  static async create(noteData) {
    const {
      employee_id,
      title,
      content,
      priority = "medium",
      due_date = null,
      attachment_url = null,
      attachment_name = null,
    } = noteData;

    const { rows: result } = await db.query(
      `INSERT INTO employee_notes 
       (employee_id, title, content, priority, due_date, attachment_url, attachment_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        title,
        content,
        priority,
        due_date,
        attachment_url,
        attachment_name,
      ]
    );

    return { note_id: result.insertId, ...noteData };
  }

  // Update note
  static async update(noteId, noteData) {
    const {
      title,
      content,
      priority,
      due_date,
      is_completed,
      attachment_url,
      attachment_name,
    } = noteData;

    const { rows: result } = await db.query(
      `UPDATE employee_notes 
       SET title = ?, content = ?, priority = ?, due_date = ?, 
           is_completed = ?, attachment_url = ?, attachment_name = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE note_id = ?`,
      [
        title,
        content,
        priority,
        due_date,
        is_completed ? 1 : 0,
        attachment_url,
        attachment_name,
        noteId,
      ]
    );

    return result.affectedRows > 0;
  }

  // Toggle completion status
  static async toggleComplete(noteId) {
    const { rows: result } = await db.query(
      `UPDATE employee_notes 
       SET is_completed = NOT is_completed, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE note_id = ?`,
      [noteId]
    );
    return result.affectedRows > 0;
  }

  // Delete note
  static async delete(noteId) {
    const { rows: result } = await db.query(
      `DELETE FROM employee_notes WHERE note_id = ?`,
      [noteId]
    );
    return result.affectedRows > 0;
  }

  // Get notes count by employee
  static async getCountByEmployeeId(employeeId) {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) as pending
       FROM employee_notes 
       WHERE employee_id = ?`,
      [employeeId]
    );
    return rows[0];
  }

  // Get all due and overdue notes (for notifications)
  static async getDueNotes(today) {
    const { rows } = await db.query(
      `SELECT en.*, e.first_name, e.last_name
       FROM employee_notes en
       LEFT JOIN employees e ON en.employee_id = e.employee_id
       WHERE en.due_date IS NOT NULL 
         AND en.due_date <= DATE_ADD(?, INTERVAL 7 DAY)
         AND en.is_completed = 0
       ORDER BY en.due_date ASC, en.priority DESC`,
      [today]
    );
    return rows;
  }
}

module.exports = EmployeeNoteModel;
