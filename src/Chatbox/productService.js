import fallbackData from "./Data/dummyProductsCopy.json";

const PRODUCTS_URL = `${process.env.PUBLIC_URL || ""}/Data/dummyProductsCopy.json`;
let productsCache = null;

function parseRawProducts(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  if (arr.length === 0) return [];
  return arr.map((item, idx) => {
    const stockIn = typeof item.stockIn === "number" ? item.stockIn : parseInt(item.stockIn, 10) || 0;
    const stockOut = typeof item.stockOut === "number" ? item.stockOut : parseInt(item.stockOut, 10) || 0;
    const balance = typeof item.balance === "number" ? item.balance : parseInt(item.balance, 10) || 0;

    return {
      id: item.productCode || `prod-${idx}`,
      name: item.product || "Unknown",
      category: "Vehicles",
      currentStock: balance,
      stockIn,
      stockOut,
      lastPrice: balance > 0 ? 1 : 0,
      transactions: [],
      productCode: item.productCode,
    };
  });
}

function initCache() {
  if (productsCache == null) {
    productsCache = parseRawProducts(fallbackData);
  }
}

/**
 * Load products from JSON file (real-time).
 * Fetches from public/Data/dummyProductsCopy.json — edit THAT file to add/update products;
 * changes are picked up on the next chat message.
 * @returns {Promise<void>}
 */
export async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_URL, { cache: "no-store" });
    if (res.ok) {
      const raw = await res.json();
      productsCache = parseRawProducts(raw);
    }
  } catch {
    initCache();
  }
}

/**
 * Get products (uses cached data; call loadProducts() first for fresh data).
 */
export function getProducts() {
  initCache();
  return productsCache || [];
}

export function getProductCount() {
  return getProducts().length;
}

export function getProductById(id) {
  return getProducts().find((p) => p.id === id);
}

/** Check if a product exists by name (case-insensitive exact match) */
export function getProductByName(name) {
  if (!name || typeof name !== "string") return null;
  const lower = String(name).trim().toLowerCase();
  return getProducts().find((p) => p.name.toLowerCase() === lower);
}

/** Return product if name matches exactly, or single product if unambiguous partial match */
export function resolveProductByName(name) {
  if (!name || typeof name !== "string") return null;
  const lower = String(name).trim().toLowerCase();
  const exact = getProducts().find((p) => p.name.toLowerCase() === lower);
  if (exact) return exact;
  const partial = getProducts().filter((p) => p.name.toLowerCase().includes(lower));
  return partial.length === 1 ? partial[0] : null;
}

/** Get all valid product names for validation */
export function getValidProductNames() {
  return getProducts().map((p) => p.name);
}

export function getProductsByCategory(category) {
  return getProducts().filter(
    (p) => p.category.toLowerCase() === category.toLowerCase(),
  );
}

export function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  return getProducts().filter((p) => p.name.toLowerCase().includes(lowerQuery));
}

/**
 * Format product data as text for AI context
 */
export function getProductsContext() {
  const products = getProducts();

  if (products.length === 0) {
    return "No products available in the system.";
  }

  // Calculate overall totals
  let totalStockBalance = 0;
  let totalStockIn = 0;
  let totalStockOut = 0;

  products.forEach((p) => {
    totalStockBalance += p.currentStock;
    totalStockIn += p.stockIn;
    totalStockOut += p.stockOut;
  });

  let summary = `STOCK CARD OVERVIEW:\n`;
  summary += `- Total Products: ${products.length}\n`;
  summary += `- Total Stock Balance: ${totalStockBalance} units\n`;
  summary += `- Total Stock In: ${totalStockIn} units\n`;
  summary += `- Total Stock Out: ${totalStockOut} units\n\n`;

  summary += `STOCK CARD - PRODUCTS:\n\n`;

  const productList = products
    .map((p, idx) => (
      `${idx + 1}. ${p.name} (Code: ${p.productCode || p.id})\n` +
      `   - Balance: ${p.currentStock} units\n` +
      `   - Stock In: ${p.stockIn} units\n` +
      `   - Stock Out: ${p.stockOut} units`
    ))
    .join("\n\n");

  return summary + productList;
}

/**
 * Get product statistics for AI queries
 */
export function getProductStats() {
  const products = getProducts();

  const categories = {};
  let totalTransactions = 0;
  let totalValue = 0;
  let totalStockUnits = 0;
  let totalStockIn = 0;
  let totalStockOut = 0;

  products.forEach((p) => {
    categories[p.category] = (categories[p.category] || 0) + 1;
    totalTransactions += p.transactions.length;
    totalValue += p.lastPrice * p.currentStock;
    totalStockUnits += p.currentStock;
    totalStockIn += p.stockIn;
    totalStockOut += p.stockOut;
  });

  return {
    totalProducts: products.length,
    categories: Object.keys(categories).map((cat) => ({
      name: cat,
      count: categories[cat],
    })),
    totalInventoryValue: totalValue,
    totalStockUnits: totalStockUnits,
    totalStockIn: totalStockIn,
    totalStockOut: totalStockOut,
    totalTransactions: totalTransactions,
  };
}
