import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildUrl, request } from "../client/apiClient.js";
import { endpoints, getAiGeminiUrl, getGeminiApiKey } from "../config/endpoints.js";
import { getBizIxBiz } from "../selectedBiz.js";
import { setBiz } from "./businessService.js";
import { buildChartFromStockcardApi } from "../../chatboxUtils.js";
import {
  hasSelectedBiz,
  getWarehouse,
  getProduct,
  fetchStockcardGraph,
  getStockcardDataForDiscussion,
  formatProductAsText,
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

const apiKey = getGeminiApiKey();
// Primary: gemini-2.5-flash-lite. Fallback (dating model) kapag api/ai/gemini hindi nag-work: gemini-2.5-flash, gemini-2.0-flash.
const modelNames = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

/** 
 * Tools the AI uses to fetch from backend endpoints and show data in chat.
 * Each tool calls the corresponding API (products, stockcard, warehouse, graph);
 * when you add new endpoints, add a new function here and a functionDeclaration in tools[].
 */
const functions = {
  getStockcardData: async (opts) => {
    const productName = opts?.item || opts?.product || opts?.productName || "";
    const text = await getStockcardDataForDiscussion({ productName, item: productName, product: productName });
    return { summary: text };
  },
  getProducts: async () => {
    if (!hasSelectedBiz()) {
      return {
        rejected: true,
        reason: "Please select a business first to view products.",
      };
    }
    const productData = await getProduct(); // fetches from /api/lib/prod via stockcardService
    const formatted = formatProductAsText(productData);
    if (!formatted || formatted.trim() === "PRODUCTS:\n" || formatted.includes("- No products")) {
      return {
        rejected: true,
        reason: "No products found for the selected business.",
      };
    }
    return { summary: formatted, productsList: formatted };
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
        name: "getProducts",
        description:
          "Fetch the product list from /api/lib/prod. Use when the user asks to list products, show products, or asks about a product's cost, price, or how much something is. Returns data including sProd (name), ProdCd (code), cCost (cost), cPrice1–cPrice5 (prices), sCat, unit, etc. Use this data to answer cost/price questions with the actual cCost or cPrice values from the list.",
        parameters: { type: "OBJECT", properties: {}, required: [] },
      },
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
 * Detect if the user message is asking for product list or product details (cost, price, etc.)
 * so we fetch from /api/lib/prod before calling AI.
 */
function isProductRequest(message) {
  if (!message || typeof message !== "string") return false;
  const lower = message.trim().toLowerCase();
  const productKeywords = [
    "product", "products", "list products", "show products", "display products",
    "all products", "what products", "product list", "see products", "get products",
    "show me products", "list all products", "view products",
    "cost of", "price of", "how much is", "how much does", "what is the cost", "what is the price",
    "what's the cost", "what's the price", "product cost", "product price", "cost for", "price for",
  ];
  return productKeywords.some((kw) => lower.includes(kw));
}

/**
 * Fetch product data from /api/lib/prod and return formatted text for the AI context.
 * Returns null if not available or no biz selected.
 */
async function fetchProductsForAiContext() {
  if (!hasSelectedBiz()) return null;
  try {
    const productData = await getProduct();
    const formatted = formatProductAsText(productData);
    if (!formatted || formatted.includes("- No products")) return null;
    return formatted;
  } catch (err) {
    console.warn("[geminiService] fetchProductsForAiContext failed:", err);
    return null;
  }
}

/**
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<string|{ type: 'text', text: string }|{ type: 'chart', data: object, text: string }>}
 */
export async function sendToGemini(userMessage, messageHistory) {
  const baseUrl = getAiGeminiUrl() || buildUrl(endpoints.gemini.chat);
  const authToken = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["x-access-tokens"] = authToken;

  
  const ccode = getBizIxBiz();
  if (ccode != null && authToken) {
    try {
      const setBizRes = await setBiz(authToken, String(ccode));
      if (setBizRes.status < 200 || setBizRes.status >= 300) {
        console.warn("[geminiService] set-biz before Gemini failed:", setBizRes.status, setBizRes.data);
      }
    } catch (err) {
      console.warn("[geminiService] set-biz before Gemini failed:", err);
    }
  }

  // Call /api/ai/gemini (backend now has biz context if set-biz succeeded).
  // When user asks for products: fetch from /api/lib/prod first, then send that data in the request
  // so the AI can display it in chat. Same pattern can be used for other endpoints later.
  try {
    let userText = userMessage;
    if (isProductRequest(userMessage)) {
      const productsFromApi = await fetchProductsForAiContext();
      if (productsFromApi) {
        userText =
          userMessage +
          "\n\n[Data fetched from /api/lib/prod for the selected business. Each product includes sProd (name), ProdCd (code), cCost (cost), cPrice1–cPrice5 (prices), sCat, unit, etc. Use this data to answer the user. For cost or price questions, find the product and state the cCost or cPrice value clearly.]\n\n" +
          productsFromApi +
          "\n\nPlease use the above product list to answer the user. If they asked about cost or price of a product, give the exact cCost and/or cPrice1 value from the data.";
      } else {
        userText +=
          "\n\n[Note: The product list could not be loaded from /api/lib/prod (e.g. server error or no business selected). " +
          "Ask the user to try again, ensure a business is selected, or check the connection.]";
      }
    }
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: userText }],
        },
      ],
    };
    const { status, data } = await request(baseUrl, {
      method: "POST",
      headers,
      body: payload,
    });
    if (status >= 200 && status < 300 && data != null) {
      // Support both simple shapes and Gemini API shape: candidates[0].content.parts[0].text
      const fromCandidates =
        data?.candidates?.[0]?.content?.parts?.find((p) => p?.text)?.text;
      const text =
        typeof data === "string"
          ? data
          : fromCandidates ??
            data?.text ??
            data?.reply ??
            data?.message ??
            data?.data?.text ??
            data?.data?.reply;
      if (text != null && String(text).trim() !== "") {
        const trimmed = String(text).trim();
        const isNotConfigured = /not\s+configured/i.test(trimmed);
        if (isNotConfigured) {
          console.warn("[geminiService] /api/ai/gemini returned 'not configured' – backend may need setup");
          return { type: "text", text: "I don't have data on that, or no data available for that." };
        } else {
          return { type: "text", text: trimmed };
        }
      }
    }
    if (status === 400) {
      console.warn("[geminiService] /api/ai/gemini 400 Bad Request – check backend expected body (e.g. prompt, message, query). Response:", data);
    }
  } catch (err) {
    console.warn("[geminiService] /api/ai/gemini failed, falling back to Gemini SDK:", err);
  }

  // Fallback: direct Gemini API (huwag alisin)
  if (!apiKey) {
    return {
      type: "text",
      text: "I don't have data on that, or no data available for that.",
    };
  }

  const hasBiz = hasSelectedBiz();
  console.debug("[geminiService] sendToGemini: hasSelectedBiz=", hasBiz);

  const systemContext =
    "You are a helpful support assistant for Ulap Biz. " +
    "When the user asks to see products, list products, or display products: use getProducts to fetch from the products API, then show the returned list in your reply. " +
    "When the user asks about the cost or price of a product (e.g. 'what is the cost of X?', 'how much is X?'): use getProducts to fetch product data, find the product by name (sProd) or code (ProdCd), and answer with the exact cCost (cost) and/or cPrice1 (price) from the data. Always give a direct answer with the number (e.g. 'The cost is ₱X' or 'cPrice1 is ₱X'). " +
    "When they ask about stock card contents, balance, movements, or transactions: use getStockcardData to fetch from the stockcard report API, then use the returned summary to answer. " +
    "When they want a graph or visualization of stock movement: use displayStockcardGraph to fetch from the stockcard graph API and show the chart. " +
    "You can use multiple tools in one turn if the user wants both a discussion and a graph. " +
    "For any other data or reports that have a corresponding tool, call that tool to fetch from the right endpoint and display the result in chat. " +
    "Only use data from the API endpoints; do not make up data. " +
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
