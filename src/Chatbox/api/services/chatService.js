/**
 * Chat service: single entry for chat. Intent → context → geminiService.sendToGemini (tools from geminiService only) → response.
 */

import { getBizIxBiz } from "../selectedBiz.js";
import { setBiz } from "../domain/selectBiz.js";
import { getProduct, formatProductAsText } from "../domain/productFetch.js";
import {
  getWarehouse,
  getStockcardOverview,
  formatWarehouseAsText,
  formatStockcardAsText,
} from "../domain/stockCardFetch.js";
import { sendToGemini } from "./geminiService.js";

const FALLBACK_MESSAGE = "Sorry, something went wrong. Please try again.";
const PRODUCT_CONTEXT_INSTRUCTION =
  "[Data from /api/lib/prod for the selected business. Use sProd, ProdCd, cCost, cPrice1–cPrice5, sCat, unit. Answer cost/price from cCost or cPrice1.]";
const NO_PRODUCT_FALLBACK =
  "[Product list could not be loaded. Ask the user to ensure a business is selected and try again.]";

const PRODUCT_KEYWORDS = [
  "product", "products", "list products", "show products", "display products",
  "all products", "what products", "product list", "see products", "get products",
  "show me products", "list all products", "view products", "cost of", "price of",
  "how much is", "how much does", "what is the cost", "what is the price",
  "what's the cost", "what's the price", "product cost", "product price", "cost for", "price for",
];
const STOCKCARD_KEYWORDS = [
  "stockcard", "stock card", "stockcard report", "inventory report", "stock report",
  "running balance", "stock movement",
];
const WAREHOUSE_KEYWORDS = [
  "warehouse", "warehouses", "wh list", "list warehouse",
];

function getAuthToken() {
  return typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
}

/** @param {string} message @returns {"product" | "stockcard" | "warehouse" | "general"} */
function getIntent(message) {
  if (!message || typeof message !== "string") return "general";
  const lower = message.trim().toLowerCase();
  if (PRODUCT_KEYWORDS.some((kw) => lower.includes(kw))) return "product";
  if (STOCKCARD_KEYWORDS.some((kw) => lower.includes(kw))) return "stockcard";
  if (WAREHOUSE_KEYWORDS.some((kw) => lower.includes(kw))) return "warehouse";
  return "general";
}

/** @param {"product" | "stockcard" | "warehouse" | "general"} intent @param {string} [authToken] */
async function loadContextForIntent(intent, authToken) {
  const out = {};
  if (intent === "product") {
    const raw = await getProduct(authToken);
    const productsText = formatProductAsText(raw);
    out.productsText = productsText && !productsText.includes("- No products") ? productsText : null;
  }
  if (intent === "warehouse") {
    const wh = await getWarehouse(authToken);
    out.warehouseText = formatWarehouseAsText(wh) || null;
  }
  if (intent === "stockcard") {
    const [wh, prod] = await Promise.all([getWarehouse(authToken), getProduct(authToken)]);
    const arr = Array.isArray(prod) ? prod : prod?.items ?? prod?.data ?? prod?.products ?? [];
    const firstProd = arr[0];
    const ixProd = firstProd?.ixProd ?? firstProd?.id;
    const whArr = Array.isArray(wh) ? wh : wh?.data ?? wh?.warehouses ?? [];
    const firstWh = whArr[0];
    const ixWH = firstWh?.ixWh ?? firstWh?.ixWH ?? firstWh?.id;
    if (ixProd != null && ixWH != null) {
      const sc = await getStockcardOverview(authToken, { ixProd, ixWH });
      out.stockcardText = formatStockcardAsText(sc) || null;
    }
  }
  return out;
}

/** @param {string} userMessage @param {object} context @param {string} intent */
function buildUserTextWithContext(userMessage, context, intent) {
  let text = userMessage.trim();
  if (intent === "product") {
    if (context.productsText) {
      text += `\n\n${PRODUCT_CONTEXT_INSTRUCTION}\n\n${context.productsText}\n\nUse the above list to answer. For cost or price, give cCost or cPrice1 from the data.`;
    } else {
      text += `\n\n${NO_PRODUCT_FALLBACK}`;
    }
  }
  if (intent === "warehouse" && context.warehouseText) {
    text += `\n\n[Warehouse data for context.]\n\n${context.warehouseText}`;
  }
  if (intent === "stockcard" && context.stockcardText) {
    text += `\n\n[Stockcard data for context.]\n\n${context.stockcardText}`;
  }
  return text;
}

/**
 * Single entry for chat: set biz, load context by intent, then call geminiService.sendToGemini (tools only from geminiService).
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

  try {
    const result = await sendToGemini(userText);
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
