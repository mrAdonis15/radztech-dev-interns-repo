
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];

/**

 * @param {string} userMessage 
 * @param {Array<{ sender: string, text: string }>} [messageHistory] 
 * @returns {Promise<string>} 
 */
export async function sendToGemini(userMessage, messageHistory) {
  if (!apiKey) {
    return "Gemini is not configured. Please set REACT_APP_GEMINI_API_KEY in your .env file.";
  }

  const systemContext =
    "You are a helpful support assistant for Ulap Biz chat. There is no Ulap Biz–specific data yet, so answer all questions in a friendly, helpful way based on general knowledge. Be concise and clear.";

  function buildPrompt(history, current, context) {
    let text = context + "\n\n";
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-10);
      recent.forEach((m) => {
        const role = m.sender === "me" ? "User" : "Assistant";
        text += role + ": " + m.text + "\n";
      });
    }
    text += "User: " + current + "\nAssistant:";
    return text;
  }

  const prompt = buildPrompt(messageHistory, userMessage, systemContext);
  const genAI = new GoogleGenerativeAI(apiKey);

  let lastError = null;
  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      });

      const result = await model.generateContent(prompt);
      const response = result.response;

      if (!response) {
        lastError = new Error("No response from model");
        continue;
      }

      if (response.candidates && response.candidates.length > 0) {
        const c = response.candidates[0];
        if (c.finishReason && c.finishReason !== "STOP" && c.finishReason !== "MAX_TOKENS") {
          lastError = new Error("Response blocked or incomplete: " + (c.finishReason || ""));
          continue;
        }
      }

      try {
        if (response.text) {
          const reply = typeof response.text === "function" ? response.text() : response.text;
          if (reply != null && String(reply).trim()) return String(reply).trim();
        }
      } catch (e) {
        lastError = e;
        continue;
      }
      lastError = new Error("Empty reply from model");
    } catch (err) {
      lastError = err;
      console.warn("Gemini model " + modelName + " failed:", err);
    }
  }

  console.error("Gemini API error (all models failed):", lastError);
  const msg = lastError && lastError.message ? lastError.message : String(lastError);
  if (msg.includes("API key") || msg.includes("403") || msg.includes("401")) {
    return "API key is invalid or missing. Check REACT_APP_GEMINI_API_KEY.";
  }
  if (msg.includes("blocked") || msg.includes("SAFETY")) {
    return "Your message or the reply was blocked by safety filters. Try rephrasing.";
  }
  if (msg.includes("quota") || msg.includes("429") || msg.includes("resource_exhausted")) {
    return "Rate limit or quota exceeded. Please try again later.";
  }
  if (msg.includes("network") || msg.includes("Failed to fetch") || msg.includes("CORS")) {
    return "Network error. Check your connection or try again later.";
  }
  return "Something went wrong: " + (msg.length > 80 ? msg.slice(0, 80) + "…" : msg);
}
