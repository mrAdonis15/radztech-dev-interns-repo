import React from "react";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import CloseIcon from "@material-ui/icons/Close";
import HistoryIcon from "@material-ui/icons/History";
import AddCommentIcon from "@material-ui/icons/AddComment";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";

export default function ChatHeader({
  maintenanceOpen,
  onMaintenanceChange,
  onClose,
  onDragStart,
  onHistoryClick,
  onNewChatClick,
  isExpanded,
  onExpandToggle,
  chatMode = "support",
  onChatModeChange,
}) {
  return (
    <div
      className="chat-header chat-header-draggable"
      onMouseDown={onDragStart}
      aria-label="Drag to move chat window"
    >
      <div className="chat-titleArea">
        <Avatar src={radzLogo} className="chat-header-avatar" />
        <div style={{ marginLeft: 8, minWidth: 0 }}>
          <Typography variant="body1" className="chat-titleText">
            Ulap Chat
          </Typography>
          {onChatModeChange && (
            <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
              <button
                type="button"
                onClick={() => onChatModeChange("support")}
                style={{
                  padding: "2px 8px",
                  fontSize: 11,
                  border: "none",
                  background: chatMode === "support" ? "rgba(255, 111, 0, 0.2)" : "transparent",
                  color: chatMode === "support" ? "#e65100" : "#888",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: chatMode === "support" ? 600 : 400,
                }}
              >
                Support
              </button>
              <button
                type="button"
                onClick={() => onChatModeChange("group")}
                style={{
                  padding: "2px 8px",
                  fontSize: 11,
                  border: "none",
                  background: chatMode === "group" ? "rgba(255, 111, 0, 0.2)" : "transparent",
                  color: chatMode === "group" ? "#e65100" : "#888",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: chatMode === "group" ? 600 : 400,
                }}
              >
                Group
              </button>
            </div>
          )}
          <div className="chat-header-statusRow">
            {maintenanceOpen ? (
              <span className="chat-header-statusLabel">
                <span className="chat-statusDot" aria-hidden />
                <Typography variant="caption" component="span" style={{ color: "#777" }}>
                  Under maintenance
                </Typography>
              </span>
            ) : (
              <span className="chat-header-statusLabel">
                <span className="chat-onlineDot" aria-hidden />
                <Typography variant="caption" component="span" style={{ color: "#777" }}>
                  Online
                </Typography>
              </span>
            )}
          </div>
        </div>
        <div
          className="chat-header-toggleWrap"
          onClick={(e) => e.stopPropagation()}
        >
          <Typography
            variant="caption"
            style={{ color: "#888", fontSize: 11, whiteSpace: "nowrap" }}
          >
            Maint.
          </Typography>
          <Switch
            size="small"
            checked={maintenanceOpen}
            onChange={(e) => onMaintenanceChange(e.target.checked)}
            color="primary"
            aria-label="Toggle maintenance mode"
          />
        </div>
      </div>
      <div className="chat-controlIcons">
        {onExpandToggle && (
          <IconButton
            size="small"
            onClick={onExpandToggle}
            aria-label={isExpanded ? "Exit expanded view" : "Expand chat"}
            title={isExpanded ? "Exit expanded view" : "Expand chat"}
          >
            {isExpanded ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconButton>
        )}
        {onHistoryClick && (
          <IconButton size="small" onClick={onHistoryClick} aria-label="Chat history">
            <HistoryIcon fontSize="small" />
          </IconButton>
        )}
        {onNewChatClick && (
          <IconButton size="small" onClick={onNewChatClick} aria-label="New chat">
            <AddCommentIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
