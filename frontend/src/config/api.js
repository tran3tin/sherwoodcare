// Centralized API base URL configuration
//
// In dev it defaults to localhost.
// In production (Render) it defaults to the deployed backend URL.
// You can override with VITE_API_BASE_URL (preferred) or VITE_API_URL.

const DEFAULT_DEV = "http://localhost:3000";
const DEFAULT_PROD = "https://sherwoodcare-backend.up.railway.app";

// Only use env vars if they are NOT localhost in production mode
const rawEnvApiUrl =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

const normalizeApiBaseUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // If protocol is missing (e.g. sherwoodcare-backend.up.railway.app),
  // force https so browser won't treat it as a relative path.
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/$/, "");
};

const envApiUrl = normalizeApiBaseUrl(rawEnvApiUrl);
const isEnvLocalhost =
  envApiUrl &&
  (envApiUrl.includes("localhost") || envApiUrl.includes("127.0.0.1"));

export const API_BASE_URL =
  import.meta.env.PROD && isEnvLocalhost
    ? DEFAULT_PROD // Use production URL if env is localhost in prod build
    : envApiUrl || (import.meta.env.PROD ? DEFAULT_PROD : DEFAULT_DEV);

export const API_URL = API_BASE_URL;

export const API_BASE_WITH_API_PREFIX = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;
