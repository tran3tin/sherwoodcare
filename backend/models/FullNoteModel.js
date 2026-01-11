const db = require("../config/db");

class FullNoteModel {
  static async getAll({ status = "all", type = "all" } = {}) {
    const filters = [];
    const params = [];

    if (status === "pending") {
      filters.push("n.is_completed = false");
    } else if (status === "completed") {
      filters.push("n.is_completed = true");
    }

    if (type === "customer") {
      filters.push("n.note_type = 'customer'");
    } else if (type === "employee") {
      filters.push("n.note_type = 'employee'");
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const sql = `
      WITH n AS (
        SELECT
          'customer'::text AS note_type,
          cn.note_id,
          cn.customer_id AS entity_id,
          COALESCE(c.full_name, '') AS entity_name,
          cn.title,
          cn.content,
          cn.priority,
          cn.due_date,
          cn.is_completed,
          cn.is_pinned,
          cn.pinned_at,
          cn.attachment_url,
          cn.attachment_name,
          cn.created_at,
          cn.updated_at
        FROM customer_notes cn
        LEFT JOIN customers c ON c.customer_id = cn.customer_id

        UNION ALL

        SELECT
          'employee'::text AS note_type,
          en.note_id,
          en.employee_id AS entity_id,
          COALESCE(e.preferred_name, CONCAT(e.first_name, ' ', e.last_name), '') AS entity_name,
          en.title,
          en.content,
          en.priority,
          en.due_date,
          en.is_completed,
          en.is_pinned,
          en.pinned_at,
          en.attachment_url,
          en.attachment_name,
          en.created_at,
          en.updated_at
        FROM employee_notes en
        LEFT JOIN employees e ON e.employee_id = en.employee_id
      )
      SELECT *
      FROM n
      ${whereClause}
      ORDER BY
        is_pinned DESC,
        COALESCE(pinned_at, created_at) DESC,
        created_at DESC;
    `;

    const { rows } = await db.query(sql, params);
    return rows;
  }
}

module.exports = FullNoteModel;
