import axios from "axios";
import { getGraphConfig } from "./reportsGraph.js";
import { getStandardAuthHeaders } from "./authContext";

const BASE_URL = "http://localhost:3000/api";
const REPORT_REQUEST_TIMEOUT_MS = 55000;
const RETRYABLE_STATUSES = [502, 503, 504];
const GATEWAY_TIMEOUT_MSG =
  "The server took too long to respond (504). Please try again or use a smaller date range.";
const DEFAULT_TZ = "+08:00";
const DEFAULT_IX_ACC = 4242;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const withTime = (date, time) =>
  /T\d{2}:\d{2}/.test(date)
    ? String(date)
    : `${String(date).replace(/Z$/, "").trim()}T${time}${DEFAULT_TZ}`;
const yearFromDate = (value) => {
  const year = parseInt(String(value).slice(0, 4), 10);
  return Number.isFinite(year) ? year : undefined;
};

export function getHeaders() {
  return getStandardAuthHeaders();
}

function errorResult(err, use504Message = false) {
  return {
    status: "error",
    message: use504Message
      ? messageFor504(err) || err.response?.data?.message || err.message
      : err.response?.data || err.message,
  };
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

function checkItems(items = []) {
  if (items.length > 10) {
    return {
      status: "error",
      error: "too many exist",
      items: items.slice(0, 10),
    };
  }
  if (items.length > 1) {
    return {
      status: "success",
      error: "multiple_exist",
      items,
    };
  }
  if (items.length === 0) {
    return {
      status: "error",
      error: "not_found",
      text: "Sorry, I couldn't find the item,",
    };
  }
  return {
    status: "success",
    items,
  };
}

function capDateRangeToMonths(dt1, dt2, maxMonths) {
  const d1 = new Date(String(dt1).slice(0, 10));
  const d2 = new Date(String(dt2).slice(0, 10));
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return [dt1, dt2];

  const start = new Date(d2);
  start.setMonth(start.getMonth() - maxMonths);
  if (start <= d1) return [dt1, dt2];

  const newDt1 = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01T00:00:00${DEFAULT_TZ}`;
  const suffix =
    String(dt2).match(/T[\d:+-]+/)?.[0] || `T23:59:59${DEFAULT_TZ}`;
  return [newDt1, `${String(dt2).slice(0, 10)}${suffix}`];
}

async function request(
  method,
  path,
  { data, params, timeout, retries = 0 } = {},
) {
  const options = {
    headers: getHeaders(),
    ...(timeout ? { timeout } : {}),
    ...(params ? { params } : {}),
  };

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return method === "get"
        ? await axios.get(`${BASE_URL}${path}`, options)
        : await axios.post(`${BASE_URL}${path}`, data, options);
    } catch (err) {
      lastError = err;
      if (attempt < retries && isRetryableError(err)) {
        await sleep(2000);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

function normalizeDateRange(
  args,
  { defaultMode = "year", maxMonths = 12 } = {},
) {
  const now = new Date();
  const requestedYear =
    args.year != null ? parseInt(String(args.year), 10) : null;
  const useYear = Number.isFinite(requestedYear)
    ? requestedYear
    : now.getFullYear();

  let { dt1, dt2 } = args;
  if (!dt1 || !dt2) {
    if (defaultMode === "month" && requestedYear == null) {
      const month = now.getMonth() + 1;
      const lastDay = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      dt1 =
        dt1 ||
        `${now.getFullYear()}-${String(month).padStart(2, "0")}-01T00:00:00${DEFAULT_TZ}`;
      dt2 =
        dt2 ||
        `${now.getFullYear()}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59${DEFAULT_TZ}`;
    } else {
      dt1 = dt1 || `${useYear}-01-01T00:00:00${DEFAULT_TZ}`;
      dt2 = dt2 || `${useYear}-12-31T23:59:59${DEFAULT_TZ}`;
    }
  } else {
    dt1 = withTime(dt1, "00:00:00");
    dt2 = withTime(dt2, "23:59:59");
    [dt1, dt2] = capDateRangeToMonths(dt1, dt2, maxMonths);
  }

  return { dt1: String(dt1), dt2: String(dt2) };
}

function normalizeGlArgs(args) {
  return {
    ...normalizeDateRange(args, { defaultMode: "month" }),
    ixAcc: args.ixAcc != null ? Number(args.ixAcc) : DEFAULT_IX_ACC,
    accOthers: Array.isArray(args.acc_others) ? args.acc_others : [],
    showZero: args.showZero !== false,
  };
}

function normalizeStockcardArgs(args) {
  return {
    ...normalizeDateRange(args),
    ixProd: args.ixProd != null ? Number(args.ixProd) : undefined,
    ixWH: args.ixWH != null ? Number(args.ixWH) : undefined,
  };
}

function buildChartResult(config, fallbackTitle, message) {
  if (!config?.labels || !config.datasets?.length) {
    return { status: "error", message };
  }

  const chartType =
    config.chartType === "pie"
      ? "pie"
      : config.chartType === "mixed"
        ? "bar"
        : config.chartType || "bar";
  const labels = Array.isArray(config.labels) ? [...config.labels] : [];
  const size = labels.length;
  const datasets = (config.datasets || []).map((dataset) => {
    const data = Array.isArray(dataset.data) ? dataset.data : [];
    return {
      ...dataset,
      data:
        data.length >= size
          ? data.slice(0, size)
          : [...data, ...Array(size - data.length).fill(0)],
    };
  });

  return {
    type: "chart",
    chartType,
    data: { labels, datasets },
    options: {
      responsive: true,
      title: {
        display: !!config.title,
        text: config.title || fallbackTitle,
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
}

async function buildGraph(
  path,
  args,
  chartErrorMessage,
  fallbackTitle,
  extraData = {},
) {
  const params = path.includes("/reports/gl/")
    ? normalizeGlArgs(args)
    : normalizeStockcardArgs(args);
  const response = await request("post", path, {
    data: params,
    timeout: REPORT_REQUEST_TIMEOUT_MS,
    retries: 2,
  });
  const config = getGraphConfig({
    ...response.data,
    ...extraData,
    dt1: params.dt1,
    year: yearFromDate(params.dt1),
  });

  return buildChartResult(config, fallbackTitle, chartErrorMessage);
}

export const functions = {
  search_prod: async (args) => {
    try {
      const response = await request("post", "/lib/prod", { data: args });
      const data = checkItems(response.data.items || []);

      return {
        ...data,
        items: (data.items || []).map(
          ({
            ixProd,
            ProdCd,
            cCost,
            sCat,
            sCatSub,
            sProd,
            sProdCat,
            unit,
          }) => ({
            ixProd,
            ProdCd,
            cCost,
            sCat,
            sCatSub,
            sProd,
            sProdCat,
            unit,
          }),
        ),
      };
    } catch (err) {
      return errorResult(err);
    }
  },

  search_branch: async (args) => {
    try {
      const response = await request("get", "/lib/brch");
      const query = args.q || "";
      const branches = query
        ? response.data.items.filter((branch) => branch.sBrch === query)
        : response.data.items;

      return {
        status: "success",
        data: branches,
      };
    } catch (err) {
      return errorResult(err);
    }
  },

  search_sub_acc: async (args) => {
    try {
      const response = await request("post", "/lib/sub", { data: args });
      const data = checkItems(response.data.sub_list || []);

      return {
        ...data,
        items: data,
      };
    } catch (err) {
      return errorResult(err);
    }
  },

  get_prod_bal: async (args) => {
    try {
      const response = await request("get", "/trans/search/prod/inv-bal", {
        params: args,
      });
      return {
        status: "success",
        data: response.data.qtyBAL,
      };
    } catch (err) {
      return errorResult(err);
    }
  },

  get_prod_bal_by_branch: async (args) => {
    try {
      const response = await request(
        "get",
        "/trans/search/prod/inv-bal-by-brch",
        { params: args },
      );
      return response.data;
    } catch (err) {
      return errorResult(err);
    }
  },

  get_gl_report: async (args) => {
    try {
      const response = await request("post", "/reports/gl", { data: args });
      const { begAmt, tDr, tCr, endAmt } = response.data;

      return {
        status: "success",
        data: { begAmt, tDr, tCr, endAmt },
      };
    } catch (err) {
      return errorResult(err);
    }
  },

  get_gl_graph: async (args) => {
    try {
      return await buildGraph(
        "/reports/gl/graph",
        args,
        "Could not build chart from general ledger graph data.",
        "General Ledger (Debit / Credit / Running Balance)",
        { glChart: true },
      );
    } catch (err) {
      return errorResult(err, true);
    }
  },

  get_stockcard_report: async (args) => {
    try {
      const response = await request("post", "/reports/inv/sc", {
        data: normalizeStockcardArgs(args),
        timeout: REPORT_REQUEST_TIMEOUT_MS,
        retries: 2,
      });
      return {
        status: "success",
        data: response.data,
      };
    } catch (err) {
      return errorResult(err, true);
    }
  },

  get_stockcard_graph: async (args) => {
    try {
      return await buildGraph(
        "/reports/inv/sc/graph",
        args,
        "Could not build chart from stockcard graph data.",
        "Stock Card (IN / OUT / Running Balance)",
      );
    } catch (err) {
      return errorResult(err, true);
    }
  },

  chart_renderer: async (args) => ({
    ...args,
    type: "chart",
  }),

  get_prod_img: async (args) => {
    try {
      const response = await request("get", `/images/prod/${args?.ixProd}`);
      return response.data;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data?.message || err.message,
      };
    }
  },

  get_sl_report: async (args) => {
    try {
      const response = await request("post", "/reports/sl", { data: args });
      const { begAmt, tDr, tCr, endAmt, rep } = response.data;

      return {
        status: "success",
        data: {
          begAmt,
          tDr,
          tCr,
          endAmt,
          ...(args?.showRep && { rep }),
        },
      };
    } catch (err) {
      return errorResult(err);
    }
  },

  get_sl_bal: async (args) => {
    try {
      const response = await request("post", "/reports/sl-bal", { data: args });
      const { begAmt, tDr, tCr, tEnd } = response.data;

      return {
        status: "success",
        data: {
          tBeg: begAmt,
          tDr,
          tCr,
          tEnd,
        },
      };
    } catch (err) {
      return errorResult(err);
    }
  },
};
