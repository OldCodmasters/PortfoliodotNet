"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * PortraitViewport — the hero's "technical reference image" instrument.
 *
 * Cinematic behaviors, all automatic:
 *   • a scan line sweeps the portrait on a loop (CSS, reduced-motion safe),
 *   • the reticle and corner registration brackets draw themselves in,
 *   • the whole frame tilts gently toward the pointer on spring physics
 *     and settles flat when the pointer leaves.
 */
export function PortraitViewport({
  src,
  name,
  initials,
}: {
  src: string;
  name: string;
  initials: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 120, damping: 16, mass: 0.4 });
  const rotateY = useSpring(ry, { stiffness: 120, damping: 16, mass: 0.4 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 8);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <figure className="flex flex-col items-center self-center">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ perspective: "900px" }}
        className="relative"
      >
        {/* Bleed registration grid behind the frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-3 opacity-25 sm:-inset-4"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(245,247,251,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,247,251,0.08) 1px, transparent 1px)",
            backgroundSize: "0.625rem 0.625rem",
            maskImage:
              "radial-gradient(ellipse 75% 75% at 50% 50%, #000 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 75% at 50% 50%, #000 30%, transparent 100%)",
          }}
        />

        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-[4/5] w-[12rem] sm:w-[14rem] lg:w-[16rem] xl:w-[18rem]"
        >
          {/* Image — grayscale base, duotone wash, vignette, scan lines. */}
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={src}
              alt={name}
              fill
              sizes="(min-width: 1280px) 18rem, (min-width: 1024px) 16rem, 14rem"
              className="object-cover"
              style={{ filter: "grayscale(1) contrast(1.08) brightness(1.05)" }}
              priority
              unoptimized
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(122,162,255,0.45) 0%, rgba(199,155,255,0.32) 50%, rgba(91,228,211,0.18) 100%)",
                mixBlendMode: "screen",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(85% 95% at 50% 45%, transparent 50%, rgba(0,0,0,0.55) 100%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)",
              }}
            />
            {/* Automated scan sweep — the machine reading its reference */}
            <div aria-hidden className="scan-line" />
          </div>

          {/* Center reticle — draws itself in */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-(--color-accent-3)"
            >
              <motion.circle
                cx="16"
                cy="16"
                r="7"
                stroke="currentColor"
                strokeWidth="0.75"
                initial={reduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.5, ease: "easeOut" }}
              />
              <circle cx="16" cy="16" r="1" fill="currentColor" />
              {(
                [
                  ["16", "0", "16", "9"],
                  ["16", "23", "16", "32"],
                  ["0", "16", "9", "16"],
                  ["23", "16", "32", "16"],
                ] as const
              ).map(([x1, y1, x2, y2], i) => (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="0.75"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.8 + i * 0.12, ease: "easeOut" }}
                />
              ))}
            </svg>
          </div>

          {/* Corner registration brackets — drawn in sequence */}
          <CornerBracket position="tl" order={0} reduceMotion={reduceMotion} />
          <CornerBracket position="tr" order={1} reduceMotion={reduceMotion} />
          <CornerBracket position="br" order={2} reduceMotion={reduceMotion} />
          <CornerBracket position="bl" order={3} reduceMotion={reduceMotion} />

          {/* Side dimension marks (top + right) */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.25em] text-(--color-foreground-subtle) sm:text-[9px]"
          >
            ◄ 4 ►
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-5 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-[0.25em] text-(--color-foreground-subtle) sm:text-[9px]"
            style={{ writingMode: "vertical-rl" }}
          >
            ◄ 5 ►
          </span>
        </motion.div>

        {/* Caption — reads like a drawing's title block */}
        <figcaption className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-(--color-foreground-subtle) sm:mt-4 sm:text-[10px]">
          <span>Front view</span>
          <span className="text-(--color-foreground-muted)">№ {initials}-001</span>
          <span>1:1</span>
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * Camera-style corner registration mark drawn just outside the picture
 * frame, animating in clockwise from the top-left.
 */
function CornerBracket({
  position,
  order,
  reduceMotion,
}: {
  position: "tl" | "tr" | "bl" | "br";
  order: number;
  reduceMotion: boolean | null;
}) {
  const positionCls = {
    tl: "-left-1.5 -top-1.5",
    tr: "-right-1.5 -top-1.5 rotate-90",
    bl: "-left-1.5 -bottom-1.5 -rotate-90",
    br: "-right-1.5 -bottom-1.5 rotate-180",
  }[position];
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3.5 w-3.5 text-(--color-accent-3) sm:h-4 sm:w-4 ${positionCls}`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 8 L0 0 L8 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 + order * 0.14, ease: "easeOut" }}
        />
      </svg>
    </span>
  );
}
