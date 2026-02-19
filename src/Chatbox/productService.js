import productsData from "./Data/products.json";

/**
 * Extract products from stock card data
 */
export function getProducts() {
  if (!productsData.products || !Array.isArray(productsData.products)) {
    return [];
  }

  return productsData.products.map((productData) => {
    const transactions = productData.rep || [];
    const totals = productData.totals || {};

    // Get latest price from transactions
    let lastPrice = 0;
    for (let i = transactions.length - 1; i >= 0; i--) {
      if (transactions[i].priceOUT > 0) {
        lastPrice = transactions[i].priceOUT;
        break;
      }
    }

    return {
      id: productData.ixProd,
      name: productData.sProd,
      category: "Vehicles",
      currentStock: totals.runBal || 0,
      stockIn: totals.qtyIN || 0,
      stockOut: totals.qtyOUT || 0,
      lastPrice: lastPrice,
      transactions: transactions,
      endQty: productData.endQty,
    };
  });
}

export function getProductCount() {
  return getProducts().length;
}

export function getProductById(id) {
  return getProducts().find((p) => p.id === id);
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

  let summary = `INVENTORY OVERVIEW:\n`;
  summary += `- Total Products: ${products.length}\n`;
  summary += `- Total Stock Balance: ${totalStockBalance} units\n`;
  summary += `- Total Stock In: ${totalStockIn} units\n`;
  summary += `- Total Stock Out: ${totalStockOut} units\n\n`;

  summary += `PRODUCTS IN INVENTORY:\n\n`;

  const productList = products
    .map((p, idx) => {
      const transactionCount = p.transactions.length;
      const latestTransaction = p.transactions[p.transactions.length - 1];
      const lastDate = latestTransaction?.jDate
        ? new Date(latestTransaction.jDate).toLocaleDateString()
        : "N/A";

      return (
        `${idx + 1}. ${p.name} (ID: ${p.id})\n` +
        `   - Current Stock: ${p.currentStock} units\n` +
        `   - Stock In: ${p.stockIn} units\n` +
        `   - Stock Out: ${p.stockOut} units\n` +
        `   - Last Transaction Date: ${lastDate}\n` +
        `   - Last Price: ${p.lastPrice > 0 ? `₱${p.lastPrice.toLocaleString()}` : "N/A"}\n` +
        `   - Total Transactions: ${transactionCount}`
      );
    })
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
