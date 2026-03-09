  import React, { useState, useRef, useEffect } from "react";
  import "../Chatbox/Chatbox.css";
  import "./ChatboxGC.css";
  import Paper from "@material-ui/core/Paper";
  import Typography from "@material-ui/core/Typography";
  import ChatIcon from "@material-ui/icons/Chat";

  import {
    getInitialMessages,
    getDefaultPanelPosition,
    PANEL_PADDING,
    DEFAULT_BOTTOM,
  } from "../Chatbox/chatboxConstants.js";
  import { useGroupChatGC } from "./useGroupChatGC.js";
  import { useChatboxTheme } from "../Chatbox/useChatboxTheme.js";
  import {
    loadHistory,
    addToHistory,
    deleteHistoryItem,
  } from "./chatStorageGC.js";
  import { ChatHeader } from "../Chatbox/chatboxUtils.js";
  import ChatMessage from "../Chatbox/ChatMessage.js";
  import ChatInputArea from "../Chatbox/ChatInputArea.js";
  import ChatHistory from "../Chatbox/ChatHistory.js";

  export default function ChatboxGC() {
    const rootRef = useRef(null);
    const bodyRef = useRef(null);
    const inputRef = useRef(null);
    const panelRef = useRef(null);

    const {
      messages,
      setMessages,
      handleSend: handleSendMessage,
    } = useGroupChatGC({ roomId: "ulap-gc-default", userId: undefined, username: "User" });
    const [input, setInput] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [maintenanceOpen, setMaintenanceOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [panelPosition, setPanelPosition] = useState({ x: null, y: null });
    const [showHistoryOpen, setShowHistoryOpen] = useState(false);
    const [history, setHistory] = useState(loadHistory());
    const [isExpanded, setIsExpanded] = useState(false);

    const theme = useChatboxTheme(rootRef);

    useEffect(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
      }
    }, [messages]);

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

    useEffect(() => {
      if (isOpen && panelPosition.x === null && panelPosition.y === null) {
        setPanelPosition(getDefaultPanelPosition());
      }
    }, [isOpen, panelPosition.x, panelPosition.y]);

    const handleDragStart = () => {};

    const handleEmojiClick = (emojiData) => {
      setInput((prev) => prev + emojiData.emoji);
    };

    const handleSend = () => {
      const text = input.trim();
      if (!text) return;
      handleSendMessage(text);
      setInput("");
      setShowEmoji(false);
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
        ? { position: "fixed", left: panelPosition.x, top: panelPosition.y, right: "auto", bottom: "auto" }
        : {
            position: "fixed",
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
                  isExpanded={isExpanded}
                  onExpandToggle={() => setIsExpanded((e) => !e)}
                />
                {maintenanceOpen ? (
                  <div className="chat-body">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", width: "100%", justifyContent: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}>
                          <div className="chat-bubbleLeft">
                            <Typography variant="body2" className="bubble-text left">
                              Service is currently under maintenance.
                            </Typography>
                          </div>
                          <Typography variant="caption" className="bubble-time left" style={{ marginTop: 6, marginLeft: 4 }}>
                            {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
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
                      showSlashMenu={false}
                      setShowSlashMenu={() => {}}
                      selectedSlashIndex={0}
                      setSelectedSlashIndex={() => {}}
                      filteredSlashOptions={[]}
                      onSlashSelect={() => {}}
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
                    showSlashMenu={false}
                    setShowSlashMenu={() => {}}
                    selectedSlashIndex={0}
                    setSelectedSlashIndex={() => {}}
                    filteredSlashOptions={[]}
                    onSlashSelect={() => {}}
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
