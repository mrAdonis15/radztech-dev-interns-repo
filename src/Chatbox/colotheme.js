// Centralized color theme and helpers for Chatbox
export const defaultTheme = {
  bubbleLeft: "rgba(255,117,4,0.5)",
  bubbleRight: "#bdbdbd",
  borderColor: "#f57c00",
};

// Preset named themes for the chatbox. Use these instead of a free color picker.
export const PRESET_THEMES = [
  {
    key: "flamingo",
    name: "Flamingo",
    theme: {
      bubbleLeft: "rgba(255,99,132,0.12)",
      bubbleRight: "#ffd6e0",
      borderColor: "#ff6f91",
    },
  },
  {
    key: "nature",
    name: "Nature",
    theme: {
      bubbleLeft: "rgba(76,175,80,0.12)",
      bubbleRight: "#dcedc8",
      borderColor: "#4caf50",
    },
  },
  {
    key: "ocean",
    name: "Ocean",
    theme: {
      bubbleLeft: "rgba(3,169,244,0.12)",
      bubbleRight: "#b3e5fc",
      borderColor: "#03a9f4",
    },
  },
  {
    key: "classic",
    name: "Classic",
    theme: defaultTheme,
  },
  {
    key: "sunset",
    name: "Sunset",
    theme: {
      bubbleLeft: "rgba(255,159,67,0.12)",
      bubbleRight: "#ffe8d6",
      borderColor: "#ff8a65",
    },
  },
  {
    key: "lavender",
    name: "Lavender",
    theme: {
      bubbleLeft: "rgba(149,117,255,0.12)",
      bubbleRight: "#efe8ff",
      borderColor: "#9b59ff",
    },
  },
  {
    key: "midnight",
    name: "Midnight",
    theme: {
      bubbleLeft: "rgba(33,47,61,0.12)",
      bubbleRight: "#e6eef6",
      borderColor: "#1f3a93",
    },
  },
  {
    key: "sandstone",
    name: "Sandstone",
    theme: {
      bubbleLeft: "rgba(205,180,140,0.12)",
      bubbleRight: "#fbf6ed",
      borderColor: "#d2b48c",
    },
  },
  {
    key: "mint",
    name: "Mint",
    theme: {
      bubbleLeft: "rgba(152,251,152,0.12)",
      bubbleRight: "#eaffef",
      borderColor: "#7ed957",
    },
  },
];

export function sanitizeColor(val, fallback) {
  if (!val) return fallback;
  const s = String(val).trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s)) return s;
  if (/^rgba?\(/.test(s)) return s;
  return fallback;
}

export function isHex(v) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(String(v || "").trim());
}

export function rgbToHex(v) {
  if (!v || !/^rgba?\(/.test(v)) return null;
  const parts = v
    .replace(/rgba?\(|\)/g, "")
    .split(",")
    .map((s) => parseInt(s, 10));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  const hex =
    "#" +
    parts
      .slice(0, 3)
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
  return hex;
}

export default defaultTheme;
