/**
 * API endpoint path templates by domain.
 * Paths are path-only (no BASE); buildUrl in apiClient prepends REACT_APP_API_BASE.
 * Use :paramName for dynamic segments; substitute via buildUrl(path, { paramName: value }).
 */

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
};

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
