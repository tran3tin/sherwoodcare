const db = require("../config/db");
const {
  getCompleteDbSchema,
  generateSchemaDescription,
  isReadOnlySql,
  executeReadOnlyQuery,
} = require("../utils/dbHelper");

// Lưu trữ lịch sử chat theo session (trong production nên dùng Redis/DB)
const chatSessions = new Map();

/**
 * Call OpenAI API
 */
async function callOpenAI({ messages, model, temperature = 0.3 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey });

  const res = await client.chat.completions.create({
    model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    temperature,
  });

  return res?.choices?.[0]?.message?.content || "";
}

/**
 * Parse SQL queries from AI response
 */
function extractSqlFromResponse(text) {
  const sqlPattern = /```sql\s*([\s\S]*?)```/gi;
  const matches = [];
  let match;

  while ((match = sqlPattern.exec(text)) !== null) {
    const sql = match[1].trim();
    if (sql && isReadOnlySql(sql)) {
      matches.push(sql);
    }
  }

  return matches;
}

/**
 * Main chatbot handler
 */
exports.chatbot = async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Get or create session history
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }
    const sessionHistory = chatSessions.get(sessionId);

    // Get complete database schema
    const dbSchema = await getCompleteDbSchema();
    const schemaDescription = generateSchemaDescription(dbSchema);

    // System prompt for understanding questions and generating SQL
    const systemPrompt = `You are an intelligent database assistant for a business management system called NexGenus/SherwoodCare.

YOUR DATABASE SCHEMA:
${schemaDescription}

YOUR CAPABILITIES:
1. Understand user questions in Vietnamese or English
2. Generate SQL queries to retrieve relevant data
3. Explain data in a clear, friendly manner
4. Join tables using foreign keys when needed

RULES:
1. ONLY generate SELECT queries - never INSERT, UPDATE, DELETE, DROP, etc.
2. When you need data, output SQL in \`\`\`sql code blocks
3. After receiving query results, explain them clearly to the user
4. If the question is unclear, ask for clarification
5. For questions not requiring database data, answer directly
6. Use Vietnamese when the user writes in Vietnamese
7. Always consider relationships between tables using foreign keys

COMMON TABLE RELATIONSHIPS:
- employees table contains employee information
- employers table contains employer/company information  
- timesheets links employees to their work hours
- customer_notes and employee_notes contain notes with due dates
- tasks contains task/todo items
- payroll_nexgenus contains payroll data
- social_sheets contains social insurance data

RESPONSE FORMAT:
- If you need to query data, output the SQL query first
- After getting results, provide a clear explanation
- Use bullet points and formatting for readability
- Include relevant totals, counts, or summaries when appropriate`;

    // Build messages for first API call (to understand question and generate SQL if needed)
    const firstCallMessages = [
      { role: "system", content: systemPrompt },
      ...sessionHistory.slice(-10), // Last 10 messages for context
      { role: "user", content: message },
    ];

    // First API call - understand question and potentially generate SQL
    const firstResponse = await callOpenAI({
      messages: firstCallMessages,
      temperature: 0.2,
    });

    // Extract any SQL queries from response
    const sqlQueries = extractSqlFromResponse(firstResponse);

    let finalResponse = firstResponse;
    let queryResults = [];

    // If SQL queries were generated, execute them and get a final response
    if (sqlQueries.length > 0) {
      const allResults = [];

      for (const sql of sqlQueries) {
        try {
          const rows = await executeReadOnlyQuery(sql, 100);
          allResults.push({
            query: sql,
            success: true,
            rowCount: rows.length,
            data: rows,
          });
        } catch (err) {
          allResults.push({
            query: sql,
            success: false,
            error: err.message,
          });
        }
      }

      queryResults = allResults;

      // Second API call - interpret the results
      const resultsContext = allResults
        .map((r, i) => {
          if (r.success) {
            return `Query ${i + 1} Results (${
              r.rowCount
            } rows):\n${JSON.stringify(r.data, null, 2)}`;
          }
          return `Query ${i + 1} Error: ${r.error}`;
        })
        .join("\n\n");

      const secondCallMessages = [
        { role: "system", content: systemPrompt },
        ...sessionHistory.slice(-10),
        { role: "user", content: message },
        { role: "assistant", content: firstResponse },
        {
          role: "user",
          content: `Here are the database query results:\n\n${resultsContext}\n\nPlease analyze these results and provide a clear, helpful response to my original question. Use the same language as my question.`,
        },
      ];

      finalResponse = await callOpenAI({
        messages: secondCallMessages,
        temperature: 0.3,
      });
    }

    // Update session history
    sessionHistory.push({ role: "user", content: message });
    sessionHistory.push({ role: "assistant", content: finalResponse });

    // Keep only last 20 messages
    if (sessionHistory.length > 20) {
      sessionHistory.splice(0, sessionHistory.length - 20);
    }

    res.json({
      success: true,
      response: finalResponse,
      queryResults: queryResults.length > 0 ? queryResults : undefined,
      sessionId,
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "An error occurred",
    });
  }
};

/**
 * Clear chat session
 */
exports.clearSession = (req, res) => {
  const { sessionId = "default" } = req.body;
  chatSessions.delete(sessionId);
  res.json({ success: true, message: "Session cleared" });
};

/**
 * Get database schema for frontend display
 */
exports.getSchema = async (req, res) => {
  try {
    const schema = await getCompleteDbSchema();
    res.json({ success: true, data: schema });
  } catch (err) {
    console.error("Schema error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Direct query endpoint (for testing/advanced users)
 */
exports.query = async (req, res) => {
  try {
    const { sql, limit = 100 } = req.body;

    if (!sql) {
      return res.status(400).json({ success: false, error: "SQL is required" });
    }

    if (!isReadOnlySql(sql)) {
      return res.status(400).json({
        success: false,
        error: "Only SELECT queries are allowed",
      });
    }

    const rows = await executeReadOnlyQuery(sql, limit);
    res.json({ success: true, data: rows, rowCount: rows.length });
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
