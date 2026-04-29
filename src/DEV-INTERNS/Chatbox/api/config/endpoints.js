export const AI_GEMINI_URL = "";

export const endpoints = {
  auth: {
    login: "/api/login",
    logout: "/api/logout",
  },

  business: {
    selectBiz: "/api/select-biz",
    setBiz: "/api/set-biz/:ccode",
    businesses: "/api/businesses",
  },

  gemini: {
    chat: "/api/ai/gemini",
    chats: "/genai/chat",
    chatHistory: "/genai/chat-history",
  },

  reports: {
    gl: "/reports/gl",
    glGraph: "/reports/gl/graph",
  },
};

function cleanPath(path) {
  return String(path || "").startsWith("/") ? String(path) : `/${path}`;
}

function joinUrl(base, path) {
  return `${String(base || "").replace(/\/+$/, "")}${cleanPath(path)}`;
}

export function buildUrl(module, endpointKey, ...params) {
  const moduleEndpoints = endpoints[module];
  if (!moduleEndpoints) {
    throw new Error(`Unknown module: ${module}`);
  }

  const endpoint = moduleEndpoints[endpointKey];
  if (!endpoint) {
    throw new Error(`Unknown endpoint: ${module}.${endpointKey}`);
  }

  return cleanPath(typeof endpoint === "function" ? endpoint(...params) : endpoint);
}

export function buildGenaiUrl(endpointKey, ...params) {
  const moduleEndpoints = endpoints.gemini;
  if (!moduleEndpoints[endpointKey]) {
    throw new Error(`Unknown GenAI endpoint: ${endpointKey}`);
  }

  return cleanPath(
    typeof moduleEndpoints[endpointKey] === "function"
      ? moduleEndpoints[endpointKey](...params)
      : moduleEndpoints[endpointKey],
  );
}

export function getAiGeminiUrl() {
  const fromConstant =
    typeof AI_GEMINI_URL === "string" && AI_GEMINI_URL.trim() !== ""
      ? AI_GEMINI_URL.trim()
      : "";

  if (fromConstant) return fromConstant;

  return typeof process !== "undefined" && process.env?.REACT_APP_AI_GEMINI_URL
    ? String(process.env.REACT_APP_AI_GEMINI_URL).trim()
    : null;
}

export function getGeminiApiKey() {
  return (typeof process !== "undefined" && process.env?.REACT_APP_GEMINI_API_KEY) || "";
}

export function getLegacyUrls() {
  const base = (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) || "";
  const genaiBase = base.replace(/\/api\/?$/, "") || base;
  const explicitChatHistory =
    typeof process !== "undefined" && process.env?.REACT_APP_CHAT_HISTORY_URL
      ? String(process.env.REACT_APP_CHAT_HISTORY_URL).trim()
      : "";

  return {
    login: joinUrl(base, endpoints.auth.login),
    logout: joinUrl(base, endpoints.auth.logout),
    selectBiz: joinUrl(base, endpoints.business.selectBiz),
    setBiz: (ccode) => joinUrl(base, `/api/set-biz${ccode ? `/${ccode}` : ""}`),
    businesses: joinUrl(base, endpoints.business.businesses),
    reportsGl: joinUrl(base, endpoints.reports.gl),
    reportsGlGraph: joinUrl(base, endpoints.reports.glGraph),
    genaiChat: joinUrl(genaiBase, endpoints.gemini.chats),
    genaiChatHistory: explicitChatHistory || joinUrl(genaiBase, endpoints.gemini.chatHistory),
  };
}

export default endpoints;
