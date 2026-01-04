const db = require("../config/db");

class SocialSheetModel {
  static async createSheet({ name, rows }) {
    const rowsJson = rows ? JSON.stringify(rows) : JSON.stringify([]);

    const sql =
      db.client === "pg"
        ? `INSERT INTO social_sheets (name, rows_json)
           VALUES ($1, $2)
           RETURNING sheet_id`
        : `INSERT INTO social_sheets (name, rows_json)
           VALUES (?, ?)`;

    const { rows: result } = await db.query(sql, [name || null, rowsJson]);
    return db.client === "pg" ? result[0].sheet_id : result.insertId;
  }

  static async getAllSheets() {
    const sql =
      db.client === "pg"
        ? `
      SELECT
        sheet_id,
        name,
        rows_json,
        created_at,
        updated_at
      FROM social_sheets
      ORDER BY created_at DESC
    `
        : `
      SELECT
        sheet_id,
        name,
        rows_json,
        created_at,
        updated_at
      FROM social_sheets
      ORDER BY created_at DESC
    `;

    const { rows } = await db.query(sql);

    const safeParse = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const normalizeText = (value) => String(value ?? "").trim();

    return rows.map((row) => {
      const listRows = safeParse(row.rows_json);

      let activity_count = 0;
      const participants = new Set();

      for (const r of listRows) {
        const p = normalizeText(r?.participant_1);
        if (p) {
          activity_count += 1;
          participants.add(p);
        }
      }

      return {
        sheet_id: row.sheet_id,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        participant_count: participants.size,
        activity_count,
      };
    });
  }

  static async getSheetById(sheetId) {
    const sql =
      db.client === "pg"
        ? `
      SELECT
        sheet_id,
        name,
        rows_json,
        created_at,
        updated_at
      FROM social_sheets
      WHERE sheet_id = $1
    `
        : `
      SELECT
        sheet_id,
        name,
        rows_json,
        created_at,
        updated_at
      FROM social_sheets
      WHERE sheet_id = ?
    `;

    const { rows } = await db.query(sql, [sheetId]);
    if (!rows[0]) return null;

    const row = rows[0];
    let parsedRows = [];
    if (row.rows_json && typeof row.rows_json === "string") {
      try {
        const parsed = JSON.parse(row.rows_json);
        parsedRows = Array.isArray(parsed) ? parsed : [];
      } catch {
        parsedRows = [];
      }
    }

    return {
      sheet_id: row.sheet_id,
      name: row.name,
      rows: parsedRows,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  static async updateSheet(sheetId, { name, rows }) {
    const rowsJson = rows ? JSON.stringify(rows) : JSON.stringify([]);

    const sql =
      db.client === "pg"
        ? `UPDATE social_sheets
           SET name = $1,
               rows_json = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE sheet_id = $3`
        : `UPDATE social_sheets
           SET name = ?,
               rows_json = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE sheet_id = ?`;

    await db.query(sql, [name || null, rowsJson, sheetId]);
  }

  static async deleteSheet(sheetId) {
    const sql =
      db.client === "pg"
        ? `DELETE FROM social_sheets WHERE sheet_id = $1`
        : `DELETE FROM social_sheets WHERE sheet_id = ?`;

    await db.query(sql, [sheetId]);
  }
}

module.exports = SocialSheetModel;
