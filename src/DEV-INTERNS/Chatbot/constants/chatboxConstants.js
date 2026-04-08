// Initial chat messages (empty - no default conversation)
export function getInitialMessages() {
  return [];
}

export const CHAT_FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";

// Storage keys for chat persistence
export const SESSION_ID_KEY = "ulap-chat-session-id";
export const CONVERSATIONS_KEY = "ulap-chat-conversations";

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
