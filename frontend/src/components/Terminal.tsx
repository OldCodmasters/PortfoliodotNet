"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { executeCommand } from "@/lib/api";
import type { Game } from "@/games/types";
import { findGame, formatGamesList, GAMES } from "@/games/registry";
import { useTheme, type Theme } from "./ThemeProvider";

type Entry =
  | { kind: "prompt"; value: string }
  | { kind: "output"; value: string }
  | { kind: "error"; value: string };

const PROMPT = "visitor@portfolio:~$";
const HISTORY_MAX = 50;

const HINT_COMMANDS = [
  "help",
  "about",
  "skills",
  "projects",
  "resume",
  "games",
  "theme",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GameCtx { game: Game<any>; state: any }

/**
 * Recognise theme-switching commands the user might type in the terminal.
 * Returns the explicit theme to set ("dark" | "light"), the sentinel
 * "toggle" to flip whatever's current, the sentinel "status" to just
 * report the current theme, or null if the command isn't a theme command.
 */
function matchThemeCommand(lower: string): Theme | "toggle" | "status" | null {
  // Bare `theme` — report status.
  if (lower === "theme") return "status";

  // `light`, `dark` as standalone commands.
  if (lower === "light") return "light";
  if (lower === "dark") return "dark";

  // `theme light`, `theme dark`, `theme toggle`.
  if (lower === "theme light") return "light";
  if (lower === "theme dark") return "dark";
  if (lower === "theme toggle") return "toggle";

  // `switch light`, `switch dark`, `switch theme`.
  if (lower === "switch light") return "light";
  if (lower === "switch dark") return "dark";
  if (lower === "switch theme") return "toggle";

  return null;
}

export function Terminal() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([
    {
      kind: "output",
      value: "Welcome. Type 'help' for commands, 'games' to play.",
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [busy, setBusy] = useState(false);
  const [gameCtx, setGameCtx] = useState<GameCtx | null>(null);
  const { theme, setTheme, toggle: toggleTheme } = useTheme();

  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const keyCaptureRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new content
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries, open, gameCtx]);

  // Focus input when terminal opens (only when not in keys-mode game)
  useEffect(() => {
    if (!open) return;
    if (gameCtx?.game.mode === "keys") {
      keyCaptureRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [open, gameCtx]);

  // Real-time tick for games that want it (Snake, etc.)
  useEffect(() => {
    const g = gameCtx?.game;
    if (!g || !g.tickMs) return;
    const id = window.setInterval(() => {
      setGameCtx((prev) => {
        if (!prev) return prev;
        const res = prev.game.update(prev.state, { type: "tick" });
        if (res.exit) return null;
        return { game: prev.game, state: res.state };
      });
    }, g.tickMs);
    return () => window.clearInterval(id);
    // We intentionally key on g (stable per active game), not gameCtx.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCtx?.game]);

  const startGame = useCallback((game: Game) => {
    setGameCtx({ game, state: game.init() });
    setOpen(true);
    setEntries((prev) => [
      ...prev,
      { kind: "output", value: `[${game.name}] ${game.howTo}` },
    ]);
  }, []);

  const exitGame = useCallback((message?: string) => {
    setGameCtx(null);
    setEntries((prev) => [
      ...prev,
      { kind: "output", value: message ?? "[game] exited." },
    ]);
  }, []);

  // ---------------------------------------------------------------------
  // Command dispatcher — intercepts games/play/quit before the backend
  // ---------------------------------------------------------------------
  const run = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      setEntries((prev) => [...prev, { kind: "prompt", value: cmd }]);
      setHistory((prev) => {
        const next = [...prev, cmd];
        return next.slice(-HISTORY_MAX);
      });
      setHistoryIdx(-1);

      const lower = cmd.toLowerCase();

      // Client-side theme commands — switching the page palette is a
      // pure UI gesture, never round-trip the backend for it.
      // Accepted forms: `light`, `dark`, `theme`, `theme light`,
      // `theme dark`, `switch light`, `switch dark`, `theme toggle`.
      const themeMatch = matchThemeCommand(lower);
      if (themeMatch !== null) {
        if (themeMatch === "toggle") {
          toggleTheme();
          const after: Theme = theme === "dark" ? "light" : "dark";
          setEntries((prev) => [
            ...prev,
            { kind: "output", value: `theme: switched to ${after} mode.` },
          ]);
        } else if (themeMatch === "status") {
          setEntries((prev) => [
            ...prev,
            { kind: "output", value: `theme: ${theme} (use 'light' or 'dark' to switch)` },
          ]);
        } else {
          setTheme(themeMatch);
          setEntries((prev) => [
            ...prev,
            { kind: "output", value: `theme: switched to ${themeMatch} mode.` },
          ]);
        }
        return;
      }

      // Client-side game commands
      if (lower === "games" || lower === "game") {
        setEntries((prev) => [...prev, { kind: "output", value: formatGamesList() }]);
        return;
      }
      if (lower === "quit" || lower === "exit") {
        if (gameCtx) exitGame();
        else setEntries((prev) => [...prev, { kind: "output", value: "(nothing to quit)" }]);
        return;
      }
      if (lower.startsWith("play ") || lower === "play") {
        const name = cmd.slice(4).trim();
        if (!name) {
          setEntries((prev) => [
            ...prev,
            { kind: "output", value: "usage: play <name>  —  try `games` for the list." },
          ]);
          return;
        }
        const g = findGame(name);
        if (!g) {
          setEntries((prev) => [
            ...prev,
            {
              kind: "error",
              value: `no game named "${name}" — try \`games\` for available titles.`,
            },
          ]);
          return;
        }
        startGame(g);
        return;
      }

      // Backend roundtrip
      setBusy(true);
      try {
        const res = await executeCommand(cmd);
        if (res.clearTerminal) {
          setEntries([]);
          return;
        }
        if (res.result.length > 0) {
          setEntries((prev) => [...prev, { kind: "output", value: res.result }]);
        }
      } catch (err) {
        setEntries((prev) => [
          ...prev,
          { kind: "error", value: err instanceof Error ? err.message : "Unknown error" },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [gameCtx, startGame, exitGame, theme, setTheme, toggleTheme],
  );

  // ---------------------------------------------------------------------
  // Input handling
  // ---------------------------------------------------------------------

  const handleKey = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // In a line-mode game, Enter forwards the line to the game
      if (gameCtx && gameCtx.game.mode === "lines") {
        if (event.key === "Enter") {
          event.preventDefault();
          const line = input;
          setInput("");
          const res = gameCtx.game.update(gameCtx.state, { type: "line", line });
          if (res.exit) {
            setGameCtx(null);
            if (res.message) {
              setEntries((prev) => [...prev, { kind: "output", value: res.message! }]);
            }
            return;
          }
          setGameCtx({ game: gameCtx.game, state: res.state });
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          exitGame();
          return;
        }
        return;
      }

      // Normal terminal keys
      if (event.key === "Enter") {
        event.preventDefault();
        const value = input;
        setInput("");
        void run(value);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (history.length === 0) return;
        const nextIdx = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] ?? "");
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyIdx < 0) return;
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(nextIdx);
          setInput(history[nextIdx] ?? "");
        }
        return;
      }
      if (event.key === "l" && event.ctrlKey) {
        event.preventDefault();
        setEntries([]);
      }
    },
    [history, historyIdx, input, run, gameCtx, exitGame],
  );

  // Keys-mode games (Snake, 2048): capture every keydown on the outer div
  const handleGameKey = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!gameCtx || gameCtx.game.mode !== "keys") return;
      event.preventDefault();
      event.stopPropagation();
      const res = gameCtx.game.update(gameCtx.state, {
        type: "key",
        key: event.key,
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
      });
      if (res.exit) {
        setGameCtx(null);
        if (res.message) {
          setEntries((prev) => [...prev, { kind: "output", value: res.message! }]);
        }
        return;
      }
      setGameCtx({ game: gameCtx.game, state: res.state });
    },
    [gameCtx],
  );

  const hints = useMemo(() => HINT_COMMANDS, []);

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  const inGame = Boolean(gameCtx);
  const gameFrame = gameCtx ? gameCtx.game.render(gameCtx.state) : "";
  const isKeysGame = gameCtx?.game.mode === "keys";

  return (
    <div
      className={
        inGame
          ? "pointer-events-none fixed inset-0 z-50 flex items-stretch justify-center p-3 sm:p-4 md:p-6"
          : "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:px-4 sm:pb-4 md:px-8 md:pb-6"
      }
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={
          "glass glass-solid specular relative pointer-events-auto overflow-hidden " +
          (inGame
            ? "w-full h-full flex flex-col"
            : "w-full max-w-4xl md:max-w-5xl xl:max-w-6xl")
        }
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="flex-1 text-center text-xs tracking-wider text-(--color-foreground-muted)">
            {inGame ? `portfolio ⌁ ${gameCtx!.game.name}` : "portfolio ⌁ zsh"}
          </p>
          {inGame && (
            <button
              type="button"
              onClick={() => exitGame()}
              className="rounded-full px-3 py-1 text-xs text-(--color-foreground-muted) hover:bg-white/10 transition"
            >
              quit
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full px-3 py-1 text-xs text-(--color-foreground-muted) hover:bg-white/10 transition"
            aria-expanded={open}
          >
            {open ? "minimize" : "expand"}
          </button>
        </header>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: inGame ? "100%" : "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className={inGame ? "flex-1 flex flex-col min-h-0" : undefined}
            >
              {inGame && isKeysGame ? (
                // Fullscreen keys-mode game — capture keys on the container
                <div
                  ref={keyCaptureRef}
                  tabIndex={0}
                  onKeyDown={handleGameKey}
                  className="flex-1 overflow-hidden px-5 py-4 font-mono text-[13px] leading-6 focus:outline-none"
                  onClick={() => keyCaptureRef.current?.focus()}
                >
                  <pre className="whitespace-pre text-(--color-foreground)">{gameFrame}</pre>
                </div>
              ) : (
                // Normal terminal, or line-mode game
                <div
                  ref={outputRef}
                  className={
                    "no-scrollbar overflow-y-auto px-3 py-3 font-mono text-[12px] leading-6 sm:px-5 sm:py-4 sm:text-[13px] " +
                    (inGame ? "flex-1 min-h-0" : "max-h-[42vh] min-h-[180px]")
                  }
                  onClick={() => inputRef.current?.focus()}
                >
                  {inGame ? (
                    <pre className="whitespace-pre text-(--color-foreground)">{gameFrame}</pre>
                  ) : (
                    entries.map((entry, i) => (
                      <div
                        key={i}
                        className={
                          entry.kind === "prompt"
                            ? "text-(--color-foreground)"
                            : entry.kind === "error"
                              ? "text-red-300"
                              : "text-(--color-foreground-muted)"
                        }
                      >
                        {entry.kind === "prompt" ? (
                          <>
                            <span className="text-(--color-accent-3)">{PROMPT}</span>{" "}
                            <span>{entry.value}</span>
                          </>
                        ) : (
                          <pre className="whitespace-pre-wrap font-mono">{entry.value}</pre>
                        )}
                      </div>
                    ))
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-(--color-accent-3)">
                      {inGame ? `${gameCtx!.game.name}>` : PROMPT}
                    </span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      disabled={busy}
                      className="flex-1 bg-transparent outline-none placeholder:text-white/25"
                      placeholder={
                        busy
                          ? "running..."
                          : inGame
                            ? "type command (q to quit)..."
                            : "Type a command..."
                      }
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Terminal input"
                    />
                  </div>
                </div>
              )}

              {!inGame && (
                <footer className="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-2.5 text-xs text-(--color-foreground-subtle)">
                  <span className="uppercase tracking-wider">Try</span>
                  {hints.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => run(h)}
                      className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono hover:bg-white/10 transition"
                    >
                      {h}
                    </button>
                  ))}
                  <span className="ml-auto text-(--color-foreground-subtle)">
                    {GAMES.length} games available
                  </span>
                </footer>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
