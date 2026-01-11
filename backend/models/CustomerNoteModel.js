const db = require("../config/db");

class CustomerNoteModel {
  // Get all notes for a customer
  static async getByCustomerId(customerId) {
    const { rows } = await db.query(
      `SELECT * FROM customer_notes 
       WHERE customer_id = $1 
       ORDER BY is_pinned DESC, COALESCE(pinned_at, created_at) DESC, is_completed ASC, created_at DESC`,
      [customerId]
    );
    return rows;
  }

  // Get single note by ID
  static async getById(noteId) {
    const { rows } = await db.query(
      `SELECT * FROM customer_notes WHERE note_id = $1`,
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
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING note_id`,
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
      `UPDATE customer_notes 
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
      `UPDATE customer_notes 
       SET is_completed = NOT is_completed, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE note_id = $1`,
      [noteId]
    );
    return rowCount > 0;
  }

  // Toggle pin status
  static async togglePin(noteId) {
    const { rowCount } = await db.query(
      `UPDATE customer_notes
       SET is_pinned = NOT is_pinned,
           pinned_at = CASE WHEN is_pinned = false THEN CURRENT_TIMESTAMP ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
       WHERE note_id = $1`,
      [noteId]
    );
    return rowCount > 0;
  }

  // Delete note
  static async delete(noteId) {
    const { rowCount } = await db.query(
      `DELETE FROM customer_notes WHERE note_id = $1`,
      [noteId]
    );
    return rowCount > 0;
  }

  // Get notes count by customer
  static async getCountByCustomerId(customerId) {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN is_completed = true THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN is_completed = false THEN 1 ELSE 0 END) as pending
       FROM customer_notes 
       WHERE customer_id = $1`,
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
         AND cn.due_date <= ($1::date + INTERVAL '7 days')
         AND cn.is_completed = false
       ORDER BY cn.due_date ASC, cn.priority DESC`,
      [today]
    );
    return rows;
  }
}

module.exports = CustomerNoteModel;
