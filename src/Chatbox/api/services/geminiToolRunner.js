/**
 * Executes Gemini tool calls (fetchEndpoints, callEndpoint, getCurrentYearRange).
 * Used when the model returns functionCall parts so we can send back functionResponse.
 */

import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";

/** Endpoint list with description and keywords for fetchEndpoints. */
const ENDPOINT_LIST = [
  { url: endpoints.auth.login, description: "User login", keywords: ["login", "auth", "sign in"], required: ["body: username, password"] },
  { url: endpoints.auth.logout, description: "User logout", keywords: ["logout", "auth"], required: [] },
  { url: endpoints.business.selectBiz, description: "Get selected business", keywords: ["business", "select", "current biz"], required: [] },
  { url: endpoints.business.setBiz, description: "Set active business by code", keywords: ["set business", "switch biz", "ccode"], required: ["ccode"] },
  { url: endpoints.business.businesses, description: "List businesses", keywords: ["businesses", "list", "companies"], required: [] },
  { url: endpoints.reports.stockcard, description: "Stock card report", keywords: ["stockcard", "inventory", "sc"], required: [] },
  { url: endpoints.reports.stockcardGraph, description: "Stock card graph", keywords: ["stockcard", "graph", "chart"], required: [] },
  { url: endpoints.reports.fs, description: "Financial statement report", keywords: ["financial", "fs", "report"], required: [] },
  { url: endpoints.reports.fsTrialBalance, description: "Trial balance report", keywords: ["trial balance", "tb", "financial"], required: [] },
  { url: endpoints.reports.fsBalanceSheet, description: "Balance sheet report", keywords: ["balance sheet", "financial"], required: [] },
  { url: endpoints.inventory.warehouse, description: "List warehouses", keywords: ["warehouse", "wh", "inventory"], required: [] },
  { url: endpoints.library.product, description: "Product list", keywords: ["product", "prod", "library"], required: [] },
  { url: endpoints.library.branches, description: "Branches list", keywords: ["branches", "branch", "lib"], required: [] },
];

/**
 * Run a single tool by name with the given args.
 * @param {string} name - Tool name: fetchEndpoints | callEndpoint | getCurrentYearRange
 * @param {Record<string, unknown>} args - Arguments from the model
 * @param {{ authToken?: string }} [options] - Optional auth for callEndpoint
 * @returns {Promise<object>} Result to send back as functionResponse (JSON-serializable)
 */
export async function runTool(name, args = {}, options = {}) {
  const { authToken } = options;
  const headers = authToken ? { "x-access-tokens": authToken } : {};

  if (name === "fetchEndpoints") {
    return { endpoints: ENDPOINT_LIST };
  }

  if (name === "getCurrentYearRange") {
    const now = new Date();
    const y = now.getFullYear();
    return {
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
      year: y,
      description: `Full year ${y}`,
    };
  }

  if (name === "callEndpoint") {
    const url = args?.url;
    const params = (args?.params && typeof args.params === "object") ? args.params : {};
    if (url == null || typeof url !== "string") {
      return { error: "Missing or invalid url" };
    }
    let fullUrl = url.trim();
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = buildUrl(fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`, params);
    } else {
      const usp = new URLSearchParams(params);
      const q = usp.toString();
      fullUrl = q ? `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}${q}` : fullUrl;
    }
    try {
      const { status, data, text } = await request(fullUrl, {
        method: "GET",
        headers: { ...headers },
      });
      return {
        status,
        data: data !== undefined ? data : (text || null),
      };
    } catch (err) {
      return { error: String(err?.message || err), status: 500 };
    }
  }

  return { error: `Unknown tool: ${name}` };
}
