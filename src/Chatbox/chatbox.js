import React, { useState, useRef, useEffect } from "react";
import "./Chatbox.css";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ChatIcon from "@material-ui/icons/Chat";

import { sendToGemini } from "./geminiService.js";
import {
  getInitialMessages,
  getDefaultPanelPosition,
  SLASH_OPTIONS,
  STATIC_REPLY,
  PANEL_PADDING,
  DEFAULT_BOTTOM,
} from "./chatboxConstants.js";
import { createMessage } from "./chatboxUtils.js";
import { useChatboxTheme } from "./useChatboxTheme.js";
import {
  loadMessages,
  saveMessages,
  loadHistory,
  addToHistory,
  deleteHistoryItem,
} from "./chatStorage.js";
import ChatHeader from "./ChatHeader.js";
import ChatMessage from "./ChatMessage.js";
import ChatInputArea from "./ChatInputArea.js";
import ChatHistory from "./ChatHistory.js";

export default function Chatbox() {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const isSendingRef = useRef(false);

  const [messages, setMessages] = useState(() => loadMessages() || getInitialMessages());
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: null, y: null });
  const [showHistoryOpen, setShowHistoryOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory());

  const theme = useChatboxTheme(rootRef);

  const filteredSlashOptions = SLASH_OPTIONS.filter((opt) => {
    const afterSlash = input.slice(1).toLowerCase();
    return (
      afterSlash === "" ||
      opt.command.toLowerCase().startsWith(afterSlash) ||
      opt.label.toLowerCase().includes(afterSlash)
    );
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Persist messages to localStorage when they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Click outside to close emoji/slash menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        !e.target.closest(".emoji-wrapper") &&
        !e.target.closest(".emoji-picker-dropdown")
      )
        setShowEmoji(false);
      if (!e.target.closest(".slash-menu-wrapper")) setShowSlashMenu(false);
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

  const handleSlashSelect = (opt) => {
    setInput("/" + opt.command + " ");
    setShowSlashMenu(false);
    setSelectedSlashIndex(0);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSendingRef.current) return;

    isSendingRef.current = true;
    const userMsgId = crypto.randomUUID();
    const userMsg = createMessage(userMsgId, "me", text);
    
    setInput("");
    setShowEmoji(false);

    const placeholderId = crypto.randomUUID();
    const typingMsg = createMessage(placeholderId, "bot", "...");
    
    setMessages((prev) => [...prev, userMsg, typingMsg]);

    // Strip /ai prefix if present, but send all messages to AI
    let messageForAi = text;
    if (text.startsWith("/")) {
      messageForAi = text.slice(1).trim();
      if (messageForAi.toLowerCase().startsWith("ai ")) {
        messageForAi = messageForAi.slice(3).trim();
      }
    }
    messageForAi = messageForAi || "Hello";

    sendToGemini(messageForAi, messages)
      .then((reply) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId ? { ...msg, text: reply } : msg
          )
        );
      })
      .catch(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? { ...msg, text: "Sorry, something went wrong. Please try again." }
              : msg
          )
        );
      })
      .finally(() => {
        isSendingRef.current = false;
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
    if (showSlashMenu && filteredSlashOptions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSlashIndex((i) => (i + 1) % filteredSlashOptions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSlashIndex(
          (i) => (i - 1 + filteredSlashOptions.length) % filteredSlashOptions.length
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleSlashSelect(filteredSlashOptions[selectedSlashIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }
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
    <div className="chat-root chat-root-popup" ref={rootRef}>
      <button
        type="button"
        className="chat-toggle-button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        <ChatIcon fontSize="large" />
      </button>

      {isOpen && (
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
            onMinimize={() => setIsOpen(false)}
            onClose={() => setIsOpen(false)}
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
                      <Typography variant="body2" className="bubble-text left">
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
                showSlashMenu={showSlashMenu}
                setShowSlashMenu={setShowSlashMenu}
                selectedSlashIndex={selectedSlashIndex}
                setSelectedSlashIndex={setSelectedSlashIndex}
                filteredSlashOptions={filteredSlashOptions}
                onSlashSelect={handleSlashSelect}
                onEmojiClick={handleEmojiClick}
                onSend={handleSend}
                onKeyDown={handleKeyDown}
                onDragStart={handleDragStart}
                themeProps={theme}
              />
            </>
          )}
        </Paper>
      )}
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
