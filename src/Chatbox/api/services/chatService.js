
import { sendToGemini } from "./geminiService.js";
const FALLBACK_MESSAGE = "Sorry, something went wrong. Please try again.";

/**
 * Send user message to AI (genai/chat) via geminiService.
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @param {string} [sessionId] - Optional session id from a previous response (continues conversation).
 * @returns {Promise<{ type: "text" | "chart", text: string, data?: object, session_id?: string }>}
 */
export async function sendMessage(userMessage, messageHistory = [], signal = undefined, sessionId = undefined) {
  try {
    const result = await sendToGemini(userMessage, messageHistory, signal, sessionId);
    if (result && (result.text != null || result.type != null)) {
      return {
        type: result.type || "text",
        text: result.text ?? FALLBACK_MESSAGE,
        data: result.data,
        session_id: result.session_id,
      };
    }
    return { type: "text", text: result?.text ?? FALLBACK_MESSAGE, session_id: result?.session_id };
  } catch (err) {
    console.error(err);
    return { type: "text", text: FALLBACK_MESSAGE };
  }
}
