import React, { useState, useRef, useEffect } from "react";
import "./ChatBoxMerlvin.css";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ChatIcon from "@material-ui/icons/Chat";
import CloseIcon from "@material-ui/icons/Close";
import SendIcon from "@material-ui/icons/Send";
import CircularProgress from "@material-ui/core/CircularProgress";
import { sendMessageToPythonAI, createConversation } from "./pythonAIService";

export default function ChatBoxMerlvin({ defaultOpen = false }) {
  const rootRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm the Python AI Assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // Initialize conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        const convo = await createConversation("Merlvin Python AI Chat");
        setConversationId(convo.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };
    initConversation();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !conversationId) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send message to Python AI
      const response = await sendMessageToPythonAI(input, conversationId);

      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text: response.reply || response.message || "No response received",
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        type: response.type, // Could be 'chart', 'text', etc.
        data: response.data, // For chart data or other structured data
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        sender: "bot",
        text: `Error: ${error.message}`,
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="chatbox-merlvin-root" ref={rootRef}>
      {/* Toggle Button */}
      <button
        type="button"
        className="chatbox-merlvin-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        <ChatIcon fontSize="large" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <Paper className="chatbox-merlvin-panel" elevation={8}>
          {/* Header */}
          <div className="chatbox-merlvin-header">
            <div>
              <Typography variant="h6" style={{ margin: 0, fontWeight: 600 }}>
                Python AI Chat
              </Typography>
              <Typography variant="caption" style={{ color: "#888" }}>
                Powered by Python AI
              </Typography>
            </div>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              title="Close chat"
            >
              <CloseIcon />
            </IconButton>
          </div>

          {/* Messages Container */}
          <div className="chatbox-merlvin-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbox-merlvin-message ${msg.sender}`}
              >
                <div className="chatbox-merlvin-bubble">
                  <Typography variant="body2">{msg.text}</Typography>
                  {msg.type === "chart" && msg.data && (
                    <div className="chatbox-merlvin-chart-placeholder">
                      [Chart: {JSON.stringify(msg.data).substring(0, 50)}...]
                    </div>
                  )}
                  <Typography
                    variant="caption"
                    style={{
                      display: "block",
                      marginTop: "4px",
                      opacity: 0.7,
                    }}
                  >
                    {msg.time}
                  </Typography>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbox-merlvin-message bot">
                <div className="chatbox-merlvin-bubble">
                  <CircularProgress size={24} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="chatbox-merlvin-input-form"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || !conversationId}
              className="chatbox-merlvin-input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !conversationId}
              className="chatbox-merlvin-send-btn"
              title="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </Paper>
      )}
    </div>
  );
}
