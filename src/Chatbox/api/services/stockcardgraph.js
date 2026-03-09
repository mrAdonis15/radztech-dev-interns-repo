
const IN_COLOR = "rgb(54, 162, 235)";
const OUT_COLOR = "rgb(255, 99, 132)";
const RUNBAL_COLOR = "rgb(75, 192, 192)";
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

// —— Item field access (supports multiple API names) ——

function getIn(i) { return num(i.tIN ?? i.in ?? i.In); }
function getOut(i) { return Math.abs(num(i.tOUT ?? i.out ?? i.Out)); }
function getBal(i) { return num(i.runBal ?? i.balance ?? i.Balance ?? i.runBalance); }
function getPeriod(i) { return i.YrWk ?? i.YrMo ?? i.period; }

// —— Aggregation ——

function aggregateToMonthly(items, year) {
  const sorted = [...items].sort((a, b) => String(getPeriod(a)).localeCompare(String(getPeriod(b)), undefined, { numeric: true }));
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

// —— Chart config builder (single place for IN/OUT/RunBal chart) ——

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
  if (Array.isArray(apiData.items)) return fromItemsFormat(apiData);
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
