import type { ExperienceItem } from "@/lib/types";
import { FlyIn } from "./FlyIn";
import { DatasheetFrame } from "./DatasheetFrame";

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <DatasheetFrame
      title="Experience"
      sheet={2}
      subtitle="Field history · roles, dates, and shipped work"
    >
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
        {items.map((item, i) => (
          <FlyIn key={`${item.company}-${i}`} index={i + 3} as="article">
            <div className="glass specular relative h-full p-4 sm:p-5 md:p-6">
              <span className="absolute left-3 top-2 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:left-4 sm:top-3 sm:text-[10px]">
                E{String(i + 1).padStart(2, "0")}
              </span>
              <header className="mb-2 mt-4 space-y-1 sm:mb-3 sm:mt-5">
                <h3 className="text-base font-semibold sm:text-lg">{item.role}</h3>
                <p className="text-xs text-(--color-accent) sm:text-sm">
                  {item.company}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--color-foreground-subtle) sm:text-xs">
                  {item.dateRange}
                </p>
              </header>
              <ul className="space-y-1.5 text-xs leading-relaxed text-(--color-foreground-muted) sm:text-sm">
                {item.bullets.map((bullet, j) => (
                  <li
                    key={j}
                    className="pl-4 relative before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-(--color-accent)"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </FlyIn>
        ))}
      </div>
    </DatasheetFrame>
  );
}
