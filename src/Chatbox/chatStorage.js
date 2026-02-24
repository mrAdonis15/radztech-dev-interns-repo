import { CHAT_STORAGE_KEY, CHAT_HISTORY_STORAGE_KEY } from "./chatboxConstants.js";

export function loadMessages() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    
    // Remove duplicate messages by ID
    const uniqueMessages = [];
    const seenIds = new Set();
    for (const msg of parsed) {
      if (!seenIds.has(msg.id)) {
        seenIds.add(msg.id);
        uniqueMessages.push(msg);
      }
    }
    
    return uniqueMessages.length > 0 ? uniqueMessages : null;
  } catch {
    return null;
  }
}

export function saveMessages(messages) {
  try {
    if (!messages || messages.length === 0) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (_) {}
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (_) {}
}

/** @param {Array<{id,sender,text,time}>} messages */
function getTitleFromMessages(messages) {
  const firstUser = messages.find((m) => m.sender === "me");
  if (firstUser && firstUser.text) {
    let text = firstUser.text.trim();
    if (!text) return "Chat";
    // Capitalize first letter for display
    text = text.charAt(0).toUpperCase() + text.slice(1);
    const maxLen = 40;
    return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
  }
  return "Chat";
}

/**
 * Add current conversation to history and return updated history.
 * @param {Array} messages
 * @returns {Array} updated history
 */
export function addToHistory(messages) {
  if (!messages || messages.length === 0) return loadHistory();
  const history = loadHistory();
  const item = {
    id: Date.now().toString(),
    title: getTitleFromMessages(messages),
    messages: [...messages],
    createdAt: Date.now(),
  };
  const next = [item, ...history].slice(0, 50);
  saveHistory(next);
  return next;
}

export function deleteHistoryItem(id) {
  const history = loadHistory().filter((h) => h.id !== id);
  saveHistory(history);
  return history;
}

export function getHistoryItem(id) {
  return loadHistory().find((h) => h.id === id) || null;
}
