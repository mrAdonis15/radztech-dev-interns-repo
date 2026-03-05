/**
 * AI gateway: thin client for /api/ai/gemini only. No domain calls, no normalization.
 * Dependency: transport (apiClient + endpoints) only.
 */

import { buildUrl, request } from "../client/apiClient.js";
import { endpoints, getAiGeminiUrl } from "../config/endpoints.js";

const GEMINI_PATH = endpoints.gemini.chat;

function getGeminiBaseUrl() {
  const env = getAiGeminiUrl();
  if (env) return env;
  return buildUrl(GEMINI_PATH);
}

/**
 * POST to /api/ai/gemini. Returns raw response.
 * @param {object} payload - Request body (e.g. { contents: [...] })
 * @param {Record<string, string>} [headers]
 * @returns {Promise<{ status: number, data: unknown }>}
 */
export async function sendGeminiRequest(payload, headers = {}) {
  const url = getGeminiBaseUrl();
  const merged = { "Content-Type": "application/json", ...headers };
  const { status, data } = await request(url, {
    method: "POST",
    headers: merged,
    body: payload,
  });
  return { status, data };
}
