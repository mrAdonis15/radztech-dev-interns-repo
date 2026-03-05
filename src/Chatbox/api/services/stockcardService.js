import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";
import { getSelectedBiz, getBizToken } from "../selectedBiz.js";

const inv = endpoints.inventory;
const lib = endpoints.library;
const reports = endpoints.reports;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let stockcardCache = null;
let stockcardCacheTime = 0;
let warehouseCache = null;
let warehouseCacheTime = 0;
let productCache = null;
let productCacheTime = 0;


function getDataAccessHeaders() {
  const token = getBizToken();
  const authToken =
    typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
  const effectiveToken = token || authToken;
  const headers = { "Content-Type": "application/json" };
  if (effectiveToken) {
    headers["x-access-tokens"] = effectiveToken;
  } else {
    console.warn("[stockcardService] No biz or auth token - data APIs may return 401/500");
  }
  return headers;
}

/**
 * Check if user has selected a biz - considers both selectedBiz and authToken (user is logged in).
 */
export function hasSelectedBiz() {
  const biz = getSelectedBiz();
  const raw = localStorage.getItem("selectedBiz");
  const hasAuth = !!localStorage.getItem("authToken");
  const hasBiz = !!biz || (!!raw && raw !== "null");
  const result = hasBiz || hasAuth;
  if (!result) {
    console.debug("[stockcardService] hasSelectedBiz=false: biz=", !!biz, "raw=", !!raw, "auth=", hasAuth);
  }
  return result;
}


export async function fetchWarehouse() {
  if (!hasSelectedBiz()) {
    console.debug("[stockcardService] fetchWarehouse skipped: no biz selected");
    return null;
  }

  try {
    const url = buildUrl(inv.warehouse);
    const { status, data } = await request(url, {
      method: "GET",
      headers: getDataAccessHeaders(),
    });
    if (status >= 200 && status < 300 && data != null) return data;
    if (status !== 200) console.warn("[stockcardService] fetchWarehouse failed:", status);
    return null;
  } catch (err) {
    console.error("[stockcardService] fetchWarehouse error:", err);
    return null;
  }
}


export async function getWarehouse() {
  const now = Date.now();
  if (warehouseCache && now - warehouseCacheTime < CACHE_TTL_MS) {
    return warehouseCache;
  }
  const data = await fetchWarehouse();
  if (data) {
    warehouseCache = data;
    warehouseCacheTime = now;
  }
  return data;
}


export async function fetchProduct() {
  if (!hasSelectedBiz()) {
    console.debug("[stockcardService] fetchProduct skipped: no biz selected");
    return null;
  }

  try {
    const url = buildUrl(lib.product);
    const { status, data } = await request(url, {
      method: "POST",
      headers: getDataAccessHeaders(),
      body: { prod_cat_filter: [] },
    });
    if (status >= 200 && status < 300 && data != null) return data;
    if (status !== 200) console.warn("[stockcardService] fetchProduct failed:", status);
    return null;
  } catch (err) {
    console.error("[stockcardService] fetchProduct error:", err);
    return null;
  }
}

/**
 * Get product list with short cache
 */
export async function getProduct() {
  const now = Date.now();
  if (productCache && now - productCacheTime < CACHE_TTL_MS) {
    return productCache;
  }
  const data = await fetchProduct();
  if (data) {
    productCache = data;
    productCacheTime = now;
  }
  return data;
}

/** Get start and end of current month in ISO format (+08:00) */
function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    dt1: `${year}-${month}-01T00:00:00+08:00`,
    dt2: `${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59+08:00`,
  };
}

/**
 * Fetch stockcard overview from /api/reports/inv/sc
 * Required params: ixProd, ixWH, dt1, dt2
 */
export async function fetchStockcardOverview(params = {}) {
  if (!hasSelectedBiz()) {
    console.debug("[stockcardService] fetchStockcardOverview skipped: no biz selected");
    return null;
  }

  const { dt1, dt2 } = getCurrentMonthRange();
  const body = {
    ixProd: params.ixProd,
    ixWH: params.ixWH,
    dt1: params.dt1 ?? dt1,
    dt2: params.dt2 ?? dt2,
  };

  if (body.ixProd == null || body.ixWH == null) {
    console.warn("[stockcardService] fetchStockcardOverview: ixProd and ixWH required");
    return null;
  }

  try {
    const url = buildUrl(reports.stockcard);
    const { status, data } = await request(url, {
      method: "POST",
      headers: getDataAccessHeaders(),
      body: body,
    });
    if (status >= 200 && status < 300 && data != null) return data;
    if (status !== 200) console.warn("[stockcardService] fetchStockcardOverview failed:", status);
    return null;
  } catch (err) {
    console.error("[stockcardService] fetchStockcardOverview error:", err);
    return null;
  }
}

/** Get start and end of current year in ISO format (+08:00) */
function getCurrentYearRange() {
  const year = new Date().getFullYear();
  return {
    dt1: `${year}-01-01T00:00:00+08:00`,
    dt2: `${year}-12-31T23:59:59+08:00`,
  };
}

/**
 * Fetch stockcard graph data
 * Required params: ixProd, ixWH. Optional: dt1, dt2, bn
 */
export async function fetchStockcardGraph(params = {}) {
  if (!hasSelectedBiz()) {
    console.debug("[stockcardService] fetchStockcardGraph skipped: no biz selected");
    return null;
  }

  const { dt1, dt2 } = getCurrentYearRange();
  const body = {
    ixProd: params.ixProd,
    ixWH: params.ixWH,
    dt1: params.dt1 ?? dt1,
    dt2: params.dt2 ?? dt2,
    bn: params.bn ?? "",
  };

  if (body.ixProd == null || body.ixWH == null) {
    console.warn("[stockcardService] fetchStockcardGraph: ixProd and ixWH required");
    return null;
  }

  try {
    const url = buildUrl(reports.stockcardGraph);
    const { status, data } = await request(url, {
      method: "POST",
      headers: getDataAccessHeaders(),
      body: body,
    });
    if (status >= 200 && status < 300 && data != null) return data;
    if (status !== 200) console.warn("[stockcardService] fetchStockcardGraph failed:", status);
    return null;
  } catch (err) {
    console.error("[stockcardService] fetchStockcardGraph error:", err);
    return null;
  }
}

/**
 * Get stockcard overview with short cache.
 * Requires ixProd and ixWH - pass from product/warehouse data.
 * @param {{ ixProd?: number, ixWH?: number }} opts - from first product/warehouse if not provided
 */
export async function getStockcardOverview(opts = {}) {
  const now = Date.now();
  const cacheKey = `${opts.ixProd ?? ""}-${opts.ixWH ?? ""}`;
  if (stockcardCache && stockcardCacheTime && now - stockcardCacheTime < CACHE_TTL_MS) {
    if (!opts.ixProd && !opts.ixWH) return stockcardCache;
    if (stockcardCache._key === cacheKey) return stockcardCache;
  }
  const data = await fetchStockcardOverview(opts);
  if (data) {
    stockcardCache = { ...data, _key: cacheKey };
    stockcardCacheTime = now;
  }
  return data;
}

/**
 * Invalidate all data caches (e.g. when biz changes)
 */
export function invalidateStockcardCache() {
  stockcardCache = null;
  stockcardCacheTime = 0;
  warehouseCache = null;
  warehouseCacheTime = 0;
  productCache = null;
  productCacheTime = 0;
}

/**
 * Format warehouse API data as text for AI context
 * Handles array or object response
 */
export function formatWarehouseAsText(warehouseData) {
  if (!warehouseData) return "";

  let text = "WAREHOUSE:\n";
  const arr = Array.isArray(warehouseData) ? warehouseData : (warehouseData.data ?? warehouseData.warehouses ?? []);
  if (!Array.isArray(arr) || arr.length === 0) {
    return text + "- No warehouses\n";
  }
  arr.forEach((wh, idx) => {
    const name = wh?.name ?? wh?.sWh ?? wh?.warehouse ?? wh?.label ?? `Warehouse ${idx + 1}`;
    const id = wh?.ixWh ?? wh?.id ?? wh?.warehouseId ?? "";
    text += `  - ${name}${id ? ` (ID: ${id})` : ""}\n`;
  });
  return text;
}

/**
 * Format product API data as text for AI context.
 * Uses product schema: ProdCd, sProd, sCat, sCatSub, unit, cPrice1-5, cCost, ixProd, etc.
 * @param {{ count?: number, items?: Array, data?: Array, products?: Array }} productData
 */
export function formatProductAsText(productData) {
  if (!productData) return "";

  let text = "PRODUCTS:\n";
  const arr = Array.isArray(productData) ? productData : (productData.items ?? productData.data ?? productData.products ?? []);
  if (!Array.isArray(arr) || arr.length === 0) {
    return text + "- No products\n";
  }
  arr.forEach((p, idx) => {
    const ProdCd = p?.ProdCd ?? p?.productCode ?? p?.code ?? "";
    const sProd = (p?.sProd ?? p?.name ?? p?.product ?? p?.label ?? `Product ${idx + 1}`).trim();
    const sCat = p?.sCat ?? p?.sProdCat ?? p?.category ?? "";
    const sCatSub = p?.sCatSub ?? "";
    const unit = p?.unit ?? "";
    const cPrice1 = p?.cPrice1 != null ? Number(p.cPrice1) : null;
    const cPrice2 = p?.cPrice2 != null ? Number(p.cPrice2) : null;
    const cPrice3 = p?.cPrice3 != null ? Number(p.cPrice3) : null;
    const cPrice4 = p?.cPrice4 != null ? Number(p.cPrice4) : null;
    const cPrice5 = p?.cPrice5 != null ? Number(p.cPrice5) : null;
    const cCost = p?.cCost != null ? Number(p.cCost) : null;
    const ixProd = p?.ixProd ?? p?.id ?? "";
    const sProdSubLink1 = p?.sProdSubLink1 ?? "";
    const sProdSubLink2 = p?.sProdSubLink2 ?? "";
    const prodStatus = p?.prodStatus;
    const qtyCS = p?.qtyCS != null ? Number(p.qtyCS) : null;
    const qtySC = p?.qtySC != null ? Number(p.qtySC) : null;

    text += `  [${idx + 1}] sProd: "${sProd}"`;
    if (ProdCd) text += ` | ProdCd: ${ProdCd}`;
    if (ixProd) text += ` | ixProd: ${ixProd}`;
    if (sCat) text += ` | sCat: ${sCat}`;
    if (sCatSub) text += ` | sCatSub: ${sCatSub}`;
    if (unit) text += ` | unit: ${unit}`;
    if (cPrice1 != null && cPrice1 !== 0) text += ` | cPrice1: ₱${cPrice1.toLocaleString()}`;
    if (cPrice2 != null && cPrice2 !== 0) text += ` | cPrice2: ₱${cPrice2.toLocaleString()}`;
    if (cPrice3 != null && cPrice3 !== 0) text += ` | cPrice3: ₱${cPrice3.toLocaleString()}`;
    if (cPrice4 != null && cPrice4 !== 0) text += ` | cPrice4: ₱${cPrice4.toLocaleString()}`;
    if (cPrice5 != null && cPrice5 !== 0) text += ` | cPrice5: ₱${cPrice5.toLocaleString()}`;
    if (cCost != null) text += ` | cCost: ₱${cCost.toLocaleString()}`;
    if (sProdSubLink1) text += ` | sProdSubLink1: ${sProdSubLink1}`;
    if (sProdSubLink2) text += ` | sProdSubLink2: ${sProdSubLink2}`;
    if (prodStatus != null) text += ` | prodStatus: ${prodStatus}`;
    if (qtyCS != null) text += ` | qtyCS: ${qtyCS}`;
    if (qtySC != null) text += ` | qtySC: ${qtySC}`;
    text += "\n";
  });
  return text;
}

/**
 * Convert API graph response to chatbox chart spec
 * @param {{ begQty, endQty, dt1, dt2, items: Array<{ YrWk?, YrMo?, tIN?, tOUT?, runBal?, details? }> }} apiData
 * @param {{ asText?: boolean }} opts
 */
export function stockcardGraphToChartSpec(apiData, opts = {}) {
  if (!apiData || !apiData.items || !Array.isArray(apiData.items)) return null;

  const validItems = apiData.items.filter(
    (i) => i && (i.YrWk != null || i.YrMo != null || i.tIN != null || i.tOUT != null || i.runBal != null)
  );
  if (!validItems.length) return null;

  const labels = validItems.map((i) => i.YrWk || i.YrMo || "Period");
  const runBal = validItems.map((i) => Number(i.runBal) || 0);
  const tIN = validItems.map((i) => Number(i.tIN) || 0);
  const tOUT = validItems.map((i) => Number(i.tOUT) || 0);

  return {
    chartType: "line",
    title: "Stockcard Movement",
    labels,
    datasets: [
      { label: "Running Balance", data: runBal, borderColor: "rgb(75,192,192)", fill: true },
      { label: "In", data: tIN, borderColor: "rgb(54,162,235)", fill: false },
      { label: "Out", data: tOUT, borderColor: "rgb(255,99,132)", fill: false },
    ],
  };
}

/**
 * Fetch stock card (sc) data and return formatted text for the AI to discuss.
 * Uses warehouse + product to get ixWH and ixProd, then fetches /api/reports/inv/sc.
 * @param {{ productName?: string }} opts - optional product to filter (e.g. "Aerox")
 * @returns {Promise<string>} Formatted stock card summary or error message
 */
export async function getStockcardDataForDiscussion(opts = {}) {
  if (!hasSelectedBiz()) {
    return "Please select a business first to view stock card data.";
  }
  const [warehouseData, productData] = await Promise.all([getWarehouse(), getProduct()]);
  const ixWH = pickIxWH(warehouseData);
  const arr = Array.isArray(productData)
    ? productData
    : productData?.items ?? productData?.data ?? productData?.products ?? [];
  const productName = opts?.productName || opts?.item || opts?.product || "";
  const ixProd = productName
    ? (() => {
        const lower = String(productName).toLowerCase();
        const match = arr.find(
          (p) =>
            (p?.sProd ?? p?.name ?? p?.product ?? "").toLowerCase().includes(lower) ||
            (p?.ProdCd ?? p?.productCode ?? "").toLowerCase().includes(lower)
        );
        return match?.ixProd ?? match?.id ?? arr[0]?.ixProd ?? arr[0]?.id;
      })()
    : arr[0]?.ixProd ?? arr[0]?.id;

  if (ixProd == null || ixWH == null) {
    return "Could not load warehouse or product list. Please try again.";
  }
  const data = await getStockcardOverview({ ixProd, ixWH });
  if (!data) return "No stock card data available for the selected period.";
  return formatStockcardAsText(data);
}

function pickIxWH(warehouseData) {
  const arr = Array.isArray(warehouseData)
    ? warehouseData
    : warehouseData?.data ?? warehouseData?.warehouses ?? [];
  const first = arr[0];
  return first?.ixWh ?? first?.ixWH ?? first?.id ?? first?.warehouseId;
}

/**
 * Format stockcard API data as text for AI context
 */
export function formatStockcardAsText(apiData) {
  if (!apiData) return "";

  let text = `STOCKCARD REPORT:\n`;
  text += `- Beginning Qty: ${apiData.begQty ?? "N/A"}\n`;
  text += `- Ending Qty: ${apiData.endQty ?? "N/A"}\n`;
  if (apiData.dt1) text += `- Date From: ${apiData.dt1}\n`;
  if (apiData.dt2) text += `- Date To: ${apiData.dt2}\n\n`;

  if (apiData.items && Array.isArray(apiData.items)) {
    const valid = apiData.items.filter(
      (i) => i && (i.YrWk != null || i.YrMo != null || i.tIN != null || i.tOUT != null || i.runBal != null)
    );
    if (valid.length) {
      text += `TRANSACTIONS:\n`;
      valid.forEach((i, idx) => {
        const period = i.YrWk || i.YrMo || `Row ${idx + 1}`;
        text += `  ${period}: In=${i.tIN ?? 0}, Out=${i.tOUT ?? 0}, Balance=${i.runBal ?? 0}\n`;
      });
    }
  }
  return text;
}
