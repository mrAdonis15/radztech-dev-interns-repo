import { getProducts, getProductStats, getProductById, getProductByName, getValidProductNames } from "./productService.js";

const CHART_COLORS = {
  primary: "rgb(75,192,192)",
  secondary: "rgb(54,162,235)",
  tertiary: "rgb(255,99,132)",
  pie: [
    "rgba(75,192,192,0.8)",
    "rgba(54,162,235,0.8)",
    "rgba(255,99,132,0.8)",
    "rgba(255,206,86,0.8)",
    "rgba(153,102,255,0.8)",
    "rgba(255,159,64,0.8)",
  ],
  lineBar: [
    "rgb(75,192,192)",
    "rgb(54,162,235)",
    "rgb(255,99,132)",
    "rgb(255,206,86)",
    "rgb(153,102,255)",
    "rgb(255,159,64)",
  ],
};

const VALID_PRODUCT_LABELS = new Set(["stock card", "stock in", "stock out", "stock in vs out", "units", "report"]);
const METRIC_MAP = {
  balance: "currentStock",
  stock: "currentStock",
  "current stock": "currentStock",
  "stock in": "stockIn",
  "stock out": "stockOut",
  "in": "stockIn",
  "out": "stockOut",
  value: "currentStock",
  units: "currentStock",
};

/**
 * Validate labels against real products. Returns { valid, invalidNames, products }.
 * If labels appear to be product names, all must exist. Aggregate labels (Stock In, Stock Out) are allowed.
 */
function validateProductLabels(labels) {
  const validNames = getValidProductNames();
  const validSet = new Set(validNames.map((n) => n.toLowerCase()));
  const invalid = [];
  const products = [];

  for (const lbl of labels) {
    const s = String(lbl).trim();
    const lower = s.toLowerCase();
    if (VALID_PRODUCT_LABELS.has(lower)) continue;
    if (validSet.has(lower)) {
      products.push(getProductByName(s) || getProducts().find((p) => p.name.toLowerCase() === lower));
    } else {
      invalid.push(s);
    }
  }
  const isProductChart = invalid.length > 0 || products.length > 0;
  return { valid: invalid.length === 0, invalid, products, isProductChart };
}

function getProductMetric(product, datasetLabel) {
  const lower = (datasetLabel || "").toLowerCase();
  for (const [key, field] of Object.entries(METRIC_MAP)) {
    if (lower.includes(key)) return product[field] ?? 0;
  }
  return product.currentStock ?? 0;
}

/**
 * Build a chart config from a flexible spec (AI-provided or arbitrary data).
 * Validates product names against the real database and replaces values with actual data.
 * @param {Object} spec - { chartType, title?, labels, datasets }
 * @returns {Object|null|{rejected:true, reason:string}} Chart config, null if invalid, or rejection
 */
export function buildChartFromSpec(spec) {
  if (!spec || !spec.labels || !spec.datasets) return null;

  let labels = spec.labels;
  if (typeof labels === "string") {
    try {
      labels = JSON.parse(labels);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(labels) || labels.length === 0) return null;
  labels = labels.map((l) => String(l).trim());

  let datasets = spec.datasets;
  if (typeof datasets === "string") {
    try {
      datasets = JSON.parse(datasets);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(datasets) || datasets.length === 0) return null;

  const validation = validateProductLabels(labels);
  if (!validation.valid && validation.invalid.length > 0) {
    return {
      rejected: true,
      reason: `Product "${validation.invalid[0]}" was not found in our inventory. Please ask about products from our catalog.`,
    };
  }

  const chartType = ["line", "bar", "pie"].includes(spec.chartType) ? spec.chartType : "bar";

  let datasetsToUse = datasets;
  if (validation.products.length > 0 && validation.products.length === labels.length) {
    datasetsToUse = datasets.map((ds) => ({
      ...ds,
      data: labels.map((lbl) => {
        const p = getProductByName(lbl) || validation.products[labels.indexOf(lbl)];
        return p ? getProductMetric(p, ds.label) : 0;
      }),
    }));
  } else if (labels.length <= 6 && labels.every((l) => VALID_PRODUCT_LABELS.has(l.toLowerCase()))) {
    const stats = getProductStats();
    const labelToValue = {
      "stock card": stats.totalStockUnits,
      "stock in": stats.totalStockIn,
      "stock out": stats.totalStockOut,
      "stock in vs out": stats.totalStockIn,
      units: stats.totalStockUnits,
      report: stats.totalStockUnits,
    };
    datasetsToUse = datasets.map((ds) => ({
      ...ds,
      data: labels.map((l) => labelToValue[l.toLowerCase()] ?? 0),
    }));
  }

  let builtDatasets;
  let finalLabels = labels;

  if (chartType === "pie") {
    const ds = datasetsToUse[0] || {};
    const data = Array.isArray(ds.data) ? ds.data.map((v) => Number(v) || 0) : [];
    const n = Math.min(labels.length, data.length) || Math.max(labels.length, data.length);
    finalLabels = labels.slice(0, n);
    const pieData = data.slice(0, n).concat(Array(Math.max(0, n - data.length)).fill(0));
    builtDatasets = [
      {
        label: ds.label != null ? String(ds.label) : "Value",
        data: pieData,
        backgroundColor: CHART_COLORS.pie.slice(0, n),
        borderColor: "rgba(255,255,255,0.8)",
        borderWidth: 1,
      },
    ];
  } else {
    builtDatasets = datasetsToUse.map((ds, i) => {
      const data = Array.isArray(ds.data) ? ds.data.map((v) => Number(v) || 0) : [];
      const label = ds.label != null ? String(ds.label) : `Series ${i + 1}`;
      const color = CHART_COLORS.lineBar[i % CHART_COLORS.lineBar.length];
      return {
        label,
        data,
        borderColor: ds.borderColor || color,
        backgroundColor: ds.backgroundColor || color.replace("rgb", "rgba").replace(")", ",0.5)"),
        tension: chartType === "line" ? 0.3 : 0,
        fill: chartType === "line" ? false : true,
        borderWidth: 1,
      };
    });
  }

  return {
    chartType,
    title: spec.title != null ? String(spec.title) : "",
    labels: finalLabels,
    datasets: builtDatasets,
  };
}

/**
 * Category distribution - pie chart of products per category
 */
export function getCategoryDistributionChart() {
  const stats = getProductStats();
  if (!stats.categories.length) {
    return null;
  }
  return {
    chartType: "pie",
    title: "Products by Category",
    labels: stats.categories.map((c) => c.name),
    datasets: [
      {
        label: "Products",
        data: stats.categories.map((c) => c.count),
        backgroundColor: CHART_COLORS.pie.slice(0, stats.categories.length),
        borderColor: "rgba(255,255,255,0.8)",
        borderWidth: 1,
      },
    ],
  };
}

/**
 * Current stock by product - bar chart
 * @param {{ limit?: number }} opts - limit number of products shown (default 10)
 */
export function getStockByProductChart(opts = {}) {
  const limit = opts.limit ?? 10;
  const products = getProducts()
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, limit);
  if (!products.length) return null;
  return {
    chartType: "bar",
    title: "Current Stock by Product",
    labels: products.map((p) => p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name),
    datasets: [
      {
        label: "Stock",
        data: products.map((p) => p.currentStock),
        backgroundColor: "rgba(54,162,235,0.6)",
        borderColor: CHART_COLORS.secondary,
        borderWidth: 1,
      },
    ],
  };
}

/**
 * Stock movement over time for a product - line chart
 * @param {{ productId?: number, productName?: string }} opts
 */
export function getStockMovementChart(opts = {}) {
  let product = null;
  if (opts.productId) {
    product = getProductById(opts.productId);
  } else if (opts.productName) {
    product = getProducts().find((p) =>
      p.name.toLowerCase().includes(String(opts.productName).toLowerCase())
    );
  }
  if (!product || !product.transactions?.length) return null;

  const items = product.transactions
    .filter((t) => t.runBal !== undefined)
    .sort((a, b) => new Date(a.jDate) - new Date(b.jDate));

  if (!items.length) return null;

  const labels = items.map((t) => {
    const d = new Date(t.jDate);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  });

  return {
    chartType: "line",
    title: `Stock Movement: ${product.name}`,
    labels,
    datasets: [
      {
        label: "Running Balance",
        data: items.map((t) => t.runBal),
        borderColor: CHART_COLORS.primary,
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "In",
        data: items.map((t) => t.qtyIN || 0),
        borderColor: "rgb(54,162,235)",
        backgroundColor: "rgba(54,162,235,0.2)",
        tension: 0.3,
      },
      {
        label: "Out",
        data: items.map((t) => Math.abs(t.qtyOUT || 0)),
        borderColor: CHART_COLORS.tertiary,
        backgroundColor: "rgba(255,99,132,0.2)",
        tension: 0.3,
      },
    ],
  };
}

/**
 * Inventory value by product - bar chart (currentStock * lastPrice)
 * @param {{ limit?: number }} opts - limit number of products (default 10)
 */
export function getInventoryValueChart(opts = {}) {
  const limit = opts.limit ?? 10;
  const products = getProducts()
    .filter((p) => p.lastPrice > 0 && p.currentStock > 0)
    .map((p) => ({ ...p, value: p.currentStock * p.lastPrice }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  if (!products.length) return null;
  return {
    chartType: "bar",
    title: "Inventory Value by Product (₱)",
    labels: products.map((p) => p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name),
    datasets: [
      {
        label: "Value (₱)",
        data: products.map((p) => Math.round(p.value)),
        backgroundColor: "rgba(255,159,64,0.6)",
        borderColor: "rgb(255,159,64)",
        borderWidth: 1,
      },
    ],
  };
}

/**
 * Stock In vs Out comparison - bar chart (aggregate)
 */
export function getStockInOutChart() {
  const stats = getProductStats();
  return {
    chartType: "bar",
    title: "Total Stock In vs Out",
    labels: ["Stock In", "Stock Out"],
    datasets: [
      {
        label: "Units",
        data: [stats.totalStockIn, stats.totalStockOut],
        backgroundColor: ["rgba(54,162,235,0.6)", "rgba(255,99,132,0.6)"],
        borderColor: [CHART_COLORS.secondary, CHART_COLORS.tertiary],
        borderWidth: 1,
      },
    ],
  };
}
