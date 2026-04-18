import type { SkillCategory } from "@/lib/types";
import { FlyIn } from "./FlyIn";

export function SkillsSection({ categories }: { categories: SkillCategory[] }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
      <FlyIn index={0}>
        <h2 className="mb-10 text-4xl font-semibold md:text-5xl">
          <span className="accent-gradient-text">Skills</span>
        </h2>
      </FlyIn>
      <div className="grid gap-5 md:grid-cols-2">
        {categories.map((c, i) => (
          <FlyIn key={c.title} index={i + 1}>
            <div className="glass specular relative h-full p-6">
              <h3 className="mb-2 text-lg font-semibold text-(--color-accent-3)">{c.title}</h3>
              <p className="text-sm leading-relaxed text-(--color-foreground-muted)">
                {c.description}
              </p>
            </div>
          </FlyIn>
        ))}
      </div>
    </div>
  );
}
