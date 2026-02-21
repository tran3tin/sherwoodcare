require("dotenv").config();

// PostgreSQL database configuration
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
      password,
    )}@${host}:${port}/${db}`;
  })();

// Detect if using Supabase (cloud) or local/Railway PostgreSQL
const isSupabase =
  databaseUrl.includes("supabase.co") || process.env.USE_SSL === "true";

const ssl = isSupabase ? { rejectUnauthorized: false } : false;

async function createPool() {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: ssl,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
  });

  // Test connection on startup (non-fatal)
  pool
    .connect()
    .then((client) => {
      console.log(
        "✅ Đã kết nối thành công tới PostgreSQL" +
          (isSupabase ? " (Supabase/SSL)" : " (Railway/Local)"),
      );
      client.release();
    })
    .catch((connectErr) => {
      console.error("❌ Lỗi kết nối PostgreSQL:", connectErr.message);
    });

  return pool;
}

const poolPromise = createPool();

// Backwards-compatible facade so existing code can keep using db.pool.query/end/connect
const pool = {
  query: (...args) => poolPromise.then((p) => p.query(...args)),
  connect: (...args) => poolPromise.then((p) => p.connect(...args)),
  end: (...args) => poolPromise.then((p) => p.end(...args)),
};

async function query(sql, params) {
  const res = await pool.query(sql, params);
  return { rows: res.rows, rowCount: res.rowCount };
}

module.exports = { client: "pg", query, pool, getPool: () => poolPromise };
