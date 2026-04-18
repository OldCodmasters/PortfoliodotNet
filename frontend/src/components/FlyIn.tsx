"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/**
 * Golden-angle based directional variety. By multiplying the child index by
 * 137.5° we get a deterministic but visually "random" spread of enter/exit
 * directions — nothing flies out or in from the same vector as its neighbour.
 */
const GOLDEN_ANGLE = 137.5;
const TRAVEL = 96; // how far elements fly (in px)

function vectorFor(index: number): { dx: number; dy: number } {
  const angleDeg = (index * GOLDEN_ANGLE) % 360;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    dx: Math.cos(rad) * TRAVEL,
    dy: Math.sin(rad) * TRAVEL,
  };
}

const springIn = {
  type: "spring" as const,
  stiffness: 220,
  damping: 26,
  mass: 0.7,
};

const springOut = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.6,
};

type Tag = "div" | "section" | "article" | "li" | "p" | "h1" | "h2" | "h3" | "button";

export function FlyIn({
  index = 0,
  children,
  className,
  as: TagName = "div",
}: {
  index?: number;
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  const { dx, dy } = vectorFor(index);

  const variants: Variants = {
    initial: {
      opacity: 0,
      x: dx,
      y: dy,
      filter: "blur(14px)",
      scale: 0.94,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: springIn,
    },
    exit: {
      opacity: 0,
      x: -dx,
      y: -dy,
      filter: "blur(14px)",
      scale: 0.94,
      transition: springOut,
    },
  };

  const MotionTag = motion[TagName];
  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  );
}
