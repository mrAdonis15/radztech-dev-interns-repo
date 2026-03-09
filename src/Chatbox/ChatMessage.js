import React from "react";
import ReactMarkdown from "react-markdown";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";
import ChartWithControls from "./ChartWithControls.js";
import { normalizeToChartConfig, isRawChartJsonText } from "./api/services/stockcardgraph.js";

const CHART_PLACEHOLDER = "Here is the chart you requested.";

export default function ChatMessage({ msg }) {
  const isMe = msg.sender === "me";
  const isTyping = msg.text === "...";
  const isChart = msg.type === "chart";

  const chartFromData = (isChart && msg.data && normalizeToChartConfig(msg.data)) || null;
  let chartFromText = null;
  if (!chartFromData && typeof msg.text === "string" && isRawChartJsonText(msg.text)) {
    try {
      chartFromText = normalizeToChartConfig(JSON.parse(msg.text.trim()));
    } catch (_) {}
  }
  const chartConfig = chartFromData || chartFromText;
  const showChart = !!chartConfig;
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
        }}
      >
        <Avatar src={radzLogo} className="reply-icon" />
        {showChart ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {chartConfig ? (
              <ChartWithControls chart={chartConfig} />
            ) : (
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                Chart could not be generated for this data.
              </Typography>
            )}
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
