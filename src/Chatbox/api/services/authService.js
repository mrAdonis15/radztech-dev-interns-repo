import { request, buildUrl } from "../client/apiClient";
import { endpoints } from "../config/endpoints";

const { auth } = endpoints;

function authHeaders(extra = {}) {
  return { "Content-Type": "application/json", ...extra };
}

/**
 * POST /api/login — authenticate; optional Basic header, optional x-access-tokens.
 * @param {object} [body] - optional JSON body
 * @param {{ authorization?: string, 'x-access-tokens'?: string }} [headers]
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function login(body = {}, headers = {}) {
  const url = buildUrl(auth.login);
  return request(url, {
    method: "POST",
    headers: authHeaders(headers),
    body,
  });
}

/**
 * GET or POST /api/logout — invalidate session.
 * @param {string} [token] - authToken
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function logout(token) {
  const url = buildUrl(auth.logout);
  return request(url, {
    method: "POST",
    headers: authHeaders(token ? { "x-access-tokens": token } : {}),
  });
}

export default {
  login,
  logout,
};
