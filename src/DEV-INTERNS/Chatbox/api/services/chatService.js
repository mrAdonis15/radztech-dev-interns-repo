import { sendToGemini } from "./geminiService.js";
import { sendToPythonBot } from "./pythonBotService.js";
const FALLBACK_MESSAGE = "Sorry, something went wrong. Please try again.";

/**
 * Send user message to AI (genai/chat) via geminiService.
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the request.
 * @param {string} [sessionId] - Optional session id from a previous response (continues conversation).
 * @returns {Promise<{ type: "text" | "chart", text: string, data?: object, session_id?: string }>}
 */
export async function sendMessage(
  userMessage,
  messageHistory = [],
  signal = undefined,
  sessionId = undefined,
  aiProvider = "ulap",
) {
  try {
    const normalizedProvider = String(aiProvider || "ulap").toLowerCase();
    const result =
      normalizedProvider === "python"
        ? await sendToPythonBot(userMessage, signal)
        : await sendToGemini(userMessage, messageHistory, signal, sessionId);

    console.log("chat-service", result);

    return result;
  } catch (err) {
    console.error(err);
    return { type: "text", text: FALLBACK_MESSAGE };
  }
}
