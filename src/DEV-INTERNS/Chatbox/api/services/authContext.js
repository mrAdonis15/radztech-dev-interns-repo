import { getBizToken, getSelectedBizStorage } from "../selectedBiz";

function parseStoredJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getStoredAuthToken() {
  if (typeof localStorage === "undefined") return null;
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("siteUserAuthToken") ||
    localStorage.getItem("user_auth_token") ||
    localStorage.getItem("siteAuthToken") ||
    localStorage.getItem("cloneUlapToken") ||
    null
  );
}

export function getStandardAuthHeaders(extra = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };

  const authToken = getStoredAuthToken();
  if (authToken) {
    headers["x-access-tokens"] = authToken;
  }

  const bizToken = getBizToken();
  if (bizToken) {
    headers["x-data-access-token"] = bizToken;
  }

  return headers;
}

export function getPythonBotAuthContext() {
  const authContext = {};
  const authToken = getStoredAuthToken();
  if (authToken) {
    authContext.user_auth_token = authToken;
    authContext.auth_header_name = "x-access-tokens";
  }

  const selectedBizToken = getBizToken();
  const resolvedDataToken = selectedBizToken || authToken || null;
  if (resolvedDataToken) {
    authContext.data_access_token = resolvedDataToken;
  }

  const selectedBiz = getSelectedBizStorage();
  const cookie =
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("siteUserCookie") ||
        localStorage.getItem("user_cookie"))) ||
    (selectedBiz?.cookie && String(selectedBiz.cookie)) ||
    (selectedBiz?.biz?.cookie && String(selectedBiz.biz.cookie)) ||
    (typeof document !== "undefined" ? document.cookie : "");

  if (cookie) authContext.user_cookie = cookie;

  const csrfToken =
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("siteCsrfToken") ||
        localStorage.getItem("csrf_token"))) ||
    null;
  if (csrfToken) authContext.csrf_token = csrfToken;

  const csrfHeaderName =
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("siteCsrfHeaderName") ||
        localStorage.getItem("csrf_header_name"))) ||
    null;
  if (csrfHeaderName) authContext.csrf_header_name = csrfHeaderName;

  const extraHeaders =
    parseStoredJson(
      typeof localStorage !== "undefined"
        ? localStorage.getItem("siteExtraHeaders")
        : null,
    ) ||
    parseStoredJson(
      typeof localStorage !== "undefined"
        ? localStorage.getItem("extra_headers")
        : null,
    );

  const mergedExtraHeaders =
    extraHeaders && typeof extraHeaders === "object" ? { ...extraHeaders } : {};

  if (resolvedDataToken) {
    mergedExtraHeaders["x-data-access-token"] = resolvedDataToken;
  }

  if (Object.keys(mergedExtraHeaders).length) {
    authContext.extra_headers = mergedExtraHeaders;
  }

  return Object.keys(authContext).length ? authContext : null;
}
