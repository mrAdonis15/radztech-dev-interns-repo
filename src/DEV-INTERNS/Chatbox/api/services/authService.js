import { request, buildUrl } from "../client/apiClient";
import { endpoints } from "../config/endpoints";
import { getPythonBotAuthContext } from "./authContext";

const { auth } = endpoints;
const PYTHON_BOT_DIAGNOSTICS_URL =
  (typeof process !== "undefined" &&
    process.env?.REACT_APP_PYTHON_BOT_CHAT_URL) ||
  "http://localhost:3001/api/auth/context-diagnostics";

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

/**
 * POST /api/auth/context-diagnostics — summarize auth fields for live-data calls.
 * @returns {Promise<{ status: number, data: any, text: string }>}
 */
export async function diagnosePythonBotAuth(
  authContext = null,
  bizContext = null,
) {
  const payload = {
    authContext: authContext || getPythonBotAuthContext(),
    ...(bizContext ? { bizContext } : {}),
  };

  const response = await fetch(
    PYTHON_BOT_DIAGNOSTICS_URL.replace(
      /\/api\/chat$/,
      "/api/auth/context-diagnostics",
    ),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {}

  return {
    status: response.status,
    data,
    text,
  };
}

const authService = {
  login,
  logout,
  diagnosePythonBotAuth,
};
export default authService;
