

import { sendMessage } from "../chatService/chatFlow.js";
import { tools } from "../config/geminiTools.js";

/**
 * Tool definitions for /api/ai/gemini payload (sent alongside contents).
 */
export { tools };

export async function sendToGemini(userMessage, messageHistory) {
  return sendMessage(userMessage, messageHistory);
}
