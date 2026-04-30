import type { Award } from "@/lib/types";
import { FlyIn } from "./FlyIn";
import { DatasheetFrame } from "./DatasheetFrame";

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
            <div className="glass specular relative h-full p-4 sm:p-5 md:p-6">
              <span className="absolute left-3 top-2 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:left-4 sm:top-3 sm:text-[10px]">
                A{String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 mt-4 text-base font-semibold sm:mt-5 sm:text-lg">
                {a.title}
              </h3>
              <p className="text-xs leading-relaxed text-(--color-foreground-muted) sm:text-sm">
                {a.description}
              </p>
            </div>
          </FlyIn>
        ))}
      </div>
    </DatasheetFrame>
  );
}
