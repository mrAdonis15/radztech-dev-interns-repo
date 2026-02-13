import React from "react";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import RemoveIcon from "@material-ui/icons/Remove";
import CloseIcon from "@material-ui/icons/Close";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";

export default function ChatHeader({
  maintenanceOpen,
  onMaintenanceChange,
  onMinimize,
  onClose,
  onDragStart,
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
            Talk to Ulap 
          </Typography>
          <div className="chat-header-statusRow">
            {maintenanceOpen ? (
              <>
                <span className="chat-statusDot" />
                <Typography variant="caption" style={{ color: "#777" }}>
                  Under Maintenance comeback again later
                </Typography>
              </>
            ) : (
              <>
                <span className="chat-onlineDot" />
                <Typography variant="caption" style={{ color: "#777" }}>
                  Online
                </Typography>
              </>
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
