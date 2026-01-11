const db = require("../config/db");

class FullNoteModel {
  static _capabilitiesCache = null;
  static _capabilitiesLoadedAt = 0;
  static _capabilitiesTtlMs = 5 * 60 * 1000;

  static async _getCapabilities() {
    const now = Date.now();
    if (
      FullNoteModel._capabilitiesCache &&
      now - FullNoteModel._capabilitiesLoadedAt <
        FullNoteModel._capabilitiesTtlMs
    ) {
      return FullNoteModel._capabilitiesCache;
    }

    const wanted = [
      { table: "customer_notes", column: "is_pinned" },
      { table: "customer_notes", column: "pinned_at" },
      { table: "employee_notes", column: "is_pinned" },
      { table: "employee_notes", column: "pinned_at" },
      { table: "customers", column: "full_name" },
      { table: "employees", column: "preferred_name" },
      { table: "employees", column: "first_name" },
      { table: "employees", column: "last_name" },
    ];

    const tables = [...new Set(wanted.map((w) => w.table))];
    const columns = [...new Set(wanted.map((w) => w.column))];

    const { rows } = await db.query(
      `
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ANY($1)
          AND column_name = ANY($2)
      `,
      [tables, columns]
    );

    const exists = new Set(rows.map((r) => `${r.table_name}.${r.column_name}`));
    const has = (table, column) => exists.has(`${table}.${column}`);

    const caps = {
      customerNotes: {
        isPinned: has("customer_notes", "is_pinned"),
        pinnedAt: has("customer_notes", "pinned_at"),
      },
      employeeNotes: {
        isPinned: has("employee_notes", "is_pinned"),
        pinnedAt: has("employee_notes", "pinned_at"),
      },
      customers: {
        fullName: has("customers", "full_name"),
      },
      employees: {
        preferredName: has("employees", "preferred_name"),
        firstName: has("employees", "first_name"),
        lastName: has("employees", "last_name"),
      },
    };

    FullNoteModel._capabilitiesCache = caps;
    FullNoteModel._capabilitiesLoadedAt = now;
    return caps;
  }

  static async getAll({ status = "all", type = "all" } = {}) {
    const caps = await FullNoteModel._getCapabilities();

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

    const cnPinnedSelect = caps.customerNotes.isPinned
      ? "cn.is_pinned"
      : "false::boolean";
    const cnPinnedAtSelect = caps.customerNotes.pinnedAt
      ? "cn.pinned_at"
      : "NULL::timestamp";

    const enPinnedSelect = caps.employeeNotes.isPinned
      ? "en.is_pinned"
      : "false::boolean";
    const enPinnedAtSelect = caps.employeeNotes.pinnedAt
      ? "en.pinned_at"
      : "NULL::timestamp";

    const customerNameSelect = caps.customers.fullName
      ? "COALESCE(c.full_name, '')"
      : "''::text";

    const employeeNameSelect = caps.employees.preferredName
      ? "COALESCE(e.preferred_name, CONCAT(e.first_name, ' ', e.last_name), '')"
      : "COALESCE(CONCAT(e.first_name, ' ', e.last_name), '')";

    const sql = `
      WITH n AS (
        SELECT
          'customer'::text AS note_type,
          cn.note_id,
          cn.customer_id AS entity_id,
          ${customerNameSelect} AS entity_name,
          cn.title,
          cn.content,
          cn.priority,
          cn.due_date,
          cn.is_completed,
          ${cnPinnedSelect} AS is_pinned,
          ${cnPinnedAtSelect} AS pinned_at,
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
          ${employeeNameSelect} AS entity_name,
          en.title,
          en.content,
          en.priority,
          en.due_date,
          en.is_completed,
          ${enPinnedSelect} AS is_pinned,
          ${enPinnedAtSelect} AS pinned_at,
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
