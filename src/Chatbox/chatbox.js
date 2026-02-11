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

export default function Chatbox() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! Welcome to Ulap Biz support chatbot.",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
    },
    {
      id: 2,
      sender: "me",
      text: "Hi Ulap Biz!!!",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
    },
  ]);

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const endRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Close emoji when clicking outside
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
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
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
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
        },
      ]);
    }, 800);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-root">
      {/* ================= ONLINE PANEL ================= */}
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

        <div className="chat-body">
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
                  <div className="chat-bubbleRight" style={{ marginRight: 8 }}>
                    <Typography variant="body2">{msg.text}</Typography>
                    <Typography
                      variant="caption"
                      style={{
                        display: "block",
                        marginTop: 6,
                        color: "#666",
                        fontSize: 11,
                      }}
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
                    <div className="chat-bubbleLeft" style={{ marginLeft: 8 }}>
                      <Typography variant="body2">{msg.text}</Typography>
                      <Typography
                        variant="caption"
                        style={{
                          display: "block",
                          marginTop: 6,
                          color: "#666",
                          fontSize: 11,
                        }}
                      >
                        {msg.time}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        {/* ================= INPUT AREA ================= */}
        <div className="chat-inputArea">
          <Paper className="chat-inputPaper" elevation={0}>
            {/* Emoji Section */}
            <div
              className="emoji-wrapper"
              style={{ position: "relative" }}
            >
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

            <IconButton size="small">
              <img
                src={ulapLogo}
                alt="logo"
                style={{ width: 22, height: 22, opacity: 0.9 }}
              />
            </IconButton>
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

      {/* ================= MAINTENANCE PANEL (UNCHANGED) ================= */}
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
              <div className="chat-bubbleLeft" style={{ marginLeft: 16 }}>
                <Typography variant="body2">
                  Service is currently under maintenance.
                </Typography>
                <Typography
                  variant="caption"
                  style={{
                    display: "block",
                    marginTop: 6,
                    color: "#666",
                    fontSize: 11,
                  }}
                >
                  {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                </Typography>
              </div>
            </div>
            <div ref={endRef} />
          </div>
        </div>
      </Paper>
    </div>
  );
}
