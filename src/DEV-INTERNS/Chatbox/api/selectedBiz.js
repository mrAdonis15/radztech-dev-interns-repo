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
  if (data?.business && typeof data.business === "object") return data.business;
  if (data?.data && typeof data.data === "object") return data.data;
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  return null;
}

export function getBizName() {
  const biz = getSelectedBiz();
  return (
    biz?.name ??
    biz?.sBiz ??
    biz?.businessName ??
    biz?.bizName ??
    biz?.sBusiness ??
    biz?.business?.name ??
    biz?.data?.name ??
    null
  );
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
    biz?.access_token ??
    biz?.bizToken ??
    biz?.api_fixed_auth_token ??
    biz?.business?.token ??
    biz?.business?.dataAccessToken ??
    biz?.business?.accessToken ??
    biz?.data?.token ??
    biz?.data?.dataAccessToken ??
    biz?.data?.accessToken ??
    raw?.token ??
    raw?.dataAccessToken ??
    raw?.accessToken ??
    raw?.access_token ??
    raw?.auth_token ??
    raw?.bizToken ??
    raw?.api_fixed_auth_token ??
    raw?.business?.token ??
    raw?.business?.dataAccessToken ??
    raw?.business?.accessToken ??
    raw?.data?.token ??
    raw?.data?.dataAccessToken ??
    raw?.data?.accessToken ??
    raw?.biz?.token ??
    raw?.biz?.dataAccessToken ??
    raw?.biz?.accessToken ??
    null;
  return token;
}

export function getBizIxBiz() {
  const biz = getSelectedBiz();
  return (
    biz?.ixBiz ??
    biz?.iXBiz ??
    biz?.bizId ??
    biz?.businessId ??
    biz?.id ??
    biz?.business?.ixBiz ??
    biz?.business?.id ??
    biz?.data?.ixBiz ??
    biz?.data?.id ??
    null
  );
}

export function getSelectedBizStorage() {
  return getSelectedBizRaw();
}

export default getSelectedBiz;
