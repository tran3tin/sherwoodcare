require("dotenv").config();

const DB_CLIENT = process.env.DB_CLIENT || "mysql";

async function initMysql() {
  const mysql = require("mysql2/promise");
  const host = process.env.MYSQL_HOST || "127.0.0.1";
  const port = process.env.MYSQL_PORT || 3306;
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || "";
  const targetDb = process.env.MYSQL_DATABASE || "sherwoodcare";

  const conn = await mysql.createConnection({ host, port, user, password });
  try {
    const [rows] = await conn.query("SHOW DATABASES LIKE ?", [targetDb]);
    if (rows.length === 0) {
      console.log(`Database '${targetDb}' not found — creating...`);
      await conn.query(
        `CREATE DATABASE \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`Database '${targetDb}' created.`);
    } else {
      console.log(`Database '${targetDb}' already exists.`);
    }
  } finally {
    await conn.end();
  }
}

async function initPostgres() {
  const { Client } = require("pg");
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || 5432;
  const user = process.env.PGUSER || "postgres";
  const password = process.env.PGPASSWORD || "";
  const targetDb = process.env.PGDATABASE || "sherwoodcare";

  const client = new Client({
    connectionString: `postgres://${user}:${encodeURIComponent(
      password
    )}@${host}:${port}/postgres`,
  });
  await client.connect();
  try {
    const check = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDb]
    );
    if (check.rowCount === 0) {
      console.log(`Database '${targetDb}' not found — creating...`);
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`Database '${targetDb}' created.`);
    } else {
      console.log(`Database '${targetDb}' already exists.`);
    }
  } finally {
    await client.end();
  }
}

async function init() {
  try {
    if (DB_CLIENT === "mysql") {
      await initMysql();
    } else {
      await initPostgres();
    }
  } catch (err) {
    console.error("Error initializing database:", err.message || err);
    process.exitCode = 2;
  }
}

init();
