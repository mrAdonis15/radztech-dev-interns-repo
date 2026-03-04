
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
    /** Products list: /api/lib/prod — AI fetches from here when user asks to see products and displays the result in chat. */
    product: path("api", "lib", "prod"),
  },
  gemini: {
    chat: path("api", "ai", "gemini"),
  },
};


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

export function getGeminiApiKey() {
  return (typeof process !== "undefined" && process.env?.REACT_APP_GEMINI_API_KEY) || "";
}


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
