const db = require("../config/db");

/**
 * Attachments for customer / employee / general notes (any number per note).
 *
 * Rows live in note_attachments, keyed by (note_type, note_id). Notes created
 * before this table existed keep their single file in the note's own
 * attachment_url / attachment_name columns; it is exposed in the same list
 * with id "legacy" so the UI treats every file the same way.
 */
const LEGACY_ID = "legacy";

// Full Notes labels general notes as "other"
const normalizeType = (noteType) =>
  noteType === "other" ? "general" : noteType;

const isMissingTable = (err) =>
  err &&
  (err.code === "ER_NO_SUCH_TABLE" || err.errno === 1146);

class NoteAttachmentModel {
  static get LEGACY_ID() {
    return LEGACY_ID;
  }

  static mapRow(row) {
    return { id: row.attachment_id, url: row.file_url, name: row.file_name };
  }

  /**
   * Set `attachments` on every note. Each note may carry its own `note_type`
   * (Full Notes); otherwise `defaultType` is used.
   */
  static async attachTo(notes, defaultType) {
    const list = (Array.isArray(notes) ? notes : [notes]).filter(Boolean);
    if (!list.length) return notes;

    const idsByType = {};
    for (const note of list) {
      const type = normalizeType(note.note_type || defaultType);
      (idsByType[type] = idsByType[type] || []).push(note.note_id);
    }

    const byNote = {};
    try {
      for (const [type, ids] of Object.entries(idsByType)) {
        const { rows } = await db.query(
          `SELECT attachment_id, note_id, file_url, file_name
           FROM note_attachments
           WHERE note_type = ? AND note_id IN (?)
           ORDER BY attachment_id ASC`,
          [type, ids]
        );
        for (const row of rows) {
          const key = `${type}:${row.note_id}`;
          (byNote[key] = byNote[key] || []).push(
            NoteAttachmentModel.mapRow(row)
          );
        }
      }
    } catch (err) {
      // Table not migrated yet → fall back to the legacy single attachment
      if (!isMissingTable(err)) throw err;
      console.warn("[NoteAttachmentModel] note_attachments table missing");
    }

    for (const note of list) {
      const type = normalizeType(note.note_type || defaultType);
      const attachments = [];
      if (note.attachment_url) {
        attachments.push({
          id: LEGACY_ID,
          url: note.attachment_url,
          name: note.attachment_name || "Attachment",
        });
      }
      attachments.push(...(byNote[`${type}:${note.note_id}`] || []));
      note.attachments = attachments;
    }
    return notes;
  }

  /** files: [{ url, name }] */
  static async add(noteType, noteId, files = []) {
    const type = normalizeType(noteType);
    for (const file of files) {
      await db.query(
        `INSERT INTO note_attachments (note_type, note_id, file_url, file_name)
         VALUES (?, ?, ?, ?)`,
        [type, noteId, file.url, file.name]
      );
    }
  }

  /** Delete the given attachment ids of one note; returns the removed rows. */
  static async remove(noteType, noteId, attachmentIds = []) {
    const ids = attachmentIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    if (!ids.length) return [];
    const type = normalizeType(noteType);

    const { rows } = await db.query(
      `SELECT attachment_id, file_url, file_name
       FROM note_attachments
       WHERE note_type = ? AND note_id = ? AND attachment_id IN (?)`,
      [type, noteId, ids]
    );
    if (rows.length) {
      await db.query(
        `DELETE FROM note_attachments
         WHERE note_type = ? AND note_id = ? AND attachment_id IN (?)`,
        [type, noteId, rows.map((r) => r.attachment_id)]
      );
    }
    return rows.map(NoteAttachmentModel.mapRow);
  }

  /** Delete every attachment row of one note; returns the removed rows. */
  static async removeAll(noteType, noteId) {
    const type = normalizeType(noteType);
    try {
      const { rows } = await db.query(
        `SELECT attachment_id, file_url, file_name
         FROM note_attachments
         WHERE note_type = ? AND note_id = ?`,
        [type, noteId]
      );
      if (rows.length) {
        await db.query(
          `DELETE FROM note_attachments WHERE note_type = ? AND note_id = ?`,
          [type, noteId]
        );
      }
      return rows.map(NoteAttachmentModel.mapRow);
    } catch (err) {
      if (isMissingTable(err)) return [];
      throw err;
    }
  }
}

module.exports = NoteAttachmentModel;
