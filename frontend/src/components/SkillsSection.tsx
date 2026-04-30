import type { SkillCategory } from "@/lib/types";
import { FlyIn } from "./FlyIn";
import { DatasheetFrame } from "./DatasheetFrame";

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
            <div className="glass specular relative h-full p-4 sm:p-5 md:p-6">
              {/* Mono part-number sits in the top-left corner of every
                  card so the section reads as a parts list rather than a
                  loose grid. */}
              <span className="absolute left-3 top-2 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:left-4 sm:top-3 sm:text-[10px]">
                S{String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 mt-4 text-base font-semibold text-(--color-accent-3) sm:mt-5 sm:text-lg">
                {c.title}
              </h3>
              <p className="text-xs leading-relaxed text-(--color-foreground-muted) sm:text-sm">
                {c.description}
              </p>
            </div>
          </FlyIn>
        ))}
      </div>
    </DatasheetFrame>
  );
}
