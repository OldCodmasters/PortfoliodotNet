import type { ReactElement } from "react";

/**
 * MachineSilhouettes — side-view line-art stations for the Work-Life
 * cinema. Every silhouette is drawn in a local 180×160 box whose floor
 * (conveyor top) sits at y=150, so LineScene can place them shoulder to
 * shoulder on the same belt. Stroke inherits currentColor; LineScene
 * decides whether a station is lit (active) or resting in the dark.
 *
 * Process track reads as a real SMT/PCBA line, software as a software
 * factory, hardware as a maintenance bay — same belt, three movies.
 */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DOT = { fill: "currentColor", stroke: "none" };

/* ── Process track ──────────────────────────────────────────────────── */

/** Warehouse — racking with kitted boxes and a pallet truck. */
function Warehouse(): ReactElement {
  return (
    <g {...S}>
      {/* rack uprights + shelves */}
      <path d="M30 150 V40 M120 150 V40 M30 40 H120" />
      <path d="M30 78 H120 M30 114 H120" />
      {/* boxes */}
      <rect x="40" y="56" width="26" height="22" />
      <rect x="74" y="50" width="30" height="28" />
      <rect x="38" y="92" width="32" height="22" />
      <rect x="80" y="98" width="24" height="16" />
      <path d="M53 56 V78 M89 50 V78" opacity="0.6" />
      {/* pallet truck */}
      <path d="M138 150 V118 L150 112" />
      <rect x="132" y="138" width="34" height="6" rx="2" />
      <circle cx="139" cy="148" r="3" {...DOT} />
      <circle cx="160" cy="148" r="3" {...DOT} />
    </g>
  );
}

/** SMT — enclosed mounter: porthole, feeder bank, HMI, signal tower. */
function Smt(): ReactElement {
  return (
    <g {...S}>
      {/* machine body with sloped hood */}
      <path d="M22 150 V72 L40 54 H140 V150" />
      {/* porthole window */}
      <circle cx="84" cy="100" r="22" />
      <path d="M68 92 q 16 -12 32 0" opacity="0.5" />
      {/* HMI panel */}
      <rect x="116" y="70" width="18" height="14" rx="2" />
      <path d="M120 76 H130" opacity="0.7" />
      {/* feeder bank — slanted reels */}
      <path d="M22 132 L8 142 M22 120 L6 128 M22 108 L8 114" />
      <circle cx="6" cy="143" r="3.5" />
      <circle cx="4" cy="129" r="3.5" />
      <circle cx="6" cy="115" r="3.5" />
      {/* signal tower */}
      <path d="M126 54 V36" />
      <rect x="121" y="20" width="10" height="16" rx="2" />
      <circle className="beacon" cx="126" cy="25" r="2.6" {...DOT} />
    </g>
  );
}

/** PTH — wave-solder tunnel: slanted conveyor, waves, exhaust stack. */
function Pth(): ReactElement {
  return (
    <g {...S}>
      {/* tunnel body */}
      <path d="M14 150 V92 H166 V150" />
      <path d="M14 92 L30 76 H150 L166 92" />
      {/* exhaust stack */}
      <path d="M82 76 V52 H102 V76" />
      <path d="M86 46 q 6 -6 12 0" opacity="0.5" />
      {/* window slot with solder waves */}
      <rect x="36" y="108" width="108" height="26" rx="3" />
      <path d="M44 128 Q 54 116 64 128 T 84 128" />
      <path d="M96 128 Q 106 114 116 128 T 136 128" />
      {/* slanted conveyor in/out */}
      <path d="M2 142 L36 124 M144 124 L178 142" opacity="0.7" />
    </g>
  );
}

/** ICT — test cell: cabinet, scope arm, hood pressing a board on nails. */
function Ict(): ReactElement {
  return (
    <g {...S}>
      {/* cabinet */}
      <rect x="28" y="96" width="124" height="54" rx="3" />
      {/* bed of nails + board */}
      <path d="M52 122 V112 M68 122 V108 M84 122 V112 M100 122 V108 M116 122 V112 M130 122 V108" opacity="0.8" />
      <rect x="44" y="102" width="94" height="7" rx="1" />
      {/* press hood */}
      <path d="M44 96 V78 H138 V96" />
      <path d="M88 78 V62" />
      {/* monitor arm + waveform */}
      <path d="M152 96 H164 V58 H118 V70" />
      <rect x="118" y="38" width="46" height="22" rx="2" />
      <path d="M124 50 l 8 -7 6 10 7 -9 6 6 7 -4" opacity="0.85" />
      <circle className="beacon" cx="36" cy="104" r="2.4" {...DOT} />
    </g>
  );
}

/** Coat — selective-coating booth: glass cell, gantry nozzle, mist. */
function Coat(): ReactElement {
  return (
    <g {...S}>
      {/* booth glass */}
      <rect x="26" y="44" width="128" height="106" rx="4" />
      <path d="M26 64 H154" opacity="0.5" />
      {/* gantry rail + carriage + nozzle */}
      <path d="M38 76 H142" />
      <rect x="80" y="70" width="18" height="12" rx="2" />
      <path d="M89 82 V94 L84 102 H94 L89 94" />
      {/* spray cone + droplets */}
      <path d="M89 102 L70 132 M89 102 L108 132" opacity="0.6" strokeDasharray="3 4" />
      <circle cx="80" cy="124" r="1.6" {...DOT} opacity="0.7" />
      <circle cx="92" cy="118" r="1.6" {...DOT} opacity="0.7" />
      <circle cx="98" cy="127" r="1.6" {...DOT} opacity="0.7" />
      {/* board */}
      <rect x="58" y="136" width="62" height="7" rx="1" />
    </g>
  );
}

/* ── Software track ─────────────────────────────────────────────────── */

/** Requirements — easel with a boxes-and-arrows system diagram. */
function Requirements(): ReactElement {
  return (
    <g {...S}>
      {/* easel */}
      <rect x="34" y="38" width="112" height="78" rx="3" />
      <path d="M70 116 L52 150 M110 116 L128 150 M90 116 V134" />
      {/* diagram: boxes and arrows */}
      <rect x="46" y="50" width="26" height="16" rx="2" />
      <rect x="108" y="50" width="26" height="16" rx="2" />
      <rect x="77" y="88" width="26" height="16" rx="2" />
      <path d="M72 58 H108 M59 66 Q 59 96 77 96 M121 66 Q 121 96 103 96" opacity="0.8" />
      <circle cx="90" cy="58" r="1.8" {...DOT} />
    </g>
  );
}

/** Develop — workstation: code on screen, keyboard, coffee. */
function Develop(): ReactElement {
  return (
    <g {...S}>
      {/* desk */}
      <path d="M20 150 V128 H160 V150" />
      {/* monitor */}
      <rect x="48" y="52" width="84" height="58" rx="3" />
      <path d="M90 110 V120 M74 120 H106" />
      {/* code lines */}
      <path d="M58 66 l8 7 -8 7" />
      <path d="M72 80 H96" opacity="0.7" />
      <path d="M58 92 H80 M86 92 H112" opacity="0.5" />
      <path d="M104 66 H122" opacity="0.7" />
      {/* keyboard + mug */}
      <rect x="60" y="132" width="52" height="9" rx="2" />
      <path d="M132 132 v 10 h 12 v -10 Z M144 134 q 8 2 0 7" />
      <path d="M136 126 q 2 -4 0 -7 M140 126 q 2 -4 0 -7" opacity="0.5" />
    </g>
  );
}

/** Data — database cylinders on a rack with a query beam. */
function Data(): ReactElement {
  return (
    <g {...S}>
      {/* rack base */}
      <rect x="40" y="128" width="100" height="22" rx="2" />
      <circle cx="52" cy="139" r="2" {...DOT} />
      <path d="M62 139 H94" opacity="0.5" />
      {/* stacked cylinders */}
      <ellipse cx="90" cy="48" rx="38" ry="10" />
      <path d="M52 48 V112 M128 48 V112" />
      <ellipse cx="90" cy="112" rx="38" ry="10" />
      <path d="M52 70 q 38 16 76 0 M52 92 q 38 16 76 0" opacity="0.6" />
      {/* query in/out */}
      <path d="M140 60 h 24 M158 54 l 6 6 -6 6" opacity="0.8" />
      <path d="M40 100 h -24 M22 94 l -6 6 6 6" opacity="0.8" />
    </g>
  );
}

/** Deploy — crane lowering a container onto the belt, cloud above. */
function Deploy(): ReactElement {
  return (
    <g {...S}>
      {/* crane mast + jib */}
      <path d="M30 150 V30 H132" />
      <path d="M30 54 L72 30 M30 84 L56 60" opacity="0.6" />
      {/* hook + cable */}
      <path d="M118 30 V64" />
      <path d="M112 64 H124" />
      {/* container */}
      <rect x="92" y="68" width="52" height="30" rx="2" />
      <path d="M102 68 V98 M112 68 V98 M122 68 V98 M132 68 V98" opacity="0.55" />
      {/* cloud destination */}
      <path d="M140 36 q 4 -10 14 -8 q 4 -8 13 -4 q 9 -2 9 8 q 8 4 0 10 h -32 q -8 -2 -4 -6 Z" opacity="0.8" />
      <circle className="beacon" cx="118" cy="26" r="2.6" {...DOT} />
    </g>
  );
}

/** Monitor — NOC wall: graph trending up, status LEDs, alert bell. */
function Monitor(): ReactElement {
  return (
    <g {...S}>
      {/* wall screen */}
      <rect x="30" y="40" width="120" height="74" rx="3" />
      <path d="M90 114 V128 M64 128 H116" />
      <path d="M64 150 H116" opacity="0.5" />
      {/* graph */}
      <path d="M40 100 l 22 -14 16 8 20 -22 14 6 16 -16" />
      <path d="M40 56 V104 H144" opacity="0.4" />
      {/* status LEDs */}
      <circle cx="124" cy="52" r="2.4" {...DOT} />
      <circle cx="134" cy="52" r="2.4" {...DOT} opacity="0.55" />
      <circle className="beacon" cx="144" cy="52" r="2.4" {...DOT} />
      {/* bell */}
      <path d="M158 80 q 0 -10 8 -10 q 8 0 8 10 l 3 8 h -22 Z" />
      <path d="M163 92 q 3 4 6 0" />
    </g>
  );
}

/* ── Hardware track ─────────────────────────────────────────────────── */

/** Triage — open machine, inspection lamp/magnifier, fault flag. */
function Triage(): ReactElement {
  return (
    <g {...S}>
      {/* patient machine with open panel */}
      <rect x="24" y="70" width="92" height="80" rx="3" />
      <path d="M24 96 H116" opacity="0.5" />
      {/* open panel door */}
      <path d="M116 80 L150 64 V118 L116 102" opacity="0.8" />
      {/* internals exposed */}
      <path d="M38 112 H66 M38 126 H58" opacity="0.6" />
      <circle cx="86" cy="120" r="9" opacity="0.8" />
      {/* magnifier on arm */}
      <path d="M138 150 V128 L120 110" />
      <circle cx="110" cy="100" r="13" />
      <path d="M119 109 L126 116" />
      {/* fault */}
      <path d="M58 44 l 10 18 h -20 Z" />
      <path d="M58 50 v 6 M58 59 v 0.5" />
    </g>
  );
}

/** Repair — robot arm with wrench over the opened machine. */
function Repair(): ReactElement {
  return (
    <g {...S}>
      {/* machine under repair */}
      <rect x="20" y="92" width="96" height="58" rx="3" />
      <path d="M34 108 H70 M34 122 H58" opacity="0.6" />
      {/* removed panel leaning on the side */}
      <path d="M126 150 L156 134 L160 150 Z" opacity="0.7" />
      {/* articulated arm */}
      <path d="M150 150 V112 L122 84 L94 70" />
      <circle cx="150" cy="112" r="4" />
      <circle cx="122" cy="84" r="4" />
      {/* wrench head */}
      <path d="M94 70 l -12 -6 m 12 6 l -4 -13" />
      <path d="M78 51 a 8 8 0 1 0 -6 14" />
      {/* sparks */}
      <path d="M64 84 l -6 -4 M70 92 l -8 0" opacity="0.6" />
    </g>
  );
}

/** Preventive — PM cart: clock, checklist, grease gun. */
function Preventive(): ReactElement {
  return (
    <g {...S}>
      {/* cart */}
      <rect x="36" y="104" width="108" height="34" rx="3" />
      <path d="M48 138 V146 M132 138 V146" />
      <circle cx="48" cy="148" r="3" {...DOT} />
      <circle cx="132" cy="148" r="3" {...DOT} />
      {/* wall clock */}
      <circle cx="64" cy="62" r="20" />
      <path d="M64 50 V62 L74 68" />
      {/* checklist */}
      <rect x="98" y="44" width="36" height="46" rx="3" />
      <path d="M104 56 l 4 4 7 -8 M104 72 l 4 4 7 -8" />
      <path d="M118 58 H128 M118 74 H128" opacity="0.6" />
      {/* grease gun on cart */}
      <path d="M52 104 V94 H84 V104" />
      <path d="M84 97 H96 L102 92" />
    </g>
  );
}

/** Verify — oscilloscope bench probing a DUT. */
function Verify(): ReactElement {
  return (
    <g {...S}>
      {/* bench */}
      <path d="M20 150 V132 H160 V150" />
      {/* scope */}
      <rect x="40" y="64" width="76" height="54" rx="3" />
      <path d="M40 118 H116" opacity="0.4" />
      {/* screen + sine */}
      <rect x="48" y="72" width="44" height="32" rx="2" />
      <path d="M52 88 q 5 -12 10 0 t 10 0 t 10 0 t 10 0" />
      {/* knobs */}
      <circle cx="102" cy="78" r="3.4" />
      <circle cx="102" cy="92" r="3.4" />
      {/* probe to DUT */}
      <path d="M116 100 q 24 4 24 22" />
      <path d="M136 118 l 4 8" />
      <rect x="128" y="124" width="26" height="8" rx="1" />
      <circle className="beacon" cx="56" cy="112" r="2.2" {...DOT} />
    </g>
  );
}

/** Document — records cabinet, report sheet, escalation arrow. */
function Document(): ReactElement {
  return (
    <g {...S}>
      {/* cabinet with open drawer */}
      <rect x="28" y="56" width="74" height="94" rx="3" />
      <path d="M28 88 H102 M28 120 H102" opacity="0.6" />
      <path d="M58 72 H72 M58 104 H72" />
      {/* open drawer + files */}
      <path d="M102 124 H134 V148 H102" />
      <path d="M108 124 V116 M118 124 V112 M128 124 V118" opacity="0.8" />
      {/* report sheet */}
      <rect x="116" y="48" width="36" height="46" rx="2" />
      <path d="M122 60 H146 M122 70 H146 M122 80 H138" opacity="0.6" />
      {/* escalation arrow */}
      <path d="M160 92 V60 M154 68 l 6 -8 6 8" />
    </g>
  );
}

/* ── Registry ───────────────────────────────────────────────────────── */

export const STATION_SILHOUETTES: Record<string, () => ReactElement> = {
  // process
  warehouse: Warehouse,
  smt: Smt,
  pth: Pth,
  ict: Ict,
  coat: Coat,
  // software
  requirements: Requirements,
  develop: Develop,
  data: Data,
  deploy: Deploy,
  monitor: Monitor,
  // hardware
  triage: Triage,
  repair: Repair,
  preventive: Preventive,
  verify: Verify,
  document: Document,
};
