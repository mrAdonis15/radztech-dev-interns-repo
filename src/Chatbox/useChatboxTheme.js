import { useState, useEffect } from "react";
import defaultTheme, { sanitizeColor, PRESET_THEMES } from "./colotheme.js";
import { applyThemeToElement } from "./chatboxUtils.js";

const STORAGE_KEY = "ulapChatTheme";

const defaultThemeValues = {
  bubbleLeft: "rgba(255,117,4,0.5)",
  bubbleRight: "#ffffff",
  borderColor: "#f57c00",
};

export function useChatboxTheme(rootRef) {
  const [theme, setTheme] = useState(defaultTheme);
  const [selectedThemeKey, setSelectedThemeKey] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  function applyTheme(t) {
    if (rootRef?.current) {
      applyThemeToElement(rootRef.current, t);
    }
  }

  function toggleThemePicker() {
    setShowThemePicker((s) => !s);
  }

  function saveTheme() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch (e) {
      console.warn("Failed to save theme", e);
    }
    setShowThemePicker(false);
  }

  function resetTheme() {
    setTheme(defaultThemeValues);
    applyTheme(defaultThemeValues);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function selectPresetTheme(presetTheme, key) {
    setTheme(presetTheme);
    applyTheme(presetTheme);
    setSelectedThemeKey(key);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const t = {
          bubbleLeft: sanitizeColor(parsed.bubbleLeft, defaultThemeValues.bubbleLeft),
          bubbleRight: sanitizeColor(parsed.bubbleRight, defaultThemeValues.bubbleRight),
          borderColor: sanitizeColor(parsed.borderColor, defaultThemeValues.borderColor),
        };
        setTheme(t);
        try {
          const match = PRESET_THEMES.find(
            (p) =>
              p.theme.bubbleLeft === t.bubbleLeft &&
              p.theme.borderColor === t.borderColor
          );
          if (match) setSelectedThemeKey(match.key);
        } catch (e) {}
        requestAnimationFrame(() => applyTheme(t));
      } else {
        applyTheme(theme);
      }
    } catch (e) {
      applyTheme(theme);
    }

  }, []);

  return {
    theme,
    setTheme,
    selectedThemeKey,
    showThemePicker,
    setShowThemePicker,
    applyTheme,
    toggleThemePicker,
    saveTheme,
    resetTheme,
    selectPresetTheme,
    PRESET_THEMES,
  };
}
