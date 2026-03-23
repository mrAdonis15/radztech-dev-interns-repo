import axios from "axios";
import { getBizToken } from "../selectedBiz";
import { getGraphConfig } from "./stockcardgraph.js";

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
async function axiosWithRetry(
  method,
  url,
  bodyOrParams,
  headers,
  maxRetries = 2,
) {
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
  const requestedYear =
    args.year != null ? parseInt(String(args.year), 10) : null;
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

/** Normalize stockcard report/graph args: dt1, dt2 (default current year), ixProd, ixWH. */
function normalizeStockcardArgs(args) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const requestedYear =
    args.year != null ? parseInt(String(args.year), 10) : null;
  const useYear = Number.isFinite(requestedYear) ? requestedYear : currentYear;

  let dt1 = args.dt1;
  let dt2 = args.dt2;
  if (!dt1 || !dt2) {
    dt1 = dt1 || `${useYear}-01-01T00:00:00+08:00`;
    dt2 = dt2 || `${useYear}-12-31T23:59:59+08:00`;
  } else {
    if (!/T\d{2}:\d{2}/.test(dt1)) {
      dt1 = `${String(dt1).replace(/Z$/, "").trim()}T00:00:00+08:00`;
    }
    if (!/T\d{2}:\d{2}/.test(dt2)) {
      dt2 = `${String(dt2).replace(/Z$/, "").trim()}T23:59:59+08:00`;
    }
    [dt1, dt2] = capDateRangeToMonths(dt1, dt2, 12);
  }

  return {
    dt1: String(dt1),
    dt2: String(dt2),
    ixProd: args.ixProd != null ? Number(args.ixProd) : undefined,
    ixWH: args.ixWH != null ? Number(args.ixWH) : undefined,
  };
}

/** Resolve account by name/code. Payload { q: "checks" }. Returns ixAcc or null. */
// eslint-disable-next-line no-unused-vars
async function resolveAccountByQ(q, headers) {
  if (!q || typeof q !== "string" || !String(q).trim()) return null;
  try {
    const res = await axios.post(
      `${BASE_URL}/lib/acc`,
      { q: String(q).trim() },
      { headers },
    );
    const items =
      res.data?.items ??
      res.data?.data ??
      (Array.isArray(res.data) ? res.data : []);
    const list = Array.isArray(items) ? items : items ? [items] : [];
    const first = list[0];
    const ixAcc = first?.ixAcc ?? first?.ix ?? first?.id ?? first?.accountId;
    return ixAcc != null ? Number(ixAcc) : null;
  } catch {
    return null;
  }
}

export const functions = {
  search_prod: async (args) => {
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/prod`;
      const response = await axios.post(url, args, { headers });
      const data = checkItems(response.data.items || []);

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
        items,
      };

      console.log("products", products);
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
        headers,
      });

      let branches = response.data.items;
      const brchName = args.q || "";

      if (brchName) {
        branches = branches.filter((brch) => brch.sBrch === args.q);
      }

      return {
        status: "success",
        data: branches,
      };
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },

  search_sub_acc: async (args) => {
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/sub`;
      const response = await axios.post(url, args, { headers });
      const data = checkItems(response.data.sub_list || []);

      const subAccounts = {
        ...data,
        items: data,
      };

      console.log("subAccounts", subAccounts);
      return subAccounts;
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
        headers,
        params: args,
      });

      return {
        status: "success",
        data: response.data.qtyBAL,
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
        headers,
        params: args,
      });

      return response.data;
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

      console.log("gl", data);
      return {
        status: "success",
        data,
      };
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },

  get_gl_graph: async (args) => {
    const headers = getHeaders();
    const params = normalizeGlArgs(args);

    try {
      const response = await axiosWithRetry(
        "post",
        `${BASE_URL}/reports/gl/graph`,
        params,
        headers,
      );
      const raw = response.data;
      const requestedYear = params.dt1
        ? parseInt(String(params.dt1).slice(0, 4), 10)
        : undefined;
      const apiData = {
        ...raw,
        glChart: true,
        dt1: params.dt1,
        year: Number.isFinite(requestedYear) ? requestedYear : undefined,
      };
      const config = getGraphConfig(apiData);

      if (!config || !config.labels || !config.datasets?.length) {
        return {
          status: "error",
          message: "Could not build chart from general ledger graph data.",
        };
      }

      const chartType =
        config.chartType === "pie"
          ? "pie"
          : config.chartType === "mixed"
            ? "bar"
            : config.chartType || "bar";
      const labels = Array.isArray(config.labels) ? [...config.labels] : [];
      const n = labels.length;
      const datasets = (config.datasets || []).map((ds) => {
        const data = Array.isArray(ds.data) ? ds.data : [];
        const padded =
          data.length >= n
            ? data.slice(0, n)
            : [...data, ...Array(n - data.length).fill(0)];
        return { ...ds, data: padded };
      });

      return {
        type: "chart",
        chartType,
        data: { labels, datasets },
        options: {
          responsive: true,
          title: {
            display: !!config.title,
            text:
              config.title ||
              "General Ledger (Debit / Credit / Running Balance)",
          },
          scales:
            chartType !== "pie"
              ? {
                  xAxes: [{ display: true }],
                  yAxes: [{ display: true, beginAtZero: true }],
                }
              : undefined,
        },
      };
    } catch (err) {
      return {
        status: "error",
        message:
          messageFor504(err) || err.response?.data?.message || err.message,
      };
    }
  },

  get_stockcard_report: async (args) => {
    const headers = getHeaders();
    const params = normalizeStockcardArgs(args);

    try {
      const response = await axiosWithRetry(
        "post",
        `${BASE_URL}/reports/inv/sc`,
        params,
        headers,
      );
      return {
        status: "success",
        data: response.data,
      };
    } catch (err) {
      return {
        status: "error",
        message:
          messageFor504(err) || err.response?.data?.message || err.message,
      };
    }
  },

  get_stockcard_graph: async (args) => {
    const headers = getHeaders();
    const params = normalizeStockcardArgs(args);

    try {
      const response = await axiosWithRetry(
        "post",
        `${BASE_URL}/reports/inv/sc/graph`,
        params,
        headers,
      );
      const requestedYear = params.dt1
        ? parseInt(String(params.dt1).slice(0, 4), 10)
        : undefined;
      const apiData = {
        ...response.data,
        dt1: params.dt1,
        year: Number.isFinite(requestedYear) ? requestedYear : undefined,
      };
      const config = getGraphConfig(apiData);

      if (!config || !config.labels || !config.datasets?.length) {
        return {
          status: "error",
          message: "Could not build chart from stockcard graph data.",
        };
      }

      const chartType =
        config.chartType === "pie"
          ? "pie"
          : config.chartType === "mixed"
            ? "bar"
            : config.chartType || "bar";
      const labels = Array.isArray(config.labels) ? [...config.labels] : [];
      const n = labels.length;
      const datasets = (config.datasets || []).map((ds) => {
        const data = Array.isArray(ds.data) ? ds.data : [];
        const padded =
          data.length >= n
            ? data.slice(0, n)
            : [...data, ...Array(n - data.length).fill(0)];
        return { ...ds, data: padded };
      });

      return {
        type: "chart",
        chartType,
        data: {
          labels,
          datasets,
        },
        options: {
          responsive: true,
          title: {
            display: !!config.title,
            text: config.title || "Stock Card (IN / OUT / Running Balance)",
          },
          scales:
            chartType !== "pie"
              ? {
                  xAxes: [{ display: true }],
                  yAxes: [{ display: true, beginAtZero: true }],
                }
              : undefined,
        },
      };
    } catch (err) {
      return {
        status: "error",
        message:
          messageFor504(err) || err.response?.data?.message || err.message,
      };
    }
  },

  chart_renderer: async (args) => {
    return {
      ...args,
      type: "chart",
    };
  },

  get_prod_img: async (args) => {
    const headers = getHeaders();
    const ixProd = args?.ixProd;

    try {
      const url = `${BASE_URL}/images/prod/${ixProd}`;
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data?.message || err.message,
      };
    }
  },

  get_sl_report: async (args) => {
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/reports/sl`;
      const response = await axios.post(url, args, { headers });
      const sl = response.data;
      const showRep = args?.showRep;

      return {
        status: "success",
        data: {
          begAmt: sl.begAmt,
          tDr: sl.tDr,
          tCr: sl.tCr,
          endAmt: sl.endAmt,
          ...(showRep && { rep: sl.rep }),
        },
      };
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },

  get_sl_bal: async (args) => {
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/reports/sl-bal`;
      const response = await axios.post(url, args, { headers });
      const data = response.data;
      const bal = {
        tBeg: data.begAmt,
        tDr: data.tDr,
        tCr: data.tCr,
        tEnd: data.tEnd,
      };

      console.log("sl", bal);
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
};
