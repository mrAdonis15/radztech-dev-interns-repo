/**
 * Python-based AI service for the chatbot
 * Replaces Gemini API with local trained AI chatbot
 */

import { getSiteContext } from "./siteContextService";

// Configure the Python backend URL
const PYTHON_AI_BACKEND =
  process.env.REACT_APP_PYTHON_AI_URL || "http://localhost:5000";

/**
 * Send message to Python AI backend
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<string|{ type: 'text', text: string }>}
 */
async function sendToPythonAI(userMessage, messageHistory) {
  try {
    const url = `${PYTHON_AI_BACKEND}/api/chat`;

    let siteContext;
    try {
      siteContext = await getSiteContext();
    } catch (siteErr) {
      console.warn(
        "[pythonAIService] siteContext unavailable:",
        siteErr?.message || siteErr,
      );
      siteContext = undefined;
    }

    const payload = {
      message: userMessage,
      history: messageHistory || [],
      ...(siteContext ? { siteContext } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    const payloadData =
      data &&
      typeof data === "object" &&
      data.data &&
      typeof data.data === "object"
        ? data.data
        : data;

    // Handle response format
    if (payloadData == null) return "No response from AI.";
    if (typeof payloadData === "string") return payloadData;

    // Handle chart response
    if (payloadData.type === "chart") {
      return {
        type: "chart",
        chartType: payloadData.chartType || "bar",
        title: payloadData.title || "Chart",
        chartData: payloadData.chartData || { labels: [], datasets: [] },
        text: payloadData.text || payloadData.response || "",
      };
    }

    // Handle text response
    if (payloadData.response) return payloadData.response;
    if (payloadData.text) return payloadData.text;

    return "No response from AI.";
  } catch (err) {
    const msg = err?.message ?? String(err ?? "Request failed.");
    console.error("[pythonAIService] Error:", msg);
    return msg;
  }
}

/**
 * Main export - compatible with previous Gemini interface
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<string|{ type: 'text', text: string }>}
 */
export async function sendToAI(userMessage, messageHistory) {
  return await sendToPythonAI(userMessage, messageHistory);
}

// Export for backward compatibility if code references sendToGemini
export { sendToPythonAI as sendToGemini };
