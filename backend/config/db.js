require("dotenv").config();

// db.js supports either Postgres (pg) or MySQL (mysql2/promise) depending on env
const DB_CLIENT =
  process.env.DB_CLIENT ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mysql")
    ? "mysql"
    : "pg");

if (DB_CLIENT === "mysql") {
  const mysql = require("mysql2/promise");
  // Build mysql connection config from DATABASE_URL or individual env vars
  let cfg = {};
  if (
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL.startsWith("mysql")
  ) {
    try {
      const u = new URL(process.env.DATABASE_URL);
      cfg = {
        host: u.hostname,
        port: u.port || 3306,
        user: u.username,
        password: u.password,
        database: u.pathname.replace(/^\//, ""),
      };
    } catch (e) {
      cfg = {};
    }
  }

  cfg.host =
    cfg.host || process.env.MYSQL_HOST || process.env.PGHOST || "localhost";
  cfg.port = cfg.port || process.env.MYSQL_PORT || 3306;
  cfg.user = cfg.user || process.env.MYSQL_USER || process.env.PGUSER || "root";
  cfg.password =
    cfg.password || process.env.MYSQL_PASSWORD || process.env.PGPASSWORD || "";
  cfg.database =
    cfg.database ||
    process.env.MYSQL_DATABASE ||
    process.env.PGDATABASE ||
    "nexgenus";
  cfg.waitForConnections = true;
  cfg.connectionLimit = 10;

  const pool = mysql.createPool(cfg);

  async function query(sql, params) {
    const [rows] = await pool.query(sql, params);
    return { rows };
  }

  module.exports = { client: "mysql", query, pool };
} else {
  const { Pool } = require("pg");
  const databaseUrl =
    process.env.DATABASE_URL ||
    (() => {
      const host = process.env.PGHOST || "localhost";
      const port = process.env.PGPORT || 5432;
      const user = process.env.PGUSER || "postgres";
      const password = process.env.PGPASSWORD || "";
      const db = process.env.PGDATABASE || "nexgenus";
      return `postgres://${user}:${encodeURIComponent(
        password
      )}@${host}:${port}/${db}`;
    })();

  const pool = new Pool({ connectionString: databaseUrl });

  async function query(sql, params) {
    const res = await pool.query(sql, params);
    return { rows: res.rows };
  }

  module.exports = { client: "pg", query, pool };
}
