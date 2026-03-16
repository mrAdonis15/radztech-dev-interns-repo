/**
 * selectBiz
 */

import { request, buildUrl } from "../client/apiClient.js";
import { endpoints } from "../config/endpoints.js";

const biz = endpoints.business;

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h["x-access-tokens"] = token;
  return h;
}

export async function setBiz(token, ccode, body = null) {
  const url = buildUrl(biz.setBiz, { ccode });
  return request(url, {
    method: "POST",
    headers: authHeaders(token),
    body: body != null ? body : { code: ccode },
  });
}

export async function selectBiz(token) {
  const url = buildUrl(biz.selectBiz);
  return request(url, { method: "GET", headers: authHeaders(token) });
}

export async function getBusinesses(token) {
  const url = buildUrl(biz.businesses);
  return request(url, { method: "GET", headers: authHeaders(token) });
}
