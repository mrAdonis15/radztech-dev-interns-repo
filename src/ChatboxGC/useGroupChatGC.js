import { useState, useEffect, useRef, useCallback } from "react";
import { createChatService } from "./chatService.js";
import { loadMessages, saveMessages } from "./chatStorageGC.js";
import { getInitialMessages } from "../Chatbox/chatboxConstants.js";
import { sendToAI } from "../services/pythonAIService.js";

/**
 * Converts backend-ready message to ChatMessage display format.
 * @param {{ id, userId, username, message, createdAt }} backendMsg
 * @param {string} currentUserId
 * @returns {{ id, sender, text, time }}
 */
export function backendToDisplay(backendMsg, currentUserId) {
  if (!backendMsg || !backendMsg.id) return null;
  const isMe = backendMsg.userId === currentUserId;
  const date = backendMsg.createdAt
    ? new Date(backendMsg.createdAt)
    : new Date();
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return {
    id: backendMsg.id,
    sender: isMe ? "me" : "other",
    text: backendMsg.message || "",
    time: time,
  };
}

/**
 * Builds sendMessage payload for chatService.
 * @param {string} roomId
 * @param {string} userId
 * @param {string} username
 * @param {string} text
 * @returns {{ roomId, userId, username, message }}
 */
export function buildSendPayload(roomId, userId, username, text) {
  return {
    roomId: roomId,
    userId: userId,
    username: username || "User",
    message: text.trim(),
  };
}

const DEFAULT_ROOM = "default-room";
const USER_ID_KEY = "chatbox-gc-user-id";
const USERNAME_KEY = "chatbox-gc-username";

function getOrCreateUserId() {
  try {
    let id = sessionStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = "user-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch (_) {
    return "user-" + Math.random().toString(36).slice(2, 10);
  }
}

function getOrCreateUsername() {
  try {
    let name = sessionStorage.getItem(USERNAME_KEY);
    if (!name) {
      name = "User " + Math.random().toString(36).slice(2, 6);
      sessionStorage.setItem(USERNAME_KEY, name);
    }
    return name;
  } catch (_) {
    return "User " + Math.random().toString(36).slice(2, 6);
  }
}

/**
 * Custom hook: connect to group chat, manage messages, handle send.
 * @param {Object} config
 * @param {string} [config.roomId] - Room identifier
 * @param {string} [config.userId] - Current user id (stable per session)
 * @param {string} [config.username] - Display name
 * @returns {{ messages, setMessages, handleSend, handleIncomingMessage }}
 */
export function useGroupChatGC(config) {
  const roomId = (config && config.roomId) || DEFAULT_ROOM;
  const userId = (config && config.userId) || getOrCreateUserId();
  const username = (config && config.username) || getOrCreateUsername();

  const [messages, setMessages] = useState(function init() {
    return loadMessages() || getInitialMessages();
  });

  const serviceRef = useRef(null);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const handleIncomingMessage = useCallback(function (backendMsg) {
    const display = backendToDisplay(backendMsg, userIdRef.current);
    if (!display) return;
    setMessages(function (prev) {
      if (
        prev.some(function (m) {
          return m.id === display.id;
        })
      ) {
        return prev;
      }
      return prev.concat(display);
    });
  }, []);

  useEffect(
    function connectEffect() {
      const service = createChatService(roomId);
      serviceRef.current = service;
      if (service.isSupported()) {
        service.connect(handleIncomingMessage);
      }
      return function cleanup() {
        service.disconnect();
        serviceRef.current = null;
      };
    },
    [roomId, handleIncomingMessage],
  );

  const handleSend = useCallback(
    function (text) {
      const trimmed = (text || "").trim();
      if (!trimmed) return;
      const service = serviceRef.current;
      const payload = buildSendPayload(roomId, userId, username, trimmed);
      const sentMsg = service ? service.sendMessage(payload) : null;
      const typingId = "typing-" + Date.now().toString(36);
      const nowTime = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      let aiHistory = messages;
      if (sentMsg) {
        const display = backendToDisplay(sentMsg, userId);
        if (display) {
          setMessages(function (prev) {
            if (
              prev.some(function (m) {
                return m.id === display.id;
              })
            ) {
              return prev;
            }
            return prev.concat(display);
          });
          aiHistory = messages.concat(display);
        }
      }

      setMessages(function (prev) {
        return prev.concat({
          id: typingId,
          sender: "other",
          text: "...",
          time: nowTime,
        });
      });

      sendToAI(trimmed, aiHistory)
        .then(function (reply) {
          const isChart =
            reply && typeof reply === "object" && reply.type === "chart";
          const replyText =
            typeof reply === "string" ? reply : String(reply?.text || "");

          const fallbackData = reply?.chartData
            ? {
                chartType: reply.chartType || "bar",
                title: reply.title || "Chart",
                labels: reply.chartData.labels || [],
                datasets: reply.chartData.datasets || [],
              }
            : null;

          const chartPayload = reply?.data || fallbackData;

          setMessages(function (prev) {
            const withoutTyping = prev.filter(function (m) {
              return m.id !== typingId;
            });
            return withoutTyping.concat(
              isChart
                ? {
                    id: "ai-" + Date.now().toString(36),
                    sender: "other",
                    type: "chart",
                    data: chartPayload,
                    text: replyText,
                    time: new Date().toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }),
                  }
                : {
                    id: "ai-" + Date.now().toString(36),
                    sender: "other",
                    text: replyText || "Sorry, I couldn't generate a reply.",
                    time: new Date().toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }),
                  },
            );
          });
        })
        .catch(function () {
          setMessages(function (prev) {
            const withoutTyping = prev.filter(function (m) {
              return m.id !== typingId;
            });
            return withoutTyping.concat({
              id: "ai-" + Date.now().toString(36),
              sender: "other",
              text: "Sorry, something went wrong. Please try again.",
              time: new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
            });
          });
        });
    },
    [roomId, userId, username, messages],
  );

  useEffect(
    function persistEffect() {
      saveMessages(messages);
    },
    [messages],
  );

  return {
    messages: messages,
    setMessages: setMessages,
    handleSend: handleSend,
    handleIncomingMessage: handleIncomingMessage,
  };
}
