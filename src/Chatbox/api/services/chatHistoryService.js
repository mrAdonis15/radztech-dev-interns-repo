import axios from "axios";
import { getHeaders } from "./tools.js";
import { getLegacyUrls } from "../config/endpoints.js";

function getChatHistoryUrl() {
  return getLegacyUrls().genaiChatHistory;
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
  const headers = getHeaders();
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
  const headers = getHeaders();
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

/**
 * Fetch conversation for a session from chat-history. Request body: { session_id }.
 * API returns array of { parts: [{ text, ... }], role: "user" | "model" }.
 * @param {string} sessionId - Session id from the chat endpoint
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Array<{ parts: Array<{ text?: string }>, role: string }>>} Raw API format
 */
export async function getChatHistoryBySessionId(sessionId, signal = undefined) {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    return [];
  }
  const headers = getHeaders();
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
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.warn("[chatHistoryService] getChatHistoryBySessionId failed:", err?.message || err);
    return [];
  }
}

/**
 * Map API history format to app message format.
 * API: { parts: [{ text }], role: "user"|"model" } -> App: { id, sender: "me"|"bot", text, time }
 */
function mapHistoryPartsToMessages(apiMessages) {
  if (!Array.isArray(apiMessages) || apiMessages.length === 0) return [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  return apiMessages.map((entry, index) => {
    const parts = entry.parts || [];
    const textPart = parts.find((p) => p != null && (p.text != null && p.text !== ""));
    const text = textPart ? String(textPart.text) : "";
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
