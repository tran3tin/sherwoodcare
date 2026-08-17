require("dotenv").config();

// MySQL database configuration (mysql2 driver)
const mysql = require("mysql2/promise");

// Parse connection settings from DATABASE_URL (mysql://) or individual env vars.
// Example DATABASE_URL: mysql://user:pass@host:3306/dbname
const dbUrl = process.env.DATABASE_URL || "";

let config = {};

if (dbUrl.startsWith("mysql")) {
  try {
    const parsed = new URL(dbUrl);
    config = {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      database: decodeURIComponent((parsed.pathname || "").replace(/^\//, "")),
    };
  } catch (err) {
    console.error("Invalid DATABASE_URL, falling back to env vars:", err.message);
  }
} else if (dbUrl.startsWith("postgres")) {
  // If a legacy postgres:// URL is still set, print a helpful warning and
  // fall back to the individual MYSQL_* env vars so startup doesn't fail.
  console.warn(
    "⚠️  DATABASE_URL is a postgres:// URL but this project now targets MySQL. " +
      "Update DATABASE_URL to a mysql:// URL or set MYSQL_HOST/MYSQL_PORT/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE.",
  );
}

const pool = mysql.createPool({
  host: config.host || process.env.MYSQL_HOST || "localhost",
  port: config.port || Number(process.env.MYSQL_PORT || 3306),
  user: config.user || process.env.MYSQL_USER || "root",
  password: config.password || process.env.MYSQL_PASSWORD || "",
  database: config.database || process.env.MYSQL_DATABASE || "nexgenus",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: "utf8mb4",
  dateStrings: false,
  decimalNumbers: true,
  namedPlaceholders: false,
  // schema.sql is a multi-statement script (auto-migrate reads it and sends the
  // whole file in one call), so multipleStatements must be on. All user-facing
  // SQL entry points are guarded by isReadOnlySql() which rejects semicolons.
  multipleStatements: true,
});

/**
 * Query helper.
 *
 * mysql2 pool.query() returns:
 *   - SELECT  → [rowsArray, fieldsArray]
 *   - INSERT/UPDATE/DELETE → [resultSetHeader] where resultSetHeader has
 *       insertId / affectedRows / warningStatus / changedRows
 *
 * We return a pg-like facade { rows, rowCount, insertId, affectedRows, fields }
 * so callers can keep using `const { rows } = await db.query(...)`.
 */
async function query(sql, params) {
  const result = await pool.query(sql, params);
  // result is an array: [rowsOrHeader, fieldsOrUndefined]
  const rows = result[0];
  const fields = result[1];

  // For write statements mysql2 returns a ResultSetHeader as rows[0].
  if (rows && typeof rows.insertId === "number") {
    return {
      rows: [],
      rowCount: rows.affectedRows || 0,
      insertId: rows.insertId,
      affectedRows: rows.affectedRows,
      fields,
    };
  }

  // SELECT / CALL / other result-set-returning statements
  return {
    rows: rows || [],
    rowCount: rows ? rows.length : 0,
    fields,
  };
}

// Get a dedicated connection from the pool (needed for BEGIN/COMMIT/ROLLBACK
// transactions so every statement runs on the same connection).
async function getConnection() {
  return pool.getConnection();
}

// Test connection on startup (non-fatal)
pool
  .query("SELECT 1")
  .then(() => {
    console.log("✅ Đã kết nối thành công tới MySQL");
  })
  .catch((connectErr) => {
    console.error("❌ Lỗi kết nối MySQL:", connectErr.message);
  });

module.exports = {
  client: "mysql",
  query,
  pool,
  getPool: () => pool,
  getConnection,
};
