const path = require("path");
const db = require("../config/db");
const { collectCodeContext } = require("../utils/aiContext");

function isReadOnlySql(sql) {
  if (!sql || typeof sql !== "string") return false;
  const s = sql.trim().toLowerCase();
  if (!s) return false;
  if (s.includes(";")) return false;
  if (
    /(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/.test(s)
  )
    return false;
  return s.startsWith("select") || s.startsWith("with");
}

async function getDbSchema() {
  // PostgreSQL
  const sql = `
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;

  const { rows } = await db.query(sql);
  const tables = {};
  for (const r of rows) {
    if (!tables[r.table_name]) tables[r.table_name] = [];
    tables[r.table_name].push({
      name: r.column_name,
      type: r.data_type,
      nullable: r.is_nullable === "YES",
    });
  }
  return { client: "pg", tables };
}

async function runReadOnlyQuery(sql, { limit = 50 } = {}) {
  if (!isReadOnlySql(sql)) {
    const err = new Error(
      "Only single-statement read-only SQL (SELECT/WITH) is allowed",
    );
    err.statusCode = 400;
    throw err;
  }

  // Wrap to enforce LIMIT without parsing - PostgreSQL syntax
  const wrapped = `SELECT * FROM (${sql}) AS _t LIMIT ${Number(limit) || 50}`;

  const { rows } = await db.query(wrapped);
  return rows;
}

async function callGemini({ messages, model, temperature = 0.2 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing GEMINI_API_KEY environment variable");
    err.statusCode = 500;
    throw err;
  }

  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  let systemInstruction = "";
  const contents = [];

  let currentRole = null;
  let currentParts = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction += msg.content + "\n";
      continue;
    }

    const geminiRole = msg.role === "assistant" ? "model" : "user";

    if (currentRole === geminiRole) {
      currentParts.push({ text: "\n\n" + msg.content });
    } else {
      if (currentRole) {
        contents.push({ role: currentRole, parts: currentParts });
      }
      currentRole = geminiRole;
      currentParts = [{ text: msg.content }];
    }
  }

  if (currentRole) {
    contents.push({ role: currentRole, parts: currentParts });
  }

  const geminiModel = genAI.getGenerativeModel({
    model: model || process.env.GEMINI_MODEL || "gemini-2.5-flash",
    systemInstruction: systemInstruction.trim() || undefined,
  });

  const result = await geminiModel.generateContent({
    contents,
    generationConfig: {
      temperature,
    },
  });

  return result.response.text();
}

exports.chat = async (req, res) => {
  try {
    const {
      prompt,
      messages,
      includeCodebase = true,
      includeDbSchema = true,
      sql,
      includeDbData = false,
      maxFiles,
    } = req.body || {};

    const userPrompt = typeof prompt === "string" ? prompt : "";
    const userMessages = Array.isArray(messages) ? messages : [];

    if (!userPrompt && userMessages.length === 0) {
      return res.status(400).json({ error: "Provide 'prompt' or 'messages'" });
    }

    const repoRoot = path.join(__dirname, "..", "..");

    const context = {};
    if (includeCodebase) {
      context.codebase = collectCodeContext({
        repoRoot,
        prompt: userPrompt || JSON.stringify(userMessages),
        maxFiles: Number.isFinite(maxFiles) ? maxFiles : undefined,
      });
    }

    if (includeDbSchema) {
      context.dbSchema = await getDbSchema();
    }

    if (includeDbData && sql) {
      context.dbData = {
        sql,
        rows: await runReadOnlyQuery(sql, { limit: 50 }),
      };
    }

    const finalMessages = [
      {
        role: "system",
        content:
          "You are an expert software engineer. Help the user implement changes in their existing codebase. Use the provided repository context and database schema. Be concrete: reference file paths and propose precise edits. If something is ambiguous, ask 1-3 clarifying questions.",
      },
    ];

    // Prefer explicit chat history from caller if provided.
    if (userMessages.length > 0) {
      finalMessages.push(...userMessages);
    } else {
      finalMessages.push({ role: "user", content: userPrompt });
    }

    finalMessages.push({
      role: "user",
      content:
        "\n\n---\nRepository context (auto-collected):\n" +
        JSON.stringify(context, null, 2),
    });

    const reply = await callGemini({ messages: finalMessages });

    res.json({ ok: true, reply });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ ok: false, error: err.message });
  }
};
