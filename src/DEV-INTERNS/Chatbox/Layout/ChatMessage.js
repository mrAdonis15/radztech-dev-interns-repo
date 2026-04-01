import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import mascot3D from "../../../images/3Dmascot.png";
import thinkingGif from "../Assets/ulap.gif";
import ChartRenderer from "./chartRenderer";

function isImageOnlyContent(text) {
  if (!text || typeof text !== "string") return false;
  const withoutImages = text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\s/g, "");
  return withoutImages.length === 0;
}

const markdownImgComponent = {
  img: ({ node, alt, ...props }) => (
    <span className="chat-message-image-container">
      <span className="chat-message-image">
        <img {...props} alt={alt || ""} />
      </span>
    </span>
  ),
};

function ChatMessageInner({ msg }) {
  const isMe = msg.sender === "me";
  const isThinking = msg.status === "thinking" || msg.text === "...";
  const isChart = msg.type === "chart";
  const isImg =
    msg.type === "img" && msg.data && Array.isArray(msg.data.images);

  const [activeImage, setActiveImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  let chart = {};
  if (isChart) chart = msg.data;

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
          flex: 1,
          minWidth: 0,
        }}
      >
        <Avatar src={mascot3D} className="reply-icon" />
        <div className="message-content left" style={{ marginLeft: 8 }}>
          {isChart ? (
            <div
              className={"chat-bubbleLeft" + (isThinking ? " chat-typing" : "")}
            >
              <ChartRenderer
                type={chart.chartType}
                data={chart.data}
                options={chart.options}
              />
            </div>
          ) : isImg ? (
            <div className="chat-message-image-only">
              {(msg.data.images || []).slice(0, 10).map((url, index) => (
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
          ) : isImageOnlyContent(msg.text) ? (
            <div className="chat-message-image-only">
              <Typography
                component="div"
                variant="body2"
                className="bubble-text left"
              >
                <ReactMarkdown components={markdownImgComponent}>
                  {msg.text}
                </ReactMarkdown>
              </Typography>
            </div>
          ) : isThinking ? (
            <div
              className="chat-thinking-bubble"
              aria-label="UlapAI is thinking"
            >
              <img
                src={thinkingGif}
                alt=""
                aria-hidden="true"
                className="chat-thinking-gif"
              />
            </div>
          ) : (
            <div
              className={"chat-bubbleLeft" + (isThinking ? " chat-typing" : "")}
            >
              <Typography
                component="div"
                variant="body2"
                className={
                  "bubble-text left" + (isThinking ? " chat-typing-text" : "")
                }
              >
                <ReactMarkdown components={markdownImgComponent}>
                  {msg.text}
                </ReactMarkdown>
              </Typography>
            </div>
          )}
          <Typography
            variant="caption"
            className="bubble-time left"
            style={{ marginTop: 6, marginLeft: 4 }}
          >
            {msg.time}
          </Typography>
          {msg.responseTimerLabel ? (
            <Typography
              variant="caption"
              className="bubble-time left"
              style={{
                marginTop: 2,
                marginLeft: 4,
                display: "block",
                opacity: 0.85,
              }}
            >
              {msg.responseTimerLabel}
            </Typography>
          ) : null}
        </div>
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
    </div>
  );
}

export default memo(ChatMessageInner);
