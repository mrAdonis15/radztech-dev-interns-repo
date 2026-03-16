import axios from "axios";
import { getHeaders } from "./tools.js";
import { getLegacyUrls } from "../config/endpoints.js";

/** Header value so DevTools Network shows which requests are chat-history */
const CHAT_HISTORY_HEADER = "chat-history";

function getChatHistoryUrl() {
  return getLegacyUrls().genaiChatHistory;
}

function withChatHistoryHeaders(headers) {
  return {
    "Content-Type": "application/json",
    ...headers,
    "X-Endpoint": CHAT_HISTORY_HEADER,
  };
}

/**
 * @param {string} sessionId - Session id returned by the genai/chat endpoint
 * @param {{ title?: string, messages?: Array }} [payload] - Optional title and messages to store
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<{ success?: boolean, data?: unknown }>}
 */
export async function saveChatHistory(sessionId, payload = {}, signal = undefined) {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    return { success: false };
  }
  const headers = withChatHistoryHeaders(getHeaders());
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }
  const body = {
    session_id: sessionId.trim(),
    ...(payload.title != null && { title: payload.title }),
    ...(Array.isArray(payload.messages) && { messages: payload.messages }),
  };
  const url = getChatHistoryUrl();
  try {
    const res = await axios.post(url, body, {
      headers: { ...headers, "X-Request-Name": "chat-history" },
      timeout: 15000,
      signal,
    });
    return { success: true, data: res.data };
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.warn("[chatHistoryService] saveChatHistory failed:", err?.message || err);
    return { success: false, error: err?.response?.data ?? err?.message };
  }
}

/**
 * Map server history list entry to app history item format.
 * @param {object} item - { session_id?, id?, title?, created_at?, createdAt? }
 * @param {number} index
 * @returns {{ id: string, title: string, sessionId?: string, createdAt: number }}
 */
export function mapServerHistoryItem(item, index) {
  if (!item || typeof item !== "object") return null;
  const sessionId = item.session_id ?? item.sessionId ?? "";
  const id = item.id ?? (sessionId || `server-${index}`);
  const title = item.title ?? "Chat";
  const createdAt = item.created_at ?? item.createdAt ?? Date.now();
  return {
    id: String(id),
    title: String(title),
    ...(sessionId && { sessionId: String(sessionId) }),
    createdAt: typeof createdAt === "number" ? createdAt : new Date(createdAt).getTime(),
  };
}

/**
 * Fetch chat history list from the server.
 * Tries POST with body { list: true } so same account sees same sidebar in another browser.
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Array>} List of history items (raw; use mapServerHistoryItem for app format)
 */
export async function getChatHistoryList(signal = undefined) {
  const headers = withChatHistoryHeaders(getHeaders());
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }
  try {
    const res = await axios.post(
      getChatHistoryUrl(),
      { list: true },
      {
        headers: { ...headers, "X-Request-Name": "chat-history" },
        timeout: 10000,
        signal,
      }
    );
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data != null && typeof data === "object" && Array.isArray(data.items)) return data.items;
    if (data != null && typeof data === "object" && Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.warn("[chatHistoryService] getChatHistoryList failed:", err?.message || err);
    return [];
  }
}
export async function getChatHistoryBySessionId(sessionId, signal = undefined) {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    return [];
  }
  const headers = withChatHistoryHeaders(getHeaders());
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }
  const body = { session_id: sessionId.trim() };
  try {
    const res = await axios.post(getChatHistoryUrl(), body, {
      headers: { ...headers, "X-Request-Name": "chat-history" },
      timeout: 10000,
      signal,
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data != null && typeof data === "object" && Array.isArray(data.data)) return data.data;
    if (data != null && typeof data === "object" && Array.isArray(data.messages)) return data.messages;
    return [];
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.warn("[chatHistoryService] getChatHistoryBySessionId failed:", err?.message || err);
    return [];
  }
}

/**
 * True if text looks like a function_response JSON (should not be shown as user message).
 */
function isFunctionResponseText(text) {
  if (!text || typeof text !== "string") return false;
  const t = text.trim();
  return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

/**
 * Build chart message data from chart_renderer function_call args.
 * @param {object} args - { chartType, data, options }
 * @returns {{ chartType: string, data: object, options: object } | null}
 */
function chartDataFromChartRendererArgs(args) {
  if (!args || typeof args !== "object") return null;
  const chartType = args.chartType;
  const data = args.data;
  const options = args.options;
  if (!chartType || !data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return null;
  return { chartType, data, options: options || {} };
}

/**
 * Try to build chart message data from a JSON text payload.
 * Expects shape like: { type: "chart", chartType, data, options? }.
 * @param {string} text
 * @returns {{ chartType: string, data: object, options: object } | null}
 */
function chartDataFromTextIfAny(text) {
  if (!text || typeof text !== "string") return null;
  if (!isFunctionResponseText(text)) return null;
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.type !== "chart") return null;
    const chartType = parsed.chartType;
    const data = parsed.data;
    const options = parsed.options;
    if (!chartType || !data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return null;
    return { chartType, data, options: options || {} };
  } catch {
    return null;
  }
}

/**
 * Try to build image message data from a JSON text payload.
 * Expects shape like: { type: "img", images: string[] }.
 * @param {string} text
 * @returns {{ images: string[] } | null}
 */
function imgDataFromTextIfAny(text) {
  if (!text || typeof text !== "string") return null;
  if (!isFunctionResponseText(text)) return null;
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.type !== "img" || !Array.isArray(parsed.images)) return null;
    const images = parsed.images.filter(
      (u) => typeof u === "string" && u.trim().length > 0,
    );
    if (images.length === 0) return null;
    return { images };
  } catch {
    return null;
  }
}

/**
 * Map API history format to app message format.
 * API: { parts: [{ text?, function_call?, function_response?, ... }], role: "user"|"model" } -> App: { id, sender, text, time } or { id, sender, type: "chart", data, time }
 * Uses last part with non-empty text; for model with only function_call shows placeholder.
 * For model parts with function_call name "chart_renderer", emits a chart message so the UI shows the graph.
 * Skips "user" entries that are only function_response JSON so sidebar/chat shows clean conversation.
 */
function mapHistoryPartsToMessages(apiMessages) {
  if (!Array.isArray(apiMessages) || apiMessages.length === 0) return [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  const result = [];
  apiMessages.forEach((entry, index) => {
    const parts = entry.parts || [];
    if (entry.role === "user") {
      const withText = parts.filter((p) => p != null && p.text != null && String(p.text).trim() !== "");
      const textPart = withText.length > 0 ? withText[withText.length - 1] : null;
      const text = textPart ? String(textPart.text).trim() : "";
      // If this user entry is actually structured JSON (chart/img), emit a typed message instead of raw JSON text.
      if (isFunctionResponseText(text)) {
        const chartData = chartDataFromTextIfAny(text);
        const imgData = chartData ? null : imgDataFromTextIfAny(text);
        if (chartData || imgData) {
          // If the immediately previous entry already produced a chart (e.g. via chart_renderer),
          // skip to avoid creating a duplicate chart message.
          const prev = index > 0 ? apiMessages[index - 1] : null;
          const prevHasChartRenderer =
            prev &&
            prev.role === "model" &&
            Array.isArray(prev.parts) &&
            prev.parts.some(
              (p) =>
                p != null &&
                p.function_call != null &&
                p.function_call.name === "chart_renderer",
            );
          if (!prevHasChartRenderer) {
            if (chartData) {
              result.push({
                id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
                sender: "bot",
                type: "chart",
                data: chartData,
                text: "",
                time: timeStr,
              });
            } else if (imgData) {
              result.push({
                id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
                sender: "bot",
                type: "img",
                data: imgData,
                text: "",
                time: timeStr,
              });
            }
          }
        }
        return;
      }
      result.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
        sender: "me",
        text,
        time: timeStr,
      });
      return;
    }
    if (entry.role === "model") {
      // Prefer explicit chart_renderer tool calls.
      const chartPart = parts.find(
        (p) => p != null && p.function_call != null && p.function_call.name === "chart_renderer",
      );
      if (chartPart && chartPart.function_call.args) {
        const chartData = chartDataFromChartRendererArgs(chartPart.function_call.args);
        if (chartData) {
          result.push({
            id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
            sender: "bot",
            type: "chart",
            data: chartData,
            text: "",
            time: timeStr,
          });
          return;
        }
      }
      // Otherwise, see if the model text itself is chart JSON.
      const withText = parts.filter((p) => p != null && p.text != null && String(p.text).trim() !== "");
      const textPart = withText.length > 0 ? withText[withText.length - 1] : null;
      let text = textPart ? String(textPart.text).trim() : "";
      const chartFromText = chartDataFromTextIfAny(text);
      if (chartFromText) {
        result.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
          sender: "bot",
          type: "chart",
          data: chartFromText,
          text: "",
          time: timeStr,
        });
        return;
      }
      const imgFromText = imgDataFromTextIfAny(text);
      if (imgFromText) {
        result.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
          sender: "bot",
          type: "img",
          data: imgFromText,
          text: "",
          time: timeStr,
        });
        return;
      }
      if (!text) {
        const hasFunctionCall = parts.some((p) => p != null && p.function_call != null);
        if (hasFunctionCall) text = "...";
      }
      result.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
        sender: "bot",
        text,
        time: timeStr,
      });
    }
  });
  return result;
}

/**
 * Fetch chat history by session_id and return messages in app format.
 * @param {string} sessionId
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{ id: string, sender: string, text: string, time: string }>>}
 */
export async function fetchChatHistoryBySessionId(sessionId, signal = undefined) {
  const raw = await getChatHistoryBySessionId(sessionId, signal);
  return mapHistoryPartsToMessages(raw);
}

/**
 * Check if a value looks like API format (has parts + role).
 */
function isApiHistoryEntry(entry) {
  return (
    entry != null &&
    typeof entry === "object" &&
    Array.isArray(entry.parts) &&
    typeof entry.role === "string"
  );
}

/**
 * Normalize to display format. If messages are in API format (parts/role), convert them.
 * Use this before setMessages() so the UI never shows raw API JSON.
 * App-format messages are returned as-is so chart messages keep type and data for graphing.
 * @param {Array} messages - Either API format [{ parts, role }] or app format [{ id, sender, text, time?, type?, data? }]
 * @returns {Array<{ id: string, sender: string, text: string, time?: string, type?: string, data?: object }>}
 */
export function normalizeToDisplayMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return [];
  if (isApiHistoryEntry(messages[0])) {
    return mapHistoryPartsToMessages(messages);
  }
  return messages;
}
