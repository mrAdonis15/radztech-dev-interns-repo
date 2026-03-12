import axios from "axios";
import { isLikelyChartData, getGraphConfigFromText } from "./stockcardgraph.js";
import { tools, functions, getHeaders } from "./tools.js";

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
    (/\b"data"\s*:/.test(t) && (/\b"labels"\s*:/.test(t) || /\b"items"\s*:/.test(t))) ||
    /\b"graph"\s*:/.test(t) ||
    /\b"glChart"\s*:/.test(t) ||
    (/\b"config"\s*:/.test(t) &&
      (/\b"datasets"\b/.test(t) || /\b"labels"\b/.test(t))) ||
    // Stockcard: items + year or dt1 or begQty (API may omit year)
    (/\b"items"\s*:/.test(t) && (/\b"year"\s*:/.test(t) || /\b"dt1"\s*:/.test(t) || /\b"begQty"\s*:/.test(t)))
  );
}

const FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";
/** Short overview shown with chart messages instead of long AI-generated tables. */
const CHART_OVERVIEW_TEXT = "Overview of the graph for the selected period.";

// function getHeaders() {
//   const token = getBizToken();

//   const headers = {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//     "x-access-tokens": token,
//   };

//   return headers;
// }

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

//  MAIN FUNCTION
/**
 * @param {string} userMessage
 * @param {Array} messageHistory
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @param {string} [sessionId] - Optional session id from a previous chat response (for continuing conversation).
 */
export async function sendToGemini(
  userMessage,
  messageHistory = [],
  signal = undefined,
  sessionId = undefined,
) {
  const headers = getHeaders();
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }

  let toolResult = null;
  let toolName = null;

  let session_id = localStorage.getItem("session_id");

  try {
    // genai/chat API expects { session_id?, parts: [{ text }], tools } (same as Postman)
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

    const functionCall = response?.data?.function_call;

    if (functionCall) {
      const { name, args } = functionCall;

      if (!functions[name]) throw new Error(`Function ${name} not defined`);
      const result = await functions[name](args || {});
      toolName = name;
      toolResult = result;

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

    // Backend may put chart data in response.data.data (no client-side tool call).
    const responseData = response?.data?.data ?? response?.data?.chart_data ?? response?.data?.graph;
    if (responseData && typeof responseData === "object" && isLikelyChartData(responseData)) {
      return {
        type: "chart",
        data: responseData,
        text: CHART_OVERVIEW_TEXT,
        session_id: session_id ?? response?.data?.session_id,
      };
    }

    // When a graph tool ran and returned chart data, return chart type so the UI can render it (no need for user to say "graph").
    if (toolName && toolResult != null) {
      const isGraphTool = toolName === "sc_graph" || toolName === "gl_graph" || toolName === "gl_report";
      let chartData = null;
      if (isGraphTool && toolResult?.status !== "error") {
        if (toolName === "gl_report" && toolResult?.data != null) {
          chartData = toolResult.data;
        } else if (toolName === "sc_graph") {
          // Stockcard returns { items, begQty, endQty, dt1, dt2, year } at top level
          chartData = toolResult;
        } else if (toolName === "gl_graph") {
          // GL API may return { rep, glChart } at top level or under .data
          chartData = toolResult.rep != null || toolResult.glChart != null
            ? toolResult
            : toolResult?.data;
        }
      }
      if (chartData && isLikelyChartData(chartData)) {
        return {
          type: "chart",
          data: chartData,
          text: CHART_OVERVIEW_TEXT,
          session_id: session_id ?? response?.data?.session_id,
        };
      }
    }

    // Fallback: backend might have returned chart JSON inside the text (e.g. no client-side tool call).
    if (typeof text === "string" && text.trim() && isRawChartJson(text)) {
      const chartConfig = getGraphConfigFromText(text);
      if (chartConfig) {
        return {
          type: "chart",
          data: chartConfig,
          text: CHART_OVERVIEW_TEXT,
          session_id: session_id ?? response?.data?.session_id,
        };
      }
    }

    return {
      type: "text",
      text,
      session_id: session_id ?? response?.data?.session_id,
    };
  } catch (err) {
    console.error("Gemini error:", err);
    const status = err.response?.status;
    const is504 =
      status === 504 ||
      /504|gateway timeout/i.test(String(err.message || err.code));
    const isNetworkError =
      !err.response &&
      (err.code === "ECONNABORTED" ||
        err.code === "ECONNREFUSED" ||
        err.code === "ERR_NETWORK" ||
        /network|failed to fetch|cors/i.test(String(err.message || "")));
    let text;
    if (is504) {
      text =
        "The request took too long (504 Gateway Timeout). Please try again or use a smaller date range for reports.";
    } else if (isNetworkError) {
      text =
        "Cannot reach the server. Check that the API is running at " +
        BASE_URL +
        " and try again. If using a different port or URL, set it in geminiService.js (BASE_URL).";
    } else {
      text =
        "Sorry, I'm having trouble processing your request. Please try again. " +
        (err.response?.data?.message || err.message || "").slice(0, 80);
    }
    return {
      type: "text",
      text,
    };
  }
}
