import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildChartFromStockcardApi } from "./chatboxUtils.js";
import {
  hasSelectedBiz,
  getWarehouse,
  getProduct,
  fetchStockcardGraph,
  getStockcardDataForDiscussion,
} from "./stockcardService.js";

function pickIxWH(warehouseData) {
  const arr = Array.isArray(warehouseData)
    ? warehouseData
    : warehouseData?.data ?? warehouseData?.warehouses ?? [];
  const first = arr[0];
  return first?.ixWh ?? first?.ixWH ?? first?.id ?? first?.warehouseId;
}

function pickIxProd(productData, productName) {
  const arr = Array.isArray(productData)
    ? productData
    : productData?.items ?? productData?.data ?? productData?.products ?? [];
  if (productName) {
    const lower = String(productName).toLowerCase();
    const match = arr.find(
      (p) =>
        (p?.sProd ?? p?.name ?? p?.product ?? "").toLowerCase().includes(lower) ||
        (p?.ProdCd ?? p?.productCode ?? "").toLowerCase().includes(lower)
    );
    return match?.ixProd ?? match?.id ?? arr[0]?.ixProd ?? arr[0]?.id;
  }
  return arr[0]?.ixProd ?? arr[0]?.id;
}

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
const modelNames = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
];

const functions = {
  getStockcardData: async (opts) => {
    const productName = opts?.item || opts?.product || opts?.productName || "";
    const text = await getStockcardDataForDiscussion({ productName, item: productName, product: productName });
    return { summary: text };
  },
  displayStockcardGraph: async (opts) => {
    if (!hasSelectedBiz()) {
      console.warn("[geminiService] displayStockcardGraph: hasSelectedBiz=false");
      return {
        rejected: true,
        reason: "Please select a business first to view stockcard graph data.",
      };
    }
    const productName = opts?.item || opts?.product || opts?.productName || "";
    const [warehouseData, productData] = await Promise.all([getWarehouse(), getProduct()]);
    const ixWH = pickIxWH(warehouseData);
    const ixProd = pickIxProd(productData, productName);
    if (ixProd == null || ixWH == null) {
      return {
        rejected: true,
        reason: "Warehouse and product data are required to display the graph. Please try again.",
      };
    }
    console.debug("[geminiService] displayStockcardGraph:", { ixProd, ixWH, product: productName || "(first)" });
    const apiData = await fetchStockcardGraph({ ixProd, ixWH });
    if (!apiData || !apiData.items?.length) {
      console.warn("[geminiService] displayStockcardGraph: no data", { ixProd, ixWH, apiData });
      return {
        rejected: true,
        reason: productName
          ? `No stockcard graph data found for "${productName}".`
          : "No stockcard data available. The report may be empty.",
      };
    }
    return buildChartFromStockcardApi(apiData);
  },
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "getStockcardData",
        description:
          "Fetch stock card report data to discuss with the user. Use when the user asks about stock card contents, balance, movements, transactions, or wants to talk about the report. Returns a text summary you can use to answer. Optionally pass item/product to filter by product name.",
        parameters: {
          type: "OBJECT",
          properties: {
            item: { type: "STRING", description: "Product name (optional)." },
            product: { type: "STRING", description: "Product name (optional)." },
          },
          required: [],
        },
      },
      {
        name: "displayStockcardGraph",
        description:
          "Fetch and display stockcard graph data from the API. Use when user has selected a business and asks for stockcard graph, stock movement over time, or transaction data as a graph. Optionally filter by product/item name.",
        parameters: {
          type: "OBJECT",
          properties: {
            item: {
              type: "STRING",
              description: "Product or item name to filter the graph (optional).",
            },
            product: {
              type: "STRING",
              description: "Same as item - product name for graph filter.",
            },
          },
          required: [],
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

  const hasBiz = hasSelectedBiz();
  console.debug("[geminiService] sendToGemini: hasSelectedBiz=", hasBiz);

  const systemContext =
    "You are a helpful support assistant for Ulap Biz. " +
    "Depending on the user's question about stock card: " +
    "Use getStockcardData when they ask about stock card contents, balance, movements, transactions, or want to discuss the report—then use the returned summary to answer in your own words. " +
    "Use displayStockcardGraph when they want to see a graph or visualization of stock movement. " +
    "You can use both in one turn if they want both a discussion and a graph. " +
    "When there are the same data keyword display both and let the user choose which one to display." +
    "If there is question about stock card and cannot answer it, save it and learn what it is, then next time you will know it and answer it correctly." +
    "Avoid False data to prevent AI from hallucinating or data poisoning ." +
    "Only use data from the API endpoint and do not make up data." +
    "If the user asks about something that is not related to stock card, answer it in a friendly and helpful way." +
    "If a user asks a comparison, properly compare the data and answer the question in a friendly and helpful way." +
    "If a user asks a suggestion, properly suggest the data and answer the question in a friendly and helpful way." +
    "If a user asks a recommendation, properly recommend the data and answer the question in a friendly and helpful way." +
    "If a user asks a prediction, properly predict the data and answer the question in a friendly and helpful way." +
    "If a user asks a forecast, properly forecast the data and answer the question in a friendly and helpful way." +
    "If a user asks a suggestion, properly suggest the data and answer the question in a friendly and helpful way." +
    "If a user asks a recommendation, properly recommend the data and answer the question in a friendly and helpful way." +
    "If a user asks a prediction, properly predict the data and answer the question in a friendly and helpful way." +
    "If a user asks a forecast, properly forecast the data and answer the question in a friendly and helpful way." +
    "Flag harmful approach and do not answer it." +
    "Flag false data and do not answer it." +
    "Flag false data and do not answer it." +
    "Flag Profanity and scold the user for using inappropriate language." +
    "Flag data leak" +
    "Be concise, friendly, and accurate.";

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
        console.debug("[geminiService] functionCall:", name, args);
        if (!functions[name]) {
          lastError = new Error(`Function ${name} is not defined`);
          console.error("[geminiService] Unknown function:", name);
          continue;
        }
        const parsedArgs = args || {};
        const functionResult = await Promise.resolve(functions[name](parsedArgs));

        if (functionResult?.rejected) {
          console.warn("[geminiService] function rejected:", name, functionResult.reason);
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
      console.warn("[geminiService] Gemini model", modelName, "failed:", err);
    }
  }

  console.error("[geminiService] All models failed:", lastError);
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
