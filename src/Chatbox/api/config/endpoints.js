
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
  gemini: {
    chat: path("api", "ai", "gemini"),
    chats: path("genai", "chat"),
    chatHistory: path("genai", "chat-history"),
  },
  reports: {
    gl: path("reports", "gl"),
    glGraph: path("reports", "gl", "graph"),
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
  const genaiBase = base.replace(/\/api\/?$/, "") || base;
  const explicitChatHistory =
    typeof process !== "undefined" && process.env?.REACT_APP_CHAT_HISTORY_URL
      ? String(process.env.REACT_APP_CHAT_HISTORY_URL).trim()
      : "";
  // Use relative path when no base URL so dev server proxy (e.g. to clone.ulap.biz) is used and CORS is avoided
  const chatHistoryUrl =
    explicitChatHistory ||
    (genaiBase ? genaiBase + path("genai", "chat-history") : path("genai", "chat-history"));
  const flat = {
    login: base + path("api", "login"),
    logout: base + path("api", "logout"),
    selectBiz: base + path("api", "select-biz"),
    setBiz: base + path("api", "set-biz"),
    businesses: base + path("api", "businesses"),
    reportsGl: base + path("reports", "gl"),
    reportsGlGraph: base + path("reports", "gl", "graph"),
    genaiChat: genaiBase + path("genai", "chat"),
    genaiChatHistory: chatHistoryUrl,
  };
  return flat;
}

export default endpoints;
