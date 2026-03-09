

const STORAGE_KEY = "selectedBiz";

function getSelectedBizRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}


export function getSelectedBiz() {
  const data = getSelectedBizRaw();
  if (data?.biz && typeof data.biz === "object") return data.biz;
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  return null;
}


export function getBizName() {
  const biz = getSelectedBiz();
  return biz?.name ?? biz?.sBiz ?? biz?.businessName ?? null;
}


/**
 * Get the biz-specific token for data access (stockcard, products, graph).
 * Token comes from set-biz response when user selects a biz.
 */
export function getBizToken() {
  const raw = getSelectedBizRaw();
  const biz = getSelectedBiz();
  const token =
    biz?.token ??
    biz?.dataAccessToken ??
    biz?.accessToken ??
    raw?.token ??
    raw?.dataAccessToken ??
    raw?.accessToken ??
    raw?.access_token ??
    raw?.auth_token ??
    raw?.bizToken ??
    raw?.data?.token ??
    raw?.biz?.token ??
    null;
  return token;
}

export function getBizIxBiz() {
  const biz = getSelectedBiz();
  return biz?.ixBiz ?? null;
}


export function getSelectedBizStorage() {
  return getSelectedBizRaw();
}

export default getSelectedBiz;
