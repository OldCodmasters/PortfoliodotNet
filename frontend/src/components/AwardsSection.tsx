import type { Award } from "@/lib/types";
import { FlyIn } from "./FlyIn";
import { DatasheetFrame } from "./DatasheetFrame";
import { SpotlightCard } from "./SpotlightCard";

/**
 * Awards — certified stamps. Each recognition is a sealed certificate:
 * a rosette seal mark, a part-number tag, and an automatic specular
 * shine that sweeps each card on a staggered loop.
 */
export function AwardsSection({ items }: { items: Award[] }) {
  return (
    <DatasheetFrame
      title="Awards"
      sheet={5}
      subtitle="Recognitions · accreditations · honors"
    >
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
        {items.map((a, i) => (
          <FlyIn key={a.title} index={i + 3}>
            <SpotlightCard className="glass specular relative h-full p-4 sm:p-5 md:p-6">
              {/* Automatic shine sweep, staggered per card */}
              <span
                aria-hidden
                className="shine-sweep"
                style={{ animationDelay: `${i * 1.4}s` }}
              />
              <span className="absolute left-3 top-2 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:left-4 sm:top-3 sm:text-[10px]">
                A{String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute right-3 top-3 text-(--color-accent-2)/70 sm:right-4">
                <SealIcon />
              </div>
              <h3 className="mb-2 mt-4 pr-10 text-base font-semibold sm:mt-5 sm:text-lg">
                {a.title}
              </h3>
              <p className="text-xs leading-relaxed text-(--color-foreground-muted) sm:text-sm">
                {a.description}
              </p>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle)/80 sm:text-[10px]">
                Certified · QA passed
              </p>
            </SpotlightCard>
          </FlyIn>
        ))}
      </div>
    </DatasheetFrame>
  );
}

/** Rosette certificate seal — pure line art, inherits currentColor. */
function SealIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      {/* scalloped seal edge */}
      <path d="M12 2.5l1.8 1.4 2.2-.5 1 2 2.2.5-.1 2.3 1.7 1.5-1.2 1.9 1.2 1.9-1.7 1.5.1 2.3-2.2.5-1 2-2.2-.5-1.8 1.4-1.8-1.4-2.2.5-1-2-2.2-.5.1-2.3-1.7-1.5L4.4 12 3.2 10.1l1.7-1.5-.1-2.3 2.2-.5 1-2 2.2.5z" />
      <circle cx="12" cy="11" r="4.2" />
      <path d="M10.3 11.2l1.2 1.2 2.2-2.6" />
    </svg>
  );
}
