const fs = require("fs");
const path = require("path");

const DEFAULT_MAX_FILES = 25;
const DEFAULT_MAX_TOTAL_CHARS = 120_000;
const DEFAULT_MAX_CHARS_PER_FILE = 10_000;

const DEFAULT_EXTS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".md",
  ".html",
]);

const DEFAULT_IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  "coverage",
  ".vite",
]);

function safeReadText(filePath, maxChars) {
  try {
    const buf = fs.readFileSync(filePath);
    // Very basic binary detection
    const nulIndex = buf.indexOf(0);
    if (nulIndex !== -1) return null;

    const text = buf.toString("utf8");
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + "\n\n[...truncated...]\n";
  } catch {
    return null;
  }
}

function extractKeywords(prompt) {
  if (!prompt || typeof prompt !== "string") return [];
  const raw = prompt
    .toLowerCase()
    .replace(/[^a-z0-9_\-/\.\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const stop = new Set([
    "the",
    "and",
    "or",
    "a",
    "an",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "be",
    "this",
    "that",
    "it",
    "as",
    "at",
    "from",
    "by",
    "vs",
    "we",
    "you",
    "i",
    "my",
    "your",
    "please",
    "need",
    "want",
    "add",
    "fix",
    "update",
    "create",
    "frontend",
    "backend",
  ]);

  const keywords = [];
  for (const t of raw) {
    if (t.length < 3) continue;
    if (stop.has(t)) continue;
    if (!keywords.includes(t)) keywords.push(t);
    if (keywords.length >= 25) break;
  }

  return keywords;
}

function walkFiles(
  rootDir,
  { exts = DEFAULT_EXTS, ignoreDirs = DEFAULT_IGNORE_DIRS } = {}
) {
  const out = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      if (ent.name.startsWith(".")) {
        // keep dotfiles like .env.example? skip by default
      }

      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ignoreDirs.has(ent.name)) continue;
        walk(full);
        continue;
      }

      if (!ent.isFile()) continue;
      const ext = path.extname(ent.name).toLowerCase();
      if (!exts.has(ext)) continue;
      out.push(full);
    }
  }

  walk(rootDir);
  return out;
}

function scoreFile(content, keywords) {
  if (!content) return 0;
  const lower = content.toLowerCase();
  let score = 0;
  for (const k of keywords) {
    let idx = 0;
    while ((idx = lower.indexOf(k, idx)) !== -1) {
      score += 1;
      idx += k.length;
      if (score > 500) return score;
    }
  }
  return score;
}

function collectCodeContext({
  repoRoot,
  prompt,
  maxFiles = DEFAULT_MAX_FILES,
  maxTotalChars = DEFAULT_MAX_TOTAL_CHARS,
  maxCharsPerFile = DEFAULT_MAX_CHARS_PER_FILE,
}) {
  const keywords = extractKeywords(prompt);

  // Always include a few “entry” files if present.
  const mustInclude = [
    path.join(repoRoot, "backend", "server.js"),
    path.join(repoRoot, "backend", "config", "db.js"),
    path.join(repoRoot, "backend", "controllers", "timesheetController.js"),
    path.join(repoRoot, "backend", "models", "TimesheetModel.js"),
    path.join(repoRoot, "frontend", "src", "App.jsx"),
  ];

  const allFiles = walkFiles(repoRoot);

  const candidates = [];
  for (const filePath of allFiles) {
    const content = safeReadText(filePath, 25_000);
    const s = scoreFile(content, keywords);
    if (s > 0) {
      candidates.push({ filePath, score: s });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const selected = [];
  const added = new Set();

  for (const f of mustInclude) {
    if (fs.existsSync(f) && !added.has(f)) {
      selected.push({ filePath: f, score: 10_000 });
      added.add(f);
    }
  }

  for (const c of candidates) {
    if (selected.length >= maxFiles) break;
    if (added.has(c.filePath)) continue;
    selected.push(c);
    added.add(c.filePath);
  }

  let totalChars = 0;
  const files = [];
  for (const { filePath } of selected.slice(0, maxFiles)) {
    if (totalChars >= maxTotalChars) break;

    const rel = path.relative(repoRoot, filePath).replace(/\\/g, "/");
    const remaining = Math.max(0, maxTotalChars - totalChars);
    const chunkLimit = Math.min(maxCharsPerFile, remaining);
    const content = safeReadText(filePath, chunkLimit);
    if (!content) continue;

    totalChars += content.length;
    files.push({ path: rel, content });
  }

  return {
    keywords,
    files,
  };
}

module.exports = {
  collectCodeContext,
};
