// Slash command options
export const SLASH_OPTIONS = [
  {
    command: "ai",
    label: "Ask AI",
    description: "Ask the Ulap Biz AI assistant",
  },
];

// Initial chat messages
export function getInitialMessages() {
  const formatTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return [
    {
      id: 1,
      sender: "bot",
      text: "Hello! Welcome to Ulap Biz support chatbot.",
      time: formatTime(),
    },
    {
      id: 2,
      sender: "me",
      text: "Hi Ulap Biz!!!",
      time: formatTime(),
    },
  ];
}

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
