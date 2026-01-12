const db = require("../config/db");

class GeneralNoteModel {
  static async getAll() {
    try {
      const { rows } = await db.query(
        `SELECT *
         FROM general_notes
         ORDER BY is_pinned DESC, COALESCE(pinned_at, created_at) DESC, is_completed ASC, created_at DESC`
      );
      return rows;
    } catch (err) {
      const message = (err && err.message) || "";
      const missingPinColumns =
        message.includes('column "is_pinned" does not exist') ||
        message.includes('column "pinned_at" does not exist');

      if (!missingPinColumns) throw err;

      const { rows } = await db.query(
        `SELECT *
         FROM general_notes
         ORDER BY is_completed ASC, created_at DESC`
      );
      return rows;
    }
  }

  static async getById(noteId) {
    const { rows } = await db.query(
      `SELECT * FROM general_notes WHERE note_id = $1`,
      [noteId]
    );
    return rows[0];
  }

  static async create(noteData) {
    const {
      title,
      content,
      priority = "medium",
      due_date = null,
      attachment_url = null,
      attachment_name = null,
    } = noteData;

    const { rows: result } = await db.query(
      `INSERT INTO general_notes
       (title, content, priority, due_date, attachment_url, attachment_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING note_id`,
      [title, content, priority, due_date, attachment_url, attachment_name]
    );

    return { note_id: result[0].note_id, ...noteData };
  }

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
      `UPDATE general_notes
       SET title = $1,
           content = $2,
           priority = $3,
           due_date = $4,
           is_completed = $5,
           attachment_url = $6,
           attachment_name = $7,
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

  static async toggleComplete(noteId) {
    const { rowCount } = await db.query(
      `UPDATE general_notes
       SET is_completed = NOT is_completed,
           updated_at = CURRENT_TIMESTAMP
       WHERE note_id = $1`,
      [noteId]
    );
    return rowCount > 0;
  }

  static async togglePin(noteId) {
    try {
      const { rowCount } = await db.query(
        `UPDATE general_notes
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

  static async delete(noteId) {
    const { rowCount } = await db.query(
      `DELETE FROM general_notes WHERE note_id = $1`,
      [noteId]
    );
    return rowCount > 0;
  }
}

module.exports = GeneralNoteModel;
