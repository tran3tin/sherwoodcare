const db = require("../config/db");

class CustomerNoteModel {
  // Get all notes for a customer
  static async getByCustomerId(customerId) {
    const { rows } = await db.query(
      `SELECT * FROM customer_notes 
       WHERE customer_id = ? 
       ORDER BY is_completed ASC, created_at DESC`,
      [customerId]
    );
    return rows;
  }

  // Get single note by ID
  static async getById(noteId) {
    const { rows } = await db.query(
      `SELECT * FROM customer_notes WHERE note_id = ?`,
      [noteId]
    );
    return rows[0];
  }

  // Create new note
  static async create(noteData) {
    const {
      customer_id,
      title,
      content,
      priority = "medium",
      due_date = null,
      attachment_url = null,
      attachment_name = null,
    } = noteData;

    const { rows: result } = await db.query(
      `INSERT INTO customer_notes 
       (customer_id, title, content, priority, due_date, attachment_url, attachment_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
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
      `UPDATE customer_notes 
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
      `UPDATE customer_notes 
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
      `DELETE FROM customer_notes WHERE note_id = ?`,
      [noteId]
    );
    return result.affectedRows > 0;
  }

  // Get notes count by customer
  static async getCountByCustomerId(customerId) {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) as pending
       FROM customer_notes 
       WHERE customer_id = ?`,
      [customerId]
    );
    return rows[0];
  }

  // Get all due and overdue notes (for notifications)
  static async getDueNotes(today) {
    const { rows } = await db.query(
      `SELECT cn.*, c.full_name
       FROM customer_notes cn
       LEFT JOIN customers c ON cn.customer_id = c.customer_id
       WHERE cn.due_date IS NOT NULL 
         AND cn.due_date <= DATE_ADD(?, INTERVAL 7 DAY)
         AND cn.is_completed = 0
       ORDER BY cn.due_date ASC, cn.priority DESC`,
      [today]
    );
    return rows;
  }
}

module.exports = CustomerNoteModel;
