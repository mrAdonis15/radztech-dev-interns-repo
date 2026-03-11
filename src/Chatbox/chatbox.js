import React, { useState, useRef, useEffect } from "react";
import "./Chatbox.css";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ChatIcon from "@material-ui/icons/Chat";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { sendMessage } from "./api/services/chatService.js";
import {
  getInitialMessages,
  getDefaultPanelPosition,
  PANEL_WIDTH,
  PANEL_HEIGHT,
  PANEL_PADDING,
  DEFAULT_BOTTOM,
} from "./chatboxConstants.js";
import {
  createMessage,
  saveMessages,
  loadHistory,
  addToHistory,
  updateHistoryItem,
  deleteHistoryItem,
  ChatHeader,
  UlapAIMainHeader,
} from "./chatboxUtils.js";
import ChatSidebar from "./ChatSidebar.js";
import { useChatboxTheme } from "./useChatboxTheme.js";
import ChatMessage from "./ChatMessage.js";
import ChatInputArea from "./ChatInputArea.js";

export default function Chatbox({ defaultOpen = false }) {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const isSendingRef = useRef(false);

  const [messages, setMessages] = useState(() => getInitialMessages());
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [panelPosition, setPanelPosition] = useState({ x: null, y: null });
  const [history, setHistory] = useState(loadHistory());
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewingHistoryId, setViewingHistoryId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [optionsMenuAnchor, setOptionsMenuAnchor] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [menuChatsCollapsed, setMenuChatsCollapsed] = useState(false);

  const theme = useChatboxTheme(rootRef);

  useEffect(() => {
    if (!isOpen || !bodyRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, isOpen]);

  // Persist messages to localStorage when they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Auto-save to chat history when there's a conversation (not when viewing a saved chat)
  useEffect(() => {
    const hasUserMessage = messages.some((m) => m.sender === "me");
    if (!hasUserMessage || viewingHistoryId != null) return;
    if (currentConversationId) {
      updateHistoryItem(currentConversationId, messages);
      setHistory(loadHistory());
    } else {
      const next = addToHistory(messages);
      if (next.length > 0) {
        setCurrentConversationId(next[0].id);
        setHistory(next);
      }
    }
  }, [messages, viewingHistoryId, currentConversationId]);

  // Click/touch outside to close emoji picker
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        !e.target.closest(".emoji-wrapper") &&
        !e.target.closest(".emoji-picker-dropdown")
      )
        setShowEmoji(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Set initial panel position when opening
  useEffect(() => {
    if (isOpen && panelPosition.x === null && panelPosition.y === null) {
      setPanelPosition(getDefaultPanelPosition());
    }
  }, [isOpen, panelPosition.x, panelPosition.y]);

  // Reposition panel on resize (e.g. console open) - keep panel within viewport
  useEffect(() => {
    if (!isOpen || isExpanded) return;
    const handleResize = () => {
      setPanelPosition((prev) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const maxW = Math.min(340, vw - 32);
        const maxH = Math.min(480, vh - 120);
        const x = prev.x ?? vw - maxW - PANEL_PADDING;
        const y = prev.y ?? vh - maxH - DEFAULT_BOTTOM;
        const clampedX = Math.max(PANEL_PADDING, Math.min(vw - maxW - PANEL_PADDING, x));
        const clampedY = Math.max(PANEL_PADDING, Math.min(vh - maxH - PANEL_PADDING, y));
        return { x: clampedX, y: clampedY };
      });
    };
    const viewport = window.visualViewport;
    window.addEventListener("resize", handleResize);
    if (viewport) viewport.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (viewport) viewport.removeEventListener("resize", handleResize);
    };
  }, [isOpen, isExpanded]);

  const handleDragStart = (e) => {
    if (isExpanded) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    if (e.type === "touchstart") e.preventDefault();
    const startClientX = clientX;
    const startClientY = clientY;
    const startPanelX =
      panelPosition.x ?? window.innerWidth - PANEL_WIDTH - PANEL_PADDING;
    const startPanelY =
      panelPosition.y ?? window.innerHeight - PANEL_HEIGHT - DEFAULT_BOTTOM;

    const handleMove = (moveE) => {
      const cx = moveE.clientX ?? moveE.touches?.[0]?.clientX;
      const cy = moveE.clientY ?? moveE.touches?.[0]?.clientY;
      if (cx == null || cy == null) return;
      setPanelPosition({
        x: startPanelX + (cx - startClientX),
        y: startPanelY + (cy - startClientY),
      });
    };
    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove, { passive: false });
      document.removeEventListener("touchend", handleUp);
      document.removeEventListener("touchcancel", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleUp);
    document.addEventListener("touchcancel", handleUp);
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData?.emoji ?? emojiData?.character ?? (typeof emojiData === "string" ? emojiData : "");
    if (emoji) setInput((prev) => prev + emoji);
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

    const messageForAi = text || "Hello";

    sendMessage(messageForAi, messages)
      .then((reply) => {
        const isChart = reply && reply.type === "chart";
        const text = reply?.text ?? "";
        if (isChart) setIsExpanded(true);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? isChart
                ? { ...msg, type: "chart", data: reply.data, text }
                : { ...msg, text }
              : msg
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
    setMessages(getInitialMessages());
    setViewingHistoryId(null);
    setCurrentConversationId(null);
    setHistory(loadHistory());
  };

  const handleSelectHistoryChat = (item) => {
    setMessages(item.messages || []);
    setViewingHistoryId(item.id);
    setCurrentConversationId(null);
  };

  const handleDeleteHistoryChat = (id) => {
    setHistory(deleteHistoryItem(id));
  };

  const historyMenuOpen = Boolean(optionsMenuAnchor);

  const handleOpenHistoryMenu = (anchorEl) => {
    setHistory(loadHistory());
    setOptionsMenuAnchor(anchorEl);
  };

  const handleCloseHistoryMenu = () => {
    setOptionsMenuAnchor(null);
  };

  const handleSelectHistoryFromMenu = (item) => {
    handleSelectHistoryChat(item);
    setOptionsMenuAnchor(null);
  };

  const handleDeleteHistoryFromMenu = (id) => {
    handleDeleteHistoryChat(id);
  };

  const formatHistoryDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleOpenSearchModal = () => {
    setOptionsMenuAnchor(null);
    setSearchModalOpen(true);
    setModalSearchQuery("");
  };

  const handleCloseSearchModal = () => {
    setSearchModalOpen(false);
    setModalSearchQuery("");
  };

  const handleSelectFromSearchModal = (item) => {
    handleSelectHistoryChat(item);
    handleCloseSearchModal();
  };

  const filterByQuery = (list, q) => {
    if (!q || !q.trim()) return list;
    const lower = q.trim().toLowerCase();
    return list.filter((item) => (item.title || "Chat").toLowerCase().includes(lower));
  };

  const groupHistoryByPeriod = (all) => {
    const now = Date.now();
    const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;
    const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;
    const last7Days = [];
    const previous30Days = [];
    all.forEach((item) => {
      const age = now - (item.createdAt || 0);
      if (age <= MS_7_DAYS) last7Days.push(item);
      else if (age <= MS_30_DAYS) previous30Days.push(item);
    });
    return { last7Days, previous30Days };
  };

  const { last7Days, previous30Days } = groupHistoryByPeriod(history);
  const modal7 = filterByQuery(last7Days, modalSearchQuery);
  const modal30 = filterByQuery(previous30Days, modalSearchQuery);

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

  const chatContent = (
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

            {isOpen && (
              isExpanded ? (
                <div className="chat-expanded-wrap">
                  <div className="chat-ulap-layout">
                    <ChatSidebar
                      onNewChat={handleNewChat}
                      history={history}
                      onSelectChat={handleSelectHistoryChat}
                      onDeleteChat={handleDeleteHistoryChat}
                    />
                    <div className="chat-ulap-main">
                      <UlapAIMainHeader
                        onMinimize={() => {
                          // Go to minimized/popup version instead of closing the chat
                          setIsOpen(true);
                          setIsExpanded(false);
                        }}
                      />
                      {maintenanceOpen ? (
                        <div className="chat-body chat-ulap-main-body">
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
                          <div className="chat-body chat-ulap-main-body" ref={bodyRef}>
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
                            placeholder="Ask UlapAI"
                          />
                        </>
                      )}
                    </div>
                  </div>
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
                  onMinimize={() => { setIsOpen(false); setIsExpanded(false); }}
                  onClose={() => { setIsOpen(false); setIsExpanded(false); }}
                  onDragStart={handleDragStart}
                  onMoreClick={
                    maintenanceOpen
                      ? undefined
                      : (anchorEl) => {
                          handleOpenHistoryMenu(anchorEl);
                        }
                  }
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
                    <div
                      className="chat-body chat-body-draggable"
                      ref={bodyRef}
                      onMouseDown={handleDragStart}
                      role="button"
                      aria-label="Drag to move chat window"
                    >
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
              )
            )}
            <Menu
              anchorEl={optionsMenuAnchor}
              keepMounted
              open={historyMenuOpen}
              onClose={handleCloseHistoryMenu}
              classes={{ paper: "chat-history-menu-paper" }}
            >
              <MenuItem onClick={handleNewChat}>
                <ListItemText primary="New Chat" />
              </MenuItem>
              <MenuItem onClick={handleOpenSearchModal}>
                <ListItemText primary="Search Chat" />
              </MenuItem>
              <MenuItem onClick={() => setMenuChatsCollapsed((c) => !c)}>
                <ListItemText
                  primary="Your chats"
                  primaryTypographyProps={{
                    className: "chat-menu-your-chats-label",
                  }}
                />
                {menuChatsCollapsed ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ExpandLessIcon fontSize="small" />
                )}
              </MenuItem>
              {!menuChatsCollapsed &&
                (history.length === 0 ? (
                  <MenuItem disabled>
                    <ListItemText
                      primary="No chats yet"
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </MenuItem>
                ) : (
                  history.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => handleSelectHistoryFromMenu(item)}
                      className="chat-history-menu-item"
                    >
                      <ListItemText
                        primary={item.title || "Chat"}
                        secondary={formatHistoryDate(item.createdAt)}
                        primaryTypographyProps={{ noWrap: true, variant: "body2" }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryFromMenu(item.id);
                        }}
                        aria-label="Delete chat"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </MenuItem>
                  ))
                ))}
            </Menu>
            <Dialog
              open={searchModalOpen}
              onClose={handleCloseSearchModal}
              maxWidth="sm"
              fullWidth
              classes={{ paper: "chat-search-modal-paper" }}
              PaperProps={{ elevation: 8 }}
            >
              <div className="chat-search-modal-header">
                <input
                  type="text"
                  className="chat-search-modal-input"
                  placeholder="Search chats..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  aria-label="Search chats"
                />
                <IconButton
                  size="small"
                  className="chat-search-modal-close"
                  onClick={handleCloseSearchModal}
                  aria-label="Close"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
              <DialogContent className="chat-search-modal-content">
                <MenuItem
                  onClick={() => {
                    handleNewChat();
                    handleCloseSearchModal();
                  }}
                  className="chat-search-modal-new-chat"
                >
                  <ListItemText primary="New chat" />
                </MenuItem>

                {modal7.length > 0 && (
                  <div className="chat-search-modal-section">
                    <Typography variant="body2" className="chat-search-modal-section-title">
                      Previous 7 Days
                    </Typography>
                    <List disablePadding className="chat-search-modal-list">
                      {modal7.map((item) => (
                        <ListItem
                          key={item.id}
                          button
                          className="chat-search-modal-item"
                          onClick={() => handleSelectFromSearchModal(item)}
                        >
                          <ChatBubbleOutlineIcon className="chat-search-modal-bubble-icon" />
                          <ListItemText
                            primary={item.title || "Chat"}
                            primaryTypographyProps={{ noWrap: true, variant: "body2" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </div>
                )}

                {modal30.length > 0 && (
                  <div className="chat-search-modal-section">
                    <Typography variant="body2" className="chat-search-modal-section-title">
                      Previous 30 Days
                    </Typography>
                    <List disablePadding className="chat-search-modal-list">
                      {modal30.map((item) => (
                        <ListItem
                          key={item.id}
                          button
                          className="chat-search-modal-item"
                          onClick={() => handleSelectFromSearchModal(item)}
                        >
                          <ChatBubbleOutlineIcon className="chat-search-modal-bubble-icon" />
                          <ListItemText
                            primary={item.title || "Chat"}
                            primaryTypographyProps={{ noWrap: true, variant: "body2" }}
                          />
                        </ListItem>
                      ))} 
                    </List>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );

    // Render inline so click state and panel stay in sync (portal was preventing panel from showing for some users)
    return chatContent;
  }
