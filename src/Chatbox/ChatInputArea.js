import React, { useState } from "react";
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
  onEmojiClick,
  onSend,
  onKeyDown,
  onDragStart,
  themeProps,
  isExpanded = false,
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

  // Added state for hover tracking on the theme toggle
  const [isHoveringTheme, setIsHoveringTheme] = useState(false);

  return (
    <div
      className={
        "chat-inputArea chat-inputArea-emojiAnchor" +
        (isExpanded ? "" : " chat-inputArea-draggable")
      }
      onMouseDown={isExpanded ? undefined : onDragStart}
      aria-label={isExpanded ? "Message input" : "Drag to move chat window"}
    >
      <Paper className="chat-inputPaper" elevation={0}>
        {/* Emoji Section: dropdown anchored to icon so it pops up on top of it */}
        <div className="emoji-wrapper" style={{ position: "relative" }}>
          {showEmoji && (
            <div className="emoji-picker-dropdown">
              <EmojiPicker
                width={280}
                height={320}
                onEmojiClick={onEmojiClick}
                className="chat-emoji-picker"
              />
            </div>
          )}
          <IconButton
            size="small"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            <EmojiEmotionsIcon
              style={{ color: showEmoji ? "#ff6f00" : "#777" }}
            />
          </IconButton>
        </div>

        <div
          className="slash-menu-wrapper"
          style={{ position: "relative", flex: 1 }}
        >
          <InputBase
            inputRef={inputRef}
            className="chat-inputBase"
            placeholder="Message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Theme Toggle */}
        <div style={{ position: "relative" }}>
          <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setIsHoveringTheme(true)}
            onMouseLeave={() => setIsHoveringTheme(false)}
          >
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
            {isHoveringTheme && (
              <div
                style={{
                  position: "absolute",
                  top: "0%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 9,
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  pointerEvents: "none",
                  fontFamily: "Poppins",
                }}
              >
                choose theme
              </div>
            )}
          </div>
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
              <div className="theme-picker-panel">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Chat Theme
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    Choose theme
                  </div>
                  <div className="theme-swatches-grid">
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
                  <button onClick={resetTheme} className="theme-action reset">
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
