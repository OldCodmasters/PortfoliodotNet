import type { ExperienceItem } from "@/lib/types";
import { FlyIn } from "./FlyIn";
import { DatasheetFrame } from "./DatasheetFrame";
import { SpotlightCard } from "./SpotlightCard";

/**
 * Experience — an assembly-line timeline. A glowing rail draws itself in
 * on the left; each role is a station on the line with a pulsing node,
 * a part-number tag, and a spotlight card that lights up under the
 * pointer.
 */
export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <DatasheetFrame
      title="Experience"
      sheet={2}
      subtitle="Field history · roles, dates, and shipped work"
    >
      <div className="relative mx-auto max-w-4xl">
        {/* The rail — grows top to bottom once per mount */}
        <span
          aria-hidden
          className="rail-grow absolute bottom-2 left-[0.6875rem] top-2 w-px bg-gradient-to-b from-(--color-accent)/60 via-(--color-accent-2)/40 to-(--color-accent-3)/60 sm:left-[0.8125rem]"
        />

        <ol className="space-y-4 sm:space-y-5">
          {items.map((item, i) => (
            <FlyIn key={`${item.company}-${i}`} index={i + 3} as="li" className="relative pl-9 sm:pl-12">
              {/* Station node */}
              <span
                aria-hidden
                className="node-pulse absolute left-1 top-6 block h-3 w-3 rounded-full border border-(--color-accent)/70 bg-(--color-canvas-elevated) text-(--color-accent) sm:left-1.5 sm:top-7"
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <span className="absolute inset-[3px] rounded-full bg-(--color-accent)" />
              </span>

              <SpotlightCard className="glass specular relative p-4 sm:p-5 md:p-6">
                <span className="absolute right-3 top-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:right-4 sm:top-3 sm:text-[10px]">
                  E{String(i + 1).padStart(2, "0")}
                </span>
                <header className="mb-2 space-y-1 sm:mb-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--color-foreground-subtle) sm:text-xs">
                    {item.dateRange}
                  </p>
                  <h3 className="text-base font-semibold sm:text-lg">{item.role}</h3>
                  <p className="text-xs text-(--color-accent) sm:text-sm">{item.company}</p>
                </header>
                <ul className="space-y-1.5 text-xs leading-relaxed text-(--color-foreground-muted) sm:text-sm">
                  {item.bullets.map((bullet, j) => (
                    <li
                      key={j}
                      className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-(--color-accent)"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </FlyIn>
          ))}
        </ol>
      </div>
    </DatasheetFrame>
  );
}
