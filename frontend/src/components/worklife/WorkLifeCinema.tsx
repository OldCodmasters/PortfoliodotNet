"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Stage, Track, TrackId } from "@/data/workflow/types";
import { STATION_SILHOUETTES } from "./MachineSilhouettes";

/**
 * WorkLifeCinema — the "My Work Life" section as a film.
 *
 * Instead of a grid of boxes, the whole line plays like a presentation:
 * one widescreen projection screen showing the entire line as side-view
 * machine silhouettes on a conveyor, a stage spotlight that glides to
 * the current station, a payload (PCB / build / gear) that rides the
 * belt between machines, and slide text that cuts in like movie titles.
 * Slides auto-advance on a progress bar (PowerPoint style); arrows,
 * clicks on machines, and ←/→ keys override; ⏯ pauses the show.
 */

const SLIDE_MS = 9000;

const TRACK_TINT: Record<TrackId, string> = {
  process: "#5be4d3",
  software: "#7aa2ff",
  hardware: "#c79bff",
};

export function WorkLifeCinema({
  tracks,
  track,
  onTrackChange,
  onExplore,
}: {
  tracks: Track[];
  track: Track;
  onTrackChange: (id: TrackId) => void;
  onExplore: (key: string) => void;
}) {
  const stages = track.stages;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const stage = stages[Math.min(idx, stages.length - 1)];
  const tint = TRACK_TINT[track.id];

  const select = useCallback(
    (i: number) => {
      setIdx(((i % stages.length) + stages.length) % stages.length);
    },
    [stages.length],
  );

  // New reel → start from the first frame.
  const changeTrack = (id: TrackId) => {
    setIdx(0);
    onTrackChange(id);
  };

  // ←/→ scrub the show (unless a stage detail overlay is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.body.dataset.modalOpen === "true") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        select(idx + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        select(idx - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, select]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[110rem] flex-col">
      {/* ── Marquee row: chapters + reel counter ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="mr-1 hidden font-mono text-[9px] uppercase tracking-[0.25em] text-(--color-foreground-subtle) sm:inline">
            Now showing
          </span>
          {tracks.map((t) => {
            const active = t.id === track.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => changeTrack(t.id)}
                className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-300 sm:px-4 sm:py-1.5 sm:text-[11px] ${
                  active
                    ? "border-(--color-border-glass-strong) bg-(--color-foreground)/10 text-(--color-foreground)"
                    : "border-(--color-border-glass) text-(--color-foreground-muted) hover:text-(--color-foreground)"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle)">
          Reel{" "}
          <span className="text-(--color-foreground-muted)">
            {String(idx + 1).padStart(2, "0")}
          </span>
          /{String(stages.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── The screen ───────────────────────────────────────────────── */}
      <div className="cinema-screen flex min-h-0 flex-1 flex-col text-white">
        {/* Slide titles — cut in like a movie title card */}
        <div className="relative z-[1] px-4 pt-6 sm:px-8 sm:pt-8 md:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${track.id}-${stage.key}`}
              initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 0.9, 0.3, 1] }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em] sm:text-[11px]"
                style={{ color: tint }}
              >
                {track.subtitle}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-mono text-3xl font-light text-white/25 sm:text-5xl">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                  {stage.label}
                </h3>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:inline">
                  {stage.desc}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-relaxed text-white/65 sm:line-clamp-3 sm:text-sm">
                {stage.overview}
              </p>
              <button
                type="button"
                onClick={() => onExplore(stage.key)}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/[0.14] sm:text-[11px]"
              >
                Walk into this station
                <span aria-hidden>›</span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The line itself */}
        <div className="relative z-0 mt-auto min-h-0">
          <LineScene
            stages={stages}
            trackId={track.id}
            tint={tint}
            activeIndex={idx}
            onSelect={select}
          />
        </div>

        {/* ── Projector controls ─────────────────────────────────────── */}
        <div className="relative z-[1] flex items-center gap-3 border-t border-white/10 bg-black/30 px-3 py-2.5 sm:gap-4 sm:px-5">
          <button
            type="button"
            onClick={() => select(idx - 1)}
            aria-label="Previous station"
            className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume the show" : "Pause the show"}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-[9px] text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {paused ? "▶" : "❚❚"}
          </button>
          <button
            type="button"
            onClick={() => select(idx + 1)}
            aria-label="Next station"
            className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ›
          </button>

          {/* Segmented slide progress — the active segment fills, then the
              film advances itself. */}
          <div className="flex flex-1 items-center gap-1.5 sm:gap-2">
            {stages.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => select(i)}
                aria-label={`Go to ${s.label}`}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/15"
              >
                {i < idx && <span className="block h-full w-full" style={{ background: tint }} />}
                {i === idx && (
                  <span
                    key={`${track.id}-${idx}`}
                    className="slide-progress block h-full"
                    style={{
                      background: tint,
                      animationDuration: `${SLIDE_MS}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                    onAnimationEnd={() => select(idx + 1)}
                  />
                )}
              </button>
            ))}
          </div>

          <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 sm:inline">
            ← → to scrub
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── the line scene ─────────────────────────────────────────────────── */

const SCENE_W = 1100;
const SCENE_H = 268;
const BELT_Y = 232;
const STATION_W = SCENE_W / 5;

function LineScene({
  stages,
  trackId,
  tint,
  activeIndex,
  onSelect,
}: {
  stages: Stage[];
  trackId: TrackId;
  tint: string;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const cx = (i: number) => i * STATION_W + STATION_W / 2;
  const activeCx = cx(activeIndex);

  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      className="block h-auto w-full"
      role="group"
      aria-label={`${stages.length} stations on the line`}
    >
      <defs>
        <linearGradient id="spot-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="floor-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={tint} stopOpacity="0.3" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Stage spotlight — a rig lamp that glides to the active station */}
      <motion.g
        initial={false}
        animate={{ x: activeCx }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
        aria-hidden
      >
        <polygon points={`-14,6 14,6 120,${BELT_Y} -120,${BELT_Y}`} fill="url(#spot-cone)" />
        <rect x={-12} y={0} width={24} height={9} rx={3} fill="#0a0f1d" stroke="rgba(255,255,255,0.35)" />
        <ellipse cx={0} cy={BELT_Y + 6} rx={120} ry={14} fill="url(#floor-glow)" />
      </motion.g>

      {/* Stations */}
      {stages.map((s, i) => {
        const active = i === activeIndex;
        const Silhouette = STATION_SILHOUETTES[s.key];
        return (
          <g
            key={s.key}
            transform={`translate(${cx(i) - 90}, ${BELT_Y - 150 - 2})`}
            onClick={() => onSelect(i)}
            className="cursor-pointer"
            role="button"
            aria-label={`${s.label} station`}
            tabIndex={-1}
          >
            {/* hit area */}
            <rect x="-10" y="-20" width="200" height="190" fill="transparent" />
            <g
              style={{
                color: active ? tint : "rgba(255,255,255,0.3)",
                opacity: active ? 1 : 0.75,
                transition: "color 500ms ease, opacity 500ms ease",
              }}
            >
              {Silhouette ? <Silhouette /> : null}
            </g>
            {/* station label */}
            <text
              x="90"
              y="178"
              textAnchor="middle"
              fill={active ? "#ffffff" : "rgba(255,255,255,0.4)"}
              style={{ transition: "fill 500ms ease" }}
              fontSize="11"
              letterSpacing="2"
              fontFamily="var(--font-mono)"
            >
              {`0${i + 1} · ${s.label.toUpperCase()}`}
            </text>
          </g>
        );
      })}

      {/* Conveyor — rails, rollers, streaming belt dashes */}
      <g aria-hidden>
        <line x1="0" y1={BELT_Y} x2={SCENE_W} y2={BELT_Y} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        <line x1="0" y1={BELT_Y + 12} x2={SCENE_W} y2={BELT_Y + 12} stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
        <line
          className="belt-dash"
          x1="0"
          y1={BELT_Y + 6}
          x2={SCENE_W}
          y2={BELT_Y + 6}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="3"
        />
        {Array.from({ length: 23 }, (_, i) => (
          <circle
            key={i}
            cx={24 + i * 48}
            cy={BELT_Y + 12}
            r="4"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
          />
        ))}
      </g>

      {/* Payload riding the belt to the active station */}
      <motion.g
        initial={false}
        animate={{ x: activeCx }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
        aria-hidden
      >
        <Payload trackId={trackId} tint={tint} />
      </motion.g>
    </svg>
  );
}

/** What's traveling down the line: a PCB, a build artifact, or a gear. */
function Payload({ trackId, tint }: { trackId: TrackId; tint: string }) {
  if (trackId === "software") {
    return (
      <g transform={`translate(0, ${BELT_Y - 10})`}>
        <polygon
          points="-10,0 -5,-9 5,-9 10,0 5,9 -5,9"
          fill="#0a0f1d"
          stroke={tint}
          strokeWidth="2"
        />
        <circle cx="0" cy="0" r="2.4" fill={tint} />
      </g>
    );
  }
  if (trackId === "hardware") {
    return (
      <g transform={`translate(0, ${BELT_Y - 11})`}>
        <circle cx="0" cy="0" r="8" fill="#0a0f1d" stroke={tint} strokeWidth="2" />
        <circle cx="0" cy="0" r="3" fill="none" stroke={tint} strokeWidth="1.6" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 8}
              y1={Math.sin(a) * 8}
              x2={Math.cos(a) * 11.5}
              y2={Math.sin(a) * 11.5}
              stroke={tint}
              strokeWidth="2"
            />
          );
        })}
      </g>
    );
  }
  // process — a little PCB with pads
  return (
    <g transform={`translate(0, ${BELT_Y - 7})`}>
      <rect x="-17" y="-4" width="34" height="9" rx="1.5" fill="#0a2018" stroke={tint} strokeWidth="2" />
      <circle cx="-9" cy="0.5" r="1.6" fill={tint} />
      <circle cx="0" cy="0.5" r="1.6" fill={tint} />
      <circle cx="9" cy="0.5" r="1.6" fill={tint} />
    </g>
  );
}
