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
  "experience",
  "projects",
  "contact",
  "resume",
  "whoami",
  "date",
  "ls",
  "clear",
];

export function Terminal() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([
    {
      kind: "output",
      value: "Welcome. Type 'help' for available commands.",
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [busy, setBusy] = useState(false);

  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
    [],
  );

  const handleKey = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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
    [history, historyIdx, input, run],
  );

  const hints = useMemo(() => HINT_COMMANDS.slice(0, 6), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 md:px-8 md:pb-6">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="glass glass-solid specular relative pointer-events-auto w-full max-w-4xl overflow-hidden"
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="flex-1 text-center text-xs tracking-wider text-(--color-foreground-muted)">
            portfolio ⌁ zsh
          </p>
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
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
            >
              <div
                ref={outputRef}
                className="terminal-scroll max-h-[42vh] min-h-[180px] overflow-y-auto px-5 py-4 font-mono text-[13px] leading-6"
                onClick={() => inputRef.current?.focus()}
              >
                {entries.map((entry, i) => (
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
                ))}

                <div className="flex items-center gap-2">
                  <span className="text-(--color-accent-3)">{PROMPT}</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={busy}
                    className="flex-1 bg-transparent outline-none placeholder:text-white/25"
                    placeholder={busy ? "running..." : "Type a command..."}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Terminal input"
                  />
                </div>
              </div>

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
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
