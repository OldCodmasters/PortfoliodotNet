"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";

/**
 * SpotlightCard — wraps a card surface with a pointer-tracked radial
 * highlight. Feeds --spot-x / --spot-y / --spot-o to the `.spotlight-card`
 * CSS (globals.css); without a pointer (touch, no-JS) the card simply has
 * no highlight and remains fully usable.
 */
export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--spot-o", "1");
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--spot-o", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`spotlight-card ${className}`}
    >
      {children}
    </div>
  );
}
