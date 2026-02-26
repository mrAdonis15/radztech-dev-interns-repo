

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


export function getBizToken() {
  const biz = getSelectedBiz();
  return biz?.token ?? null;
}

export function getBizIxBiz() {
  const biz = getSelectedBiz();
  return biz?.ixBiz ?? null;
}


export function getSelectedBizStorage() {
  return getSelectedBizRaw();
}

export default getSelectedBiz;
