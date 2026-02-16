import React from "react";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import SendIcon from "@material-ui/icons/Send";
import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";
import EmojiPicker from "emoji-picker-react";
import ulapLogo from "./Assets/ulap-biz-logo.png";

export default function ChatInputArea({
  input,
  setInput,
  inputRef,
  showEmoji,
  setShowEmoji,
  showSlashMenu,
  setShowSlashMenu,
  selectedSlashIndex,
  setSelectedSlashIndex,
  filteredSlashOptions,
  onSlashSelect,
  onEmojiClick,
  onSend,
  onKeyDown,
  onDragStart,
  themeProps,
}) {
  const {
    showThemePicker,
    toggleThemePicker,
    selectedThemeKey,
    selectPresetTheme,
    saveTheme,
    resetTheme,
    PRESET_THEMES,
  } = themeProps;

  return (
    <div
      className="chat-inputArea chat-inputArea-draggable"
      onMouseDown={onDragStart}
      aria-label="Drag to move chat window"
    >
      <Paper className="chat-inputPaper" elevation={0}>
        {/* Emoji Section */}
        <div className="emoji-wrapper" style={{ position: "relative" }}>
          <IconButton
            size="small"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            <EmojiEmotionsIcon
              style={{ color: showEmoji ? "#ff6f00" : "#777" }}
            />
          </IconButton>
          {showEmoji && (
            <div
              style={{
                position: "absolute",
                bottom: 45,
                left: 0,
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        {/* Slash Menu */}
        <div
          className="slash-menu-wrapper"
          style={{ position: "relative", flex: 1 }}
        >
          {showSlashMenu && filteredSlashOptions.length > 0 && (
            <div
              className="slash-menu"
              style={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                marginBottom: 4,
                minWidth: 260,
                maxWidth: 320,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                overflow: "hidden",
                zIndex: 1500,
              }}
            >
              <div
                style={{
                  padding: "6px 0",
                  fontSize: 12,
                  color: "#666",
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 8,
                }}
              >
                AI commands
              </div>
              {filteredSlashOptions.map((opt, idx) => (
                <div
                  key={opt.command}
                  onClick={() => onSlashSelect(opt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSlashSelect(opt);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    background:
                      idx === selectedSlashIndex
                        ? "rgba(255, 111, 0, 0.12)"
                        : "transparent",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#333" }}>
                    / {opt.command}
                  </span>
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {opt.description}
                  </span>
                </div>
              ))}
            </div>
          )}
          <InputBase
            inputRef={inputRef}
            className="chat-inputBase"
            placeholder="Message"
            value={input}
            onChange={(e) => {
              const v = e.target.value;
              setInput(v);
              setShowSlashMenu(v.startsWith("/"));
              if (v.startsWith("/")) setSelectedSlashIndex(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Theme Toggle */}
        <div style={{ position: "relative" }}>
          <IconButton
            size="small"
            onClick={toggleThemePicker}
            aria-label="theme"
          >
            <img
              src={ulapLogo}
              alt="ulapbiz logo"
              className="theme-toggle-logo"
            />
          </IconButton>
          {showThemePicker && (
            <div
              className="theme-picker"
              style={{
                position: "absolute",
                right: 0,
                bottom: 44,
                zIndex: 2000,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: 12,
                  borderRadius: 8,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                  width: 220,
                }}
              >
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                >
                  Chat Theme
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    Choose theme
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {PRESET_THEMES.map((t) => (
                      <button
                        key={t.key}
                        className={
                          "theme-swatch" +
                          (selectedThemeKey === t.key ? " selected" : "")
                        }
                        onClick={() => selectPresetTheme(t.theme, t.key)}
                        type="button"
                      >
                        <div
                          className="swatch-box"
                          style={{
                            background: t.theme.bubbleLeft,
                            borderColor: t.theme.borderColor,
                          }}
                        />
                        <div className="swatch-label">{t.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <button
                    onClick={resetTheme}
                    className="theme-action reset"
                  >
                    Reset
                  </button>
                  <button onClick={saveTheme} className="theme-action save">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Paper>

      <IconButton
        className="chat-sendButton"
        style={{ marginLeft: 8 }}
        onClick={onSend}
      >
        <SendIcon />
      </IconButton>
    </div>
  );
}
