import React, { useState, useRef, useEffect } from "react";
import "src/Chatbox/Chatbox.css";
import "./ChatBoxMerlvin.css";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ChatIcon from "@material-ui/icons/Chat";

import { sendMessageToPythonAI, initializePythonAI } from "./pythonAIService";
import {
  getInitialMessages,
  PANEL_PADDING,
  DEFAULT_BOTTOM,
} from "src/Chatbox/chatboxConstants.js";
import { useChatboxTheme } from "src/Chatbox/useChatboxTheme.js";
import {
  loadHistory,
  addToHistory,
  deleteHistoryItem,
  ChatHeader,
} from "src/Chatbox/chatboxUtils.js";
import ChatMessage from "src/Chatbox/ChatMessage.js";
import ChatInputArea from "src/Chatbox/ChatInputArea.js";
import ChatHistory from "src/Chatbox/ChatHistory.js";

export default function ChatBoxPythonAI() {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const [messages, setMessages] = useState(() => getInitialMessages());
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [panelPosition, setPanelPosition] = useState({ x: null, y: null });
  const [showHistoryOpen, setShowHistoryOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory());
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const theme = useChatboxTheme(rootRef);

  const buildMessage = (sender, text) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
    time: new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  });

  const buildMessageWithType = (sender, text, type = "text", data = null) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
    type,
    data,
    time: new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  });

  // Initialize Python AI on mount
  useEffect(() => {
    const init = async () => {
      try {
        const success = await initializePythonAI();
        setIsInitialized(success);
        if (!success) {
          setMessages((prev) => [
            ...prev,
            buildMessage(
              "bot",
              "Warning: Failed to initialize authentication. Please refresh the page.",
            ),
          ]);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setIsInitialized(false);
      }
    };
    init();
  }, []);

  // Scroll to latest messages when messages change or panel opens
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !isOpen) return;

    const handleScroll = () => {
      el.scrollTop = el.scrollHeight;
    };

    setTimeout(handleScroll, 0);
  }, [messages, isOpen]);

  useEffect(() => {
    const applyPrototypeTitle = () => {
      if (!rootRef.current) return;
      const titleNodes = rootRef.current.querySelectorAll(".chat-titleText");
      titleNodes.forEach((node) => {
        node.textContent = "Python Prototype AI";
      });
    };

    applyPrototypeTitle();
    const timer = setInterval(applyPrototypeTitle, 250);
    return () => clearInterval(timer);
  }, [isOpen, isExpanded]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isInitialized) return;

    // Create user message
    const userMsg = buildMessage("me", input);
    const currentInput = input;
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Send to Python AI
      const response = await sendMessageToPythonAI(currentInput);

      const payload = response?.response ?? response;
      const messageType =
        payload?.message_type || response?.message_type || "text";

      // Extract chart data and text differently based on message type
      let chartData = null;
      let messageText = "";

      const responseLooksLikeChart =
        messageType === "chart" ||
        !!payload?.chartData ||
        !!payload?.datasets ||
        !!response?.chartData;

      if (responseLooksLikeChart) {
        // Flatten chart data structure to match ChartWithControls expectations
        const chartResponse = payload;
        const chartDataSource = chartResponse?.chartData || chartResponse;
        chartData = {
          chartType: chartResponse?.chartType || "bar",
          title: chartResponse?.title || "Chart",
          labels: chartDataSource?.labels || [],
          datasets: chartDataSource?.datasets || [],
        };
        messageText =
          chartResponse?.message || response?.message || "Here's your chart:";
      } else {
        // For text responses
        messageText =
          typeof payload === "string"
            ? payload
            : response?.message || payload?.message || "No response received";
      }

      const botMsg = buildMessageWithType(
        "bot",
        messageText,
        messageType,
        chartData,
      );

      setMessages((prev) => {
        const nextMessages = [...prev, botMsg];
        const updatedHistory = addToHistory(nextMessages);
        setHistory(updatedHistory);
        return nextMessages;
      });
    } catch (error) {
      const errorMsg = buildMessage("bot", `Error: ${error.message}`);
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  const handleNewChat = () => {
    setMessages(getInitialMessages());
    setInput("");
    // Add welcome message
    setMessages((prev) => [
      ...prev,
      buildMessage("bot", "New conversation started. How can I help?"),
    ]);
  };

  const handleSelectHistoryChat = (historyItem) => {
    setMessages(getInitialMessages());
    setInput(historyItem.title);
    setShowHistoryOpen(false);
  };

  const handleDeleteHistoryChat = (id) => {
    deleteHistoryItem(id);
    setHistory(loadHistory());
  };

  const handleDragStart = (e) => {
    const startX = e.clientX - panelRef.current.offsetLeft;
    const startY = e.clientY - panelRef.current.offsetTop;

    const handleMouseMove = (moveEvent) => {
      setPanelPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
      {/* Floating Chat Button */}
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
          // Full-page mode
          <div className="chat-expanded-wrap">
            <Paper
              ref={panelRef}
              className="chat-panel chat-panel-popup chat-panel-expanded online"
              elevation={8}
            >
              <ChatHeader
                title="Python Prototype Chat Bot"
                onMinimize={() => {
                  setPanelPosition({ x: null, y: null });
                  setIsExpanded(false);
                  setIsOpen(true);
                }}
                onClose={() => {
                  setPanelPosition({ x: null, y: null });
                  setIsExpanded(false);
                  setIsOpen(true);
                }}
                onDragStart={undefined}
                onHistoryClick={() => {
                  setHistory(loadHistory());
                  setShowHistoryOpen(true);
                }}
                onNewChatClick={handleNewChat}
                isExpanded={isExpanded}
                onExpandToggle={() => setIsExpanded((e) => !e)}
              />

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
            </Paper>
          </div>
        ) : (
          // Mini-panel mode
          <Paper
            ref={panelRef}
            className="chat-panel chat-panel-popup online"
            elevation={8}
            style={panelStyle}
          >
            <ChatHeader
              title="Python Prototype Chat Bot"
              onMinimize={() => {
                setPanelPosition({ x: null, y: null });
                setIsOpen(false);
              }}
              onClose={() => {
                setPanelPosition({ x: null, y: null });
                setIsOpen(false);
              }}
              onDragStart={handleDragStart}
              onHistoryClick={() => {
                setHistory(loadHistory());
                setShowHistoryOpen(true);
              }}
              onNewChatClick={handleNewChat}
              isExpanded={isExpanded}
              onExpandToggle={() => setIsExpanded((e) => !e)}
            />

            <div className="chat-body" ref={bodyRef}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg} />
                ))}
                {isLoading && (
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
                          Typing...
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}
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
