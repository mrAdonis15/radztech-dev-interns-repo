import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import ChatIcon from "@material-ui/icons/Chat";

import ChatHeader from "./chatHeader";
import ChatSidebar from "./chatSidebar.js";
import ChatMessage from "./chatMessage.js";
import ChatInputArea from "./chatInputArea.js";
import TutorialCard from "./tutorialCard";
import TutorialPlayer from "./tutorialPlayer";

import { useChatboxTheme } from "./theme/useChatboxTheme.js";
import { sendToGemini } from "./gemini/geminiService.js";
import { getHeaders } from "./gemini/geminiFunctions";
import {
  getDefaultPanelPosition,
  PANEL_WIDTH,
  PANEL_HEIGHT,
  PANEL_PADDING,
  DEFAULT_BOTTOM,
  SESSION_ID_KEY,
  CONVERSATIONS_KEY,
  CHAT_FALL_BACK_MSG,
} from "./constants/chatboxConstants.js";
import "./theme/chatbox.css";

const suggestions = [
  {
    desc: "View product balance",
    input: "Provide the balance of [product name].",
  },
  {
    desc: "View stock card graph",
    input: "Provide the stock card graph of [product name] for [date range].",
  },
  {
    desc: "View last payment of a customer",
    input: "When was the last payment of [customer name].",
  },
  {
    desc: "View SL report",
    input: "Provide the [account title] of [sub account/s] for [date range].",
  },
  {
    desc: "View GL report",
    input: "Provide the [account title] for [date range].",
  },
];

const tutorials = [
  {
    title: "How to chat",
    desc: "Enter your query in the input box or select one of the chat suggestions. Click the 'Send' button or press 'Enter' to submit.",
    url: "https://youtu.be/pnMjmOaiySA?si=lOuBsIjBcEI8gBRZ",
    position: { bottom: "300px", right: "200px" },
  },
  {
    title: "Start a new chat",
    desc: "Click to start a new conversation with UlapAI.",
    url: "https://youtu.be/hxAT5PDoq0A?si=H-jp4bfA84eQXq6M",
    position: { top: "65px", left: "290px" },
  },

  {
    title: "Search Chat",
    desc: "Click to search through your chat sessions.",
    url: "https://youtu.be/oguRGRv59W8?si=dLDGpE0_mtL_KSss",
    position: { top: "120px", left: "290px" },
  },
  {
    title: "Your Chats",
    desc: "Your previous conversations with UlapAI are saved here. Choose and click a session to view the conversation.",
    url: "https://youtu.be/4uN_HQZjiB0?si=b_P5telzxWL9eHGm",
    position: { top: "180px", left: "290px" },
  },
];

export default function Chatbox({ defaultOpen = false }) {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const newChatRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const isIdleRef = useRef(false);
  const idleTimerRef = useRef(null);
  const timeout = 3000;

  const [isExpanded, setIsExpanded] = useState(true);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showEmoji, setShowEmoji] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: null, y: null });
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useChatboxTheme(rootRef);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [renameSession, setRenameSession] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [showTutorialCard, setShowTutorialCard] = useState(false);
  const [showTutorialPlayer, setShowTutorialPlayer] = useState(false);
  const [tutorialTitle, setTutorialTitle] = useState(null);
  const [tutorialDescription, setTutorialDescription] = useState(null);
  const [tutorialUrl, setTutorialUrl] = useState(null);
  const [cardPosition, setCardPosition] = useState({});

  const panelStyle =
    panelPosition.x !== null && panelPosition.y !== null
      ? { left: panelPosition.x, top: panelPosition.y }
      : {
          right: PANEL_PADDING,
          bottom: DEFAULT_BOTTOM,
          left: "auto",
          top: "auto",
        };

  // Toggle Chatbox State
  const onExpandToggle = useCallback(() => setIsExpanded((e) => !e), []);

  // Handle Chat Panel Dragging
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
      document.removeEventListener("touchmove", handleMove, {
        passive: false,
      });
      document.removeEventListener("touchend", handleUp);
      document.removeEventListener("touchcancel", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleUp);
    document.addEventListener("touchcancel", handleUp);
  };

  // Map Message
  function createMessage({ sender, type, text, data }) {
    const id = crypto.randomUUID();

    return {
      id: id,
      sender,
      type,
      text,
      data,
    };
  }

  // Start New Chat
  const handleNewChat = () => {
    localStorage.removeItem(SESSION_ID_KEY);
    setMessages([]);
  };

  // Get All User Sessions
  function getSessions() {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);

    const sessions = localStorage.getItem(CONVERSATIONS_KEY);
    if (!sessions) return [];
    const parsed = JSON.parse(sessions) || [];

    const sorted = parsed.sort(
      (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0),
    );

    if (sessionId) {
      const index = sorted.findIndex((s) => s.session_id === sessionId);

      if (index > -1) {
        const [currentSession] = sorted.splice(index, 1);
        sorted.unshift(currentSession);
      }
    }

    return sorted;
  }

  // Get Chat Session
  async function getSession(signal, sessionId) {
    const headers = getHeaders();
    const session_id = sessionId || localStorage.getItem(SESSION_ID_KEY);

    if (!session_id) return [];
    setIsLoading(true);

    try {
      const url = `http://localhost:3000/genai/chat-history`;
      const params = { session_id: session_id };

      const response = await axios.post(url, params, {
        headers,
        signal,
      });
      const session = response.data;

      const messages = [];

      session.forEach((msg) => {
        let text = msg.parts?.[0]?.text;
        let data;

        try {
          data = JSON.parse(text);
        } catch {}

        if (!text || (data && data.isFromTool)) return;
        const isChart = data?.type === "chart";

        const msgData = data?.data;
        messages.push(
          createMessage({
            sender: isChart ? "model" : msg.role,
            type: data?.type || "",
            text: text,
            data: Array.isArray(msgData)
              ? msgData.flat()
              : { ...(msgData || {}) },
          }),
        );
      });

      return messages;
    } catch (err) {
      console.error("error", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  // Set Current Session
  const handleSelectSession = async (sessionId) => {
    const currentSessionId = localStorage.getItem(SESSION_ID_KEY);
    if (currentSessionId === sessionId) return;

    localStorage.setItem(SESSION_ID_KEY, sessionId);

    const messages = await getSession(null, sessionId);
    setMessages(messages);

    const sessions = getSessions();
    setSessions(sessions);
  };

  // Save Chat Session
  function saveSession({ title, session_id }) {
    const conversations = localStorage.getItem(CONVERSATIONS_KEY);
    const parsed = JSON.parse(conversations) || [];
    const updated_at = new Date(Date.now()).toISOString();

    const session = {
      session_id,
      title,
      updated_at,
    };

    parsed.push(session);

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(parsed));

    const updatedSessions = getSessions();
    setSessions(updatedSessions);
  }

  // Update session timestamp
  function updateSession({ session_id }) {
    const conversations = localStorage.getItem(CONVERSATIONS_KEY);
    const parsed = JSON.parse(conversations) || [];
    const updated_at = new Date(Date.now()).toISOString();

    parsed.find((s) => s.session_id === session_id).updated_at = updated_at;

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(parsed));
  }

  // Show session title input
  const handleRenameSession = () => setRenameSession(true);

  // Update session title
  function updateSessionTitle({ session_id, title }) {
    const conversations = localStorage.getItem(CONVERSATIONS_KEY);
    const parsed = JSON.parse(conversations) || [];

    const session = parsed.find((s) => s.session_id === session_id);
    if (session) session.title = title;

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(parsed));

    const updatedSessions = getSessions();
    setSessions(updatedSessions);

    setRenameSession(false);
  }

  // Show delete confirmation dialog
  const handleDeleteSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setOpenDeleteDialog(true);
  };

  // Delete session
  function deleteSession(sessionId) {
    const sessions = localStorage.getItem(CONVERSATIONS_KEY);
    const parsed = JSON.parse(sessions) || [];

    const updated = parsed.filter((s) => s.session_id !== sessionId);
    setSessions(updated);

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));

    const currentSessionId = localStorage.getItem(SESSION_ID_KEY);

    if (currentSessionId === sessionId) handleNewChat();
  }

  // Send Message
  const handleSend = async () => {
    const session_id = localStorage.getItem(SESSION_ID_KEY);

    const text = input.trim();
    if (!text || isSendingRef.current) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isSendingRef.current = true;
    setIsSending(true);

    const userMsg = createMessage({ sender: "user", text });
    setInput("");
    setShowEmoji(false);

    let botMsg = createMessage({ sender: "model", text: "..." });

    setMessages((prev) => [...prev, userMsg, botMsg]);

    try {
      const response = await sendToGemini({
        signal: controller.signal,
        userMessage: text,
      });

      if (response.statusCode !== 200) {
        botMsg = createMessage({ sender: "model", text: CHAT_FALL_BACK_MSG });
        setMessages((prev) => [...prev.slice(0, -1), botMsg]);
        return;
      }

      const currentSessionId = response.session_id || "";

      if (!session_id && currentSessionId) {
        saveSession({ title: text, session_id: currentSessionId });
      }

      updateSession({ session_id: currentSessionId });

      const currentMsg = response;

      setMessages((prev) => {
        const isChart = currentMsg?.type === "chart";

        const updatedMessages = prev.map((msg) =>
          msg.id === botMsg.id
            ? {
                ...msg,
                type: isChart ? "chart" : currentMsg?.type || "",
                text: isChart ? "" : currentMsg?.text || "",
                data: Array.isArray(currentMsg.data)
                  ? currentMsg.data.flat()
                  : { ...(currentMsg.data || {}) },
              }
            : msg,
        );

        if (isChart) {
          const textMsg = createMessage({
            sender: "model",
            text: currentMsg?.text || "",
            type: "text",
          });

          return [...updatedMessages, textMsg];
        }

        return updatedMessages;
      });
    } catch (err) {
      console.error(err);
      botMsg = createMessage({ sender: "model", text: CHAT_FALL_BACK_MSG });
      setMessages((prev) => [...prev.slice(0, -1), botMsg]);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  // Selectsuggestion
  function handleSelectSuggestion(index) {
    setInput(suggestions[index].input || "");
  }

  // Stop ongoing gemini request
  const handleStopRequest = () => {
    abortControllerRef.current?.abort();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji =
      emojiData?.emoji ??
      emojiData?.character ??
      (typeof emojiData === "string" ? emojiData : "");
    if (emoji) setInput((prev) => prev + emoji);
  };

  // Show tutorial card on hover
  function handleHoverComponent({ title, desc, url, position }) {
    clearTimeout(hoverTimeoutRef.current);

    setCardPosition(position || {});
    setTutorialTitle(title);
    setTutorialDescription(desc);
    setTutorialUrl(url);
    setShowTutorialCard(true);
  }

  // Hide tutorial card
  function handleHideTutorialCard() {
    clearTimeout(hoverTimeoutRef.current);

    setTutorialTitle(null);
    setTutorialDescription(null);
    setTutorialUrl(null);
    setShowTutorialCard(false);
  }

  // Show tutorial slideshow
  const showWizard = () => {
    if (!isIdleRef.current) return;
    if (!tutorials || tutorials.length === 0 || messages.length > 0) return;

    setShowTutorialCard(true);
    let index = 0;

    const showNext = () => {
      if (!isIdleRef.current) {
        setShowTutorialCard(false);
        return;
      }

      if (index >= tutorials.length) index = 0;

      const item = tutorials[index];
      setTutorialTitle(item.title);
      setTutorialDescription(item.desc);
      setTutorialUrl(item.url);
      setCardPosition(item.position || {});
      index++;
      setTimeout(showNext, 5000);
    };

    showNext();
  };

  // Show tutorial video player
  function handleShowTutorialPlayer() {
    setShowTutorialCard(false);
    setShowTutorialPlayer(true);
  }

  // Get sessions on mount
  useEffect(() => {
    //  const controller = new AbortController();
    const sessions = getSessions();
    setSessions(sessions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get session messages on mount
  useEffect(() => {
    const controller = new AbortController();
    getSession(controller.signal)
      .then((session) => {
        setMessages(session);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setMessages([]);
        }
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect idle state
  useEffect(
    () => {
      const handleActivity = () => {
        isIdleRef.current = false;
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        idleTimerRef.current = setTimeout(() => {
          isIdleRef.current = true;
          showWizard();
        }, timeout);
      };

      const events = [
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
      ];

      events.forEach((event) => window.addEventListener(event, handleActivity));

      handleActivity();

      return () => {
        events.forEach((event) =>
          window.removeEventListener(event, handleActivity),
        );
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Scroll to most recent message
  useEffect(() => {
    if (!isOpen || !bodyRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({
          top: bodyRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, isOpen]);

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
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
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

  // Reposition panel on resize
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
        const clampedX = Math.max(
          PANEL_PADDING,
          Math.min(vw - maxW - PANEL_PADDING, x),
        );
        const clampedY = Math.max(
          PANEL_PADDING,
          Math.min(vh - maxH - PANEL_PADDING, y),
        );
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

  const chatBox = (
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
        <div className={isExpanded ? "chat-expanded-wrap" : ""}>
          <div className={isExpanded ? "chat-ulap-layout" : ""}>
            {/* Chat Sidebar */}
            {isExpanded && (
              <ChatSidebar
                history={sessions}
                renameSession={renameSession}
                onNewChat={handleNewChat}
                newChatRef={newChatRef}
                onHover={handleHoverComponent}
                onSelectChat={handleSelectSession}
                onDeleteChat={handleDeleteSession}
                onEditChat={handleRenameSession}
                updateSessionTitle={updateSessionTitle}
                hoverTimeoutRef={hoverTimeoutRef}
                setRenameSession={setRenameSession}
              ></ChatSidebar>
            )}
            <div
              className={
                isExpanded ? "chat-ulap-main" : "chat-panel chat-panel-popup"
              }
              style={!isExpanded ? panelStyle : undefined}
              ref={!isExpanded ? panelRef : null}
            >
              {/* Chat Header */}
              <ChatHeader
                isExpanded={isExpanded}
                onClose={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                onNewChat={handleNewChat}
                onDragStart={handleDragStart}
                onMinimize={() => {
                  setIsOpen(true);
                  setIsExpanded(false);
                }}
                onExpandToggle={onExpandToggle}
              />

              {/* Chat Body */}
              <>
                <div
                  className={
                    isExpanded
                      ? `chat-body chat-ulap-main-body${messages.length === 0 && !isLoading ? " chat-body-empty" : ""}`
                      : "chat-body chat-body-draggable"
                  }
                  ref={bodyRef}
                  {...(!isExpanded && {
                    onMouseDown: handleDragStart,
                    role: "button",
                    "aria-label": "Drag to move chat window",
                  })}
                >
                  {isLoading ? null : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {messages.length > 0 ? (
                        messages.map((msg) => (
                          <ChatMessage
                            key={msg.id}
                            msg={msg}
                            isExpanded={isExpanded}
                            onExpandToggle={onExpandToggle}
                          />
                        ))
                      ) : (
                        <div className="chat-empty-state">
                          <Typography
                            variant={isExpanded ? "h2" : "h5"}
                            color={"textSecondary"}
                            className="chat-empty-text"
                          >
                            What can I help you with today?
                          </Typography>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Input Area */}
                <ChatInputArea
                  input={input}
                  inputRef={inputRef}
                  isSending={isSending}
                  setInput={setInput}
                  showEmoji={showEmoji}
                  setShowEmoji={setShowEmoji}
                  onEmojiClick={handleEmojiClick}
                  onSend={handleSend}
                  onKeyDown={handleKeyDown}
                  onDragStart={handleDragStart}
                  onStop={handleStopRequest}
                  themeProps={theme}
                  isExpanded={true}
                  placeholder="Ask UlapAI"
                  onHover={handleHoverComponent}
                  hoverTimeoutRef={hoverTimeoutRef}
                />

                {/* Chat Suggestions */}
                {messages.length === 0 && isExpanded && !isLoading && (
                  <div className="chat-suggestions-container">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="chat-suggestions"
                        onClick={() => handleSelectSuggestion(index)}
                      >
                        {suggestion.desc}
                      </button>
                    ))}
                  </div>
                )}

                {isExpanded && showTutorialCard && messages.length === 0 && (
                  <TutorialCard
                    style={cardPosition}
                    title={tutorialTitle}
                    desc={tutorialDescription}
                    onGuideClick={handleShowTutorialPlayer}
                    onHide={handleHideTutorialCard}
                  />
                )}

                {showTutorialPlayer && (
                  <TutorialPlayer
                    url={tutorialUrl}
                    onClose={() => setShowTutorialPlayer(false)}
                  />
                )}
              </>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
      >
        <DialogTitle>Delete Chat</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this session? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="default">
            Cancel
          </Button>

          <Button
            onClick={() => {
              deleteSession(selectedSessionId);
              setOpenDeleteDialog(false);
            }}
            color="secondary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  return chatBox;
}
