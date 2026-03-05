/**
 * stockCardFetch: warehouse, stockcard overview, stockcard graph. 
 */

import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";

const inv = endpoints.inventory;
const reports = endpoints.reports;

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h["x-access-tokens"] = token;
  return h;
}

function currentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    dt1: `${year}-${month}-01T00:00:00+08:00`,
    dt2: `${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59+08:00`,
  };
}

function currentYearRange() {
  const year = new Date().getFullYear();
  return {
    dt1: `${year}-01-01T00:00:00+08:00`,
    dt2: `${year}-12-31T23:59:59+08:00`,
  };
}

/**
 * @param {string} [token]
 * @returns {Promise<unknown | null>}
 */
export async function getWarehouse(token) {
  const url = buildUrl(inv.warehouse);
  const { status, data } = await request(url, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (status >= 200 && status < 300 && data != null) return data;
  return null;
}

/**
 * @param {string} [token]
 * @param {{ ixProd: number, ixWH: number, dt1?: string, dt2?: string }} body
 * @returns {Promise<unknown | null>}
 */
export async function getStockcardOverview(token, body) {
  const { dt1, dt2 } = currentMonthRange();
  const payload = {
    ixProd: body.ixProd,
    ixWH: body.ixWH,
    dt1: body.dt1 ?? dt1,
    dt2: body.dt2 ?? dt2,
  };
  const url = buildUrl(reports.stockcard);
  const { status, data } = await request(url, {
    method: "POST",
    headers: authHeaders(token),
    body: payload,
  });
  if (status >= 200 && status < 300 && data != null) return data;
  return null;
}

/**
 * @param {string} [token]
 * @param {{ ixProd: number, ixWH: number, dt1?: string, dt2?: string, bn?: string }} body
 * @returns {Promise<unknown | null>}
 */
export async function getStockcardGraph(token, body) {
  const { dt1, dt2 } = currentYearRange();
  const payload = {
    ixProd: body.ixProd,
    ixWH: body.ixWH,
    dt1: body.dt1 ?? dt1,
    dt2: body.dt2 ?? dt2,
    bn: body.bn ?? "",
  };
  const url = buildUrl(reports.stockcardGraph);
  const { status, data } = await request(url, {
    method: "POST",
    headers: authHeaders(token),
    body: payload,
  });
  if (status >= 200 && status < 300 && data != null) return data;
  return null;
}

/**
 * @param {unknown} warehouseData
 * @returns {string}
 */
export function formatWarehouseAsText(warehouseData) {
  if (!warehouseData) return "";
  const arr = Array.isArray(warehouseData)
    ? warehouseData
    : warehouseData?.data ?? warehouseData?.warehouses ?? [];
  if (!Array.isArray(arr) || arr.length === 0) return "WAREHOUSE:\n- No warehouses\n";
  let text = "WAREHOUSE:\n";
  arr.forEach((wh, idx) => {
    const name = wh?.name ?? wh?.sWh ?? wh?.warehouse ?? wh?.label ?? `Warehouse ${idx + 1}`;
    const id = wh?.ixWh ?? wh?.id ?? wh?.warehouseId ?? "";
    text += `  - ${name}${id ? ` (ID: ${id})` : ""}\n`;
  });
  return text;
}

/**
 * @param {unknown} apiData
 * @returns {string}
 */
export function formatStockcardAsText(apiData) {
  if (!apiData || typeof apiData !== "object") return "";
  const d = /** @type {{ begQty?: unknown, endQty?: unknown, dt1?: string, dt2?: string, items?: Array<unknown> }} */ (apiData);
  let text = "STOCKCARD REPORT:\n";
  text += `- Beginning Qty: ${d.begQty ?? "N/A"}\n`;
  text += `- Ending Qty: ${d.endQty ?? "N/A"}\n`;
  if (d.dt1) text += `- Date From: ${d.dt1}\n`;
  if (d.dt2) text += `- Date To: ${d.dt2}\n\n`;
  if (Array.isArray(d.items) && d.items.length > 0) {
    const valid = d.items.filter(
      (i) =>
        i &&
        typeof i === "object" &&
        (i.YrWk != null || i.YrMo != null || i.tIN != null || i.tOUT != null || i.runBal != null)
    );
    if (valid.length) {
      text += "TRANSACTIONS:\n";
      valid.forEach((i, idx) => {
        const row = i;
        const period = row.YrWk || row.YrMo || `Row ${idx + 1}`;
        text += `  ${period}: In=${row.tIN ?? 0}, Out=${row.tOUT ?? 0}, Balance=${row.runBal ?? 0}\n`;
      });
    }
  }
  return text;
}

/**
 * @param {unknown} apiData
 * @returns {{ chartType: string, title: string, labels: string[], datasets: Array<{ label: string, data: number[], borderColor: string, fill: boolean }> } | null}
 */
export function stockcardGraphToChartSpec(apiData) {
  if (!apiData || typeof apiData !== "object" || !Array.isArray(apiData.items)) return null;
  const items = apiData.items;
  const validItems = items.filter(
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
