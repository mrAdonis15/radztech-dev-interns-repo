/**
 * Public API surface. Use services for domain calls; use client for low-level or custom URLs.
 */

import { request as fetchRequest } from "./client/apiClient";
import { getLegacyUrls } from "./config/endpoints";

export { buildUrl, getApiBase } from "./client/apiClient";
export { endpoints, getLegacyUrls } from "./config/endpoints";
export { default as authService } from "./services/authService";
export { default as businessService } from "./services/businessService";
export { default as reportService } from "./services/reportService";

export const API_URLS = getLegacyUrls();

export function request(url, options = {}) {
  return fetchRequest(url, options).then(({ status, data, text }) => ({
    status,
    text,
    data,
  }));
}
