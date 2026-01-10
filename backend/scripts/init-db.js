require("dotenv").config();

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
    await initPostgres();
  } catch (err) {
    console.error("Error initializing database:", err.message || err);
    process.exitCode = 2;
  }
}

init();
