import React, { useState, useRef, useEffect } from "react";
import "./ChatBoxMerlvin.css";
import "./FullPageChatBoxMerlvin.css";
import Typography from "@material-ui/core/Typography";
import SendIcon from "@material-ui/icons/Send";
import CircularProgress from "@material-ui/core/CircularProgress";
import { sendMessageToPythonAI, initializePythonAI } from "./pythonAIService";

export default function FullPageChatBoxMerlvin() {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Python AI on mount
  useEffect(() => {
    const init = async () => {
      try {
        const success = await initializePythonAI();
        setIsInitialized(success);
        if (!success) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              sender: "bot",
              text: "Warning: Failed to initialize authentication. Please refresh the page.",
              time: new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
            },
          ]);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setIsInitialized(false);
      }
    };
    init();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
    const currentInput = input; // Save before clearing
    setInput("");
    setIsLoading(true);

    try {
      // Send message to Python AI
      const response = await sendMessageToPythonAI(currentInput);
      console.log("Full API response:", response);

      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text:
          response.response ||
          response.message ||
          "Received from AI (no text content)",
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        type: response.message_type || response.type,
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
    <div className="fullpage-chatbox-container">
      {/* Header */}
      <div className="fullpage-chatbox-header">
        <div>
          <Typography variant="h5" style={{ margin: 0, fontWeight: 600 }}>
            Python AI Chat
          </Typography>
          <Typography
            variant="caption"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Powered by Python AI
          </Typography>
        </div>
      </div>

      {/* Messages Container */}
      <div className="fullpage-chatbox-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chatbox-merlvin-message ${msg.sender}`}>
            <div className="chatbox-merlvin-bubble">
              <Typography variant="body2">{msg.text}</Typography>
              {msg.type === "chart" && (
                <div className="chatbox-merlvin-chart-placeholder">
                  [Chart visualization would appear here]
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
        className="fullpage-chatbox-input-form"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            !isInitialized ? "Initializing..." : "Type your message..."
          }
          disabled={isLoading || !isInitialized}
          className="chatbox-merlvin-input"
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="chatbox-merlvin-send-btn"
          title="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
