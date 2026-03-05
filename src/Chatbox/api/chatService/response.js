/**
 * raw AI gateway response → { type, text, data? }. 
 */

const NOT_CONFIGURED_MESSAGE = "I don't have data on that, or no data available for that.";
const FALLBACK_MESSAGE = "I don't have data on that, or no data available for that.";

/**
 * Get content parts from Gemini-style response (handles both raw and wrapped in .data).
 * @param {unknown} data
 * @returns {Array<{ text?: string, functionCall?: { name: string, args?: object } }>|null}
 */
export function getResponseParts(data) {
  if (data == null || typeof data !== "object") return null;
  const c = data?.candidates?.[0]?.content?.parts ?? data?.data?.candidates?.[0]?.content?.parts;
  return Array.isArray(c) ? c : null;
}

/**
 * Extract text from various backend response shapes.
 * Handles Gemini-style (candidates[0].content.parts[0].text) and common wrappers (data.text, output, result).
 * When tools are used, parts may contain functionCall instead of text; we use the first text part if present.
 * @param {unknown} data
 * @returns {string | null}
 */
function extractText(data) {
  if (data == null) return null;
  if (typeof data === "string") return data.trim() || null;
  if (typeof data !== "object") return null;
  const parts = getResponseParts(data);
  const fromPart = parts ? parts.find((p) => p?.text)?.text : null;
  if (fromPart != null && String(fromPart).trim()) return String(fromPart).trim();
  const c = data?.candidates?.[0]?.content?.parts ?? data?.data?.candidates?.[0]?.content?.parts;
  const fromPartLegacy = Array.isArray(c) ? c.find((p) => p?.text)?.text : null;
  if (fromPartLegacy != null && String(fromPartLegacy).trim()) return String(fromPartLegacy).trim();
  const t =
    data?.text ??
    data?.reply ??
    data?.message ??
    (typeof data?.output === "string" ? data.output : data?.output?.text) ??
    (typeof data?.result === "string" ? data.result : data?.result?.text) ??
    data?.response?.text ??
    data?.response ??
    data?.data?.text ??
    data?.data?.reply ??
    data?.data?.message;
  if (t != null && typeof t === "string" && t.trim()) return t.trim();
  if (typeof t === "string") return t.trim() || null;
  return null;
}

/**
 * @param {number} status
 * @param {unknown} data
 * @returns {{ type: "text" | "chart", text: string, data?: object }}
 */
export function normalizeAiResponse(status, data) {
  const text = status >= 200 && status < 300 ? extractText(data) : null;
  const trimmed = text != null ? String(text).trim() : "";
  const isNotConfigured = /not\s+configured/i.test(trimmed);
  if (trimmed && !isNotConfigured) {
    const hasChart = data && typeof data === "object" && data.type === "chart" && data.data != null;
    if (hasChart) {
      return {
        type: "chart",
        text: trimmed,
        data: data.data,
      };
    }
    return { type: "text", text: trimmed };
  }
  return { type: "text", text: isNotConfigured ? NOT_CONFIGURED_MESSAGE : FALLBACK_MESSAGE };
}
