/**
 * Executes Gemini tool calls (fetchEndpoints, callEndpoint, getCurrentYearRange).
 * Used when the model returns functionCall parts so we can send back functionResponse.
 */

import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";


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
  { url: endpoints.library.branches, description: "Branches list for financial statement reports only. Do not use for other requests.", keywords: ["branches", "branch", "financial report", "trial balance"], required: [] },
];

/**
 * Run a single tool by name with the given args.
 * @param {string} name
 * @param {Record<string, unknown>} args
 * @param {{ authToken?: string, intent?: string }} [options] - intent used to restrict branches (brch) to financial only
 * @returns {Promise<object>}
 */
export async function runTool(name, args = {}, options = {}) {
  const { authToken, intent } = options;
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
    const urlNorm = url.trim();
    const isBranchesCall =
      urlNorm.includes("brch") ||
      urlNorm === endpoints.library.branches ||
      urlNorm.endsWith("/api/lib/brch");
    if (isBranchesCall && intent !== "financial") {
      return {
        error: "The branches (brch) endpoint is only available for financial statement reports. Do not use it for other requests.",
      };
    }
    let fullUrl = urlNorm;
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
