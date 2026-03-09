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
    (/\b"config"\s*:/.test(t) && (/\b"datasets"\b/.test(t) || /\b"labels"\b/.test(t)))
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

/** Format product for display: "Description (Code: XXX)" using ProdCd. */
function productDisplayLabel(p) {
  if (!p) return "";
  const desc = p.sProd || p.sDesc || p.name || "";
  const code = p.ProdCd || p.sCode || p.cProd || p.code || (p.ixProd != null ? String(p.ixProd) : "");
  return code ? `${desc} (Code: ${code})` : desc;
}

function addDisplayLabels(result) {
  if (!result || result.status === "error") return result;
  const data = result.data;
  if (Array.isArray(data)) {
    result.data = data.map((p) => ({ ...p, displayLabel: productDisplayLabel(p) }));
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
      // Use year from user request (args.year) or from dt1; then build dt1/dt2 so display follows user request
      const requestedYear = args.year != null ? parseInt(String(args.year), 10) : null;
      let dt1 = args.dt1;
      let dt2 = args.dt2;
      if (requestedYear != null && Number.isFinite(requestedYear)) {
        dt1 = dt1 || `${requestedYear}-01-01T00:00:00+08:00`;
        dt2 = dt2 || `${requestedYear}-12-31T23:59:59+08:00`;
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

      const scBody = { ixProd, dt1, dt2, ixWH, SN: "", SN2: "" };
      await axios.post(`${BASE_URL}/reports/inv/sc`, scBody, { headers });

      const graphBody = { ixProd, dt1, dt2, bn: "", ixWH, SN: "", SN2: "" };
      const graphRes = await axios.post(`${BASE_URL}/reports/inv/sc/graph`, graphBody, { headers });
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
          "Get stock card graph data (running balance, IN, OUT by period). Use when the user asks to graph/chart/plot stock card or running balance. For q, use the product displayLabel from search_prod (e.g. 'CLICK160 Black (Code: ACB160CBTN-MGB)') or the description when the user chose from the list (e.g. 'the first one' → use that item's displayLabel). When the user asks for a specific year (e.g. '2026', 'stock card for 2026'), pass that year in the year parameter so the chart shows the requested year.",
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
    response = await axios.post(`${BASE_URL}/ai/gemini`, payload, {
      headers,
    });

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

      response = await axios.post(`${BASE_URL}/ai/gemini`, toolPayload, {
        headers,
      });

      // console.log("secondary", response);
    }

    const finalText =
      response?.data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        ?.join("") || FALL_BACK_MSG;

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
    if (isChart && finalText) {
      return { type: "text", text: isRawChartJson(finalText) ? CHART_REPLY_TEXT : finalText };
    }

    return { type: "text", text: finalText };
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      type: "text",
      text: "Sorry, I'm having trouble processing your request.",
    };
  }
}
