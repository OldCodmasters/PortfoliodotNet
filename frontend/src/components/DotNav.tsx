"use client";

import { motion } from "motion/react";
import { SECTION_ORDER, SECTION_LABEL } from "@/lib/sections";
import { usePage } from "./PageShell";

export function DotNav() {
  const { current, goTo } = usePage();

  return (
    <nav
      aria-label="Section navigation"
      className="glass fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 px-1.5 py-2.5 md:block"
    >
      <ul className="flex flex-col items-center gap-2.5">
        {SECTION_ORDER.map((id) => {
          const active = current === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => goTo(id)}
                title={SECTION_LABEL[id]}
                className="relative grid h-6 w-6 place-items-center"
                aria-current={active ? "true" : undefined}
              >
                {/* Use semantic colors so the dots flip naturally between
                    dark and light themes without depending on `bg-white`
                    (which would stay white in light mode and disappear
                    against the bright canvas). */}
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    active
                      ? "bg-(--color-foreground)"
                      : "bg-(--color-foreground)/30 hover:bg-(--color-foreground)/60"
                  }`}
                />
                {active && (
                  <motion.span
                    layoutId="dot-active-ring"
                    className="absolute inset-0 rounded-full border border-(--color-foreground)/40"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
