import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProductsContext, getProductStats, getValidProductNames, loadProducts } from "./productService.js";
import { buildChartFromSpec } from "./chatboxUtils.js";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
const modelNames = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
];

const functions = {
  displayChart: (opts) => buildChartFromSpec(opts),
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "displayChart",
        description:
          "Display Stock Card data as a chart. Use when user asks for Stock Card report, visualization, or graph. Use data from the STOCK CARD (products with balance, stock in, stock out).",
        parameters: {
          type: "OBJECT",
          properties: {
            chartType: {
              type: "STRING",
              description: "One of: line, bar, pie",
              enum: ["line", "bar", "pie"],
            },
            title: {
              type: "STRING",
              description: "Chart title (e.g. 'Top 5 Products by Balance')",
            },
            labels: {
              type: "STRING",
              description: "JSON array of category names, e.g. [\"Product A\", \"Product B\"]",
            },
            datasets: {
              type: "STRING",
              description:
                "JSON array of {label: string, data: number[]}. Each object has label (series name) and data (values matching labels order).",
            },
          },
          required: ["chartType", "labels", "datasets"],
        },
      },
    ],
  },
];

/**
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<string|{ type: 'text', text: string }|{ type: 'chart', data: object, text: string }>}
 */
export async function sendToGemini(userMessage, messageHistory) {
  if (!apiKey) {
    return "Gemini is not configured. Please set REACT_APP_GEMINI_API_KEY in your .env file.";
  }

  await loadProducts();

  const stats = getProductStats();
  const validNames = getValidProductNames();
  const validNamesList = validNames.length ? validNames.join(", ") : "(none)";
  const productContext = `\n\n=== STOCK CARD (Product Database) ===\nThis is the primary report source. Stock Card = product inventory with balance, stock in, stock out.\n\nVALID PRODUCT NAMES (EXACT MATCH ONLY - use these names verbatim, no variations):\n${validNamesList}\n\nSTRICT RULE: Do NOT assume 'Honda Wave' = 'Wave', 'Aerox' = 'Aerox v2', etc. If the user says 'Honda Wave' and the list has 'Wave', respond that 'Honda Wave' was NOT FOUND. Only names in the list above are valid.\n\n${getProductsContext()}\n\nSTATISTICS:\n- Total Products: ${stats.totalProducts}\n- Categories: ${stats.categories.map((c) => `${c.name} (${c.count})`).join(", ")}\n- Total Inventory Value: $${stats.totalInventoryValue.toLocaleString()}\n- Total Stock Units: ${stats.totalStockUnits}\n========================\n\n`;

  const systemContext =
    "You are a helpful support assistant for Ulap Biz. " +
    "PRIORITY REPORT: Stock Card — when users ask for Stock Card, report, or data visualization, use the STOCK CARD data above (products with balance, stock in, stock out). " +
    "CRITICAL - STRICT PRODUCT MATCHING: Only respond with data for products whose name appears EXACTLY in the VALID PRODUCT NAMES list. " +
    "Do NOT infer variations (e.g. 'Honda Wave' is NOT 'Wave'). If a product name is not in the list, respond that it was not found. " +
    "When displaying charts, use ONLY product names from the list. " +
    "Be concise, friendly, and accurate. Choose chartType: bar for comparisons, pie for proportions, line for trends." +
    productContext;

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
          maxOutputTokens: 2048,
          temperature: 0.5,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
        tools,
      });

      const chat = model.startChat();
      let result = await chat.sendMessage(prompt);
      let response = result.response;

      if (!response) {
        lastError = new Error("No response from model");
        continue;
      }

      const functionCallPart = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.functionCall
      );

      if (functionCallPart) {
        const { name, args } = functionCallPart.functionCall;
        if (!functions[name]) {
          lastError = new Error(`Function ${name} is not defined`);
          continue;
        }
        const parsedArgs = args || {};
        const functionResult = functions[name](parsedArgs);

        if (functionResult?.rejected) {
          return { type: "text", text: functionResult.reason };
        }
        if (!functionResult) {
          const textPart = response.candidates?.[0]?.content?.parts?.find((p) => p.text);
          const t = textPart?.text;
          const fallbackText = (typeof t === "function" ? t() : t) || "No data available for that chart.";
          return { type: "text", text: fallbackText };
        }

        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name,
              response: { content: functionResult },
            },
          },
        ]);

        const followT = followUp.response.text;
        const followUpText = typeof followT === "function" ? followT() : followT ?? "";
        const replyText = String(followUpText || "").trim() || "Here's the chart you requested.";

        if (functionResult.chartType && functionResult.labels && functionResult.datasets) {
          return { type: "chart", data: functionResult, text: replyText };
        }
        return { type: "text", text: replyText };
      }

      const textPart = response.candidates?.[0]?.content?.parts?.find((p) => p.text);
      const textVal = textPart?.text ?? response?.text;
      const rawText = typeof textVal === "function" ? textVal() : textVal;
      const text = rawText != null ? String(rawText).trim() : "";
      if (text) return { type: "text", text };
      lastError = new Error("Empty reply from model");
    } catch (err) {
      lastError = err;
      console.warn("Gemini model " + modelName + " failed:", err);
    }
  }

  console.error("Gemini API error (all models failed):", lastError);
  const msg = lastError?.message ?? String(lastError ?? "");
  if (msg.includes("API key") || msg.includes("403") || msg.includes("401")) {
    return "API key is invalid or missing. Check REACT_APP_GEMINI_API_KEY.";
  }
  if (msg.includes("blocked") || msg.includes("SAFETY")) {
    return "Your message or the reply was blocked by safety filters. Try rephrasing.";
  }
  if (
    msg.includes("quota") ||
    msg.includes("429") ||
    msg.includes("resource_exhausted")
  ) {
    return "Rate limit or quota exceeded. Please try again later.";
  }
  if (
    msg.includes("network") ||
    msg.includes("Failed to fetch") ||
    msg.includes("CORS")
  ) {
    return "Network error. Check your connection or try again later.";
  }
  return (
    "Something went wrong: " + (msg.length > 80 ? msg.slice(0, 80) + "…" : msg)
  );
}
