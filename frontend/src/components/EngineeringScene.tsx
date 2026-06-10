"use client";

import { useEffect, useRef } from "react";
import type { SectionKey } from "@/lib/sections";

/**
 * EngineeringScene — the "Wonderland of Engineering" living backdrop.
 *
 * A fixed full-viewport canvas rendered behind every section:
 *   • two parallax blueprint-grid layers that drift forever,
 *   • a procedural PCB trace network (45°-bend copper runs ending in pads
 *     and annular vias) with glowing signal pulses traveling the traces,
 *   • large, faint line-art gears rotating at clock-hand speed,
 *   • pointer parallax (springs back when the pointer leaves),
 *   • per-section accent hue that cross-fades on navigation,
 *   • dark = glowing lines on deep space, light = ink on paper.
 *
 * All of it is decorative: aria-hidden, pointer-events:none, dpr capped at
 * 2, rAF paused while the tab is hidden, and a single static frame under
 * prefers-reduced-motion.
 */

type RGB = [number, number, number];

const SECTION_ACCENT: Record<SectionKey, RGB> = {
  home: [122, 162, 255], // blueprint blue
  experience: [199, 155, 255], // violet
  workflow: [91, 228, 211], // teal
  skills: [111, 211, 255], // cyan
  awards: [255, 210, 122], // gold
};

const LIGHT_ACCENT: Record<SectionKey, RGB> = {
  home: [47, 79, 181],
  experience: [124, 58, 237],
  workflow: [12, 138, 120],
  skills: [11, 116, 173],
  awards: [176, 124, 15],
};

type Pt = { x: number; y: number };

type Trace = {
  points: Pt[];
  length: number;
  /** cumulative length at the start of each segment */
  cum: number[];
  depth: number; // parallax multiplier 0.6..1.6
};

type Pulse = {
  trace: number;
  pos: number; // distance traveled along the trace
  speed: number; // px / s
  size: number;
};

type Gear = {
  x: number; // as fraction of width
  y: number; // as fraction of height
  radius: number;
  teeth: number;
  speed: number; // rad / s (tiny)
  phase: number;
  depth: number;
};

/** Mulberry32 — tiny seeded PRNG so the network is stable across re-renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Walk a PCB-style trace: straight runs joined by ±45° turns. */
function buildTrace(rand: () => number, w: number, h: number, depth: number): Trace {
  const points: Pt[] = [];
  let x = rand() * w;
  let y = rand() * h;
  // start direction: one of the 8 compass directions
  let dir = Math.floor(rand() * 8) * (Math.PI / 4);
  points.push({ x, y });
  const segments = 3 + Math.floor(rand() * 4);
  for (let s = 0; s < segments; s++) {
    const len = 60 + rand() * 180;
    x += Math.cos(dir) * len;
    y += Math.sin(dir) * len;
    points.push({ x, y });
    dir += (rand() < 0.5 ? -1 : 1) * (Math.PI / 4);
  }
  const cum: number[] = [0];
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    cum.push(length);
  }
  return { points, length, cum, depth };
}

function pointAt(trace: Trace, dist: number): Pt {
  const { points, cum } = trace;
  for (let i = 1; i < points.length; i++) {
    if (dist <= cum[i]) {
      const t = (dist - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      };
    }
  }
  return points[points.length - 1];
}

function gearPath(ctx: CanvasRenderingContext2D, g: Gear, rot: number, cx: number, cy: number) {
  const { radius, teeth } = g;
  const inner = radius * 0.82;
  const toothDepth = radius * 0.12;
  ctx.beginPath();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = rot + (i / steps) * Math.PI * 2;
    // square-ish teeth: alternate between outer and inner radius in blocks
    const phase = i % 4;
    const r = phase === 0 || phase === 1 ? radius + toothDepth : inner + toothDepth;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  // hub + spokes
  ctx.moveTo(cx + radius * 0.32, cy);
  ctx.arc(cx, cy, radius * 0.32, 0, Math.PI * 2);
  for (let s = 0; s < 5; s++) {
    const a = rot * 0.7 + (s / 5) * Math.PI * 2;
    ctx.moveTo(cx + Math.cos(a) * radius * 0.34, cy + Math.sin(a) * radius * 0.34);
    ctx.lineTo(cx + Math.cos(a) * inner * 0.92, cy + Math.sin(a) * inner * 0.92);
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function EngineeringScene({ section }: { section: SectionKey }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<SectionKey>(section);

  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let running = false;
    let w = 0;
    let h = 0;
    let dpr = 1;

    let traces: Trace[] = [];
    let pulses: Pulse[] = [];
    let gears: Gear[] = [];

    // pointer parallax — target follows the pointer, actual eases toward it
    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    // accent cross-fade
    let accent: RGB = [...SECTION_ACCENT[sectionRef.current]] as RGB;

    let isLight = document.documentElement.getAttribute("data-theme") === "light";
    const themeObserver = new MutationObserver(() => {
      isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (reduceMotion.matches) drawFrame(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    function rebuild() {
      const rand = mulberry32(0xad2026);
      const count = Math.max(10, Math.min(26, Math.round((w * h) / 90000)));
      traces = [];
      for (let i = 0; i < count; i++) {
        traces.push(buildTrace(rand, w, h, 0.6 + rand()));
      }
      pulses = [];
      const pulseCount = Math.min(22, Math.round(count * 1.2));
      for (let i = 0; i < pulseCount; i++) {
        const trace = Math.floor(rand() * traces.length);
        pulses.push({
          trace,
          pos: rand() * traces[trace].length,
          speed: 40 + rand() * 90,
          size: 1.2 + rand() * 1.6,
        });
      }
      gears = [
        { x: 0.88, y: 0.2, radius: Math.min(w, h) * 0.16, teeth: 14, speed: 0.05, phase: 0, depth: 1.4 },
        { x: 0.07, y: 0.78, radius: Math.min(w, h) * 0.22, teeth: 18, speed: -0.035, phase: 1.3, depth: 0.8 },
        { x: 0.55, y: 1.02, radius: Math.min(w, h) * 0.12, teeth: 10, speed: 0.07, phase: 2.1, depth: 1.1 },
      ];
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      rebuild();
      if (reduceMotion.matches) drawFrame(performance.now());
    }

    function drawGrid(time: number, px: number, py: number) {
      const ink = isLight ? "10, 13, 20" : "148, 170, 220";
      // far layer
      const farStep = 88;
      const drift = (time * 0.004) % farStep;
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = `rgba(${ink}, ${isLight ? 0.05 : 0.05})`;
      ctx!.beginPath();
      for (let x = -farStep + ((drift + px * 0.4) % farStep); x < w + farStep; x += farStep) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
      }
      for (let y = -farStep + ((drift * 0.6 + py * 0.4) % farStep); y < h + farStep; y += farStep) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
      }
      ctx!.stroke();
      // near layer — finer, slightly stronger, more parallax
      const nearStep = 22;
      const drift2 = (time * 0.009) % nearStep;
      ctx!.strokeStyle = `rgba(${ink}, ${isLight ? 0.035 : 0.03})`;
      ctx!.beginPath();
      for (let x = -nearStep + ((drift2 + px) % nearStep); x < w + nearStep; x += nearStep) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
      }
      for (let y = -nearStep + ((drift2 * 0.6 + py) % nearStep); y < h + nearStep; y += nearStep) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
      }
      ctx!.stroke();
    }

    function drawFrame(time: number) {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);

      // ease accent toward the active section's hue
      const goal = (isLight ? LIGHT_ACCENT : SECTION_ACCENT)[sectionRef.current];
      accent = [
        lerp(accent[0], goal[0], 0.04),
        lerp(accent[1], goal[1], 0.04),
        lerp(accent[2], goal[2], 0.04),
      ];
      const [ar, ag, ab] = accent.map(Math.round);

      // ease parallax
      eased.x = lerp(eased.x, target.x, 0.05);
      eased.y = lerp(eased.y, target.y, 0.05);

      drawGrid(time, eased.x * 8, eased.y * 8);

      // gears — engineering clockwork, almost subliminal
      ctx!.lineWidth = 1;
      for (const g of gears) {
        const cx = g.x * w + eased.x * 14 * g.depth;
        const cy = g.y * h + eased.y * 14 * g.depth;
        const rot = g.phase + time * 0.001 * g.speed * Math.PI * 2;
        ctx!.strokeStyle = isLight
          ? `rgba(10, 13, 20, 0.055)`
          : `rgba(${ar}, ${ag}, ${ab}, 0.07)`;
        gearPath(ctx!, g, rot, cx, cy);
        ctx!.stroke();
      }

      // traces + pads
      for (const t of traces) {
        const ox = eased.x * 20 * t.depth;
        const oy = eased.y * 20 * t.depth;
        ctx!.strokeStyle = isLight
          ? `rgba(10, 13, 20, 0.07)`
          : `rgba(${ar}, ${ag}, ${ab}, 0.1)`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(t.points[0].x + ox, t.points[0].y + oy);
        for (let i = 1; i < t.points.length; i++) {
          ctx!.lineTo(t.points[i].x + ox, t.points[i].y + oy);
        }
        ctx!.stroke();
        // via at the start (annular ring), pad at the end (filled square)
        const a = t.points[0];
        const b = t.points[t.points.length - 1];
        ctx!.beginPath();
        ctx!.arc(a.x + ox, a.y + oy, 3, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.fillStyle = isLight
          ? `rgba(10, 13, 20, 0.09)`
          : `rgba(${ar}, ${ag}, ${ab}, 0.14)`;
        ctx!.fillRect(b.x + ox - 2.5, b.y + oy - 2.5, 5, 5);
      }

      // signal pulses — the "electricity" of the wonderland
      if (!reduceMotion.matches) {
        for (const p of pulses) {
          const t = traces[p.trace];
          if (!t) continue;
          p.pos += p.speed * (1 / 60);
          if (p.pos > t.length) p.pos = 0;
          const pt = pointAt(t, p.pos);
          const ox = eased.x * 20 * t.depth;
          const oy = eased.y * 20 * t.depth;
          const x = pt.x + ox;
          const y = pt.y + oy;
          const glow = ctx!.createRadialGradient(x, y, 0, x, y, p.size * 7);
          const core = isLight ? 0.5 : 0.85;
          glow.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, ${core})`);
          glow.addColorStop(1, `rgba(${ar}, ${ag}, ${ab}, 0)`);
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(x, y, p.size * 7, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function loop(time: number) {
      drawFrame(time);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion.matches) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onPointerMove = (e: PointerEvent) => {
      target.x = (e.clientX / w) * 2 - 1;
      target.y = (e.clientY / h) * 2 - 1;
    };
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMotionPref = () => {
      stop();
      if (reduceMotion.matches) drawFrame(performance.now());
      else start();
    };

    resize();
    if (reduceMotion.matches) drawFrame(performance.now());
    else start();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", onMotionPref);

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionPref);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="aurora-blob aurora-a" />
      <div className="aurora-blob aurora-b" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="grain" />
    </div>
  );
}
