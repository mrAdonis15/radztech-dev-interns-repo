import axios from "axios";
import { getBizToken } from "../selectedBiz";
import { getGraphConfig } from "../stockcardgraph.js";

const BASE_URL = "http://localhost:3000/api";
const REPORT_REQUEST_TIMEOUT_MS = 55000;
const RETRYABLE_STATUSES = [502, 503, 504];
const GATEWAY_TIMEOUT_MSG =
  "The server took too long to respond (504). Please try again or use a smaller date range.";

function getISOYear(date) {
  const d = new Date(date);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return d.getFullYear();
}

function getReportLabels(year) {
  const labels = [];

  let date = new Date(year, 0, 4);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);

  while (true) {
    const isoYear = getISOYear(date);

    if (isoYear !== year) break;

    labels.push(date.toLocaleString("en-US", { month: "short" }));

    date.setDate(date.getDate() + 7);
  }

  return labels;
}

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
      isFromTool: true,
      status: "error",
      error: "too many exist",
      items: data.slice(0, 10),
    };
  }
  if (data.length > 1) {
    return {
      isFromTool: true,
      status: "success",
      error: "multiple_exist",
      items: data,
    };
  }
  if (data.length === 0) {
    return {
      isFromTool: true,
      status: "error",
      error: "not_found",
      text: "Sorry, I couldn't find the item,",
    };
  }
  return {
    isFromTool: true,
    status: "success",
    items: data,
  };
}

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
    if (!/T\d{2}:\d{2}/.test(dt1))
      dt1 = `${String(dt1).replace(/Z$/, "").trim()}T00:00:00+08:00`;
    if (!/T\d{2}:\d{2}/.test(dt2))
      dt2 = `${String(dt2).replace(/Z$/, "").trim()}T23:59:59+08:00`;
    [dt1, dt2] = capDateRangeToMonths(dt1, dt2, 12);
  }

  return {
    dt1: String(dt1),
    dt2: String(dt2),
    ixProd: args.ixProd != null ? Number(args.ixProd) : undefined,
    ixWH: args.ixWH != null ? Number(args.ixWH) : undefined,
  };
}

// Gemini Functions
export const functions = {
  search_prod: async (args) => {
    // console.log(args.q);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/prod`;

      const response = await axios.post(url, args, {
        headers,
      });

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
        isFromTool: true,
        ...data,
        items: items,
      };

      // console.log("products", products);

      return products;
    } catch (err) {
      return {
        isFromTool: true,
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  search_branch: async (args) => {
    // console.log(args);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/brch`;

      const response = await axios.get(url, {
        headers: headers,
      });

      let branches = response.data.items;
      const brchName = args.q || "";

      if (brchName) {
        branches = branches.filter((brch) => brch.sBrch === args.q);
      }

      return {
        isFromTool: true,
        status: "success",
        data: branches,
      };
    } catch (err) {
      return {
        isFromTool: true,
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  search_sub_acc: async (args) => {
    // console.log(args.q);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/sub`;

      const response = await axios.post(url, args, {
        headers,
      });

      const data = checkItems(response.data.sub_list || []);

      const subAccounts = {
        isFromTool: true,
        ...data,
        items: data,
      };

      console.log("subAccounts", subAccounts);

      return subAccounts;
    } catch (err) {
      return {
        isFromTool: true,
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
      return {
        isFromTool: true,
        status: "success",
        data: bal,
      };
    } catch (err) {
      return {
        isFromTool: true,
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  get_prod_bal_by_branch: async (args) => {
    // console.log(args);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/trans/search/prod/inv-bal-by-brch`;

      const response = await axios.get(url, {
        headers: headers,
        params: args,
      });

      const bal = response.data;

      return { isFromTool: true, ...bal };
    } catch (err) {
      return {
        isFromTool: true,
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  get_gl_report: async (args) => {
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/reports/gl`;

      const response = await axios.post(url, args, {
        headers,
      });

      const gl = response.data;

      const data = {
        begAmt: gl.begAmt,
        tDr: gl.tDr,
        tCr: gl.tCr,
        endAmt: gl.endAmt,
      };

      return {
        isFromTool: true,
        status: "success",
        data: data,
      };
    } catch (err) {
      return {
        isFromTool: true,
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },

  get_gl_graph: async (args) => {
    const headers = getHeaders();
    const params = {};
    try {
      const response = await axiosWithRetry(
        "post",
        `${BASE_URL}/reports/gl/graph`,
        args,
        headers,
      );

      const chartLabels = getReportLabels(args?.year);

      console.log("labels", chartLabels);
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

      const chartPayload = {
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

      return {
        isFromTool: true,
        type: "chart",
        data: chartPayload,
      };
    } catch (err) {
      return {
        isFromTool: true,
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
      const data = response.data;
      return {
        isFromTool: true,
        status: "success",
        data,
      };
    } catch (err) {
      return {
        isFromTool: true,
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
      // Chart.js has no "mixed" type; use "bar" so bar+line datasets render (datasets already specify type per series).
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

      const chartPayload = {
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
      // console.log("sc", chartPayload);

      return {
        type: "chart",
        data: chartPayload,
      };
    } catch (err) {
      return {
        isFromTool: true,
        status: "error",
        message:
          messageFor504(err) || err.response?.data?.message || err.message,
      };
    }
  },

  chart_renderer: async (args) => {
    return {
      // isFromTool: true,
      data: args,
      type: "chart",
    };
  },
  get_prod_img: async (args) => {
    const headers = getHeaders();
    const ixProd = args?.ixProd;
    try {
      const url = `${BASE_URL}/images/prod/${ixProd}`;
      const response = await axios.get(url, { headers });
      console.log("response", response);

      const data = response.data;

      return {
        isFromTool: true,
        type: "img",
        data: data,
      };
    } catch (err) {
      return {
        isFromTool: true,

        status: "error",
        message: err.response?.data?.message || err.message,
      };
    }
  },

  get_sl_report: async (args) => {
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/reports/sl`;

      const response = await axios.post(url, args, {
        headers,
      });

      const sl = response.data;
      const showRep = args?.showRep;

      const data = {
        begAmt: sl.begAmt,
        tDr: sl.tDr,
        tCr: sl.tCr,
        endAmt: sl.endAmt,
        ...(showRep && { rep: sl.rep }),
      };

      // console.log("sl", data);

      return {
        isFromTool: true,
        status: "success",
        data: data,
      };
    } catch (err) {
      return {
        isFromTool: true,

        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },

  get_sl_bal: async (args) => {
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/reports/sl-bal`;

      const response = await axios.post(url, args, {
        headers,
      });

      const data = response.data;

      const bal = {
        tBeg: data.begAmt,
        tDr: data.tDr,
        tCr: data.tCr,
        tEnd: data.tEnd,
      };

      return {
        isFromTool: true,
        status: "success",
        data: bal,
      };
    } catch (err) {
      return {
        isFromTool: true,

        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
};
