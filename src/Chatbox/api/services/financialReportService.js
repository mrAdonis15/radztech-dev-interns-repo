import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";
import { getBizToken } from "../selectedBiz.js";

const { reports, library } = endpoints;

function getHeaders() {
  const token = getBizToken();
  const h = { "Content-Type": "application/json" };
  if (token) h["x-access-tokens"] = token;
  return h;
}

const MONTH_NAMES_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_NAME_TO_NUM = { january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12 };
const BRANCH_NAME_TO_IXBRCH = { alicia: 3847, allacapan: 3848, bagabag: 28580, ballesteros: 3859, bambang: 3860, jones: 3862, lasam: 3863, "main office": 3864, "main office - sales": 3865, pasuquin: 3867, quezon: 3868, ramon: 3869, "san guillermo": 3870, "san mariano": 3873, "sanchez mira": 3875, solano: 3876, "sta. marcela": 3877, "sta marcela": 3877, tabuk: 3879, "tabuk 2": 66129, testing: 65697, tuao: 3880, tumauini: 3881 };

/** Parse month (1-12) and year from user message. */
export function parsePeriodFromMessage(message) {
  const out = {};
  if (!message || typeof message !== "string") return out;
  const lower = message.trim().toLowerCase();
  const yearMatch = lower.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) out.year = parseInt(yearMatch[1], 10);
  for (const [name, num] of Object.entries(MONTH_NAME_TO_NUM)) {
    if (lower.includes(name)) { out.month = num; break; }
  }
  return out;
}

/** Parse branch id from message; uses branchList from fetchBranches() or fallback map. Returns { ixBrch? }. */
export function parseBranchFromMessage(message, branchList) {
  const out = {};
  if (!message || typeof message !== "string") return out;
  const lower = message.trim().toLowerCase();
  const items = branchList && Array.isArray(branchList.items) ? branchList.items : [];
  const numMatch = lower.match(/\bbranch\s*(\d+)\b/i);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (Number.isFinite(num) && num >= 0) {
      const byId = items.find((b) => Number(b.ixBrch) === num);
      out.ixBrch = byId ? Number(byId.ixBrch) : num;
      return out;
    }
  }
  for (const b of items) {
    const name = (b.sBrch || "").trim().toLowerCase();
    if (!name) continue;
    const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(lower) || lower.includes(name)) { out.ixBrch = Number(b.ixBrch); return out; }
  }
  for (const [key, id] of Object.entries(BRANCH_NAME_TO_IXBRCH)) {
    if (lower.includes(key)) { out.ixBrch = id; return out; }
  }
  return out;
}

/** Fetch branches for selected business. Returns { items } or { items, error }. */
export async function fetchBranches() {
  try {
    const { status, data, text } = await request(buildUrl(library.branches), { method: "GET", headers: getHeaders() });
    if (status >= 200 && status < 300) {
      const payload = data != null ? data : (text && text.trim() ? JSON.parse(text) : null);
      const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.data?.items) ? payload.data.items : [];
      return { items };
    }
    return { items: [], error: `Request failed (${status})` };
  } catch (err) {
    return { items: [], error: err?.message || String(err) };
  }
}

/** Build dt1, dt2, label for month/year or as-of date. */
function getMonthRange(opts = {}) {
  const now = new Date();
  let year = opts.year != null ? Number(opts.year) : now.getFullYear();
  let month = opts.month != null && opts.month >= 1 && opts.month <= 12 ? opts.month : now.getMonth() + 1;
  if (opts.usePreviousMonth === true && opts.month == null) {
    month = now.getMonth();
    if (month === 0) { month = 12; year -= 1; }
  }
  const pad = (n) => String(n).padStart(2, "0");
  let first, last, label;
  if (opts.bAsOf === true && opts.asOfDate != null) {
    const d = typeof opts.asOfDate === "string" ? new Date(opts.asOfDate) : opts.asOfDate;
    if (!isNaN(d.getTime())) {
      last = d;
      first = new Date(d.getFullYear(), d.getMonth(), 1);
      label = `For the month ended ${MONTH_NAMES_FULL[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
    }
  }
  if (!last) {
    first = new Date(year, month - 1, 1);
    last = new Date(year, month, 0);
    label = `For the month ended ${MONTH_NAMES_FULL[month - 1]} ${last.getDate()}, ${year}`;
  }
  return {
    dt1: `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}T00:00:00+08:00`,
    dt2: `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}T23:59:59+08:00`,
    label,
  };
}

/** Fetch Trial Balance from api/reports/fs/tb. Sends ixBrch in body and query when > 0. */
export async function fetchTrialBalance(opts = {}) {
  const url = buildUrl(reports.fsTrialBalance);
  const { dt1, dt2, label } = getMonthRange(opts);
  const ixBrch = opts.ixBrch != null ? Number(opts.ixBrch) : 0;
  const body = { ixEType: opts.ixEType != null ? Number(opts.ixEType) : 0, ixFSLayout: 0, dt1, dt2, textValue: label, sDate: label, showHidden: true, showParams: true, ignore_items_not_in_layout: false, ixBrch, bAsOf: opts.bAsOf === true };
  const requestUrl = ixBrch > 0 ? `${url}${url.includes("?") ? "&" : "?"}ixBrch=${encodeURIComponent(ixBrch)}` : url;
  try {
    const { status, data, text } = await request(requestUrl, { method: "POST", headers: getHeaders(), body });
    if (status >= 200 && status < 300) {
      const payload = data != null ? data : (text && text.trim() ? JSON.parse(text) : null);
      return { data: payload };
    }
    return { error: `Request failed (${status}): ${(data?.message || text || "").slice(0, 200)}` };
  } catch (err) {
    return { error: err?.message || String(err) };
  }
}

function extractReportItems(obj) {
  if (obj == null || typeof obj !== "object") return [];
  if (Array.isArray(obj)) return obj;
  const arr = obj.rep ?? obj.items ?? obj.rows ?? obj.lines ?? obj.data;
  return Array.isArray(arr) ? arr : [];
}

function formatAmount(n) {
  if (n == null || typeof n !== "number") return "";
  const s = Number.isFinite(n) ? n.toFixed(2) : String(n);
  const [whole, dec] = s.split(".");
  const w = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec != null ? `${w}.${dec}` : w;
}

function formatTrialBalanceResponse(raw) {
  if (raw == null) return "Trial Balance: No data.";
  let rep = raw.rep;
  if (!Array.isArray(rep)) rep = raw.rep?.data ?? raw.rep?.items ?? raw.result?.rep ?? (Array.isArray(raw.result) ? raw.result : null) ?? raw.rows ?? raw.lines ?? raw.items ?? extractReportItems(raw);
  if (!Array.isArray(rep)) rep = [];
  const heading = raw.heading && typeof raw.heading === "object" ? raw.heading : {};
  const total = raw.total && typeof raw.total === "object" ? raw.total : {};
  const biz = heading.biz && typeof heading.biz === "object" ? heading.biz : {};
  const branchName = (heading.sub_title2 ?? "").trim();
  const W = 52, A = 18, sep = "-".repeat(W + A * 2);
  const lines = [];
  lines.push((heading.title ?? "Trial Balance").toUpperCase());
  if (biz.sBiz) lines.push(biz.sBiz);
  if (branchName) lines.push(`Branch: ${branchName}`);
  const addr = [biz.Address1, biz.Address2].filter(Boolean).join(", ");
  if (addr) lines.push(`Business address: ${addr}`);
  if (heading.sub_title1) lines.push(heading.sub_title1);
  lines.push("");
  if (rep.length === 0) return lines.join("\n").trim() || "Trial Balance: No rows returned.";
  lines.push("Account".padEnd(W) + "Debit".padStart(A) + "Credit".padStart(A));
  lines.push(sep);
  let afterFirstSection = false, totalRowEmitted = false, differenceEmitted = false;
  rep.forEach((row) => {
    if (typeof row !== "object" || row === null) return;
    if (row.spacer === true) { lines.push(""); return; }
    const label = String(row.sTitle ?? row.title ?? row.name ?? row.accountName ?? row.text ?? "").trim();
    const isSectionHeader = !!label && ((row.ixAccType === 0 && row.ixAcc === 0 && !row.bold_title && (row.amt2 == null || row.amt2 === 0) && (row.amt3 == null || row.amt3 === 0)) || /^(Assets|Liabilities|Equity|Revenues|Expenses|Other Income|Other Expenses)$/i.test(label));
    const isTotalRow = row.bold_title === true && label && /^TOTAL\s*:?\s*$/i.test(label);
    const isDifferenceRow = /^Difference\s*:?\s*$/i.test(label);
    if (isTotalRow) {
      totalRowEmitted = true;
      const d = row.amt2 ?? row.tDr, c = row.amt3 ?? row.tCr;
      const ds = d != null && (d !== 0 || row.bold_amt2) ? formatAmount(d) : "", cs = c != null && (c !== 0 || row.bold_amt3) ? formatAmount(c) : "";
      lines.push(sep);
      lines.push((label || "Total").padEnd(W) + ds.padStart(A) + cs.padStart(A));
      return;
    }
    if (isDifferenceRow) {
      differenceEmitted = true;
      const d = row.amt2, c = row.amt3 ?? total.diff;
      const ds = d != null && d !== 0 ? formatAmount(d) : "", cs = c != null && c !== 0 ? formatAmount(c) : "";
      lines.push(sep);
      lines.push((label || "Difference").padEnd(W) + ds.padStart(A) + cs.padStart(A));
      return;
    }
    if (isSectionHeader && !isTotalRow) {
      if (afterFirstSection) lines.push("");
      lines.push(label.padEnd(W) + "".padStart(A) + "".padStart(A));
      afterFirstSection = true;
      return;
    }
    const d = row.amt2 ?? row.amt1 ?? row.tDr, c = row.amt3 ?? row.tCr;
    const ds = d != null && d !== 0 ? formatAmount(d) : "", cs = c != null && c !== 0 ? formatAmount(c) : "";
    const name = (label || "(No name)").length > W ? (label || "(No name)").slice(0, W - 2) + ".." : (label || "(No name)");
    lines.push(name.padEnd(W) + ds.padStart(A) + cs.padStart(A));
  });
  if (!totalRowEmitted && (total.tDr != null || total.tCr != null)) {
    lines.push(sep);
    lines.push("Total".padEnd(W) + (total.tDr != null ? formatAmount(total.tDr) : "").padStart(A) + (total.tCr != null ? formatAmount(total.tCr) : "").padStart(A));
  }
  if (!differenceEmitted && total.diff != null && total.diff !== 0) {
    lines.push(sep);
    lines.push("Difference:".padEnd(W) + "".padStart(A) + formatAmount(total.diff).padStart(A));
  }
  return lines.join("\n").trim();
}

function formatReportItemsToText(items, reportName) {
  let text = `${reportName}:\n\n`;
  (items || []).forEach((row, i) => {
    if (typeof row === "object" && row !== null) {
      const parts = Object.entries(row).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}: ${v}`);
      if (parts.length) text += `${i + 1}. ${parts.join(", ")}\n`;
    } else text += `${i + 1}. ${row}\n`;
  });
  return text.trim();
}

export function formatFinancialReportAsText(reportName, raw) {
  if (raw == null) return `${reportName}: No data.`;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t.startsWith("{") && t.endsWith("}")) { try { raw = JSON.parse(t); } catch (_) { return `${reportName}: Invalid data.`; } }
    else return t ? `${reportName}:\n\n${t}` : `${reportName}: No data.`;
  }
  const items = extractReportItems(raw);
  if (Array.isArray(items) && items.length > 0) return formatReportItemsToText(items, reportName);
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const nested = extractReportItems(raw.data ?? raw);
    if (Array.isArray(nested) && nested.length > 0) return formatReportItemsToText(nested, reportName);
    let text = `${reportName}:\n\n`;
    Object.entries(raw).forEach(([k, v]) => { if (k !== "items" && k !== "data" && k !== "rows" && k !== "lines") text += `${k}: ${JSON.stringify(v)}\n`; });
    return text.trim();
  }
  return (typeof raw === "string" ? raw : JSON.stringify(raw)).trim() || `${reportName}: No rows returned.`;
}

function normalizeTrialBalancePayload(data) {
  if (data == null) return null;
  let obj = data;
  if (typeof obj === "string") {
    const t = obj.trim();
    if (!t.startsWith("{") || !t.endsWith("}")) return null;
    try { obj = JSON.parse(t); } catch (_) { return null; }
  }
  if (typeof obj !== "object" || obj === null) return null;
  if (obj.rep != null || Array.isArray(obj.rep)) return obj;
  if (obj.data != null && typeof obj.data === "object") obj = obj.data;
  if (obj.result != null && typeof obj.result === "object") obj = obj.result;
  return (obj.rep != null || Array.isArray(obj.rep) || (typeof obj === "object" && obj !== null)) ? obj : null;
}

/** Trial balance for chat; passes ixBrch (0 = all branches). */
export async function getTrialBalanceForChat(opts = {}) {
  const hasPeriod = opts.month != null || opts.year != null;
  const fetchOpts = hasPeriod ? { ...opts } : { ...opts, usePreviousMonth: true };
  fetchOpts.ixBrch = opts.ixBrch != null ? Number(opts.ixBrch) : 0;
  if (opts.bAsOf === true) { fetchOpts.bAsOf = true; if (opts.asOfDate != null) fetchOpts.asOfDate = opts.asOfDate; }
  else if (hasPeriod) fetchOpts.bAsOf = true;
  if (opts.ixEType != null) fetchOpts.ixEType = opts.ixEType;
  const { data, error } = await fetchTrialBalance(fetchOpts);
  if (error) return error;
  const payload = normalizeTrialBalancePayload(data);
  return payload ? formatTrialBalanceResponse(payload) : "Trial Balance: No data.";
}

/** Trial balance only; resolves branch by name or ixBrch, fetches branch list when needed. */
export async function getAllFinancialStatementReportsForChat(opts = {}) {
  const userMsg = opts.userMessage || "";
  const period = opts.month != null || opts.year != null ? { month: opts.month, year: opts.year } : parsePeriodFromMessage(userMsg);
  let branchList = opts.branches && Array.isArray(opts.branches.items) ? opts.branches : null;
  if (!branchList) { const res = await fetchBranches(); if (res.items && res.items.length) branchList = { items: res.items }; }
  const branch = parseBranchFromMessage(userMsg, branchList);
  const chatOpts = { ...period, userMessage: userMsg };
  if (opts.ixBrch != null) chatOpts.ixBrch = Number(opts.ixBrch);
  else if (branch.ixBrch != null) chatOpts.ixBrch = Number(branch.ixBrch);
  if (opts.bAsOf === true) { chatOpts.bAsOf = true; if (opts.asOfDate != null) chatOpts.asOfDate = opts.asOfDate; }
  const result = await getTrialBalanceForChat(chatOpts);
  const branchName = chatOpts.ixBrch != null && branchList?.items ? branchList.items.find((b) => Number(b.ixBrch) === Number(chatOpts.ixBrch))?.sBrch : null;
  const noData = result === "Trial Balance: No data." || result.startsWith("Trial Balance: No rows");
  if (branchName && noData) return `Trial Balance for Branch "${branchName}": No transactions or accounts were returned for the selected period. The report was requested for this branch (ixBrch: ${chatOpts.ixBrch}).`;
  if (noData) return `Trial Balance: No data for the selected period.`;
  return result;
}

const financialReportService = {
  fetchTrialBalance,
  fetchBranches,
  getTrialBalanceForChat,
  getAllFinancialStatementReportsForChat,
  formatFinancialReportAsText,
  parsePeriodFromMessage,
  parseBranchFromMessage,
};
export default financialReportService;
  