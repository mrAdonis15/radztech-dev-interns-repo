import React, { memo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";
import ChartWithControls from "./ChartWithControls.js";
import { getGraphConfig, getGraphConfigFromText, isRawChartJsonText } from "./api/services/stockcardgraph.js";

const CHART_PLACEHOLDER = "Here is the chart you requested.";

function scheduleIdle(cb) {
  if (typeof requestIdleCallback !== "undefined") {
    return requestIdleCallback(cb, { timeout: 100 });
  }
  return setTimeout(cb, 0);
}

function cancelIdle(id) {
  if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id);
  else clearTimeout(id);
}

function ChatMessageInner({ msg }) {
  const isMe = msg.sender === "me";
  const isTyping = msg.text === "...";
  const isChart = msg.type === "chart";

  const [chartConfig, setChartConfig] = useState(null);
  const [chartPending, setChartPending] = useState(
    () => (msg.type === "chart" && msg.data) || (typeof msg.text === "string" && isRawChartJsonText(msg.text))
  );
  const idleRef = useRef(null);

  const expectsChart = (isChart && msg.data) || (typeof msg.text === "string" && isRawChartJsonText(msg.text));

  useEffect(() => {
    if (!expectsChart) return;
    const id = scheduleIdle(() => {
      try {
        const config = isChart && msg.data
          ? getGraphConfig(msg.data)
          : typeof msg.text === "string"
            ? getGraphConfigFromText(msg.text)
            : null;
        setChartConfig(config || null);
      } finally {
        setChartPending(false);
      }
    });
    return () => cancelIdle(id);
  }, [expectsChart, isChart, msg.data, msg.text]);

  const showChart = expectsChart;
  const textIsChartJson = typeof msg.text === "string" && isRawChartJsonText(msg.text);
  const displayText = textIsChartJson ? CHART_PLACEHOLDER : (msg.text || "");

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
        className={showChart ? "message-with-chart" : ""}
      >
        <Avatar src={radzLogo} className="reply-icon" />
        {showChart ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            {chartPending ? (
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                Loading chart…
              </Typography>
            ) : chartConfig ? (
              <ChartWithControls chart={chartConfig} />
            ) : (
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                Chart could not be generated for this data.
              </Typography>
            )}
            {!textIsChartJson && displayText && (
              <div className="message-content left" style={{ marginLeft: 8, marginTop: 8 }}>
                <div className="chat-bubbleLeft">
                  <Typography
                    component="div"
                    variant="body2"
                    className="bubble-text left"
                  >
                    <ReactMarkdown>{displayText}</ReactMarkdown>
                  </Typography>
                </div>
              </div>
            )}
            <Typography
              variant="caption"
              className="bubble-time left"
              style={{ marginTop: 6, marginLeft: 12 }}
            >
              {msg.time}
            </Typography>
          </div>
        ) : (
          <div className="message-content left" style={{ marginLeft: 8 }}>
            <div
              className={"chat-bubbleLeft" + (isTyping ? " chat-typing" : "")}
            >
              <Typography
                component="div"
                variant="body2"
                className={
                  "bubble-text left" + (isTyping ? " chat-typing-text" : "")
                }
              >
                <ReactMarkdown>{displayText}</ReactMarkdown>
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

export default memo(ChatMessageInner);
