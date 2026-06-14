/**
 * Theme system — three-way toggle: "light" | "dark" | "system".
 *
 * Dark mode is implemented as a `.dark` class on <html> (class-based, not
 * media-query-based), so it works independently of the OS preference.
 * In "system" mode, a matchMedia listener keeps it in sync with OS changes
 * without requiring a page reload.
 *
 * The chosen preference is persisted in localStorage under "fp-theme".
 * `main.tsx` calls `applyTheme(getStoredTheme())` before the first React
 * render to prevent a flash of the wrong theme on load.
 */
import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "fp-theme";

const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

/** Read the saved preference, defaulting to "system" when absent or unrecognised. */
export const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "dark" || stored === "light" || stored === "system" ? stored : "system";
};

/**
 * Apply a theme by toggling the `.dark` class on <html>.
 * Safe to call before React mounts (used in main.tsx for pre-paint application).
 */
export const applyTheme = (theme: Theme) => {
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", !!isDark);
};

/**
 * Stateful theme control for the Settings UI.
 *
 * @returns `theme` — current stored preference; `setTheme` — updates storage and
 *   applies the class immediately. In "system" mode, an OS-change listener is
 *   registered and cleaned up automatically.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  // Persist + apply whenever the user's choice changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  // While in "system" mode, follow OS dark/light changes live without a reload.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return { theme, setTheme };
};
