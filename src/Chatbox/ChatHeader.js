import React from "react";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import RemoveIcon from "@material-ui/icons/Remove";
import CloseIcon from "@material-ui/icons/Close";
import HistoryIcon from "@material-ui/icons/History";
import AddCommentIcon from "@material-ui/icons/AddComment";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";

export default function ChatHeader({
  maintenanceOpen,
  onMaintenanceChange,
  onMinimize,
  onClose,
  onDragStart,
  onHistoryClick,
  onNewChatClick,
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
        <IconButton size="small" onClick={onMinimize} aria-label="Minimize">
          <RemoveIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
