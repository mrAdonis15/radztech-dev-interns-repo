import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";

/**
 * Send the user's question to the /api/ai/gemini backend. Returns the same shape as sendToGemini.
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<string|{ type: 'text', text: string }|{ type: 'chart', data: object, text: string }>}
 */
async function sendToGeminiViaApi(userMessage, messageHistory) {
  const url = buildUrl(endpoints.gemini.chat);
  const { status, data } = await request(url, {
    method: "POST",
    body: { message: userMessage, history: messageHistory || [] },
  });
  if (status !== 200) {
    const errMsg = data?.message ?? data?.error ?? (typeof data === "string" ? data : "Request failed.");
    throw new Error(errMsg);
  }
  if (data == null) return "No response from AI.";
  if (typeof data === "string") return data;
  if (data.type === "chart" && data.data) {
    return { type: "chart", data: data.data, text: data.text ?? "" };
  }
  return { type: "text", text: data.text ?? data.message ?? String(data) };
}

/**
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<string|{ type: 'text', text: string }|{ type: 'chart', data: object, text: string }>}
 */
export async function sendToGemini(userMessage, messageHistory) {
  try {
    return await sendToGeminiViaApi(userMessage, messageHistory);
  } catch (err) {
    const msg = err?.message ?? String(err ?? "Request failed.");
    return msg;
  }
}
