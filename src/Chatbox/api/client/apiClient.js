/**
 * Low-level fetch-based API client.
 * Use services (e.g. businessService) for domain-specific calls.
 */

const defaultHeaders = {
  "Content-Type": "application/json",
};

/**
 * Build full URL from path template and params.
 * Template uses :paramName (e.g. "/api/set-biz/:ccode" with { ccode: "x" } -> "/api/set-biz/x").
 * @param {string} pathTemplate - Path with optional :param segments
 * @param {Record<string, string|number>} [params] - Values to substitute
 * @returns {string} Full URL (base + path with params replaced)
 */
export function buildUrl(pathTemplate, params = {}) {
  const base = getApiBase();
  let path = pathTemplate.startsWith("/") ? pathTemplate : `/${pathTemplate}`;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(new RegExp(`:${key}(?=/|$)`, "g"), encodeURIComponent(String(value)));
  });
  return `${base}${path}`;
}

export function getApiBase() {
  return process.env.REACT_APP_API_BASE || "";
}

/**
 * Execute HTTP request. Parses JSON when response Content-Type is application/json.
 * @param {string} url - Full URL (use buildUrl with endpoints for dynamic paths)
 * @param {RequestInit & { parseJson?: boolean }} [options] - fetch options; parseJson defaults true for JSON responses
 * @returns {Promise<{ status: number, data?: any, text: string }>}
 */
export async function request(url, options = {}) {
  const { method = "GET", headers = {}, body, parseJson = true, ...rest } = options;
  const mergedHeaders = { ...defaultHeaders, ...headers };

  const response = await fetch(url, {
    method,
    headers: mergedHeaders,
    body: body != null ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    ...rest,
  });

  const text = await response.text();
  let data = text;
  if (parseJson && text && (response.headers.get("content-type") || "").includes("application/json")) {
    try {
      data = text.trim() ? JSON.parse(text) : null;
    } catch (_) {
      // leave data as text on parse error
    }
  }

  return {
    status: response.status,
    data,
    text,
  };
}

export default request;
