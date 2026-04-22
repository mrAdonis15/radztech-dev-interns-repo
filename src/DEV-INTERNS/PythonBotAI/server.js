const express = require("express");
const { spawn } = require("child_process");
const readline = require("readline");
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3001;

// Load .env file if it exists
const ENV_PATH = path.join(__dirname, ".env");
function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  try {
    const lines = fs.readFileSync(ENV_PATH, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (key && !(key in process.env)) process.env[key] = value;
    }
  } catch (e) {
    console.warn("[ENV] Could not read .env:", e.message);
  }
}
loadEnv();

// Save or update a single key in the .env file
function saveEnvKey(key, value) {
  let content = "";
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, "utf8");
  }
  const lines = content.split("\n");
  const prefix = `${key}=`;
  const idx = lines.findIndex((l) => l.startsWith(prefix));
  const newLine = `${key}=${value}`;
  if (idx >= 0) {
    lines[idx] = newLine;
  } else {
    lines.push(newLine);
  }
  fs.writeFileSync(
    ENV_PATH,
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n",
  );
  process.env[key] = value;
}

function removeEnvKeys(keys) {
  let content = "";
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, "utf8");
  }
  const lines = content.split("\n");
  const keySet = new Set(keys);
  const filtered = lines.filter((line) => {
    const idx = line.indexOf("=");
    if (idx < 1) return true;
    const key = line.slice(0, idx).trim();
    return !keySet.has(key);
  });

  fs.writeFileSync(
    ENV_PATH,
    filtered
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n",
  );

  for (const key of keySet) {
    delete process.env[key];
  }
}

// Update every api_fixed_auth_token entry in scraper_config.json
const SCRAPER_CONFIG_PATH = path.join(
  __dirname,
  "config",
  "scraper_config.json",
);
function updateScraperToken(token) {
  try {
    const cfg = JSON.parse(fs.readFileSync(SCRAPER_CONFIG_PATH, "utf8"));
    for (const section of Object.values(cfg)) {
      if (
        section &&
        typeof section === "object" &&
        "api_fixed_auth_token" in section
      ) {
        section.api_fixed_auth_token = token;
      }
    }
    fs.writeFileSync(SCRAPER_CONFIG_PATH, JSON.stringify(cfg, null, 2));
    console.log("[Auth] Scraper config token updated.");
  } catch (e) {
    console.error("[Auth] Failed to update scraper config:", e.message);
  }
}

function getCurrentSiteConnectionStatus() {
  let hasToken = false;
  try {
    const cfg = JSON.parse(fs.readFileSync(SCRAPER_CONFIG_PATH, "utf8"));
    for (const section of Object.values(cfg)) {
      if (
        section &&
        typeof section === "object" &&
        typeof section.api_fixed_auth_token === "string" &&
        section.api_fixed_auth_token.trim() !== ""
      ) {
        hasToken = true;
        break;
      }
    }
  } catch (_) {
    hasToken = false;
  }

  const hasSavedCreds = Boolean(
    (process.env.SITE_USERNAME || "").trim() &&
    (process.env.SITE_PASSWORD || "").trim(),
  );

  return {
    connected: hasToken,
    hasSavedCreds,
    hasToken,
    username: (process.env.SITE_USERNAME || "").trim() || null,
  };
}

function getTokenMaxAgeMs() {
  const rawHours = Number(process.env.SITE_TOKEN_MAX_AGE_HOURS || "20");
  const safeHours = Number.isFinite(rawHours) && rawHours > 0 ? rawHours : 20;
  return safeHours * 60 * 60 * 1000;
}

function isSavedTokenStale() {
  const updatedAt = (process.env.SITE_TOKEN_UPDATED_AT || "").trim();
  if (!updatedAt) return true;

  const ts = Date.parse(updatedAt);
  if (!Number.isFinite(ts)) return true;

  return Date.now() - ts >= getTokenMaxAgeMs();
}

let tokenRefreshPromise = null;

async function ensureValidSiteToken({ force = false } = {}) {
  const username = (process.env.SITE_USERNAME || "").trim();
  const password = (process.env.SITE_PASSWORD || "").trim();
  const devId = (process.env.SITE_DEV_ID || "").trim();

  if (!username || !password) {
    return { refreshed: false, skipped: true, reason: "missing_credentials" };
  }

  const status = getCurrentSiteConnectionStatus();
  const shouldRefresh = force || !status.hasToken || isSavedTokenStale();
  if (!shouldRefresh) {
    return { refreshed: false, skipped: true, reason: "token_still_fresh" };
  }

  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    const token = await loginToSite(username, password, devId);
    const check = await validateSiteApiToken(token, devId);
    if (!check.ok && isStrictTokenValidationEnabled()) {
      const err = new Error(
        `Refreshed token rejected by validation endpoint (${check.statusCode}): ${check.body}`,
      );
      err.statusCode = 401;
      throw err;
    }

    updateScraperToken(token);
    saveEnvKey("SITE_TOKEN_UPDATED_AT", new Date().toISOString());

    return {
      refreshed: true,
      validation: check,
    };
  })();

  try {
    return await tokenRefreshPromise;
  } finally {
    tokenRefreshPromise = null;
  }
}

function extractToken(payload, tokenField) {
  if (!payload || typeof payload !== "object") return "";
  return (
    payload[tokenField] ||
    payload.token ||
    payload.access_token ||
    (payload.data && payload.data[tokenField]) ||
    (payload.data && payload.data.token) ||
    (payload.result && payload.result[tokenField]) ||
    (payload.result && payload.result.token) ||
    ""
  );
}

function loginAttempt({ loginUrl, headers, method, tokenField, body }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(loginUrl);
    const lib = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers,
    };

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const preview = (data || "").slice(0, 300);
        if ((res.statusCode || 0) >= 400) {
          const err = new Error(
            `Login failed with status ${res.statusCode}: ${preview}`,
          );
          err.statusCode = res.statusCode;
          return reject(err);
        }

        try {
          const json = data ? JSON.parse(data) : {};
          const token = extractToken(json, tokenField);
          if (token) {
            return resolve(token);
          }

          const headerToken =
            res.headers["x-access-token"] || res.headers["authorization"] || "";
          if (headerToken) {
            return resolve(String(headerToken).replace(/^Bearer\s+/i, ""));
          }

          const err = new Error(
            `No token found in ${method} login response. Keys: ${Object.keys(json).join(", ")}`,
          );
          err.statusCode = 502;
          return reject(err);
        } catch (e) {
          const err = new Error(
            `Invalid login response from upstream (${method}): ${preview}`,
          );
          err.statusCode = 502;
          return reject(err);
        }
      });
    });

    req.on("error", (e) => {
      const err = new Error(`Login request failed (${method}): ${e.message}`);
      err.statusCode = 502;
      reject(err);
    });

    if (method === "POST") {
      req.write(body || "{}");
    }
    req.end();
  });
}

// Login to the target site using basic auth; returns a Promise<string> token
async function loginToSite(username, password, devId) {
  const loginUrl =
    process.env.SITE_LOGIN_URL || "https://app.clone.ulap.biz/app/login";
  const tokenField = process.env.SITE_TOKEN_FIELD || "token";
  const effectiveDevId = devId || process.env.SITE_DEV_ID || "";
  const loginOrigin =
    process.env.SITE_LOGIN_ORIGIN || "https://app.clone.ulap.biz";
  const loginReferer =
    process.env.SITE_LOGIN_REFERER || "https://app.clone.ulap.biz/app/login";
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  let bodyObject = { username, password };
  if (effectiveDevId) {
    bodyObject.devID = effectiveDevId;
  }

  const customBody = (process.env.SITE_LOGIN_BODY_JSON || "").trim();
  if (customBody) {
    try {
      bodyObject = JSON.parse(customBody);
    } catch (e) {
      console.warn("[Auth] Invalid SITE_LOGIN_BODY_JSON, using default body.");
    }
  }
  const postBody = JSON.stringify(bodyObject || {});

  const reqHeaders = {
    Authorization: `Basic ${credentials}`,
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    Origin: loginOrigin,
    Referer: loginReferer,
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36",
  };

  if (effectiveDevId) {
    reqHeaders.Cookie = `devID=${effectiveDevId}`;
  }

  const preferredMethod = (
    process.env.SITE_LOGIN_METHOD || "POST"
  ).toUpperCase();
  const methods =
    preferredMethod === "POST" ? ["POST", "GET"] : ["GET", "POST"];

  let lastError = null;
  for (const method of methods) {
    try {
      return await loginAttempt({
        loginUrl,
        headers: reqHeaders,
        method,
        tokenField,
        body: postBody,
      });
    } catch (err) {
      lastError = err;
      console.warn(`[Auth] ${method} login attempt failed: ${err.message}`);
    }
  }

  throw lastError || new Error("Login failed after all retry methods.");
}

function validateSiteApiToken(token, devId) {
  return new Promise((resolve) => {
    const validationUrl =
      process.env.SITE_VALIDATE_URL ||
      "https://app.clone.ulap.biz/api/lib/brch";
    const validationMethod = (
      process.env.SITE_VALIDATE_METHOD || "GET"
    ).toUpperCase();

    const parsed = new URL(validationUrl);
    const lib = parsed.protocol === "https:" ? https : http;
    const headers = {
      "x-access-tokens": token,
      Accept: "application/json",
      "Content-Type": "application/json",
      Referer: "https://app.clone.ulap.biz/app/reports/sc",
      Origin: "https://app.clone.ulap.biz",
    };

    const effectiveDevId = devId || process.env.SITE_DEV_ID || "";
    if (effectiveDevId) {
      headers.Cookie = `devID=${effectiveDevId}`;
    }

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: validationMethod,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const body = (data || "").slice(0, 300);
          const statusCode = res.statusCode || 0;
          if (statusCode >= 200 && statusCode < 300) {
            return resolve({ ok: true, statusCode, body });
          }
          resolve({ ok: false, statusCode, body });
        });
      },
    );

    req.on("error", (err) => {
      resolve({
        ok: false,
        statusCode: 0,
        body: err.message || "Validation request failed",
      });
    });

    if (validationMethod === "POST") {
      req.write("{}");
    }
    req.end();
  });
}

function isStrictTokenValidationEnabled() {
  const raw = (process.env.SITE_STRICT_TOKEN_VALIDATION || "false")
    .toString()
    .trim()
    .toLowerCase();
  return ["1", "true", "yes", "on"].includes(raw);
}

// Attempt auto-login using stored .env credentials on startup / token expiry
async function tryAutoLogin() {
  const username = process.env.SITE_USERNAME;
  const password = process.env.SITE_PASSWORD;
  if (!username || !password) return;
  try {
    const token = await loginToSite(
      username,
      password,
      process.env.SITE_DEV_ID || "",
    );
    const check = await validateSiteApiToken(
      token,
      process.env.SITE_DEV_ID || "",
    );
    if (!check.ok) {
      console.warn(
        `[Auth] Auto-login produced a token rejected by data APIs (${check.statusCode}): ${check.body}`,
      );
      return;
    }
    updateScraperToken(token);
    saveEnvKey("SITE_TOKEN_UPDATED_AT", new Date().toISOString());
    console.log("[Auth] Auto-login successful. Site token refreshed.");
  } catch (e) {
    console.warn("[Auth] Auto-login failed:", e.message);
  }
}

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-access-tokens",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.static("public"));

// Python daemon worker state
let pythonProcess = null;
let pythonReady = false;
let pendingRequests = [];

function resolvePythonPath() {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;
  const workspaceVenvPython = path.join(__dirname, ".venv", "bin", "python");
  if (fs.existsSync(workspaceVenvPython)) return workspaceVenvPython;
  const repoRootVenvPython = path.join(
    __dirname,
    "..",
    "..",
    "..",
    ".venv",
    "bin",
    "python",
  );
  if (fs.existsSync(repoRootVenvPython)) return repoRootVenvPython;
  if (process.env.VIRTUAL_ENV) {
    return path.join(process.env.VIRTUAL_ENV, "bin", "python");
  }
  return "python3";
}

function clearPendingRequests(err) {
  const pending = pendingRequests;
  pendingRequests = [];
  pending.forEach((entry) => {
    clearTimeout(entry.timer);
    entry.reject(err);
  });
}

function startPythonProcess() {
  if (pythonProcess) return;

  pythonProcess = spawn(
    resolvePythonPath(),
    [path.join(__dirname, "src", "python_api.py"), "--daemon"],
    {
      stdio: ["pipe", "pipe", "pipe"],
    },
  );

  pythonReady = true;

  const rl = readline.createInterface({ input: pythonProcess.stdout });
  rl.on("line", (line) => {
    const current = pendingRequests.shift();
    if (!current) return;

    clearTimeout(current.timer);

    // Keep FIFO alignment intact: if a request already timed out,
    // consume and ignore this response instead of assigning it to the next request.
    if (current.expired) {
      return;
    }

    try {
      const parsed = JSON.parse(line);
      if (parsed && parsed.success) {
        current.resolve(parsed.response || "No response");
      } else {
        current.reject(new Error(parsed?.error || "Python daemon error"));
      }
    } catch (err) {
      current.reject(new Error(`Invalid daemon response: ${line}`));
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    const msg = String(data || "").trim();
    if (msg) {
      console.error(`[Python Error] ${msg}`);
    }
  });

  pythonProcess.on("exit", (code, signal) => {
    pythonProcess = null;
    pythonReady = false;
    clearPendingRequests(
      new Error(`Python daemon exited (code=${code}, signal=${signal})`),
    );
  });
}

function runPythonResponse(
  message,
  authContext = null,
  conversationStyle = "normal",
  conversationHistory = [],
) {
  return new Promise((resolve, reject) => {
    if (!pythonProcess || !pythonReady) {
      startPythonProcess();
    }

    if (!pythonProcess || !pythonProcess.stdin) {
      reject(new Error("Python daemon is not available"));
      return;
    }

    const request = {
      resolve,
      reject,
      timer: null,
      expired: false,
    };

    request.timer = setTimeout(() => {
      request.expired = true;
      reject(new Error("Request Timed Out"));
    }, 120000);

    pendingRequests.push(request);

    const payload = { message, conversation_style: conversationStyle };
    if (authContext && typeof authContext === "object") {
      payload.auth_context = authContext;
    }
    if (
      conversationHistory &&
      Array.isArray(conversationHistory) &&
      conversationHistory.length > 0
    ) {
      payload.conversation_history = conversationHistory;
    }
    pythonProcess.stdin.write(`${JSON.stringify(payload)}\n`);
  });
}

async function warmupModel() {
  // Temporarily disabled - warmup hangs on some prompts
  console.log("[Warmup] Skipped (disabled for debugging)");
  return;

  /* Original warmup code:
  try {
    console.log("[Warmup] Starting Python model warmup...");
    const warmupPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        console.warn(
          "[Warmup] Still loading model in background... Chat will work but may be slow.",
        );
        resolve();
      }, 90000);
      runPythonResponse("warm up model")
        .then((res) => {
          clearTimeout(timer);
          console.log("[Warmup] Python model is warm.");
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
    await warmupPromise;
  } catch (err) {
    console.warn("[Warmup] Failed:", err?.message || err);
  }
  */
}

function isCurrentBizPrompt(input) {
  const normalized = String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[?.!]+$/g, "")
    .replace(/\s+/g, " ");

  const directPrompts = new Set([
    "what is the current biz",
    "what's the current biz",
    "what biz are we currently using",
    "what biz are we using",
    "which biz are we using",
    "which business are we using",
    "what business are we currently using",
    "what is the current business",
    "what's the current business",
    "current biz",
    "current business",
    "which biz",
    "which is the current biz",
    "what is the selected biz",
    "what is the selected business",
    "selected biz",
    "selected business",
    "active biz",
    "active business",
  ]);

  if (directPrompts.has(normalized)) {
    return true;
  }

  // Handle natural variations like "what biz are we currently using?"
  return /\b(current|selected|active)\s+(biz|business)\b|\bwhich\s+(biz|business)\b|\bwhat\s+(biz|business)\b.*\b(using|used|selected|active|current)\b/.test(
    normalized,
  );
}

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      bizContext,
      authContext,
      auth_context,
      conversationStyle,
      conversationHistory,
    } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const normalizedStyle =
      conversationStyle &&
      ["formal", "normal", "casual"].includes(conversationStyle.toLowerCase())
        ? conversationStyle.toLowerCase()
        : "normal";

    const normalized = String(message).toLowerCase().trim();
    const isCurrentBiz = isCurrentBizPrompt(normalized);
    const currentBizText = `Current business is: ${bizContext?.bizName || "No business selected"}`;

    // Include biz context note only for business-data queries.
    const isBizDataPrompt =
      /\b(biz|business|inventory|stock|general ledger|ledger|gl\b|balance|accounts receivable|receivable|payable|report)\b/.test(
        normalized,
      );

    // Include biz context in the request sent to Python when relevant.
    let contextNote = "";
    if (isBizDataPrompt && bizContext && bizContext.bizName) {
      contextNote = `\n[Current Business: ${bizContext.bizName}]`;
    }

    if (
      /accounts?\s+currently\s+logged\s+in|are\s+there\s+any\s+accounts?\s+currently\s+logged\s+in|are\s+there\s+any\s+accounts?\s+logged\s+in|accounts?\s+logged\s+in|who\s+is\s+logged\s+in/.test(
        normalized,
      )
    ) {
      const status = getCurrentSiteConnectionStatus();
      const detail = status.connected
        ? `A company account is connected (${status.username || "saved credentials"}), but I cannot list active website user sessions from this endpoint.`
        : "No connected company account is currently stored.";

      return res.json({
        response: detail,
        type: "text",
      });
    }

    const messageWithContext = contextNote
      ? `${message}${contextNote}`
      : message;

    const resolvedAuthContext = authContext || auth_context || null;

    // If frontend provided authContext, prefer that session and avoid
    // overriding with potentially stale server-side fallback credentials.
    if (!resolvedAuthContext) {
      try {
        await ensureValidSiteToken();
      } catch (authErr) {
        console.warn(
          "[Auth] Token refresh skipped/failed before /api/chat:",
          authErr.message,
        );
      }
    }

    let response;
    try {
      response = await runPythonResponse(
        messageWithContext,
        resolvedAuthContext,
        normalizedStyle,
        conversationHistory,
      );
    } catch (err) {
      if (isCurrentBiz) {
        return res.json({
          response: currentBizText,
          type: "text",
        });
      }
      throw err;
    }

    const normalizedResponse = String(response || "")
      .trim()
      .toLowerCase();
    if (
      isCurrentBiz &&
      (!normalizedResponse ||
        normalizedResponse === "sorry, something went wrong. please try again")
    ) {
      return res.json({
        response: currentBizText,
        type: "text",
      });
    }

    return res.json({
      response,
      type: "text",
    });
  } catch (error) {
    console.error("Endpoint error:", error);
    if (error && error.message === "Request Timed Out") {
      return res.status(408).json({
        response: "Request Timed Out",
        error: "Request Timed Out",
      });
    }

    res.status(500).json({
      response: "Sorry, Something went wrong. Please try again",
      error: "Server error",
    });
  }
});

app.post("/api/chat/stream", async (req, res) => {
  try {
    const {
      message,
      bizContext,
      authContext,
      auth_context,
      conversationStyle,
      conversationHistory,
    } = req.body || {};
    if (!message || String(message).trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const normalizedStyle =
      conversationStyle &&
      ["formal", "normal", "casual"].includes(conversationStyle.toLowerCase())
        ? conversationStyle.toLowerCase()
        : "normal";

    const normalized = String(message).toLowerCase().trim();
    const isCurrentBiz = isCurrentBizPrompt(normalized);
    const currentBizText = `Current business is: ${bizContext?.bizName || "No business selected"}`;

    const isBizDataPrompt =
      /\b(biz|business|inventory|stock|general ledger|ledger|gl\b|balance|accounts receivable|receivable|payable|report)\b/.test(
        normalized,
      );

    let contextNote = "";
    if (isBizDataPrompt && bizContext && bizContext.bizName) {
      contextNote = `\n[Current Business: ${bizContext.bizName}]`;
    }

    const startedAt = Date.now();
    const messageWithContext = contextNote
      ? `${message}${contextNote}`
      : message;

    const resolvedAuthContext = authContext || auth_context || null;

    if (!resolvedAuthContext) {
      try {
        await ensureValidSiteToken();
      } catch (authErr) {
        console.warn(
          "[Auth] Token refresh skipped/failed before /api/chat/stream:",
          authErr.message,
        );
      }
    }

    let fullText = "";
    try {
      fullText = String(
        await runPythonResponse(
          messageWithContext,
          resolvedAuthContext,
          normalizedStyle,
          conversationHistory,
        ),
      );
    } catch (err) {
      if (isCurrentBiz) {
        fullText = currentBizText;
      } else {
        throw err;
      }
    }

    const normalizedResponse = String(fullText || "")
      .trim()
      .toLowerCase();
    if (
      isCurrentBiz &&
      (!normalizedResponse ||
        normalizedResponse === "sorry, something went wrong. please try again")
    ) {
      fullText = currentBizText;
    }

    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const tokens = fullText.match(/\S+\s*/g) || [fullText];
    for (const token of tokens) {
      res.write(`${JSON.stringify({ type: "token", token })}\n`);
      await new Promise((r) => setTimeout(r, 14));
    }

    res.write(
      `${JSON.stringify({ type: "final", messageType: "text", text: fullText, elapsed_ms: Date.now() - startedAt })}\n`,
    );
    return res.end();
  } catch (err) {
    console.error("Stream endpoint error:", err?.message || err);
    if (!res.headersSent) {
      if (err && err.message === "Request Timed Out") {
        return res.status(408).json({
          response: "Request Timed Out",
          error: "Request Timed Out",
        });
      }
      return res.status(500).json({ error: "Streaming failed" });
    }
    return res.end();
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI chatbot is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth diagnostics - reports which auth fields are present without exposing secrets.
app.post("/api/auth/context-diagnostics", async (req, res) => {
  const { authContext, auth_context, bizContext, biz_context } = req.body || {};
  const resolvedAuthContext = authContext || auth_context || null;
  const resolvedBizContext = bizContext || biz_context || null;

  const summary = {
    hasAuthContext: !!resolvedAuthContext,
    hasBizContext: !!resolvedBizContext,
    authFields: {},
    bizName:
      resolvedBizContext?.bizName ||
      resolvedBizContext?.name ||
      resolvedBizContext?.biz?.name ||
      null,
    upstreamValidation: null,
  };

  if (resolvedAuthContext && typeof resolvedAuthContext === "object") {
    summary.authFields = {
      user_auth_token: !!resolvedAuthContext.user_auth_token,
      data_access_token: !!resolvedAuthContext.data_access_token,
      user_cookie: !!resolvedAuthContext.user_cookie,
      csrf_token: !!resolvedAuthContext.csrf_token,
      auth_header_name: resolvedAuthContext.auth_header_name || null,
      csrf_header_name: resolvedAuthContext.csrf_header_name || null,
      extra_headers: !!resolvedAuthContext.extra_headers,
      extra_headers_has_x_data_access_token: !!(
        resolvedAuthContext.extra_headers &&
        typeof resolvedAuthContext.extra_headers === "object" &&
        resolvedAuthContext.extra_headers["x-data-access-token"]
      ),
    };
  }

  const tokenToValidate =
    resolvedAuthContext?.user_auth_token ||
    resolvedAuthContext?.data_access_token ||
    null;

  if (tokenToValidate) {
    try {
      const check = await validateSiteApiToken(
        String(tokenToValidate).trim(),
        process.env.SITE_DEV_ID || "",
      );
      summary.upstreamValidation = {
        ok: !!check.ok,
        statusCode: check.statusCode,
        bodyPreview:
          typeof check.body === "string"
            ? check.body.slice(0, 200)
            : check.body,
      };
    } catch (err) {
      summary.upstreamValidation = {
        ok: false,
        statusCode: err?.statusCode || 0,
        error: err?.message || "Validation failed",
      };
    }
  }

  return res.json(summary);
});

// Site login — accepts user credentials, logs into the target site, stores the token
app.post("/api/auth/site-login", async (req, res) => {
  const {
    username,
    password,
    dev_id,
    user_auth_token,
    authContext,
    auth_context,
  } = req.body || {};

  const providedAuthContext =
    authContext ||
    auth_context ||
    (user_auth_token ? { user_auth_token } : null);

  if (
    !username &&
    !password &&
    !(providedAuthContext && providedAuthContext.user_auth_token)
  ) {
    return res
      .status(400)
      .json({ error: "Username/password or a valid auth token is required." });
  }

  try {
    const effectiveDevId = dev_id || process.env.SITE_DEV_ID || "";
    let token = null;

    if (providedAuthContext && providedAuthContext.user_auth_token) {
      token = String(providedAuthContext.user_auth_token).trim();
    }

    if (!token) {
      token = await loginToSite(username, password, effectiveDevId);
    }

    const check = await validateSiteApiToken(token, effectiveDevId);
    const strictValidation = isStrictTokenValidationEnabled();

    // Persist credentials so the server can auto-refresh when the token expires
    saveEnvKey("SITE_USERNAME", username);
    saveEnvKey("SITE_PASSWORD", password);
    if (effectiveDevId) saveEnvKey("SITE_DEV_ID", effectiveDevId);

    // Apply the fresh token immediately to all scraper config sections
    updateScraperToken(token);
    saveEnvKey("SITE_TOKEN_UPDATED_AT", new Date().toISOString());

    if (!check.ok && strictValidation) {
      return res.status(401).json({
        error: "Login succeeded but upstream data API rejected the token.",
        details: `Validation status ${check.statusCode}: ${check.body}`,
        hint: "Your clone.ulap session likely needs a browser-issued token/cookie context. In this case, pass user_auth_token/user_cookie from the logged-in frontend session.",
      });
    }

    return res.json({
      success: true,
      message: check.ok
        ? "Connected successfully. Token updated."
        : "Connected with limited validation. Token saved, but one upstream endpoint rejected it.",
      warning: check.ok
        ? null
        : `Validation status ${check.statusCode}: ${check.body}`,
    });
  } catch (err) {
    console.error("[Auth] site-login error:", err.message);
    const statusCode =
      Number.isInteger(err.statusCode) && err.statusCode >= 400
        ? err.statusCode
        : 502;
    return res.status(statusCode).json({
      error: err.message || "Login failed.",
      hint: "If this keeps returning 500 from upstream, try setting SITE_LOGIN_METHOD=POST in .env and retry.",
    });
  }
});

// Site logout - clears saved site credentials + fixed scraper token
app.post("/api/auth/site-logout", async (_req, res) => {
  try {
    removeEnvKeys([
      "SITE_USERNAME",
      "SITE_PASSWORD",
      "SITE_DEV_ID",
      "SITE_LOGIN_METHOD",
      "SITE_TOKEN_UPDATED_AT",
    ]);
    updateScraperToken("");

    return res.json({
      success: true,
      message: "Disconnected successfully.",
    });
  } catch (err) {
    console.error("[Auth] site-logout error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to disconnect account.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🤖 AI Chatbot Web Server`);
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`🔗 Open http://localhost:${PORT} in your browser\n`);
  startPythonProcess();
  warmupModel();
  // Attempt token refresh on startup if credentials are already saved
  tryAutoLogin();

  // Keep daily-rotating site tokens fresh in long-running sessions.
  const refreshIntervalMs = 60 * 60 * 1000;
  setInterval(() => {
    ensureValidSiteToken().catch((err) => {
      console.warn("[Auth] Background token refresh failed:", err.message);
    });
  }, refreshIntervalMs).unref();
});

// Graceful shutdown
process.on("SIGINT", () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  process.exit(0);
});
