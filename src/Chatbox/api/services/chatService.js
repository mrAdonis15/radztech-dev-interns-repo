/**
 * Chat service: single entry for chat. Sends user message to geminiService (api/ai/gemini) only.
 */

import { getBizIxBiz } from "../selectedBiz.js";
import { setBiz } from "../domain/selectBiz.js";
import { sendToGemini } from "./geminiService.js";

const FALLBACK_MESSAGE = "Sorry, something went wrong. Please try again.";

function getAuthToken() {
  return typeof localStorage !== "undefined"
    ? localStorage.getItem("authToken")
    : null;
}

/**
 * Send user message to AI (api/ai/gemini) via geminiService. Optionally sets biz first.
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<{ type: "text" | "chart", text: string, data?: object }>}
 */
export async function sendMessage(userMessage, messageHistory = []) {
  const authToken = getAuthToken();
  const ccode = getBizIxBiz();
  if (ccode != null && authToken) {
    const res = await setBiz(authToken, String(ccode));
    if (res.status < 200 || res.status >= 300) {
      // optional: log
    }
  }

  try {
    const result = await sendToGemini(userMessage, messageHistory);
    if (result && (result.text != null || result.type != null)) {
      return {
        type: result.type || "text",
        text: result.text ?? "",
        data: result.data,
      };
    }
    return { type: "text", text: result?.text ?? FALLBACK_MESSAGE };
  } catch (err) {
    console.error(err);
    return { type: "text", text: FALLBACK_MESSAGE };
  }
}
