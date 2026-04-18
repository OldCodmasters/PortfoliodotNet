"use client";

import { motion } from "motion/react";
import { SECTION_ORDER, SECTION_LABEL } from "@/lib/sections";
import { usePage } from "./PageShell";

export function DotNav() {
  const { current, goTo } = usePage();

  return (
    <nav
      aria-label="Section navigation"
      className="glass fixed right-5 top-1/2 z-40 -translate-y-1/2 px-2 py-3 hidden md:block"
    >
      <ul className="flex flex-col items-center gap-3">
        {SECTION_ORDER.map((id) => {
          const active = current === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => goTo(id)}
                title={SECTION_LABEL[id]}
                className="relative grid h-8 w-8 place-items-center"
                aria-current={active ? "true" : undefined}
              >
                <span
                  className={`block h-2 w-2 rounded-full transition-all duration-300 ${
                    active ? "bg-white" : "bg-white/30 hover:bg-white/60"
                  }`}
                />
                {active && (
                  <motion.span
                    layoutId="dot-active-ring"
                    className="absolute inset-0 rounded-full border border-white/40"
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
