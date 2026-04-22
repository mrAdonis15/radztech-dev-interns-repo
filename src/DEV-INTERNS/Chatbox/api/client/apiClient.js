const defaultHeaders = {
  "Content-Type": "application/json",
};

/**
 * Build full URL from path template and params.
 * Template uses :paramName (e.g. "/api/set-biz/:ccode" with { ccode: "x" } -> "/api/set-biz/x").
 * @param {string} pathTemplate
 * @param {Record<string, string|number>} [params]
 * @returns {string}
 */
export function buildUrl(pathTemplate, params = {}) {
  const base = getApiBase();
  let path = pathTemplate.startsWith("/") ? pathTemplate : `/${pathTemplate}`;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(
      new RegExp(`:${key}(?=/|$)`, "g"),
      encodeURIComponent(String(value)),
    );
  });
  return `${base}${path}`;
}

export function getApiBase() {
  return process.env.REACT_APP_API_BASE || "";
}

/** Default timeout for API requests (ms). Keep under gateway (e.g. 60s) to fail fast. */
const DEFAULT_REQUEST_TIMEOUT_MS = 55000;

/**
 * @param {string} url
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
  const timeoutId =
    timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: mergedHeaders,
      body:
        body != null
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
  if (
    parseJson &&
    text &&
    (response.headers.get("content-type") || "").includes("application/json")
  ) {
    try {
      data = text.trim() ? JSON.parse(text) : null;
    } catch (_) {}
  }

  return {
    status: response.status,
    data,
    text,
  };
}

export default request;
