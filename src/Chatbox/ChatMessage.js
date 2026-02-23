import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";
import ChartRenderer from "src/components/Marth/chartRenderer";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ msg }) {
  const isMe = msg.sender === "me";
  const isTyping = msg.text === "...";
  const isChart = msg.type === "chart";

  if (isMe) {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "flex-end",
        }}
      >
        <div className="message-content right" style={{ marginRight: 8 }}>
          <div className="chat-bubbleRight">
            <Typography variant="body2" className="bubble-text right">
              {msg.text}
            </Typography>
          </div>
          <Typography
            variant="caption"
            className="bubble-time right"
            style={{ marginTop: 6 }}
          >
            {msg.time}
          </Typography>
        </div>
      </div>
    );
  }

  return (
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
          alignItems: "flex-start",
          marginLeft: 16,
        }}
      >
        <Avatar src={radzLogo} className="reply-icon" />
        {isChart ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ChartRenderer chart={msg.data} />
            <div className="message-content left" style={{ marginLeft: 8 }}>
              <div
                className={"chat-bubbleLeft" + (isTyping ? " chat-typing" : "")}
              >
                <Typography
                  variant="body2"
                  className={
                    "bubble-text left" + (isTyping ? " chat-typing-text" : "")
                  }
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </Typography>
              </div>
              <Typography
                variant="caption"
                className="bubble-time left"
                style={{ marginTop: 6, marginLeft: 4 }}
              >
                {msg.time}
              </Typography>
            </div>
          </div>
        ) : (
          <div className="message-content left" style={{ marginLeft: 8 }}>
            <div
              className={"chat-bubbleLeft" + (isTyping ? " chat-typing" : "")}
            >
              <Typography
                variant="body2"
                className={
                  "bubble-text left" + (isTyping ? " chat-typing-text" : "")
                }
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </Typography>
            </div>
            <Typography
              variant="caption"
              className="bubble-time left"
              style={{ marginTop: 6, marginLeft: 4 }}
            >
              {msg.time}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
