import axios from "axios";
import { getHeaders } from "./tools.js";
import { getLegacyUrls } from "../config/endpoints.js";

/** Header value so DevTools Network shows which requests are chat-history */
const CHAT_HISTORY_HEADER = "chat-history";

function getChatHistoryUrl() {
  return getLegacyUrls().genaiChatHistory;
}

function withChatHistoryHeaders(headers) {
  return { ...headers, "X-Endpoint": CHAT_HISTORY_HEADER };
}

/**
 * Save chat history to the server with the session id from the chat endpoint.
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
  try {
    const res = await axios.post(getChatHistoryUrl(), body, {
      headers,
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
 * Fetch chat history list from the server (if the endpoint supports GET).
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Array>} List of history items from the API
 */
export async function getChatHistory(signal = undefined) {
  const headers = withChatHistoryHeaders(getHeaders());
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }
  try {
    const res = await axios.get(getChatHistoryUrl(), { headers, timeout: 10000, signal });
    const data = res.data;
    return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.warn("[chatHistoryService] getChatHistory failed:", err?.message || err);
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
      headers,
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
 * Map API history format to app message format.
 * API: { parts: [{ text?, function_call?, ... }], role: "user"|"model" } -> App: { id, sender, text, time }
 * Uses last part with non-empty text; for model with only function_call shows placeholder.
 */
function mapHistoryPartsToMessages(apiMessages) {
  if (!Array.isArray(apiMessages) || apiMessages.length === 0) return [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  return apiMessages.map((entry, index) => {
    const parts = entry.parts || [];
    const withText = parts.filter((p) => p != null && p.text != null && String(p.text).trim() !== "");
    const textPart = withText.length > 0 ? withText[withText.length - 1] : null;
    let text = textPart ? String(textPart.text).trim() : "";
    if (!text && entry.role === "model") {
      const hasFunctionCall = parts.some((p) => p != null && p.function_call != null);
      if (hasFunctionCall) text = "...";
    }
    const sender = entry.role === "user" ? "me" : "bot";
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${index}`,
      sender,
      text,
      time: timeStr,
    };
  });
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
 * @param {Array} messages - Either API format [{ parts, role }] or app format [{ id, sender, text, time }]
 * @returns {Array<{ id: string, sender: string, text: string, time?: string }>}
 */
export function normalizeToDisplayMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return [];
  if (isApiHistoryEntry(messages[0])) {
    return mapHistoryPartsToMessages(messages);
  }
  return messages;
}
