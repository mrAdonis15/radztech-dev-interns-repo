import { sanitizeColor } from "./colotheme.js";

/** Format time for message display */
export function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Create a message object */
export function createMessage(id, sender, text) {
  return {
    id,
    sender,
    text,
    time: formatTime(),
  };
}

/** Apply theme CSS variables to root element */
export function applyThemeToElement(el, theme) {
  if (!el || !theme) return;
  el.style.setProperty(
    "--bubble-left",
    sanitizeColor(theme.bubbleLeft, "rgba(255,117,4,0.5)")
  );
  el.style.setProperty(
    "--bubble-right",
    sanitizeColor(theme.bubbleRight, "#ffffff")
  );
  el.style.setProperty(
    "--border-color",
    sanitizeColor(theme.borderColor, "#f57c00")
  );
  /* Use bubbleRight for panel accent to match chat body background (e.g. light pink) */
  el.style.setProperty(
    "--panel-accent",
    sanitizeColor(theme.bubbleRight, "#fff3e0")
  );
}
