import React from "react";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import AddIcon from "@material-ui/icons/Add";
import radzLogo from "./Assets/radz-interns-logo.png";

// Chatbot Header
export default function ChatHeader({
  onMinimize,
  onNewChat,
  onClose,
  onDragStart,
  onMoreClick,
  isExpanded,
  onExpandToggle,
}) {
  return isExpanded ? (
    <header className="chat-ulap-main-header">
      <Typography variant="h6" className="chat-ulap-main-header-title">
        UlapAI
      </Typography>
      <div className="chat-ulap-main-header-right">
        {onMinimize && (
          <IconButton
            size="small"
            onClick={onMinimize}
            aria-label="Minimize"
            title="Minimize"
            className="chat-ulap-header-icon-btn chat-expand-btn"
          >
            <FullscreenExitIcon fontSize="small" />
          </IconButton>
        )}
      </div>
    </header>
  ) : (
    <div
      className="chat-header chat-header-draggable"
      onMouseDown={onDragStart}
      aria-label="Drag to move chat window"
    >
      <div className="chat-titleArea">
        <Avatar src={radzLogo} className="chat-header-avatar" />
        <Typography variant="h6" className="chat-titleText">
          UlapAI
        </Typography>
      </div>
      <div className="chat-controlIcons">
        {onMoreClick && (
          <IconButton
            size="small"
            onClick={(e) => onNewChat(e.currentTarget)}
            aria-label="More actions"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
        {onExpandToggle && (
          <IconButton
            size="small"
            className="chat-expand-btn"
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
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
