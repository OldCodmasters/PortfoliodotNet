"use client";

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&<>/\\|=+*";

/**
 * DecoderText — machine-readout reveal. The string starts as scrambled
 * glyphs and locks in character by character from the left, like a test
 * rig decoding a part number. SSR and reduced-motion render the final
 * text directly, so there is never layout shift or an unreadable name.
 */
export function DecoderText({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    // Initial state already holds the final text, so reduced-motion users
    // simply never see the scramble start.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    let interval = 0;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        frame += 1;
        // each frame locks in ~0.6 more characters; the rest keep churning
        const locked = Math.floor(frame * 0.6);
        if (locked >= text.length) {
          setDisplay(text);
          window.clearInterval(interval);
          return;
        }
        let out = text.slice(0, locked);
        for (let i = locked; i < text.length; i++) {
          out +=
            text[i] === " "
              ? " "
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(out);
      }, 38);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
