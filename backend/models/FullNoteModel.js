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
      { table: "general_notes", column: "note_id" },
      { table: "general_notes", column: "is_pinned" },
      { table: "general_notes", column: "pinned_at" },
      { table: "customers", column: "full_name" },
      { table: "employees", column: "preferred_name" },
      { table: "employees", column: "first_name" },
      { table: "employees", column: "last_name" },
    ];

    const tables = [...new Set(wanted.map((w) => w.table))];
    const columns = [...new Set(wanted.map((w) => w.column))];

    // MySQL: information_schema with IN (?) — mysql2 expands the array param.
    // IMPORTANT: MySQL 8 (Coolify) often returns TABLE_NAME/COLUMN_NAME uppercase,
    // while MariaDB local often returns lowercase. Normalize both.
    const { rows } = await db.query(
      `
        SELECT table_name AS tbl, column_name AS col
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name IN (?)
          AND column_name IN (?)
      `,
      [tables, columns]
    );

    const exists = new Set(
      rows.map((r) => {
        const table = r.tbl ?? r.TBL ?? r.table_name ?? r.TABLE_NAME ?? "";
        const column = r.col ?? r.COL ?? r.column_name ?? r.COLUMN_NAME ?? "";
        return `${String(table).toLowerCase()}.${String(column).toLowerCase()}`;
      })
    );
    const has = (table, column) =>
      exists.has(`${String(table).toLowerCase()}.${String(column).toLowerCase()}`);

    const caps = {
      customerNotes: {
        isPinned: has("customer_notes", "is_pinned"),
        pinnedAt: has("customer_notes", "pinned_at"),
      },
      employeeNotes: {
        isPinned: has("employee_notes", "is_pinned"),
        pinnedAt: has("employee_notes", "pinned_at"),
      },
      generalNotes: {
        exists: has("general_notes", "note_id"),
        isPinned: has("general_notes", "is_pinned"),
        pinnedAt: has("general_notes", "pinned_at"),
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

    // Fallback: if information_schema key casing/driver quirks hid general_notes,
    // probe the table directly so Coolify MySQL 8 still includes "other" notes.
    if (!caps.generalNotes.exists) {
      try {
        await db.query("SELECT note_id FROM general_notes LIMIT 0");
        caps.generalNotes.exists = true;
        try {
          await db.query("SELECT is_pinned, pinned_at FROM general_notes LIMIT 0");
          caps.generalNotes.isPinned = true;
          caps.generalNotes.pinnedAt = true;
        } catch (_) {
          // pin columns optional
        }
        console.warn(
          "[FullNoteModel] information_schema missed general_notes; direct probe OK"
        );
      } catch (_) {
        // table really missing
      }
    }

    FullNoteModel._capabilitiesCache = caps;
    FullNoteModel._capabilitiesLoadedAt = now;
    return caps;
  }

  static async getAll({ status = "all", type = "all" } = {}) {
    const caps = await FullNoteModel._getCapabilities();

    if (type === "other" && !caps.generalNotes.exists) {
      return [];
    }

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
    } else if (type === "other") {
      filters.push("n.note_type = 'other'");
    }

    const whereClause = filters.length
      ? `WHERE ${filters.join(" AND ")}`
      : "";

    // MySQL doesn't have ::text / ::int / ::boolean casts, use CONCAT/CAST instead
    const cnPinnedSelect = caps.customerNotes.isPinned
      ? "cn.is_pinned"
      : "false";
    const cnPinnedAtSelect = caps.customerNotes.pinnedAt
      ? "cn.pinned_at"
      : "NULL";

    const enPinnedSelect = caps.employeeNotes.isPinned
      ? "en.is_pinned"
      : "false";
    const enPinnedAtSelect = caps.employeeNotes.pinnedAt
      ? "en.pinned_at"
      : "NULL";

    const customerNameSelect = caps.customers.fullName
      ? "COALESCE(c.full_name, '')"
      : "''";

    const employeeNameSelect = caps.employees.preferredName
      ? "COALESCE(e.preferred_name, CONCAT(e.first_name, ' ', e.last_name), '')"
      : "COALESCE(CONCAT(e.first_name, ' ', e.last_name), '')";

    const gnPinnedSelect = caps.generalNotes.isPinned
      ? "gn.is_pinned"
      : "false";
    const gnPinnedAtSelect = caps.generalNotes.pinnedAt
      ? "gn.pinned_at"
      : "NULL";

    const unionParts = [
      `
        SELECT
          'customer' AS note_type,
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
      `,
      `
        SELECT
          'employee' AS note_type,
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
      `,
    ];

    if (caps.generalNotes.exists) {
      // entity_id must match INT type of customer_id/employee_id in UNION.
      // Prefer SIGNED (MySQL/MariaDB portable); fall back without CAST if needed.
      unionParts.push(`
        SELECT
          'other' AS note_type,
          gn.note_id,
          CAST(NULL AS SIGNED) AS entity_id,
          '' AS entity_name,
          gn.title,
          gn.content,
          gn.priority,
          gn.due_date,
          gn.is_completed,
          ${gnPinnedSelect} AS is_pinned,
          ${gnPinnedAtSelect} AS pinned_at,
          gn.attachment_url,
          gn.attachment_name,
          gn.created_at,
          gn.updated_at
        FROM general_notes gn
      `);
    } else {
      // Surface this in server logs so Coolify deploy issues are visible.
      console.warn(
        "[FullNoteModel] general_notes table/columns not detected — other notes excluded from UNION",
        {
          exists: caps.generalNotes.exists,
          isPinned: caps.generalNotes.isPinned,
          pinnedAt: caps.generalNotes.pinnedAt,
        }
      );
    }

    const unionSql = unionParts.join("\n\n        UNION ALL\n\n");
    // Wrap UNION so WHERE/ORDER can reference alias columns (note_type, is_completed, ...)
    // MySQL rejects `WHERE n.note_type` against a bare UNION without a derived table.
    const sql = `
      SELECT * FROM (
        ${unionSql}
      ) AS n
      ${whereClause}
      ORDER BY
        is_pinned DESC,
        COALESCE(pinned_at, created_at) DESC,
        created_at DESC
    `;

    try {
      const { rows } = await db.query(sql, params);
      return rows;
    } catch (err) {
      const message = (err && err.message) || "";
      // If CAST AS SIGNED still fails on a rare engine, retry with plain NULL.
      if (
        caps.generalNotes.exists &&
        (message.includes("SIGNED") ||
          message.includes("CAST") ||
          message.includes("entity_id"))
      ) {
        console.warn(
          "[FullNoteModel] UNION failed, retrying general_notes without CAST:",
          message
        );
        const fallbackParts = unionParts.map((part) =>
          part.includes("CAST(NULL AS SIGNED)")
            ? part.replace(
                "CAST(NULL AS SIGNED) AS entity_id",
                "NULL AS entity_id"
              )
            : part
        );
        const fallbackSql = `
          SELECT * FROM (
            ${fallbackParts.join("\n\n        UNION ALL\n\n")}
          ) AS n
          ${whereClause}
          ORDER BY
            is_pinned DESC,
            COALESCE(pinned_at, created_at) DESC,
            created_at DESC
        `;
        const { rows } = await db.query(fallbackSql, params);
        return rows;
      }
      throw err;
    }
  }
}

module.exports = FullNoteModel;