/**
 * Helpers to read the selected business (biz) from localStorage.
 * After select-biz POST, the response is stored as selectedBiz with shape:
 * { biz: { name, ixBiz, token, ad1, ad2, image, settings, user_position, ... } }
 */

const STORAGE_KEY = "selectedBiz";

function getSelectedBizRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Returns the biz object from the last select-biz response.
 * Use this to access biz contents: name, token, ixBiz, ad1, ad2, etc.
 */
export function getSelectedBiz() {
  const data = getSelectedBizRaw();
  if (data?.biz && typeof data.biz === "object") return data.biz;
  if (data && typeof data === "object" && !Array.isArray(data)) return data;
  return null;
}

/** Biz display name */
export function getBizName() {
  const biz = getSelectedBiz();
  return biz?.name ?? biz?.sBiz ?? biz?.businessName ?? null;
}

/** Biz token (for API calls that need biz context) */
export function getBizToken() {
  const biz = getSelectedBiz();
  return biz?.token ?? null;
}

/** Biz identifier (number or string) */
export function getBizIxBiz() {
  const biz = getSelectedBiz();
  return biz?.ixBiz ?? null;
}

/** Full selectedBiz object as stored (includes top-level biz key) */
export function getSelectedBizStorage() {
  return getSelectedBizRaw();
}

export default getSelectedBiz;
