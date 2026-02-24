

// Initial chat messages (empty - no default conversation)
export function getInitialMessages() {
  return [];
}

// Storage keys for chat persistence
export const CHAT_STORAGE_KEY = "ulap-chat-messages";
export const CHAT_HISTORY_STORAGE_KEY = "ulap-chat-history";

// Panel dimensions
export const PANEL_WIDTH = 340;
export const PANEL_HEIGHT = 480;
export const PANEL_PADDING = 24;
export const TOGGLE_BUTTON_HEIGHT = 56;
export const DEFAULT_BOTTOM = TOGGLE_BUTTON_HEIGHT + PANEL_PADDING + 16;

// Default position when opening panel
export function getDefaultPanelPosition() {
  return {
    x: window.innerWidth - PANEL_WIDTH - PANEL_PADDING,
    y: window.innerHeight - PANEL_HEIGHT - DEFAULT_BOTTOM,
  };
}
