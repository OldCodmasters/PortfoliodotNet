"use client";

import {
  createContext,
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
import { EngineeringScene } from "./EngineeringScene";

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

/**
 * Cinematic "camera move" between sections. Navigating forward, the old
 * section scales up past the lens while the new one rises from depth;
 * navigating backward the move reverses. Children (FlyIn) inherit the
 * stagger from these container variants exactly as before.
 */
const sectionContainer: Variants = {
  initial: (dir: number) => ({
    opacity: 0,
    scale: dir >= 0 ? 0.92 : 1.07,
    y: dir >= 0 ? 28 : -28,
    filter: "blur(14px)",
  }),
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 0.9, 0.3, 1],
      staggerChildren: 0.045,
      delayChildren: 0.05,
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    scale: dir >= 0 ? 1.07 : 0.92,
    y: dir >= 0 ? -28 : 28,
    filter: "blur(14px)",
    transition: {
      duration: 0.45,
      ease: [0.55, 0.05, 0.7, 0.4],
      staggerChildren: 0.025,
      staggerDirection: -1,
    },
  }),
};

const WHEEL_COOLDOWN_MS = 850;

type Nav = { key: SectionKey; dir: 1 | -1 };

export function PageShell({ portfolio }: { portfolio: Portfolio }) {
  // dir: +1 = traveling deeper into the document, -1 = back toward home.
  // Kept beside the key so the camera move always knows its direction.
  const [nav, setNav] = useState<Nav>({ key: "home", dir: 1 });
  const current = nav.key;
  const lastNavRef = useRef<number>(0);

  const goTo = useCallback((key: SectionKey) => {
    const now = performance.now();
    if (now - lastNavRef.current < 200) return;
    lastNavRef.current = now;
    setNav((n) => {
      if (n.key === key) return n;
      return {
        key,
        dir: SECTION_ORDER.indexOf(key) > SECTION_ORDER.indexOf(n.key) ? 1 : -1,
      };
    });
  }, []);

  const step = useCallback((delta: 1 | -1) => {
    const now = performance.now();
    if (now - lastNavRef.current < WHEEL_COOLDOWN_MS) return;
    setNav((n) => {
      const i = SECTION_ORDER.indexOf(n.key);
      const ni = Math.max(0, Math.min(SECTION_ORDER.length - 1, i + delta));
      if (ni === i) return n;
      lastNavRef.current = now;
      return { key: SECTION_ORDER[ni], dir: delta };
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
      <EngineeringScene section={current} />
      <Header />
      <DotNav />
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ perspective: "1400px" }}
      >
        <AnimatePresence mode="sync" initial={false} custom={nav.dir}>
          <motion.section
            key={current}
            custom={nav.dir}
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
