"use client";

import { motion } from "motion/react";
import { SECTION_ORDER, SECTION_LABEL } from "@/lib/sections";
import { usePage } from "./PageShell";

/**
 * DotNav — a connected instrument rail. The dots sit on a faint vertical
 * line (a measurement scale); the active section gets a shared-element
 * ring and its label slides out to the left of the rail.
 */
export function DotNav() {
  const { current, goTo } = usePage();

  return (
    <nav
      aria-label="Section navigation"
      className="glass fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 px-1.5 py-2.5 md:block"
    >
      <ul className="relative flex flex-col items-center gap-2.5">
        {/* Connecting rail behind the dots */}
        <span
          aria-hidden
          className="absolute bottom-3 top-3 w-px bg-(--color-foreground)/15"
        />
        {SECTION_ORDER.map((id) => {
          const active = current === id;
          return (
            <li key={id} className="relative">
              <button
                type="button"
                onClick={() => goTo(id)}
                title={SECTION_LABEL[id]}
                className="group relative grid h-6 w-6 place-items-center"
                aria-current={active ? "true" : undefined}
              >
                {/* Semantic colors so dots flip naturally between themes. */}
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    active
                      ? "bg-(--color-foreground)"
                      : "bg-(--color-foreground)/30 group-hover:bg-(--color-foreground)/60"
                  }`}
                />
                {active && (
                  <motion.span
                    layoutId="dot-active-ring"
                    className="absolute inset-0 rounded-full border border-(--color-foreground)/40"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                {/* Label flyout — visible on hover, persistent for active */}
                <span
                  className={`pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-(--color-border-glass) bg-(--color-canvas-elevated)/85 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] backdrop-blur-sm transition-all duration-300 ${
                    active
                      ? "translate-x-0 text-(--color-foreground) opacity-90"
                      : "translate-x-1 text-(--color-foreground-muted) opacity-0 group-hover:translate-x-0 group-hover:opacity-90"
                  }`}
                >
                  {SECTION_LABEL[id]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
