require("dotenv").config();

async function initMysql() {
  const mysql = require("mysql2/promise");

  const host = process.env.MYSQL_HOST || "localhost";
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || "";
  const targetDb = process.env.MYSQL_DATABASE || "nexgenus";

  // Connect without selecting a database so we can CREATE DATABASE if needed
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    charset: "utf8mb4",
  });

  try {
    const [rows] = await conn.query(
      "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
      [targetDb]
    );

    if (!rows.length) {
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

async function init() {
  try {
    await initMysql();
  } catch (err) {
    console.error("Error initializing database:", err.message || err);
    process.exitCode = 2;
  }
}

init();