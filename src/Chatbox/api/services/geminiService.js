import axios from "axios";
import { isLikelyChartData } from "./stockcardgraph.js";
import { tools, functions, getHeaders } from "./tools.js";

const BASE_URL = typeof process !== "undefined" && process.env?.REACT_APP_API_BASE
  ? String(process.env.REACT_APP_API_BASE).replace(/\/$/, "")
  : "http://localhost:3000/api";

/** genai/chat lives at /genai/chat (no /api) so requests match Postman: e.g. https://clone.ulap.biz/genai/chat */
const GENAI_CHAT_BASE = BASE_URL.replace(/\/api\/?$/, "") || BASE_URL;
const GENAI_CHAT_URL = typeof process !== "undefined" && process.env?.REACT_APP_GENAI_CHAT_URL
  ? String(process.env.REACT_APP_GENAI_CHAT_URL).trim()
  : `${GENAI_CHAT_BASE}/genai/chat`;

const FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";

const CHART_REPLY_TEXT = "Here is the chart based on your request.";
/** Shown when we return report data as text so user can ask for a graph if they want. */
const ASK_FOR_GRAPH_SUGGESTION = "\n\nWould you like to see this as a chart? Just ask to graph or chart it.";
const GEMINI_REQUEST_TIMEOUT_MS = 180000;
/** Cap GL rep rows sent to chart to avoid UI freeze when user asks for a specific account (large result). */
const GL_REP_MAX_ROWS = 4000;
const RETRYABLE_STATUSES = [502, 503, 504];

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

/** POST to Gemini AI with long timeout and retry on gateway/timeout errors. Supports abort via signal. */
async function postToGemini(url, data, headers, maxRetries = 3, signal = undefined) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.post(url, data, {
        headers,
        timeout: GEMINI_REQUEST_TIMEOUT_MS,
        signal,
      });
      return res;
    } catch (err) {
      lastError = err;
      if (axios.isCancel(err)) throw err;
      if (attempt < maxRetries && isRetryableError(err)) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

//  MAIN FUNCTION
/**
 * @param {string} userMessage
 * @param {Array} messageHistory
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @param {string} [sessionId] - Optional session id from a previous chat response (for continuing conversation).
 */
export async function sendToGemini(userMessage, messageHistory = [], signal = undefined, sessionId = undefined) {
  const headers = getHeaders();
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }

  /** Deciding factor: only show chart when user explicitly asked for a graph/chart/plot/visual. */
  const userAskedForGraph = /graph|chart|plot|visual|visualize/i.test(userMessage);

  let finalData = {};
  let lastToolName = null;
  let lastToolArgs = null;

  try {
    // genai/chat API expects { session_id?, parts: [{ text }], tools } (same as Postman)
    const payload = {
      parts: [{ text: userMessage }],
      tools,
    };
    if (sessionId != null && sessionId !== "") {
      payload.session_id = sessionId;
    }
    let response;
    response = await postToGemini(GENAI_CHAT_URL, payload, headers, 3, signal);

    // genai API can return function_call for tools; support both genai format and Gemini candidates
    let parts = [...payload.parts];
    let currentSessionId = sessionId != null && sessionId !== "" ? sessionId : (response?.data?.session_id ?? null);

    while (true) {
      const candidatesParts = response?.data?.candidates?.[0]?.content?.parts;
      const genaiFunctionCall = response?.data?.function_call;
      const functionCalls = candidatesParts?.filter((p) => p.functionCall) || [];
      const fromGenai = genaiFunctionCall && (typeof genaiFunctionCall.name === "string" || genaiFunctionCall.name != null);
      const allCalls = fromGenai ? [{ functionCall: genaiFunctionCall }] : functionCalls;

      if (!allCalls.length) break;

      for (const func of allCalls) {
        const { name, args } = func.functionCall || func;

        if (!functions[name]) throw new Error(`Function ${name} not defined`);

        const result = await functions[name](args || {});

        lastToolName = name;
        lastToolArgs = args || {};
        finalData = result;

        parts.push({ function_call: { name, args: args || {} } });
        parts.push({ function_response: { name, response: result } });
      }

      const nextPayload = { parts, tools };
      if (currentSessionId != null && currentSessionId !== "") {
        nextPayload.session_id = currentSessionId;
      }
      const sidFromRes = response?.data?.session_id;
      if (sidFromRes != null && sidFromRes !== "") {
        currentSessionId = sidFromRes;
        nextPayload.session_id = sidFromRes;
      }

      response = await postToGemini(GENAI_CHAT_URL, nextPayload, headers, 3, signal);
    }

    const sessionIdFromApi = response?.data?.session_id ?? currentSessionId ?? null;
    const finalText =
      response?.data?.text ??
      (response?.data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        ?.join("") || FALL_BACK_MSG);

    const hasChartToolData = lastToolName === "sc_graph" || lastToolName === "gl_graph" || lastToolName === "gl_report" || lastToolName === "get_gl_report";
    let chartPayload =
      lastToolName === "gl_report" && finalData?.data != null
        ? finalData.data
        : lastToolName === "gl_graph" && finalData != null
          ? { ...(finalData.data || finalData), glChart: true }
          : lastToolName === "get_gl_report" && finalData?.data != null
            ? { ...finalData.data, glChart: true }
            : finalData;
    if (chartPayload?.data && (chartPayload.data.rep != null || chartPayload.data.items != null)) {
      chartPayload = { ...chartPayload.data, glChart: chartPayload.glChart || chartPayload.data.glChart };
    }
    // GL graph API may return { graph: { rep, dt1, dt2, begAmt, endAmt, ... } } – unwrap so chart builder sees rep at top level
    if (chartPayload?.graph && typeof chartPayload.graph === "object") {
      chartPayload = { ...chartPayload.graph, glChart: chartPayload.glChart ?? true };
    }
    // Cap GL rep size so specific-account requests with huge result don't freeze the UI
    if (chartPayload && Array.isArray(chartPayload.rep) && chartPayload.rep.length > GL_REP_MAX_ROWS) {
      chartPayload = { ...chartPayload, rep: chartPayload.rep.slice(-GL_REP_MAX_ROWS) };
    }
    // Ensure GL summary-only (no rep) still has rep array and glChart for chart builder
    if (chartPayload && chartPayload.glChart && chartPayload.rep === undefined) {
      chartPayload = { ...chartPayload, rep: [] };
    }
    // Use requested year/dt1/dt2 so chart shows correct year and includes that year's data (API response often doesn't include these)
    if (chartPayload && (lastToolName === "gl_graph" || lastToolName === "gl_report" || lastToolName === "get_gl_report") && lastToolArgs) {
      const dt1 = lastToolArgs.dt1 ?? chartPayload.dt1;
      const dt2 = lastToolArgs.dt2 ?? chartPayload.dt2;
      const yearFromDt1 = dt1 != null && /^\d{4}/.test(String(dt1)) ? parseInt(String(dt1).slice(0, 4), 10) : null;
      const requestedYear = lastToolArgs.year ?? yearFromDt1 ?? chartPayload.year;
      if (dt1 != null) chartPayload = { ...chartPayload, dt1 };
      if (dt2 != null) chartPayload = { ...chartPayload, dt2 };
      if (requestedYear != null && Number.isFinite(requestedYear)) chartPayload = { ...chartPayload, year: requestedYear };
      if (lastToolArgs.ixAcc != null) chartPayload = { ...chartPayload, ixAcc: lastToolArgs.ixAcc };
    }

    // Only return chart when user explicitly asked for a graph (deciding factor).
    if (userAskedForGraph && chartPayload && chartPayload.status !== "error") {
      try {
        if (isLikelyChartData(chartPayload)) {
          return { type: "chart", data: chartPayload, text: CHART_REPLY_TEXT, session_id: sessionIdFromApi };
        }
      } catch (chartErr) {
        console.warn("Chart build failed:", chartErr);
      }
    }

    // When user did not ask for graph but we have report/graph data: return text and suggest graph.
    if (!userAskedForGraph && hasChartToolData && finalText) {
      return { type: "text", text: finalText + ASK_FOR_GRAPH_SUGGESTION, session_id: sessionIdFromApi };
    }

    // If user asked for a GL graph but Gemini responded with text (no tool call),
    // fetch the graph directly so we display ONLY the chart.
    const wantsGLGraph =
      userAskedForGraph &&
      /(general\s*ledger|\bgl\b|ledger)/i.test(userMessage || "");
    if (wantsGLGraph && (lastToolName == null || lastToolName === "gl_report" || lastToolName === "get_gl_report")) {
      const yearMatch = String(userMessage || "").match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
      const dt1 = `${year}-01-01T00:00:00+08:00`;
      const dt2 = `${year}-12-31T23:59:59+08:00`;
      try {
        const raw = await functions.gl_graph({ dt1, dt2 });
        const payload = raw && raw.status !== "error" ? { ...(raw.data || raw), glChart: true, dt1, dt2, year } : null;
        if (payload && isLikelyChartData(payload)) {
          return { type: "chart", data: payload, text: CHART_REPLY_TEXT, session_id: sessionIdFromApi };
        }
      } catch (e) {
        // fall through to text response below
      }
    }
    if (userAskedForGraph && finalText) {
      // If the model returns raw chart JSON as text, keep it so the UI can render the graph.
      return { type: "text", text: finalText, session_id: sessionIdFromApi };
    }

    return { type: "text", text: finalText, session_id: sessionIdFromApi };
  } catch (err) {
    console.error("Gemini error:", err);
    const status = err.response?.status;
    const is504 = status === 504 || /504|gateway timeout/i.test(String(err.message || err.code));
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
