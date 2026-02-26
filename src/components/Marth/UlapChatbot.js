import React, { useState, useRef, useEffect } from "react";
import "src/Chatbox/Chatbox.css";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ChatIcon from "@material-ui/icons/Chat";

import { sendToGemini } from "./geminiService.js";
import {
  getInitialMessages,
  getDefaultPanelPosition,
  PANEL_PADDING,
  DEFAULT_BOTTOM,
} from "src/Chatbox/chatboxConstants.js";
import { useChatboxTheme } from "src/Chatbox/useChatboxTheme.js";
import {
  createMessage,
  loadMessages,
  saveMessages,
  loadHistory,
  addToHistory,
  deleteHistoryItem,
  ChatHeader,
} from "src/Chatbox/chatboxUtils.js";
import ChatMessage from "src/Chatbox/ChatMessage.js";
import ChatInputArea from "src/Chatbox/ChatInputArea.js";
import ChatHistory from "src/Chatbox/ChatHistory.js";

export default function Chatbox() {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const [messages, setMessages] = useState(
    () => loadMessages() || getInitialMessages(),
  );
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: null, y: null });
  const [showHistoryOpen, setShowHistoryOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory());
  const [isExpanded, setIsExpanded] = useState(false);

  const theme = useChatboxTheme(rootRef);

  // Scroll to latest messages when messages change or panel opens
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !isOpen) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    requestAnimationFrame(() => {
      scrollToBottom();
      requestAnimationFrame(scrollToBottom);
    });
  }, [messages, isOpen, isExpanded]);

  // Persist messages to localStorage when they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Click outside to close emoji picker
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        !e.target.closest(".emoji-wrapper") &&
        !e.target.closest(".emoji-picker-dropdown")
      )
        setShowEmoji(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set initial panel position when opening
  useEffect(() => {
    if (isOpen && panelPosition.x === null && panelPosition.y === null) {
      setPanelPosition(getDefaultPanelPosition());
    }
  }, [isOpen, panelPosition.x, panelPosition.y]);

  // Drag disabled - chat box stays fixed
  const handleDragStart = () => {};

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = createMessage(Date.now(), "me", text);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowEmoji(false);

    const placeholderId = Date.now() + 1;
    const typingMsg = createMessage(placeholderId, "bot", "...");
    setMessages((prev) => [...prev, typingMsg]);

    let messageForAi = text.trim() || "Hello";

    sendToGemini(messageForAi, messages)
      .then((reply) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? reply.type === "chart"
                ? {
                    ...msg,
                    type: "chart",
                    data: structuredClone(reply.data),
                    text: reply.text || "",
                  }
                : {
                    ...msg,
                    type: "text",
                    text: reply.text,
                  }
              : msg,
          ),
        );
      })
      .catch(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? {
                  ...msg,
                  text: "Sorry, I'm having trouble processing your request. Please try again.",
                }
              : msg,
          ),
        );
      });
  };

  const handleNewChat = () => {
    const hasUserMessage = messages.some((m) => m.sender === "me");
    if (hasUserMessage && messages.length > 0) {
      addToHistory(messages);
      setHistory(loadHistory());
    }
    setMessages(getInitialMessages());
    setShowHistoryOpen(false);
  };

  const handleSelectHistoryChat = (item) => {
    setMessages(item.messages || []);
    setShowHistoryOpen(false);
  };

  const handleDeleteHistoryChat = (id) => {
    setHistory(deleteHistoryItem(id));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const panelStyle =
    panelPosition.x !== null && panelPosition.y !== null
      ? { left: panelPosition.x, top: panelPosition.y }
      : {
          right: PANEL_PADDING,
          bottom: DEFAULT_BOTTOM,
          left: "auto",
          top: "auto",
        };

  return (
    <div
      className={
        "chat-root chat-root-popup" + (isExpanded ? " chat-root-expanded" : "")
      }
      ref={rootRef}
    >
      <button
        type="button"
        className="chat-toggle-button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        <ChatIcon fontSize="large" />
      </button>

      {isOpen &&
        (isExpanded ? (
          <div className="chat-expanded-wrap">
            <Paper
              ref={panelRef}
              className={
                "chat-panel chat-panel-popup chat-panel-expanded " +
                (maintenanceOpen ? "maintenance" : "online")
              }
              elevation={8}
            >
              <ChatHeader
                maintenanceOpen={maintenanceOpen}
                onMaintenanceChange={setMaintenanceOpen}
                onMinimize={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                onClose={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                onDragStart={handleDragStart}
                onHistoryClick={
                  maintenanceOpen
                    ? undefined
                    : () => {
                        setHistory(loadHistory());
                        setShowHistoryOpen(true);
                      }
                }
                onNewChatClick={maintenanceOpen ? undefined : handleNewChat}
                isExpanded={isExpanded}
                onExpandToggle={() => setIsExpanded((e) => !e)}
              />
              {maintenanceOpen ? (
                <div className="chat-body">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginLeft: 16,
                        }}
                      >
                        <div className="chat-bubbleLeft">
                          <Typography
                            variant="body2"
                            className="bubble-text left"
                          >
                            Service is currently under maintenance.
                          </Typography>
                        </div>
                        <Typography
                          variant="caption"
                          className="bubble-time left"
                          style={{ marginTop: 6, marginLeft: 4 }}
                        >
                          {new Date().toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="chat-body" ref={bodyRef}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {messages.map((msg) => (
                        <ChatMessage key={msg.id} msg={msg} />
                      ))}
                    </div>
                  </div>
                  <ChatInputArea
                    input={input}
                    setInput={setInput}
                    inputRef={inputRef}
                    showEmoji={showEmoji}
                    setShowEmoji={setShowEmoji}
                    onEmojiClick={handleEmojiClick}
                    onSend={handleSend}
                    onKeyDown={handleKeyDown}
                    onDragStart={handleDragStart}
                    themeProps={theme}
                    isExpanded={true}
                  />
                </>
              )}
            </Paper>
          </div>
        ) : (
          <Paper
            ref={panelRef}
            className={
              "chat-panel chat-panel-popup " +
              (maintenanceOpen ? "maintenance" : "online")
            }
            elevation={8}
            style={panelStyle}
          >
            <ChatHeader
              maintenanceOpen={maintenanceOpen}
              onMaintenanceChange={setMaintenanceOpen}
              onMinimize={() => {
                setIsOpen(false);
                setIsExpanded(false);
              }}
              onClose={() => {
                setIsOpen(false);
                setIsExpanded(false);
              }}
              onDragStart={handleDragStart}
              onHistoryClick={
                maintenanceOpen
                  ? undefined
                  : () => {
                      setHistory(loadHistory());
                      setShowHistoryOpen(true);
                    }
              }
              onNewChatClick={maintenanceOpen ? undefined : handleNewChat}
              isExpanded={isExpanded}
              onExpandToggle={() => setIsExpanded((e) => !e)}
            />

            {maintenanceOpen ? (
              <div className="chat-body">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: 16,
                      }}
                    >
                      <div className="chat-bubbleLeft">
                        <Typography
                          variant="body2"
                          className="bubble-text left"
                        >
                          Service is currently under maintenance.
                        </Typography>
                      </div>
                      <Typography
                        variant="caption"
                        className="bubble-time left"
                        style={{ marginTop: 6, marginLeft: 4 }}
                      >
                        {new Date().toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="chat-body" ref={bodyRef}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} msg={msg} />
                    ))}
                  </div>
                </div>
                <ChatInputArea
                  input={input}
                  setInput={setInput}
                  inputRef={inputRef}
                  showEmoji={showEmoji}
                  setShowEmoji={setShowEmoji}
                  onEmojiClick={handleEmojiClick}
                  onSend={handleSend}
                  onKeyDown={handleKeyDown}
                  onDragStart={handleDragStart}
                  themeProps={theme}
                  isExpanded={false}
                />
              </>
            )}
          </Paper>
        ))}
      <ChatHistory
        open={showHistoryOpen}
        onClose={() => setShowHistoryOpen(false)}
        history={history}
        onSelectChat={handleSelectHistoryChat}
        onDeleteChat={handleDeleteHistoryChat}
      />
    </div>
  );
}
