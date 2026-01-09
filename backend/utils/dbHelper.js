const db = require("../config/db");

/**
 * Get complete database schema including tables, columns, primary keys, and foreign keys
 */
async function getCompleteDbSchema() {
  if (db.client === "mysql") {
    const dbNameSql = "SELECT DATABASE() AS db";
    const { rows: dbNameRows } = await db.query(dbNameSql);
    const dbName = Array.isArray(dbNameRows)
      ? dbNameRows[0]?.db
      : dbNameRows?.[0]?.db;

    // Get all columns
    const columnsSql = `
      SELECT TABLE_NAME as table_name, COLUMN_NAME as column_name, 
             DATA_TYPE as data_type, IS_NULLABLE as is_nullable,
             COLUMN_KEY as column_key, EXTRA as extra
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;
    const { rows: columns } = await db.query(columnsSql, [dbName]);

    // Get primary keys
    const pkSql = `
      SELECT TABLE_NAME as table_name, COLUMN_NAME as column_name
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND CONSTRAINT_NAME = 'PRIMARY'
    `;
    const { rows: primaryKeys } = await db.query(pkSql, [dbName]);

    // Get foreign keys
    const fkSql = `
      SELECT 
        TABLE_NAME as table_name,
        COLUMN_NAME as column_name,
        REFERENCED_TABLE_NAME as referenced_table,
        REFERENCED_COLUMN_NAME as referenced_column,
        CONSTRAINT_NAME as constraint_name
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `;
    const { rows: foreignKeys } = await db.query(fkSql, [dbName]);

    // Build schema object
    const tables = {};
    for (const col of columns) {
      if (!tables[col.table_name]) {
        tables[col.table_name] = {
          columns: [],
          primaryKeys: [],
          foreignKeys: [],
        };
      }
      tables[col.table_name].columns.push({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === "YES",
        isPrimaryKey: col.column_key === "PRI",
        isAutoIncrement: col.extra?.includes("auto_increment"),
      });
    }

    // Add primary keys
    for (const pk of primaryKeys) {
      if (tables[pk.table_name]) {
        tables[pk.table_name].primaryKeys.push(pk.column_name);
      }
    }

    // Add foreign keys
    for (const fk of foreignKeys) {
      if (tables[fk.table_name]) {
        tables[fk.table_name].foreignKeys.push({
          column: fk.column_name,
          referencesTable: fk.referenced_table,
          referencesColumn: fk.referenced_column,
        });
      }
    }

    return { client: "mysql", database: dbName, tables };
  }

  // PostgreSQL
  const columnsSql = `
    SELECT table_name, column_name, data_type, is_nullable,
           column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;
  const { rows: columns } = await db.query(columnsSql);

  const pkSql = `
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY' 
      AND tc.table_schema = 'public'
  `;
  const { rows: primaryKeys } = await db.query(pkSql);

  const fkSql = `
    SELECT 
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS referenced_table,
      ccu.column_name AS referenced_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
  `;
  const { rows: foreignKeys } = await db.query(fkSql);

  const tables = {};
  for (const col of columns) {
    if (!tables[col.table_name]) {
      tables[col.table_name] = {
        columns: [],
        primaryKeys: [],
        foreignKeys: [],
      };
    }
    tables[col.table_name].columns.push({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === "YES",
    });
  }

  for (const pk of primaryKeys) {
    if (tables[pk.table_name]) {
      tables[pk.table_name].primaryKeys.push(pk.column_name);
    }
  }

  for (const fk of foreignKeys) {
    if (tables[fk.table_name]) {
      tables[fk.table_name].foreignKeys.push({
        column: fk.column_name,
        referencesTable: fk.referenced_table,
        referencesColumn: fk.referenced_column,
      });
    }
  }

  return { client: "pg", tables };
}

/**
 * Generate a human-readable schema description for AI
 */
function generateSchemaDescription(schema) {
  let description = `Database: ${schema.database || "PostgreSQL"} (${
    schema.client
  })\n\n`;
  description += "=== TABLES AND RELATIONSHIPS ===\n\n";

  for (const [tableName, tableInfo] of Object.entries(schema.tables)) {
    description += `📋 TABLE: ${tableName}\n`;
    description += `   Primary Key(s): ${
      tableInfo.primaryKeys.join(", ") || "none"
    }\n`;
    description += `   Columns:\n`;

    for (const col of tableInfo.columns) {
      const pkIndicator = col.isPrimaryKey ? " 🔑PK" : "";
      const nullable = col.nullable ? " (nullable)" : " (required)";
      description += `     - ${col.name}: ${col.type}${nullable}${pkIndicator}\n`;
    }

    if (tableInfo.foreignKeys.length > 0) {
      description += `   Foreign Keys:\n`;
      for (const fk of tableInfo.foreignKeys) {
        description += `     - ${fk.column} → ${fk.referencesTable}.${fk.referencesColumn}\n`;
      }
    }
    description += "\n";
  }

  return description;
}

/**
 * Check if SQL is read-only
 */
function isReadOnlySql(sql) {
  if (!sql || typeof sql !== "string") return false;
  const s = sql.trim().toLowerCase();
  if (!s) return false;
  // Chặn multiple statements
  const statements = s.split(";").filter((st) => st.trim());
  if (statements.length > 1) return false;
  // Chặn các lệnh nguy hiểm
  if (
    /(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/.test(s)
  )
    return false;
  return s.startsWith("select") || s.startsWith("with");
}

/**
 * Execute a read-only SQL query with limit
 */
async function executeReadOnlyQuery(sql, limit = 100) {
  if (!isReadOnlySql(sql)) {
    throw new Error("Only read-only SQL queries (SELECT/WITH) are allowed");
  }

  // Remove trailing semicolon if present, as it breaks the subquery wrapper
  const cleanSql = sql.trim().replace(/;+$/, "");

  const wrapped =
    db.client === "mysql"
      ? `SELECT * FROM (${cleanSql}) AS _t LIMIT ${Number(limit) || 100}`
      : `SELECT * FROM (${cleanSql}) AS _t LIMIT ${Number(limit) || 100}`;

  const { rows } = await db.query(wrapped);
  return rows;
}

module.exports = {
  getCompleteDbSchema,
  generateSchemaDescription,
  isReadOnlySql,
  executeReadOnlyQuery,
};
