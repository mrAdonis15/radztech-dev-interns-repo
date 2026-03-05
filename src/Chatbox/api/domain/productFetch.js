/**
 * fetch /api/lib/prod and format for context. 
 */

import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";

const lib = endpoints.library;

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h["x-access-tokens"] = token;
  return h;
}

/**
 * Fetch product list from API. Token required when biz is selected.
 * @param {string} [token]
 * @returns {Promise<{ count?: number, items?: Array, data?: Array, products?: Array } | null>}
 */
export async function getProduct(token) {
  const url = buildUrl(lib.product);
  const { status, data } = await request(url, {
    method: "POST",
    headers: authHeaders(token),
    body: { prod_cat_filter: [] },
  });
  if (status >= 200 && status < 300 && data != null) return data;
  return null;
}

/**
 * Map product API response to text for AI context.
 * @param {{ count?: number, items?: Array, data?: Array, products?: Array } | null} productData
 * @returns {string}
 */
export function formatProductAsText(productData) {
  if (!productData) return "";
  const arr = Array.isArray(productData)
    ? productData
    : productData.items ?? productData.data ?? productData.products ?? [];
  if (!Array.isArray(arr) || arr.length === 0) return "PRODUCTS:\n- No products\n";
  let text = "PRODUCTS:\n";
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
