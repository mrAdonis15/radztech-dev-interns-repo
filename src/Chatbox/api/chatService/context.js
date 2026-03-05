/**
 * Context loader: preload domain data by intent. Depends on domain modules only.
 */

import { getProduct, formatProductAsText } from "../domain/productFetch.js";
import {
  getWarehouse,
  getStockcardOverview,
  formatWarehouseAsText,
  formatStockcardAsText,
} from "../domain/stockCardFetch.js";
import financialReportService from "../services/financialReportService.js";

const PRODUCT_CONTEXT_INSTRUCTION =
  "[Data from /api/lib/prod for the selected business. Use sProd, ProdCd, cCost, cPrice1–cPrice5, sCat, unit. Answer cost/price from cCost or cPrice1.]";

const NO_PRODUCT_FALLBACK =
  "[Product list could not be loaded. Ask the user to ensure a business is selected and try again.]";

const FINANCIAL_CONTEXT_INSTRUCTION =
  "[Financial report data below. Use this data to answer the user. Present the report or the message below. If it says no data/rows for a branch or period, explain that the report for that branch or period has no data—do not say you personally don't have data. If a full report is provided, show it clearly.]";

const NO_FINANCIAL_FALLBACK =
  "[The report request failed or could not be loaded. Ask the user to ensure a business is selected and try again, or try a different period or branch.]";

/**
 * @param {"product" | "stockcard" | "warehouse" | "financial" | "general"} intent
 * @param {string} [authToken]
 * @param {string} [userMessage] - optional; for "financial" intent used to parse month/year (e.g. "trial balance for February 2026")
 * @returns {Promise<{ productsText?: string, warehouseText?: string, stockcardText?: string, financialReportText?: string }>}
 */
export async function loadContextForIntent(intent, authToken, userMessage) {
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
  if (intent === "financial") {
    const reportText = await financialReportService.getAllFinancialStatementReportsForChat({
      userMessage: userMessage || "",
    });
    const isLoadError =
      !reportText ||
      reportText.startsWith("Unable to load") ||
      reportText.startsWith("Request failed");
    out.financialReportText = isLoadError ? null : reportText;
  }
  return out;
}

/**
 * Build user text with injected context for AI. Single instruction block, no duplication.
 * @param {string} userMessage
 * @param {{ productsText?: string | null, warehouseText?: string | null, stockcardText?: string | null, financialReportText?: string | null }} context
 * @param {"product" | "stockcard" | "warehouse" | "financial" | "general"} intent
 * @returns {string}
 */
export function buildUserTextWithContext(userMessage, context, intent) {
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
  if (intent === "financial") {
    if (context.financialReportText) {
      text += `\n\n${FINANCIAL_CONTEXT_INSTRUCTION}\n\n${context.financialReportText}\n\nAnswer using the report data above. Do not suggest visiting a link.`;
    } else {
      text += `\n\n${NO_FINANCIAL_FALLBACK}`;
    }
  }
  return text;
}
