/**
 * Chat orchestration: intent → context → payload → AI gateway → normalized response.
 * When the model returns function calls, we execute tools and send results back until we get text.
 */

import { getBizIxBiz } from "../selectedBiz.js";
import { setBiz } from "../domain/selectBiz.js";
import { getIntent } from "./intent.js";
import { loadContextForIntent, buildUserTextWithContext } from "./context.js";
import { normalizeAiResponse, getResponseParts } from "./response.js";
import { sendGeminiRequest } from "../ai/aiGateway.js";
import { tools } from "../config/geminiTools.js";
import { runTool } from "../services/geminiToolRunner.js";

const MAX_TOOL_ROUNDS = 5;

/** Build Gemini payload tools shape: { functionDeclarations: [...] } */
function getGeminiToolsPayload() {
  return [{ functionDeclarations: tools }];
}

function getAuthToken() {
  return typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
}

/**
 * Single entry for chat: preload context, inject into payload, call /api/ai/gemini (with tool loop), return normalized shape.
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
  const context = await loadContextForIntent(intent, authToken || undefined, userMessage);
  const userText = buildUserTextWithContext(userMessage, context, intent);

  let contents = [
    {
      role: "user",
      parts: [{ text: userText }],
    },
  ];
  const payloadBase = { tools: getGeminiToolsPayload() };
  const headers = authToken ? { "x-access-tokens": authToken } : {};
  let status = 200;
  let data = null;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const payload = { ...payloadBase, contents };
    const res = await sendGeminiRequest(payload, headers);
    status = res.status;
    data = res.data;

    const parts = getResponseParts(data);
    if (!parts || parts.length === 0) break;

    const functionCalls = parts.filter((p) => p?.functionCall?.name);
    if (functionCalls.length === 0) break;

    const modelTurn = { role: "model", parts };
    const functionResponseParts = [];
    for (const part of functionCalls) {
      const fc = part.functionCall;
      const name = fc.name;
      const args = fc.args && typeof fc.args === "object" ? fc.args : {};
      const result = await runTool(name, args, { authToken });
      functionResponseParts.push({
        functionResponse: {
          name,
          response: result,
        },
      });
    }
    contents = [
      ...contents,
      modelTurn,
      {
        role: "user",
        parts: functionResponseParts,
      },
    ];
  }

  const normalized = normalizeAiResponse(status, data);
  return normalized;
}
