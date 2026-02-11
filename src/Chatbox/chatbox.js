import React, { useState, useRef, useEffect } from "react";
import "./Chatbox.css";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import SendIcon from "@material-ui/icons/Send";
import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";
import CloseIcon from "@material-ui/icons/Close";
import RemoveIcon from "@material-ui/icons/Remove";
import EmojiPicker from "emoji-picker-react"; //naglagay lng ng emoji-picker para sa emojis.

import ulapLogo from "./Assets/ulap-biz-logo.png";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";
import defaultTheme, { sanitizeColor, PRESET_THEMES } from "./colotheme";

export default function Chatbox() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! Welcome to Ulap Biz support chatbot.",
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    },
    {
      id: 2,
      sender: "me",
      text: "Hi Ulap Biz!!!",
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const bodyRef = useRef(null);
  const rootRef = useRef(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [linkTheme] = useState(true);


  const [theme, setTheme] = useState(defaultTheme);
  const [selectedThemeKey, setSelectedThemeKey] = useState(null);

  function applyTheme(t) {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty(
      "--bubble-left",
      sanitizeColor(t.bubbleLeft, "rgba(255,117,4,0.5)"),
    );
    el.style.setProperty(
      "--bubble-right",
      sanitizeColor(t.bubbleRight, "#ffffff"),
    );
    el.style.setProperty(
      "--border-color",
      sanitizeColor(t.borderColor, "#f57c00"),
    );
  }


  useEffect(() => {
    try {
      const raw = localStorage.getItem("ulapChatTheme");
      if (raw) {
        const parsed = JSON.parse(raw);
        const t = {
          bubbleLeft: sanitizeColor(parsed.bubbleLeft, "rgba(255,117,4,0.5)"),
          bubbleRight: sanitizeColor(parsed.bubbleRight, "#ffffff"),
          borderColor: sanitizeColor(parsed.borderColor, "#f57c00"),
        };
        setTheme(t);
          // attempt to set selectedThemeKey to a preset if it matches
          try {
            const match = PRESET_THEMES.find((p) =>
              p.theme.bubbleLeft === t.bubbleLeft && p.theme.borderColor === t.borderColor
            );
            if (match) setSelectedThemeKey(match.key);
          } catch (e) {}
        // apply after setTheme
        requestAnimationFrame(() => applyTheme(t));
      } else {
        applyTheme(theme);
      }
    } catch (e) {
      applyTheme(theme);
    }
    
  }, []);


  useEffect(() => {
    const el = bodyRef.current;
    if (el) {
      
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".emoji-wrapper")) {
        setShowEmoji(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Add emoji to input
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const next = {
      id: Date.now(),
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, next]);
    setInput("");
    setShowEmoji(false);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Thanks — we received your message.",
          time: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        },
      ]);
    }, 800);
  }

  function toggleThemePicker() {
    setShowThemePicker((s) => !s);
  }
    //color theme
  function handleThemeChange(key, value) {
    
    let next;
    if (linkTheme) {
      next = { bubbleLeft: value, bubbleRight: value, borderColor: value };
    } else {
      next = { ...theme, [key]: value };
    }
    setTheme(next);
    applyTheme(next);
  }

  function saveTheme() {
    try {
      localStorage.setItem("ulapChatTheme", JSON.stringify(theme));
    } catch (e) {
      console.warn("Failed to save theme", e);
    }
    setShowThemePicker(false);
  }

  function resetTheme() {
    const def = {
      bubbleLeft: "rgba(255,117,4,0.5)",
      bubbleRight: "#ffffff",
      borderColor: "#f57c00",
    };
    setTheme(def);
    applyTheme(def);
    try {
      localStorage.removeItem("ulapChatTheme");
    } catch (e) {}
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-root" ref={rootRef}>
      <Paper className="chat-panel online" elevation={0}>
        <div className="chat-header">
          <div className="chat-titleArea">
            <Avatar src={radzLogo} />
            <div style={{ marginLeft: 8 }}>
              <Typography variant="body1" className="chat-titleText">
                Ulap Chat
              </Typography>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="chat-onlineDot" />
                <Typography
                  variant="caption"
                  style={{ color: "#777", marginLeft: 6 }}
                >
                  Online
                </Typography>
              </div>
            </div>
          </div>
          <div className="chat-controlIcons">
            <IconButton size="small">
              <RemoveIcon fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <div className="chat-body" ref={bodyRef}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent:
                    msg.sender === "me" ? "flex-end" : "flex-start",
                }}
              >
                {msg.sender === "me" ? (
                  <div
                    className={"message-content right"}
                    style={{ marginRight: 8 }}
                  >
                    <div className="chat-bubbleRight">
                      <Typography
                        variant="body2"
                        className={"bubble-text right"}
                      >
                        {msg.text}
                      </Typography>
                    </div>
                    <Typography
                      variant="caption"
                      className={"bubble-time right"}
                      style={{ marginTop: 6 }}
                    >
                      {msg.time}
                    </Typography>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      marginLeft: 16,
                    }}
                  >
                    <Avatar src={radzLogo} className="reply-icon" />
                    <div
                      className={"message-content left"}
                      style={{ marginLeft: 8 }}
                    >
                      <div className="chat-bubbleLeft">
                        <Typography
                          variant="body2"
                          className={"bubble-text left"}
                        >
                          {msg.text}
                        </Typography>
                      </div>
                      <Typography
                        variant="caption"
                        className={"bubble-time left"}
                        style={{ marginTop: 6, marginLeft: 4 }}
                      >
                        {msg.time}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* spacer at bottom handled by scrolling the body element */}
          </div>
        </div>

        {/*  INPUT AREA  */}
        <div className="chat-inputArea">
          <Paper className="chat-inputPaper" elevation={0}>
            {/* Emoji Section */}
            <div className="emoji-wrapper" style={{ position: "relative" }}>
              <IconButton
                size="small"
                onClick={() => setShowEmoji((prev) => !prev)}
              >
                <EmojiEmotionsIcon
                  style={{ color: showEmoji ? "#ff6f00" : "#777" }}
                />
              </IconButton>

              {showEmoji && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 45,
                    left: 0,
                    zIndex: 1000,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <InputBase
              className="chat-inputBase"
              placeholder="Type Message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div style={{ position: "relative" }}>
              <IconButton
                size="small"
                onClick={toggleThemePicker}
                aria-label="theme"
              >
                <img
                  src={ulapLogo}
                  alt="logo"
                  style={{ width: 22, height: 22, opacity: 0.95 }}
                />
              </IconButton>

              {showThemePicker && (
                <div
                  className="theme-picker"
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 44,
                    zIndex: 2000,
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      padding: 12,
                      borderRadius: 8,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                      width: 220,
                    }}
                  >
                    <div
                      style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                    >
                      Chat Theme
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 13, marginBottom: 8 }}>Choose theme</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {PRESET_THEMES.map((t) => (
                          <button
                            key={t.key}
                            className={"theme-swatch" + (selectedThemeKey === t.key ? " selected" : "")}
                            onClick={() => {
                              setTheme(t.theme);
                              applyTheme(t.theme);
                              setSelectedThemeKey(t.key);
                            }}
                            type="button"
                          >
                            <div
                              className="swatch-box"
                              style={{
                                background: t.theme.bubbleLeft,
                                borderColor: t.theme.borderColor,
                              }}
                            />
                            <div className="swatch-label">{t.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <button onClick={resetTheme} className="theme-action reset">Reset</button>
                      <button onClick={saveTheme} className="theme-action save">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Paper>

          <IconButton
            className="chat-sendButton"
            style={{ marginLeft: 8 }}
            onClick={handleSend}
          >
            <SendIcon />
          </IconButton>
        </div>
      </Paper>

      {/* MAINTENANCE PANEL  */}
      <Paper className="chat-panel maintenance" elevation={0}>
        <div className="chat-header">
          <div className="chat-titleArea">
            <Avatar src={radzLogo} />
            <div style={{ marginLeft: 8 }}>
              <Typography variant="body1" className="chat-titleText">
                Ulap Chat
              </Typography>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="chat-statusDot" />
                <Typography
                  variant="caption"
                  style={{ color: "#777", marginLeft: 6 }}
                >
                  Under Maintenance
                </Typography>
              </div>
            </div>
          </div>
        </div>

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
                  <Typography variant="body2" className={"bubble-text left"}>
                    Service is currently under maintenance.
                  </Typography>
                </div>
                <Typography
                  variant="caption"
                  className={"bubble-time left"}
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
            {/* maintenance panel bottom spacer removed */}
          </div>
        </div>
      </Paper>
    </div>
  );
}
