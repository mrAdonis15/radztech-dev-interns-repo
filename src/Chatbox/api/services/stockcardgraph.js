/**
 * Stock Card & General Ledger graph module.
 * Single source for building and graphical design of:
 * - Stock card: IN / OUT / Running Balance (blue / red / teal), monthly aggregation.
 * - General Ledger: Debit / Credit / Running Balance (blue bars up, red bars down, green line), "YEAR YYYY" title, monthly aggregation.
 */
const IN_COLOR = "rgb(54, 162, 235)";
const OUT_COLOR = "rgb(255, 99, 132)";
const RUNBAL_COLOR = "rgb(75, 192, 192)";
const GL_RUNBAL_COLOR = "rgb(34, 197, 94)";
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

// —— Detection (public) ——

export function isRawChartJsonText(text) {
  if (typeof text !== "string" || !text.trim()) return false;
  const t = text.trim();
  if (t[0] !== "{" || t[t.length - 1] !== "}") return false;
  return /\b"chart"\s*:/.test(t) || /\b"series"\s*:/.test(t) || /\b"datasets"\s*:/.test(t)
    || (/\b"data"\s*:/.test(t) && (/\b"labels"\s*:/.test(t) || /\b"items"\s*:/.test(t)))
    || /\b"graph"\s*:/.test(t) || (/\b"config"\s*:/.test(t) && (/\b"datasets"\b/.test(t) || /\b"labels"\b/.test(t)));
}

export function isLikelyChartData(payload) {
  if (!payload || typeof payload !== "object" || payload.status === "error") return false;
  // GL graph can legitimately return an empty rep (no transactions) but still has beg/end amounts.
  // We still want to render a flat Running Balance chart in that case.
  if (
    payload.glChart &&
    (payload.begAmt != null || payload.endAmt != null) &&
    Array.isArray(payload.rep)
  ) {
    return true;
  }
  if (Array.isArray(payload.rep) && payload.rep.length > 0) {
    const first = payload.rep[0];
    const hasDebit = first.Dr != null || first.dr != null || first.amountDr != null || first.amount_dr != null || first.debit != null || first.Debit != null;
    const hasCredit = first.Cr != null || first.cr != null || first.amountCr != null || first.amount_cr != null || first.credit != null || first.Credit != null;
    const hasBal = first.runBal != null || first.runBalance != null || first.balance != null || first.Balance != null || first.runningBalance != null;
    const hasDate = first.jDate != null || first.date != null || first.Date != null || first.transDate != null || first.postDate != null || first.dt != null;
    if (hasDate && (hasDebit || hasCredit || hasBal)) return true;
  }
  if (payload.chart?.series?.length && payload.chart?.xAxis?.categories) return true;
  if (payload.config?.data?.labels && payload.config?.data?.datasets?.length) return true;
  if (Array.isArray(payload.data) && payload.config) return true;
  if (Array.isArray(payload.items)) return true;
  if (Array.isArray(payload.series) && payload.series.length > 0 && (payload.labels?.length || payload.xAxis?.categories?.length)) return true;
  if (Array.isArray(payload.datasets) && payload.datasets.length > 0 && Array.isArray(payload.labels)) return true;
  return false;
}

// —— Period helpers ——

function getThursdayOfIsoWeek(year, week) {
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay();
  const monday1 = new Date(jan4);
  monday1.setDate(4 - (dow === 0 ? 6 : dow - 1));
  const monday = new Date(monday1);
  monday.setDate(monday1.getDate() + (week - 1) * 7);
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  return thursday;
}

function getMonthFromPeriod(p) {
  const s = String(p ?? "").trim();
  if (s.length >= 7 && /^\d{4}-\d{2}/.test(s)) {
    const m = parseInt(s.slice(5, 7), 10);
    return m >= 1 && m <= 12 ? m : null;
  }
  const w = s.match(/^(\d{4})-W?(\d{1,2})$/i);
  if (w) {
    const week = parseInt(w[2], 10) || 1;
    if (week < 1 || week > 53) return null;
    const month = getThursdayOfIsoWeek(parseInt(w[1], 10), week).getMonth() + 1;
    return month >= 1 && month <= 12 ? month : null;
  }
  return null;
}

function getYearFromPeriod(p) {
  const s = String(p ?? "").trim();
  if (s.length < 4 || !/^\d{4}/.test(s)) return null;
  const y = parseInt(s.slice(0, 4), 10);
  const w = s.match(/^\d{4}-W?(\d{1,2})$/i);
  return w ? getThursdayOfIsoWeek(y, parseInt(w[1], 10) || 1).getFullYear() : (Number.isFinite(y) ? y : null);
}

function formatLabel(val) {
  if (val == null) return "Period";
  const s = String(val);
  if (s.length === 7 && /^\d{4}-\d{2}$/.test(s)) {
    const [y, m] = s.split("-");
    return `${MONTHS[parseInt(m, 10) - 1] || m} ${y}`;
  }
  return s;
}

function yearFromLabels(labels) {
  const y = String(labels[0] || "").split("-")[0];
  return Number.isFinite(parseInt(y, 10)) ? parseInt(y, 10) : new Date().getFullYear();
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// —— GL rep row field access (backend may use different names) ——
function getGLDebit(r) {
  if (r == null) return 0;
  const v = r.Dr ?? r.dr ?? r.amountDr ?? r.amount_dr ?? r.debit ?? r.Debit;
  return num(v);
}
function getGLCredit(r) {
  if (r == null) return 0;
  const v = r.Cr ?? r.cr ?? r.amountCr ?? r.amount_cr ?? r.credit ?? r.Credit;
  return num(v);
}
function getGLBalance(r) {
  if (r == null) return 0;
  const v = r.runBal ?? r.runBalance ?? r.balance ?? r.Balance ?? r.runningBalance;
  return num(v);
}
/** Parse date from row; return { year, month } or null. */
function getGLDateParts(r) {
  if (r == null) return null;
  let d = r.jDate ?? r.date ?? r.Date ?? r.transDate ?? r.postDate ?? r.dt;
  if (d == null) return null;
  if (typeof d === "number") d = new Date(d);
  if (d instanceof Date) {
    if (Number.isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
  const s = String(d).trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{1,2})/);
  if (iso) return { year: parseInt(iso[1], 10), month: parseInt(iso[2], 10) || 1 };
  const slash = s.match(/(\d{4})[\/\-](\d{1,2})/);
  if (slash) return { year: parseInt(slash[1], 10), month: parseInt(slash[2], 10) || 1 };
  return null;
}

// —— Item field access (supports multiple API names, including GL summary tDr/tCr) ——
function getIn(i) { return num(i.tIN ?? i.in ?? i.In ?? i.tDr ?? i.Dr ?? i.debit ?? i.Debit); }
function getOut(i) { return Math.abs(num(i.tOUT ?? i.out ?? i.Out ?? i.tCr ?? i.Cr ?? i.credit ?? i.Credit)); }
function getBal(i) { return num(i.runBal ?? i.balance ?? i.Balance ?? i.runBalance); }
function getPeriod(i) { return i.YrWk ?? i.YrMo ?? i.period; }

// —— Aggregation ——
const ITEMS_AGGREGATE_MAX = 3000;

function aggregateToMonthly(items, year) {
  const toUse = items.length > ITEMS_AGGREGATE_MAX ? items.slice(-ITEMS_AGGREGATE_MAX) : items;
  const sorted = [...toUse].sort((a, b) => String(getPeriod(a)).localeCompare(String(getPeriod(b)), undefined, { numeric: true }));
  const labels = MONTHS.map((m) => `${m} ${year}`);
  const inData = new Array(12).fill(0);
  const outData = new Array(12).fill(0);
  const runBalData = new Array(12).fill(0);
  const lastBal = {};
  for (const i of sorted) {
    const m = getMonthFromPeriod(getPeriod(i));
    if (m == null || (getYearFromPeriod(getPeriod(i)) != null && getYearFromPeriod(getPeriod(i)) !== year)) continue;
    const idx = m - 1;
    inData[idx] += getIn(i);
    outData[idx] += getOut(i);
    lastBal[m] = getBal(i);
  }
  let carry = 0;
  for (let m = 1; m <= 12; m++) {
    if (lastBal[m] != null) carry = lastBal[m];
    runBalData[m - 1] = carry;
  }
  return { labels, inData, outData, runBalData };
}

function emptyMonthly(year) {
  return {
    labels: MONTHS.map((m) => `${m} ${year}`),
    inData: new Array(12).fill(0),
    outData: new Array(12).fill(0),
    runBalData: new Array(12).fill(0),
  };
}

// —— Chart config builder ——
function makeStockCardChart(year, title, inData, outData, runBalData) {
  return {
    chartType: "mixed",
    title: title || `YEAR ${year}`,
    labels: MONTHS.map((m) => `${m} ${year}`),
    datasets: [
      { type: "bar", label: "IN", data: inData, backgroundColor: IN_COLOR, borderColor: IN_COLOR, borderWidth: 0, order: 1 },
      { type: "bar", label: "OUT", data: outData, backgroundColor: OUT_COLOR, borderColor: OUT_COLOR, borderWidth: 0, order: 2 },
      { type: "line", label: "Running Balance", data: runBalData, borderColor: RUNBAL_COLOR, backgroundColor: "rgba(75, 192, 192, 0.1)", fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: RUNBAL_COLOR, pointBorderColor: "#fff", pointBorderWidth: 1, order: 3 },
    ],
  };
}

/** General Ledger chart design: Debit (blue, up), Credit (red, down), Running Balance (green line). */
function makeGLChart(year, title, debitData, creditData, runBalData) {
  const creditNegated = creditData.map((v) => -num(v));
  return {
    chartType: "mixed",
    title: title || `YEAR ${year}`,
    labels: MONTHS.map((m) => `${m} ${year}`),
    datasets: [
      { type: "bar", label: "Debit", data: debitData, backgroundColor: IN_COLOR, borderColor: IN_COLOR, borderWidth: 0, order: 1 },
      { type: "bar", label: "Credit", data: creditNegated, backgroundColor: OUT_COLOR, borderColor: OUT_COLOR, borderWidth: 0, order: 2 },
      { type: "line", label: "Running Balance", data: runBalData, borderColor: GL_RUNBAL_COLOR, backgroundColor: "rgba(34, 197, 94, 0.1)", fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: GL_RUNBAL_COLOR, pointBorderColor: "#fff", pointBorderWidth: 1, order: 3 },
    ],
  };
}

function resolveYear(apiData, validPeriods, currentYear) {
  if (apiData.year != null) return apiData.year;
  if (apiData.dt1 != null) {
    const y = parseInt(String(apiData.dt1).slice(0, 4), 10);
    if (Number.isFinite(y)) return y;
  }
  if (validPeriods?.length) return yearFromLabels(validPeriods);
  return currentYear;
}

// —— Format handlers ——

function fromItemsFormat(apiData) {
  const items = apiData.items;
  if (!Array.isArray(items)) return null;
  const valid = items.filter((i) => i && (getPeriod(i) != null || getIn(i) !== 0 || getOut(i) !== 0 || getBal(i) !== 0));
  const year = resolveYear(apiData, valid.map((i) => getPeriod(i)), new Date().getFullYear());
  const agg = valid.length ? aggregateToMonthly(valid, year) : emptyMonthly(year);
  return makeStockCardChart(year, apiData.title, agg.inData, agg.outData, agg.runBalData);
}

/** Same as items format but GL style: Debit (blue up), Credit (red down), Running Balance (green). Use when apiData.glChart is true. */
function fromItemsFormatGL(apiData) {
  const items = apiData.items;
  if (!Array.isArray(items)) return null;
  const valid = items.filter((i) => i && (getPeriod(i) != null || getIn(i) !== 0 || getOut(i) !== 0 || getBal(i) !== 0));
  const year = resolveYear(apiData, valid.map((i) => getPeriod(i)), new Date().getFullYear());
  const agg = valid.length ? aggregateToMonthly(valid, year) : emptyMonthly(year);
  return makeGLChart(year, `YEAR ${year}`, agg.inData, agg.outData, agg.runBalData);
}

function fromDataConfigFormat(apiData) {
  const data = apiData.data;
  const config = apiData.config || {};
  if (!Array.isArray(data)) return null;
  const year = resolveYear({ ...apiData, year: config.year }, data.map((r) => r.period ?? r.YrWk ?? r.YrMo), new Date().getFullYear());
  const items = data.map((row) => ({
    period: row.period ?? row.YrWk ?? row.YrMo,
    tIN: row.in ?? row.tIN ?? row.In,
    tOUT: row.out ?? row.tOUT ?? row.Out,
    runBal: row.balance ?? row.runBal ?? row.Balance ?? row.runBalance,
  }));
  const agg = data.length ? aggregateToMonthly(items, year) : emptyMonthly(year);
  return makeStockCardChart(year, config.title, agg.inData, agg.outData, agg.runBalData);
}

function seriesToDataset(s, i) {
  const isLine = /running balance/i.test(s.name || "");
  const isIn = /stock in|in\b/i.test(s.name || "");
  const order = isLine ? 3 : isIn ? 1 : 2;
  return {
    type: isLine ? "line" : "bar",
    label: s.name || `Series ${i + 1}`,
    data: Array.isArray(s.data) ? s.data.map((v) => num(v)) : [],
    order,
    backgroundColor: isLine ? "rgba(75, 192, 192, 0.1)" : isIn ? IN_COLOR : OUT_COLOR,
    borderColor: isLine ? RUNBAL_COLOR : isIn ? IN_COLOR : OUT_COLOR,
    borderWidth: 0,
    fill: isLine,
    tension: isLine ? 0.3 : 0,
    pointRadius: isLine ? 4 : undefined,
    pointBackgroundColor: isLine ? RUNBAL_COLOR : undefined,
    pointBorderColor: isLine ? "#fff" : undefined,
    pointBorderWidth: isLine ? 1 : undefined,
  };
}

function fromChartSeriesFormat(apiData) {
  const c = apiData.chart;
  if (!c?.series?.length || !c?.xAxis?.categories?.length) return null;
  const labels = c.xAxis.categories.map(formatLabel);
  const yearFromReq = apiData.year ?? (apiData.dt1 != null ? parseInt(String(apiData.dt1).slice(0, 4), 10) : null);
  const title = (Number.isFinite(yearFromReq) ? `YEAR ${yearFromReq}` : null) || c.title || "Stock Card Graph";
  return { chartType: "mixed", title, labels, datasets: c.series.map(seriesToDataset) };
}

function fromConfigDataFormat(apiData) {
  const config = apiData.config;
  if (!config?.data?.labels || !config?.data?.datasets?.length) return null;
  const labels = config.data.labels.map(formatLabel);
  const datasets = config.data.datasets.map((ds, i) => ({
    ...ds,
    type: ds.type || (/running balance/i.test(ds.label || "") ? "line" : "bar"),
    order: ds.order ?? (/running balance/i.test(ds.label || "") ? 3 : i + 1),
    pointRadius: ds.pointRadius ?? 4,
  }));
  const yearFromReq = apiData.year ?? (apiData.dt1 != null ? parseInt(String(apiData.dt1).slice(0, 4), 10) : null);
  const title = (Number.isFinite(yearFromReq) ? `YEAR ${yearFromReq}` : null) || apiData.title || config.options?.plugins?.title?.text || "Stock Card Graph";
  return { chartType: "mixed", title, labels, datasets };
}

function fromGenericFormat(apiData) {
  const labels = (apiData.labels || apiData.xAxis?.categories || []).map(formatLabel);
  const series = apiData.series || apiData.datasets;
  if (!Array.isArray(series) || !series.length) return null;
  const datasets = series.map((s, i) => {
    const label = s.name ?? s.label ?? `Series ${i + 1}`;
    const data = Array.isArray(s.data) ? s.data.map((v) => num(v)) : [];
    const isLine = s.type === "line" || /running balance|balance|trend/i.test(label);
    const colors = [IN_COLOR, OUT_COLOR, RUNBAL_COLOR];
    return {
      type: isLine ? "line" : "bar",
      label,
      data,
      order: i + 1,
      backgroundColor: isLine ? "rgba(75, 192, 192, 0.2)" : colors[i % 3],
      borderColor: isLine ? RUNBAL_COLOR : colors[i % 3],
      borderWidth: 0,
      fill: isLine,
      tension: isLine ? 0.3 : 0,
      pointRadius: isLine ? 4 : undefined,
    };
  });
  return { chartType: "mixed", title: apiData.title || apiData.chart?.title || "Chart", labels, datasets };
}

/** General Ledger rep format: array of { Dr/dr, Cr/cr, runBal/runBalance, jDate }. Aggregates to monthly, Debit up / Credit down / Running Balance green. */
/** Cap rep size to avoid heavy sort/iteration and server load; use last N rows to keep recent data. */
const GL_REP_MAX_ROWS = 4000;

function fromGLRepFormat(apiData) {
  const rep = apiData.rep;
  if (!Array.isArray(rep) || !rep.length) return null;
  const repToUse = rep.length > GL_REP_MAX_ROWS ? rep.slice(-GL_REP_MAX_ROWS) : rep;
  const dateParts = repToUse.map((r) => getGLDateParts(r)).filter(Boolean);
  const year = resolveYear(apiData, dateParts.length ? dateParts.map((p) => `${p.year}-${String(p.month).padStart(2, "0")}`) : [], new Date().getFullYear());
  const debitByMonth = new Array(12).fill(0);
  const creditByMonth = new Array(12).fill(0);
  const lastBalByMonth = {};
  const getSortKey = (r) => {
    let d = r?.jDate ?? r?.date ?? r?.Date ?? r?.transDate ?? r?.postDate ?? r?.dt;
    if (d == null) return "";
    if (typeof d === "number") d = new Date(d).toISOString();
    else if (d instanceof Date) d = d.toISOString();
    const s = String(d).trim();
    return s.slice(0, 19) || s.slice(0, 10) || s;
  };
  const sortedIndices = repToUse.map((_, i) => i);
  sortedIndices.sort((a, b) => getSortKey(repToUse[a]).localeCompare(getSortKey(repToUse[b]), undefined, { numeric: true }));
  for (const i of sortedIndices) {
    const r = repToUse[i];
    const parts = getGLDateParts(r);
    if (!parts || parts.month < 1 || parts.month > 12 || parts.year !== year) continue;
    const idx = parts.month - 1;
    debitByMonth[idx] += getGLDebit(r);
    creditByMonth[idx] += getGLCredit(r);
    lastBalByMonth[parts.month] = getGLBalance(r);
  }
  const runBalData = new Array(12).fill(0);
  let carry = 0;
  for (let m = 1; m <= 12; m++) {
    if (lastBalByMonth[m] != null) carry = lastBalByMonth[m];
    runBalData[m - 1] = carry;
  }
  return makeGLChart(year, `YEAR ${year}`, debitByMonth, creditByMonth, runBalData);
}

function fromGLEmptyRepFormat(apiData) {
  // For GL graph calls, backend may return rep: [] but still includes begAmt/endAmt.
  // Render a flat running balance line (with 0 debit/credit bars) so the user still sees a graph.
  const rep = apiData.rep;
  if (!Array.isArray(rep) || rep.length) return null;
  const year = resolveYear(apiData, [], new Date().getFullYear());
  const debitByMonth = new Array(12).fill(0);
  const creditByMonth = new Array(12).fill(0);

  // If API provides period totals (tDr/tCr, periodBalDr/Cr), surface them as bars
  // (even when rep is empty) by putting them into the dt2 month bucket.
  const sdt2 = String(apiData.dt2 ?? "").trim();
  const m2 = sdt2.match(/^\d{4}-(\d{2})/);
  const idx = m2 ? Math.max(0, Math.min(11, parseInt(m2[1], 10) - 1)) : 11;
  const totalDr = num(apiData.tDr ?? apiData.totalDr ?? apiData.periodBalDr ?? apiData.tDrFA);
  const totalCr = num(apiData.tCr ?? apiData.totalCr ?? apiData.periodBalCr ?? apiData.tCrFA);
  if (totalDr !== 0) debitByMonth[idx] = totalDr;
  if (totalCr !== 0) creditByMonth[idx] = totalCr;

  const bal = num(apiData.endAmt ?? apiData.begAmt ?? apiData.periodBal ?? apiData.tBalFA ?? 0);
  const runBalData = new Array(12).fill(bal);
  return makeGLChart(year, `YEAR ${year}`, debitByMonth, creditByMonth, runBalData);
}

function fromAnyChartLike(payload) {
  if (!payload || typeof payload !== "object") return null;
  const c = payload.chart || payload;
  let labels = c.xAxis?.categories ?? payload.labels ?? c.labels ?? [];
  let series = c.series ?? payload.series ?? payload.config?.data?.datasets ?? payload.datasets ?? [];
  if (!Array.isArray(labels)) labels = [];
  if (!Array.isArray(series) && Array.isArray(payload.data) && payload.data.length > 0) {
    const d = payload.data;
    const hasPeriod = d[0] && (d[0].period != null || d[0].YrWk != null);
    labels = hasPeriod ? d.map((r) => getPeriod(r) || r.period || "") : d.map((_, i) => `${i + 1}`);
    series = hasPeriod
      ? [{ name: "IN", data: d.map((r) => getIn(r)) }, { name: "OUT", data: d.map((r) => getOut(r)) }, { name: "Running Balance", data: d.map((r) => getBal(r)) }]
      : [{ name: "Value", data: d.map((v) => num(typeof v === "object" ? v.value ?? v.data : v)) }];
  }
  if (!Array.isArray(series)) series = [];
  if (!labels.length && series[0]?.data?.length) labels = series[0].data.map((_, i) => `${i + 1}`);
  if (!series.length || !labels.length) return null;
  return fromGenericFormat({ ...payload, labels, series });
}

// —— Public API ——

/**
 * Get graph config from any chart-like payload. Call when you need a graph from API data.
 * @param {object} payload - API response or chart-like object
 * @returns {{ chartType: string, title: string, labels: string[], datasets: object[] } | null}
 */
export function getGraphConfig(payload) {
  return normalizeToChartConfig(payload);
}

/**
 * Get graph config from raw JSON text (e.g. message text that might be chart JSON).
 * @param {string} text - JSON string that may represent chart data
 * @returns {{ chartType: string, title: string, labels: string[], datasets: object[] } | null}
 */
export function getGraphConfigFromText(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  if (!isRawChartJsonText(text)) return null;
  try {
    return normalizeToChartConfig(JSON.parse(text.trim()));
  } catch {
    return null;
  }
}

export function normalizeToChartConfig(payload) {
  if (!payload || typeof payload !== "object" || payload.status === "error") return null;
  if (payload.chartType && Array.isArray(payload.labels) && Array.isArray(payload.datasets)) return payload;
  const built = buildStockCardRunningBalanceChart(payload);
  if (built) return built;
  return isLikelyChartData(payload) ? fromAnyChartLike(payload) : null;
}

export function buildStockCardRunningBalanceChart(apiData) {
  if (!apiData) return null;
  if (apiData.chartType && apiData.labels && apiData.datasets) return apiData;
  // Normalize nested .data.rep or .data.items (graph API may return { data: { rep: [...] } })
  const rep = apiData.rep ?? apiData.data?.rep;
  const items = apiData.items ?? apiData.data?.items;
  // GL graph: allow empty rep but with beg/end amounts.
  if (apiData.glChart && Array.isArray(rep) && rep.length === 0 && (apiData.begAmt != null || apiData.endAmt != null)) {
    const builtEmpty = fromGLEmptyRepFormat({ ...apiData, rep });
    if (builtEmpty) return builtEmpty;
  }
  if (Array.isArray(rep) && rep.length > 0) {
    const first = rep[0];
    const hasDebit = first.Dr != null || first.dr != null || first.amountDr != null || first.amount_dr != null || first.debit != null || first.Debit != null;
    const hasCredit = first.Cr != null || first.cr != null || first.amountCr != null || first.amount_cr != null || first.credit != null || first.Credit != null;
    const hasBal = first.runBal != null || first.runBalance != null || first.balance != null || first.Balance != null || first.runningBalance != null;
    const hasDate = first.jDate != null || first.date != null || first.Date != null || first.transDate != null || first.postDate != null || first.dt != null;
    if (hasDate && (hasDebit || hasCredit || hasBal)) return fromGLRepFormat({ ...apiData, rep });
    // GL weekly/monthly summary format (YrWk/YrMo, tDr/tCr, runBal) without explicit dates:
    // map rep rows into items and build a GL-style chart.
    if (apiData.glChart) {
      const itemsFromRep = rep.map((r) => ({
        ...r,
        tIN: r.tIN ?? r.tDr ?? r.Dr ?? r.debit ?? r.Debit ?? 0,
        tOUT: r.tOUT ?? r.tCr ?? r.Cr ?? r.credit ?? r.Credit ?? 0,
        runBal: r.runBal ?? r.runBalance ?? r.balance ?? r.Balance ?? r.runningBalance ?? 0,
      }));
      const builtFromRep = fromItemsFormatGL({ ...apiData, items: itemsFromRep });
      if (builtFromRep) return builtFromRep;
    }
  }
  if (apiData.glChart && Array.isArray(items)) return fromItemsFormatGL({ ...apiData, items });
  if (Array.isArray(apiData.items)) return fromItemsFormat(apiData);
  if (Array.isArray(items)) return fromItemsFormat({ ...apiData, items });
  if (Array.isArray(apiData.data) && apiData.config) return fromDataConfigFormat(apiData);
  if (apiData.chart?.series?.length) {
    const c = apiData.chart;
    if (!c.xAxis?.categories?.length && c.series?.[0]?.data?.length)
      return fromChartSeriesFormat({ ...apiData, chart: { ...c, xAxis: { categories: c.series[0].data.map((_, i) => `${i + 1}`) } } });
    if (c.xAxis?.categories?.length) return fromChartSeriesFormat(apiData);
  }
  if (apiData.config?.data?.labels && apiData.config?.data?.datasets) return fromConfigDataFormat(apiData);
  if ((apiData.series || apiData.datasets)?.length && (apiData.labels || apiData.xAxis?.categories)) return fromGenericFormat(apiData);
  return null;
}
