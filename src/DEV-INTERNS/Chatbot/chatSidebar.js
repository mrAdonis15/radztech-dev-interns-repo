import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import CreateIcon from "@material-ui/icons/Create";
import SearchIcon from "@material-ui/icons/Search";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import CloseIcon from "@material-ui/icons/Close";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import MenuIcon from "@material-ui/icons/MenuOpen";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import DoneIcon from "@material-ui/icons/Done";

import { SESSION_ID_KEY } from "./constants/chatboxConstants";
import "./theme/chatbox.css";
import radzLogo from "./Assets/radz-interns-logo.png";

export default function ChatSidebar({
  history = [],
  hoverTimeoutRef,
  newChatRef,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onEditChat,
  updateSessionTitle,
  onHover,
}) {
  const [chatsCollapsed, setChatsCollapsed] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [title, setTitle] = useState("");
  const [renamingSessionId, setRenamingSessionId] = useState(null);

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenMenu = (event, sessionId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveSessionId(sessionId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveSessionId(null);
  };

  const handleCloseSearchModal = () => {
    setSearchModalOpen(false);
    setSearchQuery("");
  };

  const handleSelectFromModal = (sessionId) => {
    onSelectChat(sessionId);
    handleCloseSearchModal();
  };

  return (
    <aside
      className={
        "chat-ulap-sidebar" +
        (sidebarCollapsed ? " chat-ulap-sidebar--collapsed" : "")
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
              <img
                src={radzLogo}
                alt="UlapBiz"
                className="chat-ulap-sidebar-logo-img"
              />
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
          ref={newChatRef}
          type="button"
          className="chat-ulap-nav-btn"
          onClick={onNewChat}
          onMouseEnter={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              onHover({
                title: "Start a new chat",
                desc: "Click to start a new conversation with UlapAI.",
                url: "https://youtu.be/hxAT5PDoq0A?si=H-jp4bfA84eQXq6M",
                position: { top: "65px", left: "290px" },
              });
            }, 500);
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          aria-label="New Chat"
        >
          <CreateIcon className="chat-ulap-nav-icon" />
          <span className="chat-ulap-nav-btn-text">New Chat</span>
        </button>
        <button
          type="button"
          className="chat-ulap-nav-btn chat-ulap-search-btn"
          onClick={() => setSearchModalOpen(true)}
          onMouseEnter={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              onHover({
                title: "Search Chat",
                desc: "Click to search through your chat sessions.",
                url: "https://youtu.be/oguRGRv59W8?si=dLDGpE0_mtL_KSss",
                position: { top: "120px", left: "290px" },
              });
            }, 500);
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
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
          onMouseEnter={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              onHover({
                title: "Your Chats",
                desc: "Your previous conversations with UlapAI are saved here. Choose and click a session to view the conversation.",
                url: "https://youtu.be/4uN_HQZjiB0?si=b_P5telzxWL9eHGm",
                position: { top: "180px", left: "290px" },
              });
            }, 500);
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          aria-expanded={!chatsCollapsed}
        >
          <Typography variant="subtitle2" className="chat-ulap-chats-title">
            Your chats
          </Typography>
          {chatsCollapsed ? (
            <ExpandMoreIcon
              className="chat-ulap-chats-arrow"
              fontSize="small"
            />
          ) : (
            <ExpandLessIcon
              className="chat-ulap-chats-arrow"
              fontSize="small"
            />
          )}
        </button>
        {!chatsCollapsed && (
          <List className="chat-ulap-chats-list" disablePadding>
            {history.length === 0 ? (
              <ListItem className="chat-ulap-chat-item">
                <ListItemText
                  primary="No chats yet"
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "textSecondary",
                  }}
                />
              </ListItem>
            ) : (
              history.map((item) => (
                <ListItem
                  key={item.session_id}
                  button
                  className="chat-conversation-item"
                  selected={
                    item.session_id === localStorage.getItem(SESSION_ID_KEY)
                  }
                  onClick={() => {
                    onSelectChat(item.session_id);
                  }}
                >
                  {renamingSessionId !== item.session_id ? (
                    <>
                      <ListItemText
                        primary={item.title || "Chat"}
                        primaryTypographyProps={{
                          noWrap: true,
                          variant: "body2",
                          className: "chat-ulap-chat-title",
                        }}
                      />
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="More options"
                        className="session-icon"
                        onClick={(e) => handleOpenMenu(e, item.session_id)}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={activeSessionId === item.session_id}
                        onClose={handleCloseMenu}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            setTitle(item.title);
                            setRenamingSessionId(item.session_id);
                            onEditChat();
                            handleCloseMenu();
                          }}
                        >
                          Rename
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(item.session_id);
                            handleCloseMenu();
                          }}
                        >
                          Delete
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <div
                      style={{ display: "flex", alignItems: "center", flex: 1 }}
                    >
                      <TextField
                        variant="standard"
                        value={title}
                        InputProps={{
                          disableUnderline: true,
                          classes: { input: "chat-ulap-chat-title" },
                        }}
                        onChange={(e) => setTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateSessionTitle({
                              session_id: item.session_id,
                              title,
                            });
                          }
                        }}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Save title"
                        className="session-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSessionTitle({
                            session_id: item.session_id,
                            title,
                          });
                        }}
                      >
                        <DoneIcon />
                      </IconButton>
                    </div>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="chat-search-modal-section">
            {!searchQuery && (
              <Typography
                variant="body2"
                className="chat-search-modal-section-title"
              >
                Recents
              </Typography>
            )}
            <List disablePadding className="chat-search-modal-list">
              {filteredHistory.slice(0, 10).map((item) => (
                <ListItem
                  key={item.session_id}
                  button
                  className="chat-search-modal-item"
                  onClick={() => handleSelectFromModal(item.session_id)}
                >
                  <ChatBubbleOutlineIcon className="chat-search-modal-bubble-icon" />
                  <ListItemText
                    primary={item.title || "Chat"}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: "body2",
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {filteredHistory.length === 0 && (
              <Typography
                variant="body2"
                color="textSecondary"
                className="chat-search-modal-empty"
              >
                No sessions found.
              </Typography>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
