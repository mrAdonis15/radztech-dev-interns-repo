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
    if (!/T\d{2}:\d{2}/.test(dt1)) dt1 = `${String(dt1).replace(/Z$/, "").trim()}T00:00:00+08:00`;
    if (!/T\d{2}:\d{2}/.test(dt2)) dt2 = `${String(dt2).replace(/Z$/, "").trim()}T23:59:59+08:00`;
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

/** Tool implementations invoked when Gemini calls a function. */
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
        ...data,
        items: items,
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
    // console.log(args);
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

      console.log("branch", branches);
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
    // console.log(args);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/trans/search/prod/inv-bal-by-brch`;

      const response = await axios.get(url, {
        headers: headers,
        params: args,
      });

      const bal = response.data;

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

      console.log("gl", data);

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
      const apiData = { ...raw, glChart: true };
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
            text: config.title || "General Ledger (Debit / Credit / Running Balance)",
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
      return chartPayload;
    } catch (err) {
      return {
        status: "error",
        message: messageFor504(err) || err.response?.data?.message || err.message,
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
        status: "success",
        data,
      };
    } catch (err) {
      return {
        status: "error",
        message: messageFor504(err) || err.response?.data?.message || err.message,
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
      const apiData = response.data;
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
      return chartPayload;
    } catch (err) {
      return {
        status: "error",
        message: messageFor504(err) || err.response?.data?.message || err.message,
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

    try {
      const url = `${BASE_URL}/images/prod/${args.ixProd}`;

      const response = await axios.get(url, {
        headers: headers,
      });

      console.log(response.data);

      const images = response.data;

      const avatarImg = images.find((img) => img.filename.includes("avatar"));

      return avatarImg || images;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
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
        name: "get_gl_graph",
        description:
          "Get and render a graph of general ledger Debit, Credit and running balance. Call this when the user wants to see a chart of GL account movement. Returns chart data for visualization.",
        parameters: {
          type: "object",
          properties: {
            ixAcc: {
              type: "integer",
              description: "The id of the GL account (ixAcc).",
            },
            showZero: {
              type: "boolean",
              description: "Include zero-balance rows. Default true.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (%Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to current month start.",
            },
            dt2: {
              type: "string",
              description:
                "End date (%Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to current month end.",
            },
            acc_others: {
              type: "array",
              items: {},
              description: "Optional list of other account filters. Default [].",
            },
            year: {
              type: "integer",
              description: "Optional year; used to default dt1/dt2 to that year.",
            },
          },
          required: ["ixAcc", "dt1", "dt2", "acc_others"],
        },
      },
      {
        name: "get_stockcard_report",
        description:
          "Get the stock card report (IN, OUT, running balance) for a product and date range. Use for tabular or summary responses.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The product id (ixProd).",
            },
            ixWH: {
              type: "integer",
              description: "The warehouse id (ixWH). Use 4282 if not specified.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (e.g. %Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to start of year.",
            },
            dt2: {
              type: "string",
              description:
                "End date (e.g. %Y-%m-%d or %Y-%m-%dT%H:%M:%S%z). Defaults to end of year.",
            },
            year: {
              type: "integer",
              description: "Optional year; used to default dt1/dt2 to that year.",
            },
          },
          required: ["ixProd"],
        },
      },
      {
        name: "get_stockcard_graph",
        description:
          "Get and render a graph of stock card IN, OUT and running balance. Call this when the user wants to see a chart of stock card movement. Returns chart data for visualization.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The product id (ixProd).",
            },
            ixWH: {
              type: "integer",
              description: "The warehouse id (ixWH). Use 4282 if not specified.",
            },
            dt1: {
              type: "string",
              description:
                "Start date (e.g. %Y-%m-%d). Defaults to start of year.",
            },
            dt2: {
              type: "string",
              description:
                "End date (e.g. %Y-%m-%d). Defaults to end of year.",
            },
            year: {
              type: "integer",
              description: "Optional year; used to default dt1/dt2 to that year.",
            },
          },
          required: ["ixProd"],
        },
      },
      {
        name: "chart_renderer",
        description:
          "Return chart data for dynamic chart rendering. Use this if the data you received can be visualize to a graph.",
        parameters: {
          type: "object",
          properties: {
            chartType: {
              type: "string",
              description:
                "Choose the chart type based on the data: line (trends), pie/doughnut (proportions), bar (category comparison).",
            },
            data: {
              type: "object",
              description:
                "The chart data object containing 'labels' (array of strings) and 'datasets' (array of dataset objects). Each dataset should include 'label' (string), 'data' (array of numbers), and optional styling such as 'backgroundColor' or 'borderColor'.",
            },
            options: {
              type: "object",
              description:
                "Chart.js options object for customizing the chart's appearance and behavior, including title, legend, scales, tooltips, responsiveness, and animations.",
            },
          },
          required: ["chartType", "data", "options"],
        },
      },
      {
        name: "get_prod_img",
        description:
          "Return the product description first, followed by the product image in Markdown format. The image must appear below the description.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The id of the product",
            },
          },
          required: ["ixProd"],
        },
      },
    ],
  },
];
