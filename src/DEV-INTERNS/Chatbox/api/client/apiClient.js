

const defaultHeaders = {
  "Content-Type": "application/json",
};

/** Default timeout for API requests (ms). Keep under gateway timeout to fail fast. */
const DEFAULT_REQUEST_TIMEOUT_MS = 55000;

// ========================
// BASE URL HELPERS
// ========================

export function getApiBase() {
  return (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) || "";
}

export function getGenaiBase() {
  const base = getApiBase();
  return base.replace(/\/api\/?$/, "") || base;
}

export function getAiGeminiUrl() {
  return typeof process !== "undefined" && process.env?.REACT_APP_AI_GEMINI_URL
    ? String(process.env.REACT_APP_AI_GEMINI_URL).trim()
    : null;
}

export function getGeminiApiKey() {
  return (typeof process !== "undefined" && process.env?.REACT_APP_GEMINI_API_KEY) || "";
}

// ========================
// URL BUILDER 
// ========================

/**
 * Build full URL from path template and params.
 * Supports :paramName syntax (e.g. "/set-biz/:ccode" with { ccode: "PH123" })
 */
export function buildUrl(pathTemplate, params = {}) {
  const base = getApiBase();
  let path = pathTemplate.startsWith("/") ? pathTemplate : `/${pathTemplate}`;

  Object.entries(params).forEach(([key, value]) => {
    const regex = new RegExp(`:${key}(?=/|$)`, "g");
    path = path.replace(regex, encodeURIComponent(String(value)));
  });

  return `${String(base).replace(/\/+$/, "")}${path}`;
}

/**
 * Build URL for GenAI endpoints (different base path)
 */
export function buildGenaiUrl(pathTemplate, params = {}) {
  const base = getGenaiBase();
  let path = pathTemplate.startsWith("/") ? pathTemplate : `/${pathTemplate}`;

  Object.entries(params).forEach(([key, value]) => {
    const regex = new RegExp(`:${key}(?=/|$)`, "g");
    path = path.replace(regex, encodeURIComponent(String(value)));
  });

  return `${String(base).replace(/\/+$/, "")}${path}`;
}

// ========================
// MAIN REQUEST FUNCTION (Core API Client)
// ========================

/**
 * Universal API request helper
 * @param {string} url - Full URL
 * @param {RequestInit & { parseJson?: boolean, timeout?: number }} [options]
 * @returns {Promise<{ status: number, data?: any, text: string }>}
 */
export async function request(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    parseJson = true,
    timeout = DEFAULT_REQUEST_TIMEOUT_MS,
    ...rest
  } = options;

  const mergedHeaders = { ...defaultHeaders, ...headers };

  const controller = new AbortController();
  const timeoutId = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: mergedHeaders,
      body: body != null
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined,
      credentials: "include",
      signal: controller.signal,
      ...rest,
    });
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);

    if (err?.name === "AbortError") {
      return {
        status: 504,
        data: null,
        text: "Request timed out. The server took too long to respond. Please try again.",
      };
    }
    throw err;
  }

  if (timeoutId) clearTimeout(timeoutId);

  const text = await response.text();
  let data = text;

  if (parseJson && text && (response.headers.get("content-type") || "").includes("application/json")) {
    try {
      data = text.trim() ? JSON.parse(text) : null;
    } catch (_) {
      // Keep original text if JSON parse fails
    }
  }

  return {
    status: response.status,
    data,
    text,
  };
}

// ========================
// CONVENIENCE WRAPPERS 
// ========================

/**
 * GET request helper
 */
export async function get(url, options = {}) {
  return request(url, { method: "GET", ...options });
}

/**
 * POST request helper
 */
export async function post(url, body, options = {}) {
  return request(url, { method: "POST", body, ...options });
}

/**
 * PUT request helper
 */
export async function put(url, body, options = {}) {
  return request(url, { method: "PUT", body, ...options });
}

/**
 * DELETE request helper
 */
export async function del(url, options = {}) {
  return request(url, { method: "DELETE", ...options });
}

// ========================
// DEFAULT EXPORT
// ========================

export default request;
