import { request, buildUrl } from "../client/apiClient";
import { endpoints } from "../config/endpoints";

const { reports } = endpoints;

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h["x-access-tokens"] = token;
  return h;
}

/**

 * @param {object} params
 * @param {number} [params.ixAcc] 
 * @param {boolean} [params.showZero] 
 * @param {boolean} [params.group_by_branch] 
 * @param {string} [params.dt1] 
 * @param {string} [params.dt2] 
 * @param {Array} [params.acc_others] 
 * @param {string} [token] - authToken
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function getGeneralLedgerReport(params = {}, token) {
  const url = buildUrl(reports.gl);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth(), 0).getDate();
  let dt1 = params.dt1;
  let dt2 = params.dt2;
  if (!dt1 || !dt2) {
    dt1 = dt1 || `${y}-${m}-01T00:00:00+08:00`;
    dt2 = dt2 || `${y}-${m}-${lastDay}T23:59:59+08:00`;
  } else {
    if (!/T\d{2}:\d{2}/.test(dt1)) dt1 = `${String(dt1).trim()}T00:00:00+08:00`;
    if (!/T\d{2}:\d{2}/.test(dt2)) dt2 = `${String(dt2).trim()}T23:59:59+08:00`;
  }
  const body = {
    ixAcc: params.ixAcc != null ? Number(params.ixAcc) : 4242,
    showZero: params.showZero !== false,
    group_by_branch: params.group_by_branch === true,
    dt1: String(dt1),
    dt2: String(dt2),
    acc_others: Array.isArray(params.acc_others) ? params.acc_others : [],
  };
  return request(url, {
    method: "POST",
    headers: authHeaders(token),
    body,
  });
}

/**
 * @param {object} params - Same as getGeneralLedgerReport (ixAcc, showZero, group_by_branch, dt1, dt2, acc_others)
 * @param {string} [token] - authToken
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function getGeneralLedgerGraph(params = {}, token) {
  const url = buildUrl(reports.glGraph);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth(), 0).getDate();
  let dt1 = params.dt1;
  let dt2 = params.dt2;
  if (!dt1 || !dt2) {
    dt1 = dt1 || `${y}-${m}-01T00:00:00+08:00`;
    dt2 = dt2 || `${y}-${m}-${lastDay}T23:59:59+08:00`;
  } else {
    if (!/T\d{2}:\d{2}/.test(dt1)) dt1 = `${String(dt1).trim()}T00:00:00+08:00`;
    if (!/T\d{2}:\d{2}/.test(dt2)) dt2 = `${String(dt2).trim()}T23:59:59+08:00`;
  }
  const body = {
    ixAcc: params.ixAcc != null ? Number(params.ixAcc) : 4242,
    showZero: params.showZero !== false,
    group_by_branch: params.group_by_branch === true,
    dt1: String(dt1),
    dt2: String(dt2),
    acc_others: Array.isArray(params.acc_others) ? params.acc_others : [],
  };
  return request(url, {
    method: "POST",
    headers: authHeaders(token),
    body,
  });
}

const reportsService = {
  getGeneralLedgerReport,
  getGeneralLedgerGraph,
};
export default reportsService;
