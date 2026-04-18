import type { Award } from "@/lib/types";
import { FlyIn } from "./FlyIn";

export function AwardsSection({ items }: { items: Award[] }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
      <FlyIn index={0}>
        <h2 className="mb-10 text-4xl font-semibold md:text-5xl">
          <span className="accent-gradient-text">Awards</span>
        </h2>
      </FlyIn>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((a, i) => (
          <FlyIn key={a.title} index={i + 1}>
            <div className="glass specular relative h-full p-6">
              <h3 className="mb-2 text-lg font-semibold">{a.title}</h3>
              <p className="text-sm leading-relaxed text-(--color-foreground-muted)">
                {a.description}
              </p>
            </div>
          </FlyIn>
        ))}
      </div>
    </div>
  );
}
