const VN_TZ = "Asia/Ho_Chi_Minh";

function ymdFromDateInTimeZone(dateLike) {
  const d = new Date(dateLike);
  if (!Number.isFinite(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

export function normalizeYMD(value) {
  if (!value) return "";
  if (typeof value === "string") {
    // Accept 'YYYY-MM-DD' or ISO; keep date-only.
    return value.slice(0, 10);
  }
  return ymdFromDateInTimeZone(value);
}

export function formatDMYFromYMD(ymd) {
  const s = normalizeYMD(ymd);
  if (!s) return "";
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

export function formatDMFromYMD(ymd) {
  const s = normalizeYMD(ymd);
  if (!s) return "";
  const [, m, d] = s.split("-");
  if (!m || !d) return "";
  return `${d}/${m}`;
}

export function addDaysYMD(ymd, daysToAdd) {
  const s = normalizeYMD(ymd);
  if (!s) return "";
  const [y, m, d] = s.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return "";

  // Use UTC arithmetic for date-only values (stable across environments).
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(
    base.getUTCDate() + (Number.isFinite(daysToAdd) ? daysToAdd : 0)
  );
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(base.getUTCDate()).padStart(2, "0")}`;
}

export function weekdayIndexFromYMD(ymd) {
  const s = normalizeYMD(ymd);
  if (!s) return NaN;
  const [y, m, d] = s.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return NaN;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCDay();
}

export function formatDateVN(dateLike) {
  // For timestamps (created_at etc). Keep fixed VN timezone.
  const d = new Date(dateLike);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
