require("dotenv").config();

// PostgreSQL database configuration (Supabase compatible)
const { Pool } = require("pg");
const dns = require("dns");

// Node's URL parser is reliable for postgres:// and postgresql://
const { URL } = require("url");

// Force IPv4 DNS resolution for cloud platforms (Render, Railway, etc.)
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const primaryDatabaseUrl =
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

// Render currently has IPv6 egress issues in some regions. Supabase direct hostnames
// can be IPv6-only (no A record). If you hit ENETUNREACH, set DATABASE_URL_IPV4 to
// Supabase's Pooler connection string (IPv4-capable host, usually port 6543).
const databaseUrl = process.env.DATABASE_URL_IPV4 || primaryDatabaseUrl;

// Detect if using Supabase (cloud) or local PostgreSQL
const isSupabase =
  primaryDatabaseUrl.includes("supabase.co") || process.env.USE_SSL === "true";

const ssl = isSupabase ? { rejectUnauthorized: false } : false;

async function resolveHostnameToIpv4(hostname) {
  // Prefer explicit A record resolution to avoid hosts that try AAAA first.
  try {
    const aRecords = await dns.promises.resolve4(hostname);
    if (Array.isArray(aRecords) && aRecords.length > 0) return aRecords[0];
  } catch (_) {
    // Ignore and fall back
  }

  // Helpful message for the common Supabase-on-Render failure mode:
  // hostname has no A record, so IPv4-only hosts can never connect.
  try {
    await dns.promises.resolve6(hostname);
    console.warn(
      "⚠️  DB hostname appears to be IPv6-only (no IPv4 A record). " +
        "If you're on Render and see ENETUNREACH, set DATABASE_URL_IPV4 to Supabase Pooler URL.",
    );
  } catch (_) {
    // ignore
  }

  // Fallback to lookup() constrained to IPv4
  try {
    const result = await dns.promises.lookup(hostname, { family: 4 });
    if (result && result.address) return result.address;
  } catch (_) {
    // Ignore and fall back
  }

  return hostname;
}

async function createPool() {
  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch (err) {
    // If URL parsing fails, fall back to connectionString (best-effort)
    return new Pool({
      connectionString: databaseUrl,
      family: 4,
      ssl,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20,
    });
  }

  const hostname = parsed.hostname;
  const ipv4Host = await resolveHostnameToIpv4(hostname);

  const port = Number(parsed.port || 5432);
  const user = decodeURIComponent(parsed.username || "");
  const password = decodeURIComponent(parsed.password || "");
  const database = decodeURIComponent(
    (parsed.pathname || "").replace(/^\//, ""),
  );

  const pool = new Pool({
    host: ipv4Host,
    port,
    user,
    password,
    database,
    // Keep hostname as servername for TLS SNI when possible
    ssl: ssl
      ? {
          ...ssl,
          servername: hostname,
        }
      : false,
    // Extra belt-and-suspenders: also force IPv4 for any internal lookup
    family: 4,
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
          (isSupabase ? " (Supabase)" : " (Local)"),
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
