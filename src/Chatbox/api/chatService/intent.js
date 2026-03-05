/**
 *  classify user message for context loading.
 */

const PRODUCT_KEYWORDS = [
  "product",
  "products",
  "list products",
  "show products",
  "display products",
  "all products",
  "what products",
  "product list",
  "see products",
  "get products",
  "show me products",
  "list all products",
  "view products",
  "cost of",
  "price of",
  "how much is",
  "how much does",
  "what is the cost",
  "what is the price",
  "what's the cost",
  "what's the price",
  "product cost",
  "product price",
  "cost for",
  "price for",
];

const STOCKCARD_KEYWORDS = [
  "stockcard",
  "stock card",
  "stockcard report",
  "inventory report",
  "stock report",
  "running balance",
  "stock movement",
];

const WAREHOUSE_KEYWORDS = [
  "warehouse",
  "warehouses",
  "wh list",
  "list warehouse",
];

const FINANCIAL_KEYWORDS = [
  "trial balance",
  "trialbalance",
  "income statement",
  "balance sheet",
  "financial report",
  "financial statement",
  "financial statements",
  "fs report",
  "reports/fs",
  "give me a trial balance",
  "show trial balance",
  "get trial balance",
  "generate trial balance",
];

/**
 * @param {string} message
 * @returns {"product" | "stockcard" | "warehouse" | "financial" | "general"}
 */
export function getIntent(message) {
  if (!message || typeof message !== "string") return "general";
  const lower = message.trim().toLowerCase();
  if (PRODUCT_KEYWORDS.some((kw) => lower.includes(kw))) return "product";
  if (STOCKCARD_KEYWORDS.some((kw) => lower.includes(kw))) return "stockcard";
  if (WAREHOUSE_KEYWORDS.some((kw) => lower.includes(kw))) return "warehouse";
  if (FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw))) return "financial";
  return "general";
}
