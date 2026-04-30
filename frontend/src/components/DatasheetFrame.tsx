"use client";

import type { ReactNode } from "react";
import { FlyIn } from "./FlyIn";

/**
 * The datasheet "shell" used by every non-Hero section. Wraps the content
 * in the same engineering-drawing chrome as the home page:
 *   • top strip  — "Datasheet / <title> / Sheet N/M …… ● Available"
 *   • title block with a mono "Section" label and the section name
 *   • optional subtitle paragraph
 *   • bottom drawing-block footer with sheet number / drawn-by / units
 *
 * The wrapper provides its own scroll container (no-scrollbar + fade-y),
 * so callers should NOT add another scroll wrapper around the content.
 */
export function DatasheetFrame({
  title,
  sheet,
  totalSheets = 5,
  subtitle,
  children,
}: {
  title: string;
  sheet: number;
  totalSheets?: number;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="no-scrollbar fade-y mx-auto flex h-full w-full max-w-[110rem] flex-col overflow-y-auto">
      <div className="m-auto w-full py-2 md:py-0">
        {/* ── Top datasheet header strip ─────────────────────────────── */}
        <FlyIn index={0}>
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:mb-6 sm:pb-3 sm:text-[11px]">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:gap-x-4">
              <span className="text-(--color-foreground-muted)">Datasheet</span>
              <span className="hidden text-white/15 sm:inline">/</span>
              <span className="hidden sm:inline">
                Part{" "}
                <span className="text-(--color-foreground-muted)">
                  № AD-2026
                </span>
              </span>
              <span className="hidden text-white/15 md:inline">/</span>
              <span className="hidden md:inline">
                Sheet{" "}
                <span className="text-(--color-foreground-muted)">
                  {sheet}/{totalSheets}
                </span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-(--color-foreground-muted)">Available</span>
            </div>
          </div>
        </FlyIn>

        {/* ── Title block ──────────────────────────────────────────── */}
        <FlyIn index={1}>
          <div className="mb-4 grid grid-cols-[3rem_1fr] items-baseline gap-3 sm:mb-6 sm:grid-cols-[3.5rem_1fr] sm:gap-4 md:mb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:text-[11px]">
              Section
            </span>
            <h2 className="text-3xl font-semibold leading-[1.05] sm:text-4xl md:text-5xl">
              <span className="accent-gradient-text">{title}</span>
            </h2>
          </div>
        </FlyIn>

        {/* Optional subtitle / overview paragraph */}
        {subtitle && (
          <FlyIn index={2}>
            <div className="mb-4 grid grid-cols-[3rem_1fr] items-baseline gap-3 sm:mb-6 sm:grid-cols-[3.5rem_1fr] sm:gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:text-[11px]">
                Func
              </span>
              <p className="border-l-2 border-(--color-accent-3)/45 pl-3 text-sm leading-relaxed text-(--color-foreground-muted) sm:pl-4 sm:text-base">
                {subtitle}
              </p>
            </div>
          </FlyIn>
        )}

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div>{children}</div>

        {/* ── Bottom drawing-block footer ──────────────────────────── */}
        <FlyIn index={20}>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:mt-8 sm:pt-3 sm:text-[10px]">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-white/20 sm:w-10" />
              <span>
                Sheet{" "}
                <span className="text-(--color-foreground-muted)">
                  {sheet}/{totalSheets}
                </span>
              </span>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span>Drawn</span>
              <span className="text-(--color-foreground-muted)">A. Dehghani</span>
              <span className="text-white/15">/</span>
              <span>Approved</span>
              <span className="text-(--color-foreground-muted)">A. Dehghani</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Units mm</span>
              <span className="h-px w-6 bg-white/20 sm:w-10" />
            </div>
          </div>
        </FlyIn>
      </div>
    </div>
  );
}
