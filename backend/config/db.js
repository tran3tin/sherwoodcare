require("dotenv").config();

// PostgreSQL database configuration (Supabase compatible)
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

// Detect if using Supabase (cloud) or local PostgreSQL
const isSupabase =
  databaseUrl.includes("supabase.co") || process.env.USE_SSL === "true";

const pool = new Pool({
  connectionString: databaseUrl,
  // SSL required for Supabase
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Lỗi kết nối PostgreSQL:", err.message);
  } else {
    console.log(
      "✅ Đã kết nối thành công tới PostgreSQL" +
        (isSupabase ? " (Supabase)" : " (Local)")
    );
    release();
  }
});

async function query(sql, params) {
  const res = await pool.query(sql, params);
  return { rows: res.rows };
}

module.exports = { client: "pg", query, pool };
