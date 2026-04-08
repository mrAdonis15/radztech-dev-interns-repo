import axios from "axios";
import { getSelectedBiz, getBizName, getBizIxBiz } from "../selectedBiz";
import { getPythonBotAuthContext } from "./authContext";

const PYTHON_BOT_CHAT_URL =
  (typeof process !== "undefined" &&
    process.env?.REACT_APP_PYTHON_BOT_CHAT_URL) ||
  "http://localhost:3001/api/chat";

const FALLBACK_MESSAGE =
  "I can't access the live business data right now. Please reconnect the logged-in business account and try again.";

function parseChunkLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function getBizContext() {
  const biz = getSelectedBiz();
  if (!biz) return null;

  const rawSelectedBiz = (() => {
    try {
      const raw = localStorage.getItem("selectedBiz");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const fallbackBizName =
    biz?.bizName ||
    biz?.business?.name ||
    biz?.data?.name ||
    rawSelectedBiz?.biz?.name ||
    rawSelectedBiz?.business?.name ||
    rawSelectedBiz?.data?.name;

  const fallbackBizId =
    biz?.businessId ||
    biz?.bizId ||
    biz?.id ||
    biz?.iXBiz ||
    biz?.business?.id ||
    biz?.business?.ixBiz ||
    biz?.data?.id ||
    rawSelectedBiz?.biz?.ixBiz ||
    rawSelectedBiz?.biz?.id;

  return {
    bizName:
      getBizName() || biz?.name || biz?.sBiz || fallbackBizName || "Unknown",
    bizId: getBizIxBiz() || biz?.ixBiz || biz?.id || fallbackBizId,
    bizInfo: biz,
  };
}

export async function sendToPythonBot(userMessage, signal = undefined) {
  try {
    const bizContext = getBizContext();
    const authContext = getPythonBotAuthContext();
    const payload = {
      message: userMessage,
      ...(bizContext && { bizContext }),
      ...(authContext && { authContext }),
    };

    const response = await axios.post(PYTHON_BOT_CHAT_URL, payload, { signal });

    const data = response?.data || {};
    const text =
      typeof data.response === "string"
        ? data.response
        : typeof data.text === "string"
          ? data.text
          : "";

    return {
      type: data.type === "chart" || data.type === "img" ? data.type : "text",
      text: text || FALLBACK_MESSAGE,
      ...(data.images && Array.isArray(data.images)
        ? { images: data.images }
        : {}),
    };
  } catch (err) {
    const isCanceled =
      err?.name === "CanceledError" ||
      err?.code === "ERR_CANCELED" ||
      err?.message === "canceled";

    if (isCanceled) {
      throw err;
    }

    console.error("PythonBot service error:", err);
    return {
      type: "text",
      text: FALLBACK_MESSAGE,
    };
  }
}

export async function streamFromPythonBot(
  userMessage,
  { signal, onToken, onDone } = {},
) {
  const bizContext = getBizContext();
  const authContext = getPythonBotAuthContext();
  const response = await fetch(
    PYTHON_BOT_CHAT_URL.replace(/\/api\/chat$/, "/api/chat/stream"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        ...(bizContext && { bizContext }),
        ...(authContext && { authContext }),
      }),
      signal,
    },
  );

  if (!response.ok || !response.body) {
    throw new Error("Streaming endpoint unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let carry = "";
  let finalPayload = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    carry += decoder.decode(value, { stream: true });

    const lines = carry.split("\n");
    carry = lines.pop() || "";

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const parsed = parseChunkLine(line);
      if (!parsed) continue;

      if (parsed.type === "token" && typeof parsed.token === "string") {
        if (onToken) onToken(parsed.token);
      }
      if (parsed.type === "final") {
        finalPayload = parsed;
      }
    }
  }

  if (carry.trim()) {
    const parsed = parseChunkLine(carry.trim());
    if (parsed?.type === "final") {
      finalPayload = parsed;
    }
  }

  const result = {
    type: finalPayload?.messageType || "text",
    text: finalPayload?.text || "",
    ...(Array.isArray(finalPayload?.images)
      ? { images: finalPayload.images }
      : {}),
  };

  if (onDone) onDone(result);
  return result;
}
