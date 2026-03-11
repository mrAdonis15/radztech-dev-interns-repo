import axios from "axios";
import { getBizToken } from "../selectedBiz";
import { isLikelyChartData } from "./stockcardgraph.js";

const BASE_URL = "http://localhost:3000/api";

const FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";

const CHART_REPLY_TEXT = "Here is the chart based on your request.";
const GEMINI_REQUEST_TIMEOUT_MS = 180000;
/** Timeout for report/graph API calls. Keep under gateway (e.g. 60s) so we fail fast and retry. */
const REPORT_REQUEST_TIMEOUT_MS = 55000;
const RETRYABLE_STATUSES = [502, 503, 504];
const GATEWAY_TIMEOUT_MSG =
  "The server took too long to respond (504). Please try again or use a smaller date range.";

/** Cap date range to at most maxMonths to reduce server load. Returns [dt1, dt2] as ISO strings. */
function capDateRangeToMonths(dt1, dt2, maxMonths) {
  const d1 = new Date(String(dt1).slice(0, 10));
  const d2 = new Date(String(dt2).slice(0, 10));
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return [dt1, dt2];
  const start = new Date(d2);
  start.setMonth(start.getMonth() - maxMonths);
  if (start <= d1) return [dt1, dt2];
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const newDt1 = `${y}-${m}-01T00:00:00+08:00`;
  const suffix = (String(dt2).match(/T[\d:+-]+/) || ["T23:59:59+08:00"])[0];
  return [newDt1, String(dt2).slice(0, 10) + suffix];
}

function isRetryableError(err) {
  if (RETRYABLE_STATUSES.includes(err.response?.status)) return true;
  const code = err.code || err.message || "";
  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    /timeout|504|gateway/i.test(String(code))
  );
}

function messageFor504(err) {
  if (err.response?.status === 504) return GATEWAY_TIMEOUT_MSG;
  return err.response?.data?.message ?? err.response?.data ?? err.message;
}

/** POST to Gemini AI with long timeout and retry on gateway/timeout errors. */
async function postToGemini(url, data, headers, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.post(url, data, {
        headers,
        timeout: GEMINI_REQUEST_TIMEOUT_MS,
      });
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && isRetryableError(err)) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/** Axios request with long timeout and retry on 502/503/504. Used for report/graph APIs. */
async function axiosWithRetry(method, url, bodyOrParams, headers, maxRetries = 2) {
  const opts = { headers, timeout: REPORT_REQUEST_TIMEOUT_MS };
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (method === "get") {
        return await axios.get(url, { ...opts, params: bodyOrParams });
      }
      return await axios.post(url, bodyOrParams, opts);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && isRetryableError(err)) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function getHeaders() {
  const token = getBizToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-tokens": token,
  };

  return headers;
}

function checkItems(data) {
  if (data.length > 10) {
    return {
      status: "error",
      error: "too many exist",
      data: data.slice(0, 10),
    };
  }
  if (data.length > 1) {
    return {
      status: "success",
      error: "multiple_exist",
      data: data,
    };
  }

  if (data.length === 0) {
    return {
      status: "error",
      error: "not_found",
      text: "Sorry, I couldn't find the item,",
    };
  }
  return {
    status: "success",
    data: data,
  };
}

function normalizeGlArgs(args) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(currentYear, now.getMonth(), 0).getDate();

  let dt1 = args.dt1;
  let dt2 = args.dt2;

  if (!dt1 || !dt2) {
    dt1 = dt1 || `${currentYear}-${currentMonth}-01T00:00:00+08:00`;
    dt2 = dt2 || `${currentYear}-${currentMonth}-${lastDay}T23:59:59+08:00`;
  } else {
    if (!/T\d{2}:\d{2}/.test(dt1)) {
      dt1 = `${String(dt1).replace(/Z$/, "").trim()}T00:00:00+08:00`;
    }
    if (!/T\d{2}:\d{2}/.test(dt2)) {
      dt2 = `${String(dt2).replace(/Z$/, "").trim()}T23:59:59+08:00`;
    }
    [dt1, dt2] = capDateRangeToMonths(dt1, dt2, 6);
  }

  const ixAcc = args.ixAcc != null ? Number(args.ixAcc) : 4242;
  const accOthers = Array.isArray(args.acc_others) ? args.acc_others : [];

  return {
    dt1: String(dt1),
    dt2: String(dt2),
    ixAcc,
    accOthers,
    showZero: args.showZero !== false,
    groupByBranch: args.group_by_branch === true,
  };
}

// TOOLS
const functions = {
  search_prod: async (args) => {
    // console.log(args.q);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/prod`;

      const response = await axios.post(url, args, {
        headers,
      });
      const items = response.data.items || {};

      const products = checkItems(items);

      // console.log(products);

      return products;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  get_prod_bal: async (args) => {
    // console.log(args);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/trans/search/prod/inv-bal`;

      const response = await axios.get(url, {
        headers: headers,
        params: args,
      });

      const bal = response.data.qtyBAL;
      console.log(bal);

      return {
        status: "success",
        data: bal,
      };
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  sc_graph: async (args) => {
    const headers = getHeaders();
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const requestedYear = args.year != null ? parseInt(String(args.year), 10) : null;
      let dt1 = args.dt1;
      let dt2 = args.dt2;
      const userSpecifiedRange = args.dt1 && args.dt2;
      if (requestedYear != null && Number.isFinite(requestedYear)) {
        dt1 = dt1 || `${requestedYear}-01-01T00:00:00+08:00`;
        dt2 = dt2 || `${requestedYear}-12-31T23:59:59+08:00`;
      } else if (!userSpecifiedRange) {
        // Default to last 3 months to reduce server load and stay under gateway timeout
        const end = new Date(now);
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        dt1 = dt1 || `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01T00:00:00+08:00`;
        dt2 = dt2 || `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}T23:59:59+08:00`;
      } else {
        dt1 = dt1 || `${currentYear}-01-01T00:00:00+08:00`;
        dt2 = dt2 || `${currentYear}-12-31T23:59:59+08:00`;
      }
      let ixWH = args.ixWH;
      let ixProd = args.ixProd;

      if (ixWH == null) {
        const whRes = await axios.get(`${BASE_URL}/trans/get/wh`, { headers });
        const whList = Array.isArray(whRes.data) ? whRes.data : [];
        ixWH = whList[0]?.ixWH ?? 4282;
      }

      if (ixProd == null && args.q) {
        const qRaw = String(args.q).trim();
        const codeMatch = qRaw.match(/\s*\(Code:\s*([^)]+)\)\s*$/i);
        const qForSearch = codeMatch ? qRaw.replace(/\s*\(Code:\s*[^)]+\)\s*$/i, "").trim() : qRaw;
        const searchRes = await axios.post(`${BASE_URL}/lib/prod`, { q: qForSearch || qRaw }, { headers });
        const items = searchRes.data?.items;
        const list = Array.isArray(items) ? items : items ? [items] : [];
        let chosen = list[0];
        if (list.length > 1 && codeMatch) {
          const code = codeMatch[1].trim();
          const byCode = list.find((p) => {
            const c = p.ProdCd || p.sCode || p.cProd || p.code || (p.ixProd != null ? String(p.ixProd) : "");
            return c && (c === code || String(p.ixProd) === code);
          });
          if (byCode) chosen = byCode;
        }
        ixProd = chosen?.ixProd;
        if (ixProd == null) {
          return { status: "error", text: "Product not found. Please specify a valid product." };
        }
      }
      if (ixProd == null) {
        return { status: "error", text: "Missing product: pass q (description) or ixProd." };
      }

      // Call only the graph endpoint to reduce server load (skip redundant /reports/inv/sc)
      const graphBody = { ixProd, dt1, dt2, bn: "", ixWH, SN: "", SN2: "" };
      const graphRes = await axiosWithRetry("post", `${BASE_URL}/reports/inv/sc/graph`, graphBody, headers);
      const raw = graphRes.data;
      if (!raw) return { status: "error", text: "No graph data returned." }

      if (Array.isArray(raw.data) && raw.config) {
        const d = raw.data;
        const items = d.map((row) => ({
          YrWk: row.period ?? row.YrWk ?? row.YrMo,
          tIN: row.in ?? row.tIN ?? row.In,
          tOUT: row.out ?? row.tOUT ?? row.Out,
          runBal: row.balance ?? row.runBal ?? row.Balance ?? row.runBalance,
        }));
        const begQty = d.length ? (d[0].balance ?? d[0].runBal ?? d[0].Balance ?? d[0].runBalance ?? 0) : 0;
        const endQty = d.length ? (d[d.length - 1].balance ?? d[d.length - 1].runBal ?? d[d.length - 1].Balance ?? d[d.length - 1].runBalance ?? 0) : 0;
        const year = parseInt(String(dt1).slice(0, 4), 10) || currentYear;
        return { items, begQty, endQty, dt1, dt2, year };
      }
      if (Array.isArray(raw.items)) {
        // Use the year from our request (dt1), not the API's raw.dt1, so the chart shows the user-requested year
        const y = parseInt(String(dt1).slice(0, 4), 10);
        return { ...raw, dt1, dt2, year: Number.isFinite(y) ? y : currentYear };
      }
      if (raw.config?.data?.labels && raw.config?.data?.datasets) {
        const y = parseInt(String(dt1).slice(0, 4), 10);
        return { ...raw, dt1, dt2, year: Number.isFinite(y) ? y : currentYear };
      }
      if (raw.chart?.series?.length && raw.chart?.xAxis?.categories) {
        const y = parseInt(String(dt1).slice(0, 4), 10);
        return { ...raw, dt1, dt2, year: Number.isFinite(y) ? y : currentYear };
      }
      return { status: "error", text: "No graph data returned." };
    } catch (err) {
      return {
        status: "error",
        text: err.response?.status === 504 ? GATEWAY_TIMEOUT_MSG : undefined,
        message: messageFor504(err),
      };
    }
  },
  gl_report: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/reports/gl`;
      const { dt1, dt2, ixAcc, accOthers, showZero, groupByBranch } = normalizeGlArgs(args);
      const body = {
        ixAcc,
        showZero,
        group_by_branch: groupByBranch,
        dt1,
        dt2,
        acc_others: accOthers,
      };
      const response = await axiosWithRetry("post", url, body, headers);
       const gl = response.data;

       const data = {
        begAmt: gl.begAmt,
        tDr: gl.tDr,
        tCr: gl.tCr,
        endAmt: gl.endAmt,
      };

      console.log("gl", data);

      return {
        status: "success",
        data: data,
      };
    } catch (err) {
      return {
        status: "error",
        text: err.response?.status === 504 ? GATEWAY_TIMEOUT_MSG : undefined,
        message: messageFor504(err),
      };
    }
  },
  gl_graph: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/reports/gl/graph`;
      const { dt1, dt2, ixAcc, accOthers, showZero, groupByBranch } = normalizeGlArgs(args);
      const body = {
        ixAcc,
        showZero,
        group_by_branch: groupByBranch,
        dt1,
        dt2,
        acc_others: accOthers,
      };
      const response = await axiosWithRetry("post", url, body, headers);
      const raw = response.data;
      if (!raw) return { status: "error", text: "No graph data returned." };
      return raw;
    } catch (err) {
      return {
        status: "error",
        text: err.response?.status === 504 ? GATEWAY_TIMEOUT_MSG : undefined,
        message: messageFor504(err),
      };
    }
  },
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "search_prod",
        description: "Use this to search for specific products.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The name or category of the product",
            },
          },
          required: ["q"],
        },
      },
      {
        name: "get_prod_bal",
        description:
          "Get the balance of a certain product. Only use this if the user specifically needs the balance of a certain product.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The id of the product",
            },
            ixWH: {
              type: "integer",
              description: "Use 4282 as ixWH",
            },
          },
          required: ["ixProd"],
        },
      },
      {
        name: "sc_graph",
        description:
          "Get stock card graph data (running balance, IN, OUT by period). Use when the user asks to graph/chart/plot stock card or running balance. For q, use the product displayLabel from search_prod. When the user asks for a specific year, pass the year parameter. If no period is given, the chart shows the last 3 months (faster). Prefer shorter date ranges to avoid timeouts.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Product displayLabel (e.g. 'CLICK160 Black (Code: ACB160CBTN-MGB)') or description. Use the displayLabel from the search result when user picked one.",
            },
            ixProd: {
              type: "integer",
              description: "Product id. Use only when q is not available.",
            },
            year: {
              type: "integer",
              description: "Year requested by the user (e.g. 2026). Use when the user says a specific year. The chart will show this year; dt1/dt2 are derived from it if not provided.",
            },
            dt1: { type: "string", description: "Start date (e.g. '2026-01-01T00:00:00+08:00'). Optional; built from year when year is provided." },
            dt2: { type: "string", description: "End date (e.g. '2026-12-31T23:59:59+08:00'). Optional; built from year when year is provided." },
            ixWH: { type: "integer", description: "Warehouse id (default from API). Optional." },
          },
          required: [],
        },
      },
      {
        name: "gl_report",
        description:
          "General Ledger report (table data). Use when the user asks for general ledger report, account summary, or balances in a date range. If the user asks to graph or chart the general ledger, you may use gl_report or gl_graph; both are rendered with the shared stockcardgraph module (Debit/Credit/Running Balance design).",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "Main account index (e.g. 4242). Default 4242 if omitted.",
            },
            showZero: {
              type: "boolean",
              description: "Include zero-balance rows. Default true.",
            },
            group_by_branch: {
              type: "boolean",
              description: "Group report by branch. Default false.",
            },
            dt1: {
              type: "string",
              description: "Start date (e.g. '2024-03-01' or '2024-03-01T00:00:00+08:00'). Defaults to first day of current month.",
            },
            dt2: {
              type: "string",
              description: "End date (e.g. '2024-03-31' or '2024-03-31T23:59:59+08:00'). Defaults to last day of current month.",
            },
            acc_others: {
              type: "array",
              items: {},
              description: "Optional list of other account filters. Default [].",
            },
          },
          required: [],
        },
      },
      {
        name: "gl_graph",
        description:
          "General Ledger graph (Debit, Credit, Running Balance). Use when the user asks to graph or chart the general ledger. Calls /reports/gl/graph. Response is rendered with the shared stockcardgraph module (same graphical design as stock card: Debit blue up, Credit red down, Running Balance green line, YEAR title).",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "Main account index (e.g. 4242). Default 4242 if omitted.",
            },
            showZero: {
              type: "boolean",
              description: "Include zero-balance rows. Default true.",
            },
            group_by_branch: {
              type: "boolean",
              description: "Group by branch. Default false.",
            },
            dt1: {
              type: "string",
              description: "Start date (e.g. '2024-03-01' or '2024-03-01T00:00:00+08:00'). Defaults to first day of current month.",
            },
            dt2: {
              type: "string",
              description: "End date (e.g. '2024-03-31' or '2024-03-31T23:59:59+08:00'). Defaults to last day of current month.",
            },
            acc_others: {
              type: "array",
              items: {},
              description: "Optional list of other account filters. Default [].",
            },
          },
          required: [],
        },
      },
    ],
  },
];

//  MAIN FUNCTION
export async function sendToGemini(userMessage, messageHistory = []) {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-tokens": token,
  };

  const isChart = /graph|chart|plot|visual/i.test(userMessage);

  let finalData = {};
  let lastToolName = null;

  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userMessage,
            },
          ],
        },
      ],
      tools,
    };
    // console.log("payload", payload);
    let response;
    response = await postToGemini(`${BASE_URL}/ai/gemini`, payload, headers);

    // console.log("initial", response);

    while (true) {
      let functionResponses = [];
      const functionCalls =
        response?.data?.candidates?.[0]?.content?.parts?.filter(
          (p) => p.functionCall,
        ) || [];

      if (!functionCalls.length) break;

      for (const func of functionCalls) {
        const { name, args } = func.functionCall;

        if (!functions[name]) throw new Error(`Function ${name} not defined`);

        const result = await functions[name](args || {});

        lastToolName = name;
        finalData = result;
       

        functionResponses.push({
          role: "tool",
          parts: [
            {
              functionResponse: {
                name,
                response: result,
              },
            },
          ],
        });

        // console.log("array", functionResponses);
      }

      // console.log("funcRes", result);

      const modelContent = response?.data?.candidates?.[0]?.content;

      const toolPayload = {
        contents: [...payload.contents, modelContent, ...functionResponses],
        tools,
      };
      console.log("secondary", toolPayload);

      response = await postToGemini(`${BASE_URL}/ai/gemini`, toolPayload, headers);

      // console.log("secondary", response);
    }

    const finalText =
      response?.data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        ?.join("") || FALL_BACK_MSG;

    const isChartFromRequest = isChart;
    const isChartFromTool = lastToolName === "sc_graph" || lastToolName === "gl_graph" || lastToolName === "gl_report";
    let chartPayload =
      lastToolName === "gl_report" && finalData?.data != null
        ? finalData.data
        : lastToolName === "gl_graph" && finalData != null
          ? { ...(finalData.data || finalData), glChart: true }
          : finalData;
    if (chartPayload?.data && (chartPayload.data.rep != null || chartPayload.data.items != null)) {
      chartPayload = { ...chartPayload.data, glChart: chartPayload.glChart || chartPayload.data.glChart };
    }

    if ((isChartFromRequest || isChartFromTool) && chartPayload && chartPayload.status !== "error") {
      try {
        // General Ledger and Stock Card graphs both use stockcardgraph (data + graphical design: Debit/Credit/RunBal, colors, layout)
        if (isLikelyChartData(chartPayload)) {
          return { type: "chart", data: chartPayload, text: CHART_REPLY_TEXT };
        }
      } catch (chartErr) {
        console.warn("Chart build failed:", chartErr);
      }
    }

    // If user asked for a GL graph but Gemini responded with text (no tool call),
    // fetch the graph directly so we display ONLY the chart.
    const wantsGLGraph =
      isChart &&
      /(general\s*ledger|\bgl\b|ledger)/i.test(userMessage || "");
    if (wantsGLGraph && (lastToolName == null || lastToolName === "gl_report")) {
      const yearMatch = String(userMessage || "").match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
      const dt1 = `${year}-01-01T00:00:00+08:00`;
      const dt2 = `${year}-12-31T23:59:59+08:00`;
      try {
        const raw = await functions.gl_graph({ dt1, dt2 });
        const payload = raw && raw.status !== "error" ? { ...(raw.data || raw), glChart: true, dt1, dt2, year } : null;
        if (payload && isLikelyChartData(payload)) {
          return { type: "chart", data: payload, text: CHART_REPLY_TEXT };
        }
      } catch (e) {
        // fall through to text response below
      }
    }
    if (isChart && finalText) {
      // If the model returns raw chart JSON as text, keep it so the UI can render the graph.
      return { type: "text", text: finalText };
    }

    return { type: "text", text: finalText };
  } catch (err) {
    console.error("Gemini error:", err);
    const is504 = err.response?.status === 504 || /504|gateway timeout/i.test(String(err.message || err.code));
    const text = is504
      ? "The request took too long (504 Gateway Timeout). Please try again or use a smaller date range for reports."
      : "Sorry, I'm having trouble processing your request.";
    return {
      type: "text",
      text,
    };
  }
}
