/**
 * API endpoint path templates by domain.
 * Paths are path-only (no BASE); buildUrl in apiClient prepends REACT_APP_API_BASE.
 * Use :paramName for dynamic segments; substitute via buildUrl(path, { paramName: value }).
 */

/** Edit this to use your own AI Gemini endpoint. Example: "https://your-api.com/ai/gemini". Leave empty to use REACT_APP_API_BASE + /api/ai/gemini. */
export const AI_GEMINI_URL = "";

function path(...segments) {
  return "/" + segments.filter(Boolean).join("/").replace(/\/+/g, "/");
}

export const endpoints = {
  auth: {
    login: path("api", "login"),
    logout: path("api", "logout"),
  },
  business: {
    selectBiz: path("api", "select-biz"),
    setBiz: path("api", "set-biz", ":ccode"),
    businesses: path("api", "businesses"),
  },
  reports: {
    stockcard: path("api", "reports", "inv", "sc"),
    stockcardGraph: path("api", "reports", "inv", "sc", "graph"),
  },
  inventory: {
    warehouse: path("api", "trans", "get", "wh"),
  },
  library: {
    product: path("api", "lib", "prod"),
  },
  gemini: {
    product: path("api", "ai", "gemini"),
  },
};

/**
 * Full URL for the AI Gemini endpoint.
 * Uses AI_GEMINI_URL (edit above) first, then REACT_APP_AI_GEMINI_URL, else null so caller uses buildUrl(gemini.product).
 */
export function getAiGeminiUrl() {
  const fromConstant =
    typeof AI_GEMINI_URL === "string" && AI_GEMINI_URL.trim() !== "" ? AI_GEMINI_URL.trim() : "";
  if (fromConstant) return fromConstant;
  const fromEnv =
    typeof process !== "undefined" && process.env?.REACT_APP_AI_GEMINI_URL != null
      ? String(process.env.REACT_APP_AI_GEMINI_URL).trim()
      : "";
  return fromEnv || null;
}

/**
 * Gemini API key for SDK usage (e.g. Google Generative AI). Uses REACT_APP_GEMINI_API_KEY from env.
 */
export function getGeminiApiKey() {
  return (typeof process !== "undefined" && process.env?.REACT_APP_GEMINI_API_KEY) || "";
}

/** Flattened map for legacy API_URLS compatibility */
export function getLegacyUrls() {
  const base = process.env.REACT_APP_API_BASE || "";
  const flat = {
    login: base + path("api", "login"),
    logout: base + path("api", "logout"),
    selectBiz: base + path("api", "select-biz"),
    setBiz: base + path("api", "set-biz"),
    businesses: base + path("api", "businesses"),
    stockcard: base + path("api", "reports", "inv", "sc"),
    stockcardGraph: base + path("api", "reports", "inv", "sc", "graph"),
    warehouse: base + path("api", "trans", "get", "wh"),
    product: base + path("api", "lib", "prod"),
  };
  return flat;
}

export default endpoints;
