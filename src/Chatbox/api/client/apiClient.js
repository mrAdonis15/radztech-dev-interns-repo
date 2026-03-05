

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
    path = path.replace(new RegExp(`:${key}(?=/|$)`, "g"), encodeURIComponent(String(value)));
  });
  return `${base}${path}`;
}

export function getApiBase() {
  return process.env.REACT_APP_API_BASE || "";
}

/**

 * @param {string} url 
 * @param {RequestInit & { parseJson?: boolean }} [options] 
 * @returns {Promise<{ status: number, data?: any, text: string }>}
 */
export async function request(url, options = {}) {
  const { method = "GET", headers = {}, body, parseJson = true, ...rest } = options;
  const mergedHeaders = { ...defaultHeaders, ...headers };

  const response = await fetch(url, {
    method,
    headers: mergedHeaders,
    body: body != null ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    credentials: "include",
    ...rest,
  });

  const text = await response.text();
  let data = text;
  if (parseJson && text && (response.headers.get("content-type") || "").includes("application/json")) {
    try {
      data = text.trim() ? JSON.parse(text) : null;
    } catch (_) {
      
    }
  }

  return {
    status: response.status,
    data,
    text,
  };
}

export default request;
