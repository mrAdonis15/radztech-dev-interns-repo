import axios from "axios";
import { getBizToken } from "../selectedBiz";
import { isLikelyChartData, normalizeToChartConfig } from "./stockcardgraph.js";

const BASE_URL = "http://localhost:3000/api";
/** Return false if text looks like raw chart/graph JSON (should not be shown to user). */
function isRawChartJson(text) {
  if (typeof text !== "string" || !text.trim()) return false;
  const t = text.trim();
  if (t[0] !== "{" || t[t.length - 1] !== "}") return false;
  return (
    /\b"chart"\s*:/.test(t) ||
    /\b"series"\s*:/.test(t) ||
    /\b"datasets"\s*:/.test(t) ||
    (/\b"data"\s*:/.test(t) && /\b"labels"\s*:/.test(t)) ||
    /\b"graph"\s*:/.test(t) ||
    (/\b"config"\s*:/.test(t) &&
      (/\b"datasets"\b/.test(t) || /\b"labels"\b/.test(t)))
  );
}

const FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";
const CHART_REPLY_TEXT = "Here is the chart you requested.";

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

/** Format product for display: "Description (Code: XXX)" using ProdCd. */
function productDisplayLabel(p) {
  if (!p) return "";
  const desc = p.sProd || p.sDesc || p.name || "";
  const code =
    p.ProdCd ||
    p.sCode ||
    p.cProd ||
    p.code ||
    (p.ixProd != null ? String(p.ixProd) : "");
  return code ? `${desc} (Code: ${code})` : desc;
}

function addDisplayLabels(result) {
  if (!result || result.status === "error") return result;
  const data = result.data;
  if (Array.isArray(data)) {
    result.data = data.map((p) => ({
      ...p,
      displayLabel: productDisplayLabel(p),
    }));
  } else if (data && typeof data === "object") {
    result.data = { ...data, displayLabel: productDisplayLabel(data) };
  }
  return result;
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

  search_gl_acc: async (args) => {
    // console.log(args.q);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/acc`;

      const response = await axios.post(url, args, {
        headers,
      });

      const data = checkItems(response.data) || {};

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

      console.log("accounts", accounts);

      return accounts;
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
};

const tools = [
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

  let session_id = localStorage.getItem("session_id");

  try {
    const payload = {
      session_id: session_id ? session_id : null,
      message: userMessage,
      tools,
    };

    // console.log("payload", payload);

    const genai_base_url = "http://localhost:3000";
    let response;
    response = await axios.post(`${genai_base_url}/genai/chat`, payload, {
      headers,
    });

    // console.log("initial", response);

    const functionCall = response?.data?.function_call;

    if (functionCall) {
      const { name, args } = functionCall;

      if (!functions[name]) throw new Error(`Function ${name} not defined`);
      const result = await functions[name](args || {});

      if (!session_id) {
        session_id = response.data.session_id;
        localStorage.setItem("session_id", session_id);
      }

      const resultPayload = {
        session_id,
        message: JSON.stringify(result),
      };

      console.log(resultPayload);

      response = await axios.post(
        `${genai_base_url}/genai/chat`,
        resultPayload,
        {
          headers,
        },
      );
    }

    const text = response?.data?.text || FALL_BACK_MSG;

    const isChartFromRequest = isChart;
    const isChartFromTool = lastToolName === "sc_graph";
    const hasChartPayload =
      finalData &&
      !finalData.status &&
      (isLikelyChartData(finalData) || normalizeToChartConfig(finalData));

    if ((isChartFromRequest || isChartFromTool) && hasChartPayload) {
      const chartConfig = normalizeToChartConfig(finalData);
      if (chartConfig) {
        return { type: "chart", data: chartConfig, text: CHART_REPLY_TEXT };
      }
    }
    if (isChart && text) {
      return {
        type: "text",
        text: isRawChartJson(text) ? CHART_REPLY_TEXT : text,
      };
    }

    return { type: "text", text: text };
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      type: "text",
      text: "Sorry, I'm having trouble processing your request.",
    };
  }
}
