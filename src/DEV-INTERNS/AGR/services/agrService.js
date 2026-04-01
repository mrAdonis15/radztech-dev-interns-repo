import endPoints from "./endpoints";
import { getBizToken } from "../../Chatbox/api/selectedBiz";

const DEFAULT_TIMEOUT_MS = 60000;

function getAuthHeaders() {
  const authToken = localStorage.getItem("authToken");
  const bizToken = getBizToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (authToken) headers["x-access-tokens"] = authToken;
  if (bizToken) headers["x-data-access-token"] = bizToken;
  return headers;
}

/**
 * Execute AGR simulator report. POST body: ixDashboard, ixSim, dt1, dt2, ixBrch, settings.
 * @param {{ dt1?: string, dt2?: string, ixDashboard?: number, ixSim?: number, ixBrch?: number, settings?: object, [key: string]: any }} params
 * @returns {Promise<{ status: number, data?: any, text: string }>}
 */
export async function executeAGR(params = {}) {
  const url = endPoints.execute;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const firstDay = "01";
  const lastDay = String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, "0");
  let dt1 = params.dt1;
  let dt2 = params.dt2;
  if (!dt1 || !dt2) {
    dt1 = dt1 || `${y}-${m}-${firstDay}T00:00:00+08:00`;
    dt2 = dt2 || `${y}-${m}-${lastDay}T23:59:59+08:00`;
  }
  const body = {
    ixDashboard: params.ixDashboard ?? 10,
    ixSim: params.ixSim ?? 1705616,
    dt1: String(dt1),
    dt2: String(dt2),
    ixBrch: params.ixBrch ?? 3847,
    settings: params.settings ?? {},
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let data = text;
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const looksLikeJson = text && (text.trim().startsWith("{") || text.trim().startsWith("["));
    if (text && (contentType.includes("application/json") || looksLikeJson)) {
      try {
        data = text.trim() ? JSON.parse(text) : null;
      } catch (_) {
        data = text;
      }
    }
    return { status: res.status, data, text };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      return { status: 504, data: null, text: "Request timed out." };
    }
    throw err;
  }
}

/**
 * GET current AGR setup from save endpoint. Returns { data, dt1, dt2 } from values.kvs.sim_data.
 * @returns {Promise<{ status: number, data?: { data: any[], dt1: string, dt2: string }, text: string }>}
 */
export async function getSetupAGR() {
  const url = endPoints.save;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let data = text;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (text && (ct.includes("application/json") || (text.trim().startsWith("{") || text.trim().startsWith("[")))) {
      try {
        data = text.trim() ? JSON.parse(text) : null;
      } catch (_) {
        data = text;
      }
    }
    const simData = data?.values?.kvs?.sim_data ?? null;
    return { status: res.status, data: simData, text };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      return { status: 504, data: null, text: "Request timed out." };
    }
    throw err;
  }
}

/**
 * Save AGR setup via PUT. Body: { values: { kvs: { sim_data: { data, dt1, dt2 } } } }.
 * @param {{ data: any[], dt1: string, dt2: string }} payload - sim_data shape
 * @returns {Promise<{ status: number, data?: any, text: string }>}
 */
export async function saveAGR(payload) {
  const url = endPoints.save;
  const body = {
    values: {
      kvs: {
        sim_data: {
          data: payload.data ?? [],
          dt1: payload.dt1 ?? "2025-1-01T00:00:00+08:00",
          dt2: payload.dt2 ?? "2025-1-31T23:59:59+08:00",
        },
      },
    },
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    let data = text;
    if (text && (res.headers.get("content-type") || "").includes("application/json")) {
      try {
        data = text.trim() ? JSON.parse(text) : null;
      } catch (_) {
        data = text;
      }
    }
    return { status: res.status, data, text };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      return { status: 504, data: null, text: "Request timed out." };
    }
    throw err;
  }
}

const agrService = { executeAGR, getSetupAGR, saveAGR };
export default agrService;
