import React from "react";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import "./Chatbox.css";

export default function ChatHistory({
  open,
  onClose,
  history,
  onSelectChat,
  onDeleteChat,
}) {
  const formatDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{ paper: "chat-history-drawer-paper" }}
      ModalProps={{ keepMounted: true }}
    >
      <div className="chat-history-drawer">
        <div className="chat-history-header">
          <Typography variant="subtitle1" className="chat-history-title">
            Chat history
          </Typography>
        </div>
        <List className="chat-history-list" disablePadding>
          {history.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No past chats"
                secondary="Start a new chat and use &quot;New chat&quot; to save it here."
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          ) : (
            history.map((item) => (
              <ListItem
                key={item.id}
                button
                className="chat-history-item"
                onClick={() => onSelectChat(item)}
              >
                <ListItemText
                  primary={item.title || "Chat"}
                  secondary={formatDate(item.createdAt)}
                  primaryTypographyProps={{ noWrap: true }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
                <IconButton
                  size="small"
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(item.id);
                  }}
                  aria-label="Delete chat"
                  className="chat-history-delete"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))
          )}
        </List>
      </div>
    </Drawer>
  );
}
