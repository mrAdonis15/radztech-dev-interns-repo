import { request, buildUrl } from "../client/apiClient";
import { endpoints } from "../config/endpoints";

const { business: biz } = endpoints;

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h["x-access-tokens"] = token;
  return h;
}

/**
 * GET /api/select-biz — list businesses for the current user.
 * @param {string} [token] - authToken
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function selectBiz(token) {
  const url = buildUrl(biz.selectBiz);
  return request(url, {
    method: "GET",
    headers: authHeaders(token),
  });
}

/**
 * POST /api/set-biz/:ccode — set active business; returns biz + data-access token.
 * @param {string} [token] - authToken
 * @param {string} ccode - biz identifier (ixBi)
 * @param {object} [body] - optional payload (e.g. { code: ccode })
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function setBiz(token, ccode, body = null) {
  const url = buildUrl(biz.setBiz, { ccode });
  return request(url, {
    method: "POST",
    headers: authHeaders(token),
    body: body != null ? body : { code: ccode },
  });
}

/**
 * GET biz list businesses (if different from select-biz).
 * @param {string} [token] - authToken
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function getBusinesses(token) {
  const url = buildUrl(biz.businesses);
  return request(url, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export default {
  selectBiz,
  setBiz,
  getBusinesses,
};
