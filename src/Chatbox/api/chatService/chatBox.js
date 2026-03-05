/**
 * Chat orchestration: intent → context → payload → AI gateway → normalized response. Depends on: intent, context, response, aiGateway, selectBiz, selectedBiz.
 */

import { getBizIxBiz } from "../selectedBiz.js";
import { setBiz } from "../domain/selectBiz.js";
import { getIntent } from "./intent.js";
import { loadContextForIntent, buildUserTextWithContext } from "./context.js";
import { normalizeAiResponse } from "./response.js";
import { sendGeminiRequest } from "../ai/aiGateway.js";

function getAuthToken() {
  return typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
}

/**
 * Single entry for chat: preload context, inject into payload, call /api/ai/gemini, return normalized shape.
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
  const intent = getIntent(userMessage);
  const context = await loadContextForIntent(intent, authToken || undefined);
  const userText = buildUserTextWithContext(userMessage, context, intent);
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
  };
  const headers = authToken ? { "x-access-tokens": authToken } : {};
  const { status, data } = await sendGeminiRequest(payload, headers);
  return normalizeAiResponse(status, data);
}
