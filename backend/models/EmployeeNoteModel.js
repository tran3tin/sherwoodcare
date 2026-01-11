const db = require("../config/db");

class EmployeeNoteModel {
  // Get all notes for an employee
  static async getByEmployeeId(employeeId) {
    try {
      const { rows } = await db.query(
        `SELECT * FROM employee_notes 
         WHERE employee_id = $1 
         ORDER BY is_pinned DESC, COALESCE(pinned_at, created_at) DESC, is_completed ASC, created_at DESC`,
        [employeeId]
      );
      return rows;
    } catch (err) {
      const message = (err && err.message) || "";
      const missingPinColumns =
        message.includes('column "is_pinned" does not exist') ||
        message.includes('column "pinned_at" does not exist');

      if (!missingPinColumns) throw err;

      // Backward-compatible fallback if DB hasn't been migrated yet
      const { rows } = await db.query(
        `SELECT * FROM employee_notes
         WHERE employee_id = $1
         ORDER BY is_completed ASC, created_at DESC`,
        [employeeId]
      );
      return rows;
    }
  }

  // Get single note by ID
  static async getById(noteId) {
    const { rows } = await db.query(
      `SELECT * FROM employee_notes WHERE note_id = $1`,
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
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING note_id`,
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

    return { note_id: result[0].note_id, ...noteData };
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

    const { rowCount } = await db.query(
      `UPDATE employee_notes 
       SET title = $1, content = $2, priority = $3, due_date = $4, 
           is_completed = $5, attachment_url = $6, attachment_name = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE note_id = $8`,
      [
        title,
        content,
        priority,
        due_date,
        is_completed ? true : false,
        attachment_url,
        attachment_name,
        noteId,
      ]
    );

    return rowCount > 0;
  }

  // Toggle completion status
  static async toggleComplete(noteId) {
    const { rowCount } = await db.query(
      `UPDATE employee_notes 
       SET is_completed = NOT is_completed, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE note_id = $1`,
      [noteId]
    );
    return rowCount > 0;
  }

  // Toggle pin status
  static async togglePin(noteId) {
    try {
      const { rowCount } = await db.query(
        `UPDATE employee_notes
         SET is_pinned = NOT is_pinned,
             pinned_at = CASE WHEN is_pinned = false THEN CURRENT_TIMESTAMP ELSE NULL END,
             updated_at = CURRENT_TIMESTAMP
         WHERE note_id = $1`,
        [noteId]
      );
      return rowCount > 0;
    } catch (err) {
      const message = (err && err.message) || "";
      const missingPinColumns =
        message.includes('column "is_pinned" does not exist') ||
        message.includes('column "pinned_at" does not exist');

      if (missingPinColumns) {
        err.code = "PIN_COLUMNS_MISSING";
      }

      throw err;
    }
  }

  // Delete note
  static async delete(noteId) {
    const { rowCount } = await db.query(
      `DELETE FROM employee_notes WHERE note_id = $1`,
      [noteId]
    );
    return rowCount > 0;
  }

  // Get notes count by employee
  static async getCountByEmployeeId(employeeId) {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN is_completed = true THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN is_completed = false THEN 1 ELSE 0 END) as pending
       FROM employee_notes 
       WHERE employee_id = $1`,
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
         AND en.due_date <= ($1::date + INTERVAL '7 days')
         AND en.is_completed = false
       ORDER BY en.due_date ASC, en.priority DESC`,
      [today]
    );
    return rows;
  }
}

module.exports = EmployeeNoteModel;
