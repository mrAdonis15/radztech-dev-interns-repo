import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import ChartRenderer from "./chartRenderer";
import radzLogo from "./Assets/radz-interns-logo.png";
import thinkingGif from "./Assets/thinking.gif";

function ChatMessage({ msg, isExpanded, onExpandToggle }) {
  const isUser = msg.sender === "user";
  // console.log("msg", msg);

  const [activeImage, setActiveImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Render Bot Reply
  function BotMsg() {
    const type = msg.type || "";
    const isThinking = msg.text === "...";

    let data;
    if (msg?.data) data = msg?.data;
    // console.log("msg-data", data);

    switch (type) {
      case "img":
        return (
          <>
            <div className="chat-message-image-only">
              {(data || []).slice(0, 10).map((url, index) => (
                <button
                  key={url || index}
                  type="button"
                  className="chat-image-thumb-button"
                  onClick={() => {
                    setActiveImage(url);
                    setZoom(1);
                  }}
                >
                  <span className="chat-message-image-container">
                    <span className="chat-message-image">
                      <img src={url} alt="" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {activeImage && (
              <div
                className="chat-image-overlay"
                onClick={() => {
                  setActiveImage(null);
                  setZoom(1);
                }}
              >
                <div
                  className="chat-image-overlay-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="chat-image-overlay-toolbar">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    >
                      −
                    </button>
                    <span className="chat-image-overlay-zoom">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setActiveImage(null);
                      }}
                    >
                      Close
                    </button>
                  </div>
                  <div className="chat-image-overlay-body">
                    <img
                      src={activeImage}
                      alt=""
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case "chart":
        return isExpanded ? (
          <div
            className={"chat-bubbleLeft" + (isThinking ? " chat-typing" : "")}
          >
            <ChartRenderer
              type={data.chartType}
              data={data.data}
              options={data.options}
            />
          </div>
        ) : (
          <div
            className={"chat-bubbleLeft" + (isThinking ? " chat-typing" : "")}
          >
            <div className="clickable-text" onClick={onExpandToggle}>
              Maximize to view chart
            </div>
          </div>
        );
      default:
        return (
          <div className="message-content left" style={{ marginLeft: 8 }}>
            {isThinking ? (
              <div aria-label="UlapAI is thinking">
                <img
                  src={thinkingGif}
                  alt=""
                  aria-hidden="true"
                  className="chat-thinking-gif"
                />
              </div>
            ) : (
              <div
                className={
                  "chat-bubbleLeft" + (isThinking ? " chat-typing" : "")
                }
              >
                <Typography
                  component="div"
                  variant="body2"
                  className={
                    "bubble-text left" + (isThinking ? " chat-typing-text" : "")
                  }
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </Typography>
              </div>
            )}
          </div>
        );
    }
  }

  return isUser ? (
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
      </div>
    </div>
  ) : (
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
          flex: 1,
          minWidth: 0,
        }}
      >
        <Avatar src={radzLogo} className="reply-icon" />
        <div className="message-content left" style={{ marginLeft: 8 }}>
          <BotMsg
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            zoom={zoom}
            setZoom={setZoom}
          ></BotMsg>
        </div>
      </div>
    </div>
  );
}
export default memo(ChatMessage);
