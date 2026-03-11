import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import CreateIcon from "@material-ui/icons/Create";
import SearchIcon from "@material-ui/icons/Search";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import MenuIcon from "@material-ui/icons/MenuOpen";
import radzLogo from "./Assets/SHARED] Radztech Interns Logo - 32.png";
import "./Chatbox.css";

const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;
const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;

function groupHistoryByPeriod(history) {
  const now = Date.now();
  const last7 = [];
  const last30 = [];
  history.forEach((item) => {
    const age = now - (item.createdAt || 0);
    if (age <= MS_7_DAYS) last7.push(item);
    else if (age <= MS_30_DAYS) last30.push(item);
  });
  return { last7Days: last7, previous30Days: last30 };
}

export default function ChatSidebar({
  onNewChat,
  history = [],
  onSelectChat,
  onDeleteChat,
}) {
  const [chatsCollapsed, setChatsCollapsed] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  const filteredHistory = history;
  const hasConversations = filteredHistory.length > 0;
  // Only show "New Chat" entry in the list when there is at least one saved conversation
  const listItems = hasConversations
    ? [{ id: "__new_chat__", title: "New Chat", isNewChat: true }, ...filteredHistory]
    : filteredHistory;

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

  const filterByQuery = (list, q) => {
    if (!q || !q.trim()) return list;
    const lower = q.trim().toLowerCase();
    return list.filter((item) => (item.title || "Chat").toLowerCase().includes(lower));
  };

  const { last7Days, previous30Days } = groupHistoryByPeriod(history);
  const modal7 = filterByQuery(last7Days, modalSearchQuery);
  const modal30 = filterByQuery(previous30Days, modalSearchQuery);

  const handleCloseSearchModal = () => {
    setSearchModalOpen(false);
    setModalSearchQuery("");
  };

  const handleSelectFromModal = (item) => {
    onSelectChat(item);
    handleCloseSearchModal();
  };

  return (
    <aside
      className={
        "chat-ulap-sidebar" + (sidebarCollapsed ? " chat-ulap-sidebar--collapsed" : "")
      }
    >
      <div className="chat-ulap-sidebar-top">
        <div
          className="chat-ulap-sidebar-logo-wrap"
          onMouseEnter={() => sidebarCollapsed && setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}
          onKeyDown={(e) => {
            if (sidebarCollapsed && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setSidebarCollapsed(false);
            }
          }}
          role={sidebarCollapsed ? "button" : undefined}
          tabIndex={sidebarCollapsed ? 0 : undefined}
          aria-label={sidebarCollapsed ? "Expand sidebar" : undefined}
        >
          <div className="chat-ulap-logo-circle" aria-hidden>
            {sidebarCollapsed && logoHovered ? (
              <MenuIcon className="chat-ulap-sidebar-menu-icon" />
            ) : (
              <img src={radzLogo} alt="UlapBiz" className="chat-ulap-sidebar-logo-img" />
            )}
          </div>
        </div>
        {!sidebarCollapsed && (
          <IconButton
            size="small"
            className="chat-ulap-sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </div>
      <nav className="chat-ulap-sidebar-nav">
        <button
          type="button"
          className="chat-ulap-nav-btn"
          onClick={onNewChat}
          aria-label="New Chat"
        >
          <CreateIcon className="chat-ulap-nav-icon" />
          <span className="chat-ulap-nav-btn-text">New Chat</span>
        </button>
        <button
          type="button"
          className="chat-ulap-nav-btn chat-ulap-search-btn"
          onClick={() => setSearchModalOpen(true)}
          aria-label="Search Chat"
        >
          <SearchIcon className="chat-ulap-nav-icon" />
          <span className="chat-ulap-nav-btn-text">Search Chat</span>
        </button>
      </nav>
      <div className="chat-ulap-your-chats">
        <button
          type="button"
          className="chat-ulap-chats-header"
          onClick={() => setChatsCollapsed((c) => !c)}
          aria-expanded={!chatsCollapsed}
        >
          <Typography variant="subtitle2" className="chat-ulap-chats-title">
            Your chats
          </Typography>
          {chatsCollapsed ? (
            <ExpandMoreIcon className="chat-ulap-chats-arrow" fontSize="small" />
          ) : (
            <ExpandLessIcon className="chat-ulap-chats-arrow" fontSize="small" />
          )}
        </button>
        {!chatsCollapsed && (
          <List className="chat-ulap-chats-list" disablePadding>
            {listItems.length === 0 ? (
              <ListItem className="chat-ulap-chat-item">
                <ListItemText
                  primary="No chats yet"
                  primaryTypographyProps={{ variant: "body2", color: "textSecondary" }}
                />
              </ListItem>
            ) : (
              listItems.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  className={"chat-ulap-chat-item" + (item.isNewChat ? " chat-ulap-chat-item-new" : "")}
                  onClick={() => item.isNewChat ? onNewChat() : onSelectChat(item)}
                >
                  <ListItemText
                    primary={item.title || "Chat"}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: "body2",
                      className: "chat-ulap-chat-title",
                    }}
                    secondary={item.isNewChat ? null : formatDate(item.createdAt)}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                  {!item.isNewChat && (
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(item.id);
                      }}
                      aria-label="Delete chat"
                      className="chat-ulap-chat-delete"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
              ))
            )}
          </List>
        )}
      </div>

      <Dialog
        open={searchModalOpen}
        onClose={handleCloseSearchModal}
        maxWidth="sm"
        fullWidth
        classes={{ paper: "chat-search-modal-paper" }}
        PaperProps={{ elevation: 8 }}
      >
        <div className="chat-search-modal-header">
          <input
            type="text"
            className="chat-search-modal-input"
            placeholder="Search chats..."
            value={modalSearchQuery}
            onChange={(e) => setModalSearchQuery(e.target.value)}
            aria-label="Search chats"
          />
          <IconButton
            size="small"
            className="chat-search-modal-close"
            onClick={handleCloseSearchModal}
            aria-label="Close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <DialogContent className="chat-search-modal-content">
          <button
            type="button"
            className="chat-search-modal-new-chat"
            onClick={() => {
              onNewChat();
              handleCloseSearchModal();
            }}
          >
            <CreateIcon className="chat-ulap-nav-icon" />
            <span>New chat</span>
          </button>

          {modal7.length > 0 && (
            <div className="chat-search-modal-section">
              <Typography variant="body2" className="chat-search-modal-section-title">
                Previous 7 Days
              </Typography>
              <List disablePadding className="chat-search-modal-list">
                {modal7.map((item) => (
                  <ListItem
                    key={item.id}
                    button
                    className="chat-search-modal-item"
                    onClick={() => handleSelectFromModal(item)}
                  >
                    <ChatBubbleOutlineIcon className="chat-search-modal-bubble-icon" />
                    <ListItemText
                      primary={item.title || "Chat"}
                      primaryTypographyProps={{ noWrap: true, variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          )}

          {modal30.length > 0 && (
            <div className="chat-search-modal-section">
              <Typography variant="body2" className="chat-search-modal-section-title">
                Previous 30 Days
              </Typography>
              <List disablePadding className="chat-search-modal-list">
                {modal30.map((item) => (
                  <ListItem
                    key={item.id}
                    button
                    className="chat-search-modal-item"
                    onClick={() => handleSelectFromModal(item)}
                  >
                    <ChatBubbleOutlineIcon className="chat-search-modal-bubble-icon" />
                    <ListItemText
                      primary={item.title || "Chat"}
                      primaryTypographyProps={{ noWrap: true, variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          )}

          {modal7.length === 0 && modal30.length === 0 && (
            <Typography variant="body2" color="textSecondary" className="chat-search-modal-empty">
              {modalSearchQuery.trim() ? "No chats match your search." : "No recent chats."}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
}
