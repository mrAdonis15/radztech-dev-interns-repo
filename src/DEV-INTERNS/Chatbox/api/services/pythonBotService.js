import axios from "axios";
import { getSelectedBiz, getBizName, getBizIxBiz } from "../selectedBiz";

const PYTHON_BOT_CHAT_URL =
  (typeof process !== "undefined" &&
    process.env?.REACT_APP_PYTHON_BOT_CHAT_URL) ||
  "http://localhost:3001/api/chat";

const FALLBACK_MESSAGE =
  "PythonPrototype Chatbot is unavailable. Make sure PythonBotAI is running.";

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

  return {
    bizName: getBizName() || biz?.name || biz?.sBiz || "Unknown",
    bizId: getBizIxBiz() || biz?.ixBiz || biz?.id,
    bizInfo: biz,
  };
}

export async function sendToPythonBot(userMessage, signal = undefined) {
  try {
    const bizContext = getBizContext();
    const payload = {
      message: userMessage,
      ...(bizContext && { bizContext }),
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
  const response = await fetch(
    PYTHON_BOT_CHAT_URL.replace(/\/api\/chat$/, "/api/chat/stream"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        ...(bizContext && { bizContext }),
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
