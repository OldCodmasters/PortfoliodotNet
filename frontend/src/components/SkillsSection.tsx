import type { SkillCategory } from "@/lib/types";
import { FlyIn } from "./FlyIn";
import { DatasheetFrame } from "./DatasheetFrame";
import { SpotlightCard } from "./SpotlightCard";

/**
 * Skills — a parts inventory of IC modules. Each category renders as a
 * chip package: pin ticks along the top edge, a mono part number, and a
 * pointer spotlight, so the grid reads like a board populated with
 * capability silicon.
 */
export function SkillsSection({ categories }: { categories: SkillCategory[] }) {
  return (
    <DatasheetFrame
      title="Skills"
      sheet={4}
      subtitle="Stack inventory · cross-domain tooling and protocols"
    >
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {categories.map((c, i) => (
          <FlyIn key={c.title} index={i + 3}>
            <SpotlightCard className="glass specular relative h-full p-4 sm:p-5 md:p-6">
              {/* IC pin row along the top edge */}
              <span aria-hidden className="chip-pins" />
              <span className="absolute left-3 top-2 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:left-4 sm:top-3 sm:text-[10px]">
                S{String(i + 1).padStart(2, "0")}
              </span>
              <span className="absolute right-3 top-2 font-mono text-[9px] uppercase tracking-[0.18em] text-(--color-foreground-subtle)/70 sm:right-4 sm:top-3 sm:text-[10px]">
                QFP-{(i + 1) * 8}
              </span>
              <h3 className="mb-2 mt-4 text-base font-semibold text-(--color-accent-3) sm:mt-5 sm:text-lg">
                {c.title}
              </h3>
              <p className="text-xs leading-relaxed text-(--color-foreground-muted) sm:text-sm">
                {c.description}
              </p>
            </SpotlightCard>
          </FlyIn>
        ))}
      </div>
    </DatasheetFrame>
  );
}
