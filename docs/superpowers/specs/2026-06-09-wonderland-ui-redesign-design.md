# Wonderland of Engineering — cinematic UI redesign

Date: 2026-06-09
Scope: frontend only (`frontend/src`). No backend or API changes.

## Goal

Evolve the existing "engineering datasheet + liquid glass" UI into a cinematic,
self-animating experience: the visitor lands inside a living engineering world
("Wonderland of Engineering"). Everything animates automatically — no
interaction required — while staying readable, fast, accessible, and fully
theme-aware (dark/light).

## What stays

- Paged section model (`PageShell` + `SECTION_ORDER`), terminal, games,
  theme system, dot-nav/keyboard navigation, server-component data flow.
- The datasheet visual vocabulary (mono labels, sheet numbers, title blocks).
- WorkflowSection internals (1.7k lines of content) — it inherits the new
  backdrop, transitions, and card styling but is not rewritten.

## New pieces

### 1. EngineeringScene (client, canvas 2D)
Fixed full-viewport backdrop rendered behind all content:
- Drifting blueprint grid (two parallax layers).
- Procedural PCB trace network: orthogonal/45° copper traces with pads and
  vias; glowing signal pulses continuously travel the traces.
- 2–3 large, faint line-art gears rotating very slowly.
- Pointer parallax (subtle, springs back when idle); auto-drift always on.
- Section-aware accent hue (PageShell passes current section).
- Theme-aware: glowing lines on dark canvas; ink-on-paper on light.
- Performance: dpr capped at 2, rAF paused when `document.hidden`,
  static single frame under `prefers-reduced-motion`.

### 2. Cinematic section transitions (PageShell)
Direction-aware "camera move": navigating forward zooms the old section past
the camera (scale up + blur out) while the new one rises from depth
(scale 0.94 → 1, blur → 0); reversed when navigating backward. FlyIn children
keep their stagger inside the new container variants.

### 3. Hero
- `DecoderText`: name decodes from scrambled glyphs to final text on mount.
- Portrait viewport: automated scan-line sweep loop + subtle pointer tilt
  (spring), reticle and corner brackets draw themselves in (pathLength).
- New CTA row: "Download CV" (uses `hero.cvUrl`) and "LinkedIn"
  (`hero.linkedInUrl`) as pill buttons — data exists but was unused.

### 4. Cards — cursor spotlight + section identities
- `SpotlightCard` (client): tracks pointer, drives a radial highlight +
  border glow via CSS vars; pure CSS fallback when no pointer.
- Experience → vertical timeline: animated rail that draws in, pulsing nodes,
  cards hanging off the rail with role/company/date hierarchy sharpened.
- Skills → "circuit modules": cards with chip-pin header decoration and a
  module index; spotlight glow.
- Awards → "certificate seals": rosette seal icon, stamped border, automatic
  shine sweep across each card.

### 5. Chrome
- Header: animated active-link underline (layoutId) + mono sheet readout
  (`02 / 05`).
- DotNav: connected vertical rail, labels appear on hover/active.
- globals.css: aurora drift keyframes on the body gradients, film-grain
  overlay (SVG noise, ~3% opacity), shine/scan/pulse keyframes, spotlight
  utilities, `prefers-reduced-motion` kill-switch for all decorative motion.

## Error handling / accessibility

- All decorative layers are `aria-hidden` and `pointer-events: none`.
- `prefers-reduced-motion: reduce` → static scene frame, no decoder scramble
  (renders final text), no scan sweep, transitions become simple fades.
- Canvas failures (no 2D context) silently render nothing — page is fully
  usable without the scene.

## Testing

- `npm run lint` and `npm run build` must pass.
- Visual smoke-check of all five sections in dark + light themes via local
  dev server.
