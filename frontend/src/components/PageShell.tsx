"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { Portfolio } from "@/lib/types";
import { SECTION_ORDER, type SectionKey } from "@/lib/sections";
import { Header } from "./Header";
import { DotNav } from "./DotNav";
import { Hero } from "./Hero";
import { ExperienceSection } from "./ExperienceSection";
import { WorkflowSection } from "./WorkflowSection";
import { SkillsSection } from "./SkillsSection";
import { AwardsSection } from "./AwardsSection";

type PageCtx = {
  current: SectionKey;
  goTo: (key: SectionKey) => void;
  next: () => void;
  prev: () => void;
};

const PageContext = createContext<PageCtx | null>(null);

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePage must be used inside <PageShell>");
  return ctx;
}

const sectionContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.025, staggerDirection: -1 },
  },
};

const WHEEL_COOLDOWN_MS = 850;

export function PageShell({ portfolio }: { portfolio: Portfolio }) {
  const [current, setCurrent] = useState<SectionKey>("home");
  const lastNavRef = useRef<number>(0);

  const goTo = useCallback((key: SectionKey) => {
    const now = performance.now();
    if (now - lastNavRef.current < 200) return;
    lastNavRef.current = now;
    setCurrent((c) => (c === key ? c : key));
  }, []);

  const step = useCallback((delta: 1 | -1) => {
    const now = performance.now();
    if (now - lastNavRef.current < WHEEL_COOLDOWN_MS) return;
    setCurrent((c) => {
      const i = SECTION_ORDER.indexOf(c);
      const ni = Math.max(0, Math.min(SECTION_ORDER.length - 1, i + delta));
      if (ni === i) return c;
      lastNavRef.current = now;
      return SECTION_ORDER[ni];
    });
  }, []);

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // keyboard navigation — ignore when the user is typing in the terminal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.body.dataset.modalOpen === "true") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo("home");
      } else if (e.key === "End") {
        e.preventDefault();
        goTo("awards");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo]);

  // Intentional: page-switching via wheel / touch swipe has been removed.
  // Scrolling now exclusively scrolls the content of the current section.
  // Section navigation happens via the header, dot-nav, keyboard shortcuts,
  // and the terminal — all explicit gestures.

  const ctxValue = useMemo(() => ({ current, goTo, next, prev }), [current, goTo, next, prev]);

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "home":
        return <Hero hero={portfolio.hero} />;
      case "experience":
        return <ExperienceSection items={portfolio.experience} />;
      case "workflow":
        return <WorkflowSection />;
      case "skills":
        return <SkillsSection categories={portfolio.skills} />;
      case "awards":
        return <AwardsSection items={portfolio.awards} />;
    }
  };

  return (
    <PageContext.Provider value={ctxValue}>
      <Header />
      <DotNav />
      <div className="fixed inset-0 overflow-hidden">
        <AnimatePresence mode="sync" initial={false}>
          <motion.section
            key={current}
            variants={sectionContainer}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex items-stretch justify-center px-3 pt-16 pb-28 sm:px-5 sm:pt-20 sm:pb-36 md:px-8 md:pb-44 lg:px-12 xl:px-16"
          >
            {renderSection(current)}
          </motion.section>
        </AnimatePresence>
      </div>
    </PageContext.Provider>
  );
}
