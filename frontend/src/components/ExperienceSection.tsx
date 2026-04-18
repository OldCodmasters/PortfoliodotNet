import type { ExperienceItem } from "@/lib/types";
import { FlyIn } from "./FlyIn";

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
      <FlyIn index={0}>
        <h2 className="mb-10 text-4xl font-semibold md:text-5xl">
          <span className="accent-gradient-text">Experience</span>
        </h2>
      </FlyIn>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item, i) => (
          <FlyIn key={`${item.company}-${i}`} index={i + 1} as="article">
            <div className="glass specular relative h-full p-6">
              <header className="mb-3 space-y-1">
                <h3 className="text-lg font-semibold">{item.role}</h3>
                <p className="text-sm text-(--color-accent)">{item.company}</p>
                <p className="text-xs uppercase tracking-wider text-(--color-foreground-subtle)">
                  {item.dateRange}
                </p>
              </header>
              <ul className="space-y-1.5 text-sm leading-relaxed text-(--color-foreground-muted)">
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
    </div>
  );
}
