import { useState, useEffect, useCallback } from "react";
import { sanitizeColor, PRESET_THEMES } from "./colotheme.js";
import { applyThemeToElement } from "./chatboxUtils.js";

const STORAGE_KEY = "ulapChatTheme";

/* Default to Flamingo (light pink) to match Ulap Chat design */
const defaultThemeValues = PRESET_THEMES.find((p) => p.key === "flamingo")?.theme ?? {
  bubbleLeft: "rgba(255,99,132,0.12)",
  bubbleRight: "#ffd6e0",
  borderColor: "#ff6f91",
};

export function useChatboxTheme(rootRef) {
  const [theme, setTheme] = useState(defaultThemeValues);
  const [selectedThemeKey, setSelectedThemeKey] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const applyTheme = useCallback((t) => {
    if (rootRef?.current) {
      applyThemeToElement(rootRef.current, t);
    }
  }, [rootRef]);

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
    setSelectedThemeKey("flamingo");
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
        setSelectedThemeKey("flamingo");
        applyTheme(defaultThemeValues);
      }
    } catch (e) {
      applyTheme(defaultThemeValues);
    }
  }, [applyTheme]);

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
