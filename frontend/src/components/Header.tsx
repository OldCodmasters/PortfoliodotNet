"use client";

import { motion } from "motion/react";
import { usePage } from "./PageShell";
import { SECTION_LABEL, SECTION_ORDER, type SectionKey } from "@/lib/sections";
import { useTheme } from "./ThemeProvider";

const NAV_LINKS: SectionKey[] = ["experience", "workflow", "skills", "awards"];

export function Header() {
  const { goTo, current } = usePage();
  const { theme, toggle } = useTheme();
  const sheetIndex = SECTION_ORDER.indexOf(current) + 1;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-4 py-4 md:px-8">
      {/* Spacer keeps the nav pill horizontally centered while the toggle
          floats on the right. */}
      <span className="hidden h-9 w-9 sm:block" aria-hidden />

      <div className="glass glass-pill specular flex max-w-2xl flex-1 items-center justify-between gap-6 px-6 py-2 sm:flex-initial md:gap-8 md:px-7">
        <button
          type="button"
          onClick={() => goTo("home")}
          className="font-semibold tracking-tight"
        >
          Amin. D
        </button>
        <nav className="hidden gap-5 text-sm sm:flex">
          {NAV_LINKS.map((key) => {
            const active = current === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => goTo(key)}
                className={`relative pb-0.5 transition ${
                  active
                    ? "text-(--color-foreground)"
                    : "text-(--color-foreground-muted) hover:text-(--color-foreground)"
                }`}
              >
                {SECTION_LABEL[key]}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-gradient-to-r from-(--color-accent) via-(--color-accent-2) to-(--color-accent-3)"
                    transition={{ type: "spring", stiffness: 480, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
        {/* Sheet readout — where the camera currently is in the datasheet */}
        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) md:inline">
          Sheet{" "}
          <span className="text-(--color-foreground-muted)">
            {String(sheetIndex).padStart(2, "0")}
          </span>
          /{String(SECTION_ORDER.length).padStart(2, "0")}
        </span>
      </div>

      {/* Theme toggle — sun icon on dark (click to go light), moon on
          light. Sits in the top-right corner, glass pill matching the
          nav. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        className="glass glass-pill specular flex h-9 w-9 shrink-0 items-center justify-center text-(--color-foreground-muted) transition hover:text-(--color-foreground)"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.6" y1="4.6" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.4" y2="19.4" />
      <line x1="4.6" y1="19.4" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.4" y2="4.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
