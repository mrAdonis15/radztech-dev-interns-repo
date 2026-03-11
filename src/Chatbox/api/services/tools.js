import axios from "axios";
import { getBizToken } from "../selectedBiz";

const BASE_URL = "http://localhost:3000/api";
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
    code === "ERR_NETWORK" ||
    code === "ERR_CONNECTION_RESET" ||
    /timeout|504|gateway|connection reset/i.test(String(code))
  );
}

function messageFor504(err) {
  if (err.response?.status === 504) return GATEWAY_TIMEOUT_MSG;
  return err.response?.data?.message ?? err.response?.data ?? err.message;
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

export function getHeaders() {
  const token = getBizToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-tokens": token,
  };
}

function checkItems(data) {
  if (data.length > 10) {
    return {
      status: "error",
      error: "too many exist",
      items: data.slice(0, 10),
    };
  }
  if (data.length > 1) {
    return {
      status: "success",
      error: "multiple_exist",
      items: data,
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
    items: data,
  };
}

function normalizeGlArgs(args) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(currentYear, now.getMonth(), 0).getDate();
  const requestedYear = args.year != null ? parseInt(String(args.year), 10) : null;
  const useYear = Number.isFinite(requestedYear) ? requestedYear : null;

  let dt1 = args.dt1;
  let dt2 = args.dt2;

  if (!dt1 || !dt2) {
    if (useYear != null) {
      dt1 = dt1 || `${useYear}-01-01T00:00:00+08:00`;
      dt2 = dt2 || `${useYear}-12-31T23:59:59+08:00`;
    } else {
      dt1 = dt1 || `${currentYear}-${currentMonth}-01T00:00:00+08:00`;
      dt2 = dt2 || `${currentYear}-${currentMonth}-${lastDay}T23:59:59+08:00`;
    }
  } else {
    if (!/T\d{2}:\d{2}/.test(dt1)) {
      dt1 = `${String(dt1).replace(/Z$/, "").trim()}T00:00:00+08:00`;
    }
    if (!/T\d{2}:\d{2}/.test(dt2)) {
      dt2 = `${String(dt2).replace(/Z$/, "").trim()}T23:59:59+08:00`;
    }
    [dt1, dt2] = capDateRangeToMonths(dt1, dt2, 12);
  }

  const ixAcc = args.ixAcc != null ? Number(args.ixAcc) : 4242;
  const accOthers = Array.isArray(args.acc_others) ? args.acc_others : [];

  return {
    dt1: String(dt1),
    dt2: String(dt2),
    ixAcc,
    accOthers,
    showZero: args.showZero !== false,
  };
}

/** Resolve account by name/code. Payload { q: "checks" }. Returns ixAcc or null. */
async function resolveAccountByQ(q, headers) {
  if (!q || typeof q !== "string" || !String(q).trim()) return null;
  try {
    const res = await axios.post(`${BASE_URL}/lib/acc`, { q: String(q).trim() }, { headers });
    const items = res.data?.items ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
    const list = Array.isArray(items) ? items : items ? [items] : [];
    const first = list[0];
    const ixAcc = first?.ixAcc ?? first?.ix ?? first?.id ?? first?.accountId;
    return ixAcc != null ? Number(ixAcc) : null;
  } catch {
    return null;
  }
}

/** Tool implementations invoked when Gemini calls a function. */
export const functions = {
  search_prod: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/lib/prod`;
      const response = await axios.post(url, args, { headers });
      const data = checkItems(response.data.items || []);
      if (!data.items) return data;
      const items = data.items.map(
        ({ ixProd, ProdCd, cCost, sCat, sCatSub, sProd, sProdCat, unit }) => ({
          ixProd,
          ProdCd,
          cCost,
          sCat,
          sCatSub,
          sProd,
          sProdCat,
          unit,
        }),
      );
      const products = {
        ...data,
        items: items,
      };
      return products;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  search_branch: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/lib/brch`;
      const response = await axios.get(url, {
        headers: headers,
      });
      const data = response.data.items;
      const branches = data.filter((item) => item.sBrch === args.q);
      if (branches.length > 1) {
        return {
          status: "error",
          error: "multiple",
          data: branches,
        };
      }
      return {
        status: "success",
        data: branches[0],
      };
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  search_gl_acc: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/lib/acc`;
      const response = await axios.post(url, args, { headers });
      const raw = response.data?.items ?? response.data;
      const data = checkItems(Array.isArray(raw) ? raw : []);
      if (!data.items) return data;
      const items = data.items.map(
        ({ ixAcc, sAccTitle, sAccType, parent_sAccTitle }) => ({
          ixAcc,
          sAccTitle,
          sAccType,
          parent_sAccTitle,
        }),
      );
      const accounts = {
        ...data,
        items: items,
      };
      return accounts;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  get_prod_bal: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/trans/search/prod/inv-bal`;
      const response = await axios.get(url, {
        headers: headers,
        params: args,
      });
      const bal = response.data.qtyBAL;
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
  get_prod_bal_by_branch: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/trans/search/prod/inv-bal-by-brch`;
      const response = await axios.get(url, {
        headers: headers,
        params: args,
      });
      const bal = checkItems(response.data);
      return bal;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  get_gl_report: async (args) => {
    const headers = getHeaders();
    try {
      const url = `${BASE_URL}/reports/gl`;
      const response = await axios.post(url, args, { headers });
      const gl = response.data;
      const data = {
        begAmt: gl.begAmt,
        tDr: gl.tDr,
        tCr: gl.tCr,
        endAmt: gl.endAmt,
      };
      return {
        status: "success",
        data: data,
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

      const graphBody = { ixProd, dt1, dt2, bn: "", ixWH, SN: "", SN2: "" };
      const graphRes = await axiosWithRetry("post", `${BASE_URL}/reports/inv/sc/graph`, graphBody, headers);
      const raw = graphRes.data;
      if (!raw) return { status: "error", text: "No graph data returned." };

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
      let resolvedArgs = { ...args };
      if (args.ixAcc == null && args.q) {
        const ixAcc = await resolveAccountByQ(args.q, headers);
        if (ixAcc != null) resolvedArgs = { ...args, ixAcc };
      }
      const url = `${BASE_URL}/reports/gl`;
      const { dt1, dt2, ixAcc, accOthers, showZero } = normalizeGlArgs(resolvedArgs);
      const body = {
        ixAcc,
        showZero,
        dt1,
        dt2,
        acc_others: accOthers,
      };
      const response = await axiosWithRetry("post", url, body, headers);
      const gl = response.data;
      const rep = Array.isArray(gl.rep) ? gl.rep : [];
      const data = {
        begAmt: gl.begAmt,
        tDr: gl.tDr,
        tCr: gl.tCr,
        endAmt: gl.endAmt,
        glChart: true,
        rep,
      };
      return {
        status: "success",
        data,
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
      let resolvedArgs = { ...args };
      if (args.ixAcc == null && args.q) {
        const ixAcc = await resolveAccountByQ(args.q, headers);
        if (ixAcc != null) resolvedArgs = { ...args, ixAcc };
      }
      const url = `${BASE_URL}/reports/gl/graph`;
      const { dt1, dt2, ixAcc, accOthers, showZero } = normalizeGlArgs(resolvedArgs);
      const body = {
        ixAcc,
        showZero,
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

/** Gemini function declarations (tool schema) sent to the AI. */
export const tools = [
  {
    functionDeclarations: [
      {
        name: "search_prod",
        description:
          "Use this to search for specific products. Use ProdCd to display multiple entries. If no items found on the first search, return the result immediately and do not search again.",
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
        name: "search_branch",
        description: "Use this to search for specific branch.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The name/title of the branch.",
            },
          },
          required: ["q"],
        },
      },
      {
        name: "search_gl_acc",
        description: "Use this to search specific gl account.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The title of the account",
            },
          },
          required: ["q"],
        },
      },
      {
        name: "get_prod_bal",
        description:
          "Get the total product balance or the balance in a specific branch.",
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
            ixBrch: {
              type: "integer",
              description:
                "The branch where the product belongs. This is optional.",
            },
          },
          required: ["ixProd", "ixWH"],
        },
      },
      {
        name: "get_prod_bal_by_branch",
        description: "Get the product balance for each branch.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The id of the product",
            },
            ixWH: {
              type: "integer",
              description: "USE 4282 as ixWH",
            },
          },
          required: ["ixProd", "ixWH"],
        },
      },
      {
        name: "get_gl_report",
        description:
          "Returns the general ledger report for descriptive responses.",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "The id of the gl account (ixAcc).",
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
              description:
                "Start date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's start date.",
            },
            dt2: {
              type: "string",
              description:
                "End date (%Y-%m-%dT%H:%M:%S%z). Defaults to current month's end date.",
            },
            acc_others: {
              type: "array",
              items: {},
              description:
                "Optional list of other account filters. Default [].",
            },
          },
          required: ["ixAcc", "dt1", "dt2", "acc_others"],
        },
      },
      {
        name: "gl_report",
        description:
          "General Ledger report (table data). Use when user asks for GL report or ledger table. Returns rep array for charting.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Account name or code to look up (e.g. 'checks', 'cash').",
            },
            ixAcc: {
              type: "integer",
              description: "Main account index (e.g. 4242).",
            },
            showZero: {
              type: "boolean",
              description: "Include zero-balance rows. Default true.",
            },
            year: {
              type: "integer",
              description: "Year requested by the user (e.g. 2024, 2025).",
            },
            dt1: {
              type: "string",
              description: "Start date (e.g. '2024-01-01' or '2024-03-01T00:00:00+08:00').",
            },
            dt2: {
              type: "string",
              description: "End date (e.g. '2024-12-31' or '2024-03-31T23:59:59+08:00').",
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
          "General Ledger graph (Debit, Credit, Running Balance). Use when the user asks to graph/chart/plot general ledger or GL.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Account name or code to look up (e.g. 'checks', 'cash').",
            },
            ixAcc: {
              type: "integer",
              description: "Main account index (e.g. 4242). Default 4242 if omitted.",
            },
            showZero: {
              type: "boolean",
              description: "Include zero-balance rows. Default true.",
            },
            year: {
              type: "integer",
              description: "Year requested by the user (e.g. 2024, 2025).",
            },
            dt1: {
              type: "string",
              description: "Start date (e.g. '2024-01-01' or '2024-03-01T00:00:00+08:00').",
            },
            dt2: {
              type: "string",
              description: "End date (e.g. '2024-12-31' or '2024-03-31T23:59:59+08:00').",
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
        name: "sc_graph",
        description:
          "Get stock card graph data (running balance, IN, OUT by period). Use when the user asks to graph/chart/plot stock card or running balance. For q, use the product displayLabel from search_prod (e.g. 'CLICK160 Black (Code: ACB160CBTN-MGB)') or the description when the user chose from the list (e.g. 'the first one' → use that item's displayLabel). When the user asks for a specific year (e.g. '2026', 'stock card for 2026'), pass that year in the year parameter so the chart shows the requested year.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description:
                "Product displayLabel (e.g. 'CLICK160 Black (Code: ACB160CBTN-MGB)') or description. Use the displayLabel from the search result when user picked one.",
            },
            ixProd: {
              type: "integer",
              description: "Product id. Use only when q is not available.",
            },
            year: {
              type: "integer",
              description:
                "Year requested by the user (e.g. 2026). Use when the user says a specific year. The chart will show this year; dt1/dt2 are derived from it if not provided.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (e.g. '2026-01-01T00:00:00+08:00'). Optional; built from year when year is provided.",
            },
            dt2: {
              type: "string",
              description:
                "End date (e.g. '2026-12-31T23:59:59+08:00'). Optional; built from year when year is provided.",
            },
            ixWH: {
              type: "integer",
              description: "Warehouse id (default from API). Optional.",
            },
          },
          required: [],
        },
      },
    ],
  },
];
