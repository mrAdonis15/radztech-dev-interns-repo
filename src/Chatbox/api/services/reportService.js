import { request, buildUrl } from "../client/apiClient";
import { endpoints } from "../config/endpoints";
import { getBizToken } from "../selectedBiz";

const { reports, inventory, library } = endpoints;

function dataAccessHeaders() {
  const token = getBizToken();
  const h = { "Content-Type": "application/json" };
  if (token) h["x-access-tokens"] = token;
  return h;
}

export async function fetchWarehouse() {
  const url = buildUrl(inventory.warehouse);
  return request(url, { method: "GET", headers: dataAccessHeaders() });
}

export async function fetchProduct() {
  const url = buildUrl(library.product);
  return request(url, { method: "GET", headers: dataAccessHeaders() });
}

export async function fetchStockcard(body) {
  const url = buildUrl(reports.stockcard);
  return request(url, {
    method: "POST",
    headers: dataAccessHeaders(),
    body: body || {},
  });
}

export async function fetchStockcardGraph(body) {
  const url = buildUrl(reports.stockcardGraph);
  return request(url, {
    method: "POST",
    headers: dataAccessHeaders(),
    body: body || {},
  });
}

export default {
  fetchWarehouse,
  fetchProduct,
  fetchStockcard,
  fetchStockcardGraph,
};
