"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "portfolio.theme";
const ATTR = "data-theme";
// Custom event used to broadcast theme changes within the current tab so
// `useSyncExternalStore` can re-render every consumer in lock-step.
const CHANGE_EVENT = "portfolio.theme.change";

type ThemeCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

/* ─── External-store glue ──────────────────────────────────────────────
   We treat <html data-theme="..."> as the single source of truth. The
   provider subscribes via useSyncExternalStore so that React re-renders
   every consumer the instant the attribute flips — whether the change
   came from this tab (custom event) or another tab (storage event). */

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getClientSnapshot(): Theme {
  const attr = document.documentElement.getAttribute(ATTR);
  return attr === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  // SSR has no DOM — render with the dark default. The pre-paint script
  // in layout.tsx flips the attribute synchronously on the client before
  // any styles paint, and useSyncExternalStore reconciles immediately
  // after hydration.
  return "dark";
}

function applyTheme(next: Theme): void {
  document.documentElement.setAttribute(ATTR, next);
  // Keep native form controls / scrollbars in sync.
  document.documentElement.style.colorScheme = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage may be unavailable — silently ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* ─── Provider ─────────────────────────────────────────────────────── */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const value = useMemo<ThemeCtx>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/**
 * Pre-paint bootstrap. Inlined in <head> so `data-theme` is set on <html>
 * before any styles paint — no flash of unstyled-theme on reload.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var ls = window.localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var t = ls === "light" ? "light" : "dark";
    document.documentElement.setAttribute("${ATTR}", t);
    document.documentElement.style.colorScheme = t;
  } catch (e) {
    document.documentElement.setAttribute("${ATTR}", "dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;
