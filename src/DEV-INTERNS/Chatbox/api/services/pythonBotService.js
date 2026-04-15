import axios from "axios";
import { getSelectedBiz, getBizName, getBizIxBiz } from "../selectedBiz";
import { getPythonBotAuthContext } from "./authContext";
import { setBiz } from "./businessService";

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

function extractDataAccessToken(payload) {
  if (!payload || typeof payload !== "object") return null;
  return (
    payload.token ||
    payload.dataAccessToken ||
    payload.accessToken ||
    payload.access_token ||
    payload.bizToken ||
    payload?.data?.token ||
    payload?.data?.dataAccessToken ||
    payload?.biz?.token ||
    payload?.biz?.dataAccessToken ||
    null
  );
}

function parseSelectedBizStorage() {
  try {
    const raw = localStorage.getItem("selectedBiz");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistRefreshedSelectedBiz(payload) {
  if (typeof localStorage === "undefined") return false;

  const existing = parseSelectedBizStorage();
  const next =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...existing }
      : {};

  const incoming =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload
      : null;
  if (!incoming) return false;

  const incomingBiz =
    incoming.biz &&
    typeof incoming.biz === "object" &&
    !Array.isArray(incoming.biz)
      ? incoming.biz
      : incoming;

  const existingBiz =
    next.biz && typeof next.biz === "object" && !Array.isArray(next.biz)
      ? next.biz
      : {};

  const token =
    extractDataAccessToken(incoming) || extractDataAccessToken(incomingBiz);

  next.biz = {
    ...existingBiz,
    ...incomingBiz,
  };

  if (token) {
    next.token = token;
    next.dataAccessToken = token;
    next.biz.token = token;
    next.biz.dataAccessToken = token;
  }

  localStorage.setItem("selectedBiz", JSON.stringify(next));
  return Boolean(token);
}

function resolveBizCode() {
  const selected = getSelectedBiz();
  return (
    getBizIxBiz() ||
    selected?.ixBiz ||
    selected?.iXBiz ||
    selected?.bizId ||
    selected?.businessId ||
    selected?.id ||
    selected?.business?.ixBiz ||
    selected?.business?.id ||
    selected?.data?.ixBiz ||
    selected?.data?.id ||
    null
  );
}

async function refreshSelectedBizToken() {
  if (typeof localStorage === "undefined") return false;

  const authToken = localStorage.getItem("authToken");
  const bizCode = resolveBizCode();
  if (!authToken || bizCode == null) return false;

  try {
    const response = await setBiz(authToken, bizCode);
    if (!response || response.status < 200 || response.status >= 300) {
      return false;
    }

    let payload = response.data;
    if (
      (payload == null || typeof payload !== "object") &&
      response.text &&
      response.text.trim()
    ) {
      try {
        payload = JSON.parse(response.text);
      } catch {
        payload = null;
      }
    }

    return persistRefreshedSelectedBiz(payload);
  } catch {
    return false;
  }
}

function buildPythonPayload(userMessage, conversationStyle, messageHistory) {
  const bizContext = getBizContext();
  const authContext = getPythonBotAuthContext();
  return {
    message: userMessage,
    conversationStyle,
    ...(messageHistory &&
      Array.isArray(messageHistory) &&
      messageHistory.length > 0 && { conversationHistory: messageHistory }),
    ...(bizContext && { bizContext }),
    ...(authContext && { authContext }),
  };
}

export async function sendToPythonBot(
  userMessage,
  signal = undefined,
  conversationStyle = "normal",
  messageHistory = [],
) {
  try {
    let payload = buildPythonPayload(
      userMessage,
      conversationStyle,
      messageHistory,
    );
    let response;

    try {
      response = await axios.post(PYTHON_BOT_CHAT_URL, payload, { signal });
    } catch (err) {
      const unauthorized = Number(err?.response?.status) === 401;
      if (!unauthorized) {
        throw err;
      }

      const refreshed = await refreshSelectedBizToken();
      if (!refreshed) {
        throw err;
      }

      payload = buildPythonPayload(
        userMessage,
        conversationStyle,
        messageHistory,
      );
      response = await axios.post(PYTHON_BOT_CHAT_URL, payload, { signal });
    }

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
  {
    signal,
    onToken,
    onDone,
    conversationStyle = "normal",
    messageHistory = [],
  } = {},
) {
  const streamUrl = PYTHON_BOT_CHAT_URL.replace(
    /\/api\/chat$/,
    "/api/chat/stream",
  );

  const requestStream = async () => {
    const payload = buildPythonPayload(
      userMessage,
      conversationStyle,
      messageHistory,
    );
    return fetch(streamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  };

  let response = await requestStream();
  if (response.status === 401) {
    const refreshed = await refreshSelectedBizToken();
    if (refreshed) {
      response = await requestStream();
    }
  }

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
