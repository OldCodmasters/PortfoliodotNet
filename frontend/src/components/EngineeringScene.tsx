"use client";

import { useEffect, useRef } from "react";
import type { SectionKey } from "@/lib/sections";

/**
 * EngineeringScene — the "Wonderland of Engineering" living backdrop.
 *
 * The whole viewport is one big printed circuit board:
 *   • IC packages with real pin rows, pin-1 dots and silkscreen
 *     designators (U1, U2…), plus scattered resistors and capacitors,
 *   • copper traces routed out of actual chip pins with 45° bends,
 *     ending in annular vias,
 *   • signal pulses (the electrons) racing the traces with binary data
 *     streams trailing behind them,
 *   • two faint clockwork gears for the mechanical half of the world,
 *   • pointer interactivity: components within reach of the cursor glow
 *     brighter, and clicking anywhere injects a burst of data packets,
 *   • per-section accent hue, dark/light aware, parallax on pointer.
 *
 * A center "safe zone" mask erases the board behind the page content so
 * the artwork can stay bold at the edges without ever fighting the text.
 * Decorative only: aria-hidden, pointer-events:none, dpr capped at 2,
 * rAF paused on hidden tabs, static frame under prefers-reduced-motion.
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
  cum: number[]; // cumulative length at the start of each segment
  mid: Pt; // cached midpoint for pointer-proximity checks
  depth: number; // parallax multiplier
  fromPin: boolean; // pin-routed traces skip the start via
};

type Packet = {
  trace: number;
  pos: number; // distance traveled along the trace
  speed: number; // px / s
  size: number;
  bits: string; // the data riding behind the electron
  ttl: number; // seconds to live; Infinity for the standing streams
};

type Pin = { x: number; y: number; tx: number; ty: number };

type Chip = {
  x: number;
  y: number;
  w: number;
  h: number;
  pins: Pin[];
  designator: string;
  label: string;
};

type Part = {
  x: number;
  y: number;
  kind: "res" | "cap";
  vertical: boolean;
  designator: string;
};

type Gear = {
  x: number;
  y: number;
  radius: number;
  teeth: number;
  speed: number;
  phase: number;
  depth: number;
};

/** Mulberry32 — tiny seeded PRNG so the board is stable across re-renders. */
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

function finishTrace(points: Pt[], depth: number, fromPin: boolean): Trace {
  const cum: number[] = [0];
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    cum.push(length);
  }
  let mid = points[0];
  for (let i = 1; i < points.length; i++) {
    if (cum[i] >= length / 2) {
      mid = points[i];
      break;
    }
  }
  return { points, length, cum, mid, depth, fromPin };
}

/** Walk a PCB-style run: straight segments joined by ±45° turns. */
function walkFrom(
  rand: () => number,
  start: Pt,
  startAngle: number,
  depth: number,
  fromPin: boolean,
): Trace {
  const points: Pt[] = [start];
  let { x, y } = start;
  let dir = startAngle;
  const segments = 2 + Math.floor(rand() * 3);
  for (let s = 0; s < segments; s++) {
    const len = s === 0 ? 26 + rand() * 70 : 50 + rand() * 150;
    x += Math.cos(dir) * len;
    y += Math.sin(dir) * len;
    points.push({ x, y });
    dir += (rand() < 0.5 ? -1 : 1) * (Math.PI / 4);
  }
  return finishTrace(points, depth, fromPin);
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

function randomBits(rand: () => number): string {
  const n = 5 + Math.floor(rand() * 4);
  let s = "";
  for (let i = 0; i < n; i++) s += rand() < 0.5 ? "0" : "1";
  return s;
}

function gearPath(ctx: CanvasRenderingContext2D, g: Gear, rot: number, cx: number, cy: number) {
  const { radius, teeth } = g;
  const inner = radius * 0.82;
  const toothDepth = radius * 0.12;
  ctx.beginPath();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = rot + (i / steps) * Math.PI * 2;
    const phase = i % 4;
    const r = phase === 0 || phase === 1 ? radius + toothDepth : inner + toothDepth;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
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

const CHIP_LABELS = ["FAB-5", "AD-2026", "SMT-01", "NET10", "PCBA-X", "QA-610"];

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

    let chips: Chip[] = [];
    let parts: Part[] = [];
    let traces: Trace[] = [];
    let packets: Packet[] = [];
    let gears: Gear[] = [];

    // pointer state — normalized for parallax, raw px for proximity glow
    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const mouse = { x: -9999, y: -9999 };

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

    /** How much extra brightness an element near the cursor receives. */
    function proximity(x: number, y: number): number {
      const d = Math.hypot(x - mouse.x, y - mouse.y);
      return Math.max(0, 1 - d / 280);
    }

    function buildChip(rand: () => number, idx: number): Chip {
      const cw = 64 + rand() * 76;
      const ch = 46 + rand() * 60;
      const x = 40 + rand() * Math.max(1, w - cw - 80);
      const y = 40 + rand() * Math.max(1, h - ch - 80);
      const pins: Pin[] = [];
      const pitch = 12;
      const stub = 7;
      for (let px = x + 10; px < x + cw - 8; px += pitch) {
        pins.push({ x: px, y, tx: px, ty: y - stub });
        pins.push({ x: px, y: y + ch, tx: px, ty: y + ch + stub });
      }
      for (let py = y + 10; py < y + ch - 8; py += pitch) {
        pins.push({ x, y: py, tx: x - stub, ty: py });
        pins.push({ x: x + cw, y: py, tx: x + cw + stub, ty: py });
      }
      return {
        x,
        y,
        w: cw,
        h: ch,
        pins,
        designator: `U${idx + 1}`,
        label: CHIP_LABELS[idx % CHIP_LABELS.length],
      };
    }

    function rebuild() {
      const rand = mulberry32(0xad2026);
      const area = w * h;

      // chips — the big silicon
      chips = [];
      const chipCount = Math.max(2, Math.min(5, Math.round(area / 420000)));
      for (let i = 0; i < chipCount; i++) {
        let chip = buildChip(rand, i);
        // a few retries to avoid stacking chips on top of each other
        for (let attempt = 0; attempt < 8; attempt++) {
          const collides = chips.some(
            (c) =>
              chip.x < c.x + c.w + 50 &&
              chip.x + chip.w + 50 > c.x &&
              chip.y < c.y + c.h + 50 &&
              chip.y + chip.h + 50 > c.y,
          );
          if (!collides) break;
          chip = buildChip(rand, i);
        }
        chips.push(chip);
      }

      // traces — most routed out of real chip pins, a few free runs
      traces = [];
      for (const chip of chips) {
        for (const pin of chip.pins) {
          if (rand() > 0.3) continue;
          const angle = Math.atan2(pin.ty - pin.y, pin.tx - pin.x);
          traces.push(
            walkFrom(rand, { x: pin.tx, y: pin.ty }, angle, 0.7 + rand() * 0.7, true),
          );
        }
      }
      const freeCount = Math.max(4, Math.min(10, Math.round(area / 220000)));
      for (let i = 0; i < freeCount; i++) {
        const start = { x: rand() * w, y: rand() * h };
        const angle = Math.floor(rand() * 8) * (Math.PI / 4);
        traces.push(walkFrom(rand, start, angle, 0.6 + rand(), false));
      }

      // small passives sprinkled between the silicon
      parts = [];
      const partCount = Math.max(8, Math.min(20, Math.round(area / 90000)));
      let rIdx = 1;
      let cIdx = 1;
      for (let i = 0; i < partCount; i++) {
        const kind = rand() < 0.5 ? "res" : "cap";
        parts.push({
          x: 24 + rand() * (w - 48),
          y: 24 + rand() * (h - 48),
          kind,
          vertical: rand() < 0.5,
          designator: kind === "res" ? `R${rIdx++}` : `C${cIdx++}`,
        });
      }

      // data packets — electrons with their bit streams
      packets = [];
      const packetCount = Math.min(26, Math.max(10, Math.round(traces.length * 0.55)));
      for (let i = 0; i < packetCount; i++) {
        const trace = Math.floor(rand() * traces.length);
        packets.push({
          trace,
          pos: rand() * traces[trace].length,
          speed: 36 + rand() * 80,
          size: 1.1 + rand() * 1.4,
          bits: randomBits(rand),
          ttl: Infinity,
        });
      }

      gears = [
        { x: 0.9, y: 0.16, radius: Math.min(w, h) * 0.15, teeth: 14, speed: 0.05, phase: 0, depth: 1.4 },
        { x: 0.06, y: 0.82, radius: Math.min(w, h) * 0.2, teeth: 18, speed: -0.035, phase: 1.3, depth: 0.8 },
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
      const farStep = 88;
      const drift = (time * 0.004) % farStep;
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = `rgba(${ink}, 0.05)`;
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

    function drawChips(ar: number, ag: number, ab: number) {
      const ox = eased.x * 16;
      const oy = eased.y * 16;
      ctx!.font = "9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      for (const chip of chips) {
        const boost = proximity(chip.x + chip.w / 2, chip.y + chip.h / 2);
        const lineA = (isLight ? 0.16 : 0.2) * (1 + boost * 1.3);
        const fillA = (isLight ? 0.045 : 0.05) * (1 + boost * 1.6);
        const stroke = isLight
          ? `rgba(10, 13, 20, ${lineA})`
          : `rgba(${ar}, ${ag}, ${ab}, ${lineA})`;
        ctx!.strokeStyle = stroke;
        ctx!.fillStyle = isLight
          ? `rgba(10, 13, 20, ${fillA})`
          : `rgba(${ar}, ${ag}, ${ab}, ${fillA})`;
        ctx!.lineWidth = 1.4;

        const x = chip.x + ox;
        const y = chip.y + oy;
        ctx!.beginPath();
        ctx!.roundRect(x, y, chip.w, chip.h, 4);
        ctx!.fill();
        ctx!.stroke();

        // pins
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        for (const pin of chip.pins) {
          ctx!.moveTo(pin.x + ox, pin.y + oy);
          ctx!.lineTo(pin.tx + ox, pin.ty + oy);
        }
        ctx!.stroke();

        // pin-1 dot
        ctx!.beginPath();
        ctx!.arc(x + 9, y + 9, 2.2, 0, Math.PI * 2);
        ctx!.fillStyle = stroke;
        ctx!.fill();

        // silkscreen
        const textA = (isLight ? 0.34 : 0.32) * (1 + boost * 1.1);
        ctx!.fillStyle = isLight
          ? `rgba(10, 13, 20, ${textA})`
          : `rgba(${ar}, ${ag}, ${ab}, ${textA})`;
        ctx!.textAlign = "left";
        ctx!.fillText(chip.designator, x, y - 11);
        ctx!.textAlign = "center";
        ctx!.fillText(chip.label, x + chip.w / 2, y + chip.h / 2 + 3);
      }
    }

    function drawParts(ar: number, ag: number, ab: number) {
      const ox = eased.x * 22;
      const oy = eased.y * 22;
      ctx!.font = "8px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx!.textAlign = "left";
      for (const p of parts) {
        const boost = proximity(p.x, p.y);
        const a = (isLight ? 0.14 : 0.16) * (1 + boost * 1.4);
        const col = isLight
          ? `rgba(10, 13, 20, ${a})`
          : `rgba(${ar}, ${ag}, ${ab}, ${a})`;
        ctx!.strokeStyle = col;
        ctx!.lineWidth = 1.2;
        const x = p.x + ox;
        const y = p.y + oy;
        ctx!.beginPath();
        if (p.kind === "res") {
          if (p.vertical) {
            ctx!.moveTo(x, y - 11);
            ctx!.lineTo(x, y - 6);
            ctx!.rect(x - 3, y - 6, 6, 12);
            ctx!.moveTo(x, y + 6);
            ctx!.lineTo(x, y + 11);
          } else {
            ctx!.moveTo(x - 11, y);
            ctx!.lineTo(x - 6, y);
            ctx!.rect(x - 6, y - 3, 12, 6);
            ctx!.moveTo(x + 6, y);
            ctx!.lineTo(x + 11, y);
          }
        } else {
          // capacitor — two plates with leads
          if (p.vertical) {
            ctx!.moveTo(x, y - 10);
            ctx!.lineTo(x, y - 2.5);
            ctx!.moveTo(x - 5, y - 2.5);
            ctx!.lineTo(x + 5, y - 2.5);
            ctx!.moveTo(x - 5, y + 2.5);
            ctx!.lineTo(x + 5, y + 2.5);
            ctx!.moveTo(x, y + 2.5);
            ctx!.lineTo(x, y + 10);
          } else {
            ctx!.moveTo(x - 10, y);
            ctx!.lineTo(x - 2.5, y);
            ctx!.moveTo(x - 2.5, y - 5);
            ctx!.lineTo(x - 2.5, y + 5);
            ctx!.moveTo(x + 2.5, y - 5);
            ctx!.lineTo(x + 2.5, y + 5);
            ctx!.moveTo(x + 2.5, y);
            ctx!.lineTo(x + 10, y);
          }
        }
        ctx!.stroke();
        const ta = (isLight ? 0.26 : 0.24) * (1 + boost);
        ctx!.fillStyle = isLight
          ? `rgba(10, 13, 20, ${ta})`
          : `rgba(${ar}, ${ag}, ${ab}, ${ta})`;
        ctx!.fillText(p.designator, x + 8, y - 8);
      }
    }

    function drawTraces(ar: number, ag: number, ab: number) {
      for (const t of traces) {
        const ox = eased.x * 20 * t.depth;
        const oy = eased.y * 20 * t.depth;
        const boost = proximity(t.mid.x, t.mid.y);
        const a = (isLight ? 0.11 : 0.15) * (1 + boost * 1.5);
        ctx!.strokeStyle = isLight
          ? `rgba(10, 13, 20, ${a})`
          : `rgba(${ar}, ${ag}, ${ab}, ${a})`;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.moveTo(t.points[0].x + ox, t.points[0].y + oy);
        for (let i = 1; i < t.points.length; i++) {
          ctx!.lineTo(t.points[i].x + ox, t.points[i].y + oy);
        }
        ctx!.stroke();
        // start via for free runs, end via for everything
        const end = t.points[t.points.length - 1];
        ctx!.beginPath();
        ctx!.arc(end.x + ox, end.y + oy, 3.2, 0, Math.PI * 2);
        ctx!.stroke();
        if (!t.fromPin) {
          const s = t.points[0];
          ctx!.beginPath();
          ctx!.arc(s.x + ox, s.y + oy, 2.2, 0, Math.PI * 2);
          ctx!.stroke();
        }
      }
    }

    function drawPackets(dtSec: number, ar: number, ag: number, ab: number) {
      ctx!.font = "8px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx!.textAlign = "center";
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        const t = traces[p.trace];
        if (!t) continue;
        p.pos += p.speed * dtSec;
        if (p.pos > t.length + p.bits.length * 9) {
          if (p.ttl === Infinity) {
            p.pos = 0;
            continue;
          }
          packets.splice(i, 1);
          continue;
        }
        if (p.ttl !== Infinity) {
          p.ttl -= dtSec;
          if (p.ttl <= 0) {
            packets.splice(i, 1);
            continue;
          }
        }
        const fade = p.ttl === Infinity ? 1 : Math.min(1, p.ttl / 0.8);
        const ox = eased.x * 20 * t.depth;
        const oy = eased.y * 20 * t.depth;

        // electron head
        const headPos = Math.min(p.pos, t.length);
        const head = pointAt(t, headPos);
        const hx = head.x + ox;
        const hy = head.y + oy;
        const core = (isLight ? 0.55 : 0.9) * fade;
        const glow = ctx!.createRadialGradient(hx, hy, 0, hx, hy, p.size * 6.5);
        glow.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, ${core})`);
        glow.addColorStop(1, `rgba(${ar}, ${ag}, ${ab}, 0)`);
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(hx, hy, p.size * 6.5, 0, Math.PI * 2);
        ctx!.fill();

        // the binary stream riding behind it
        for (let b = 0; b < p.bits.length; b++) {
          const d = p.pos - 11 - b * 9;
          if (d < 0 || d > t.length) continue;
          const bp = pointAt(t, d);
          const a = (isLight ? 0.5 : 0.6) * (1 - b / p.bits.length) * fade;
          ctx!.fillStyle = isLight
            ? `rgba(${ar}, ${ag}, ${ab}, ${a})`
            : `rgba(${ar}, ${ag}, ${ab}, ${a})`;
          ctx!.fillText(p.bits[b], bp.x + ox, bp.y + oy + 2.5);
        }
      }
    }

    /** Erase the board behind the page content so text always wins. */
    function maskContentZone() {
      ctx!.globalCompositeOperation = "destination-out";
      const g = ctx!.createRadialGradient(
        w / 2,
        h * 0.46,
        0,
        w / 2,
        h * 0.46,
        Math.max(w, h) * 0.44,
      );
      g.addColorStop(0, "rgba(0, 0, 0, 0.66)");
      g.addColorStop(0.6, "rgba(0, 0, 0, 0.3)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "source-over";
    }

    let lastTime = 0;

    function drawFrame(time: number) {
      const dtSec = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);

      const goal = (isLight ? LIGHT_ACCENT : SECTION_ACCENT)[sectionRef.current];
      accent = [
        lerp(accent[0], goal[0], 0.04),
        lerp(accent[1], goal[1], 0.04),
        lerp(accent[2], goal[2], 0.04),
      ];
      const [ar, ag, ab] = accent.map(Math.round);

      eased.x = lerp(eased.x, target.x, 0.05);
      eased.y = lerp(eased.y, target.y, 0.05);

      drawGrid(time, eased.x * 8, eased.y * 8);

      ctx!.lineWidth = 1;
      for (const g of gears) {
        const cx = g.x * w + eased.x * 14 * g.depth;
        const cy = g.y * h + eased.y * 14 * g.depth;
        const rot = g.phase + time * 0.001 * g.speed * Math.PI * 2;
        ctx!.strokeStyle = isLight
          ? `rgba(10, 13, 20, 0.05)`
          : `rgba(${ar}, ${ag}, ${ab}, 0.06)`;
        gearPath(ctx!, g, rot, cx, cy);
        ctx!.stroke();
      }

      drawTraces(ar, ag, ab);
      drawParts(ar, ag, ab);
      drawChips(ar, ag, ab);
      if (!reduceMotion.matches) {
        drawPackets(dtSec, ar, ag, ab);
      }

      maskContentZone();
    }

    function loop(time: number) {
      drawFrame(time);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion.matches) return;
      running = true;
      lastTime = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onPointerMove = (e: PointerEvent) => {
      target.x = (e.clientX / w) * 2 - 1;
      target.y = (e.clientY / h) * 2 - 1;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    // Clicking anywhere injects a burst of data packets on the traces
    // closest to the cursor — the board reacts to being touched.
    const onPointerDown = (e: PointerEvent) => {
      if (reduceMotion.matches || traces.length === 0) return;
      const burstRand = mulberry32((e.clientX * 31 + e.clientY * 17) >>> 0);
      const nearest = traces
        .map((t, i) => ({ i, d: Math.hypot(t.mid.x - e.clientX, t.mid.y - e.clientY) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 4);
      for (const { i } of nearest) {
        packets.push({
          trace: i,
          pos: 0,
          speed: 130 + burstRand() * 120,
          size: 1.4 + burstRand() * 1.2,
          bits: randomBits(burstRand),
          ttl: 4,
        });
      }
      // keep the population bounded no matter how excited the visitor gets
      if (packets.length > 60) packets.splice(0, packets.length - 60);
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
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", onMotionPref);

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
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
