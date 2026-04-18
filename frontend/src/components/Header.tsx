"use client";

import { usePage } from "./PageShell";
import { SECTION_LABEL, type SectionKey } from "@/lib/sections";

const NAV_LINKS: SectionKey[] = ["experience", "workflow", "skills", "awards"];

export function Header() {
  const { goTo, current } = usePage();

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 py-4 md:px-8">
      <div className="glass glass-pill specular mx-auto flex max-w-xl items-center justify-between px-5 py-2">
        <button
          type="button"
          onClick={() => goTo("home")}
          className="font-semibold tracking-tight"
        >
          Amin. D
        </button>
        <nav className="hidden gap-5 text-sm sm:flex">
          {NAV_LINKS.map((key) => {
            const active = current === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => goTo(key)}
                className={`transition ${
                  active
                    ? "text-white"
                    : "text-(--color-foreground-muted) hover:text-white"
                }`}
              >
                {SECTION_LABEL[key]}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
