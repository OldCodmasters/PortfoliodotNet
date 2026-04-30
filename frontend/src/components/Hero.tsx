import Image from "next/image";
import type { HeroProfile } from "@/lib/types";
import { apiBase } from "@/lib/api";
import { FlyIn } from "./FlyIn";

/**
 * Hero — engineering datasheet aesthetic.
 *
 * The page reads like a technical spec sheet for the person, rather than a
 * generic photo + bio split:
 *   • A "datasheet" header strip with part-number / revision metadata and a
 *     pulsing availability LED.
 *   • A structured spec column on the left with monospaced labels (PART,
 *     FUNC, DESC, S01..Sn) cueing each block of content, like rows of a
 *     component datasheet.
 *   • A portrait "viewport" on the right framed by registration corner
 *     brackets, a center crosshair reticle, and a faint registration-grid
 *     bleed — duotone-tinted (blue→purple) so the photo reads as a
 *     technical reference image rather than a candid snapshot.
 *   • A footer dimension strip on the bottom with size markers, echoing
 *     the bottom edge of an engineering drawing.
 */
export function Hero({ hero }: { hero: HeroProfile }) {
  const imageSrc = hero.imageUrl.startsWith("http")
    ? hero.imageUrl
    : `${apiBase}${hero.imageUrl}`;

  // Build a part-number-style identifier from the person's initials so the
  // caption under the portrait carries a deterministic "№ XX-001" tag.
  const initials = hero.name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="no-scrollbar fade-y mx-auto flex h-full w-full max-w-[110rem] flex-col overflow-y-auto">
      <div className="m-auto w-full py-2 md:py-0">
        {/* ── Top datasheet header strip ─────────────────────────────── */}
        <FlyIn index={0}>
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:mb-6 sm:pb-3 sm:text-[11px]">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:gap-x-4">
              <span className="text-(--color-foreground-muted)">Datasheet</span>
              <span className="hidden text-white/15 sm:inline">/</span>
              <span className="hidden sm:inline">
                Part <span className="text-(--color-foreground-muted)">№ AD-2026</span>
              </span>
              <span className="hidden text-white/15 md:inline">/</span>
              <span className="hidden md:inline">
                Rev <span className="text-(--color-foreground-muted)">26.04</span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-(--color-foreground-muted)">Available</span>
            </div>
          </div>
        </FlyIn>

        {/* ── Main spec body ────────────────────────────────────────── */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-[1fr_auto] md:gap-10 lg:gap-14">
          {/* Left: structured spec sheet */}
          <div>
            {/* PART · title block */}
            <FlyIn index={1}>
              <SpecRow label="Part" sub="001">
                <h1 className="text-3xl font-semibold leading-[1.05] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                  Hi, I&apos;m{" "}
                  <span className="accent-gradient-text">{hero.name}</span>
                </h1>
              </SpecRow>
            </FlyIn>

            {/* FUNC · tagline */}
            <FlyIn index={2}>
              <div className="mt-4 sm:mt-5">
                <SpecRow label="Func" accent>
                  <h2 className="text-base font-medium text-(--color-foreground-muted) sm:text-lg md:text-xl lg:text-2xl">
                    {hero.tagline}
                  </h2>
                </SpecRow>
              </div>
            </FlyIn>

            {/* DESC · bio paragraphs */}
            <div className="mt-5 sm:mt-7">
              <SectionLabel>Description</SectionLabel>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-(--color-foreground-muted) sm:text-[15px] md:text-base">
                {hero.bioLines.map((line, i) => (
                  <FlyIn key={i} index={3 + i} as="p">
                    {line}
                  </FlyIn>
                ))}
              </div>
            </div>

            {/* SPECS · highlight rows */}
            <div className="mt-5 sm:mt-7">
              <SectionLabel>Specifications</SectionLabel>
              <ul className="mt-2 divide-y divide-white/5 border-y border-white/5">
                {hero.highlights.map((h, i) => (
                  <FlyIn
                    key={i}
                    index={8 + i}
                    as="li"
                    className="grid grid-cols-[3rem_1fr] items-baseline gap-3 py-1.5 sm:grid-cols-[3.5rem_1fr] sm:gap-4 sm:py-2"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:text-[10px]">
                      S{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs leading-relaxed text-(--color-foreground-muted) sm:text-sm">
                      {h}
                    </span>
                  </FlyIn>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: portrait viewport */}
          <FlyIn index={5}>
            <figure className="flex flex-col items-center self-center md:self-center">
              <div className="relative">
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

                {/* Frame box */}
                <div className="relative aspect-[4/5] w-[12rem] sm:w-[14rem] lg:w-[16rem] xl:w-[18rem]">
                  {/* Image — grayscale base, then a screen-blend duotone wash
                      tints highlights blue/purple, then a vignette pushes the
                      edges into the canvas. */}
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={hero.name}
                      fill
                      sizes="(min-width: 1280px) 18rem, (min-width: 1024px) 16rem, 14rem"
                      className="object-cover"
                      style={{
                        filter:
                          "grayscale(1) contrast(1.08) brightness(1.05)",
                      }}
                      priority
                      unoptimized
                    />
                    {/* Duotone accent wash */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(122,162,255,0.45) 0%, rgba(199,155,255,0.32) 50%, rgba(91,228,211,0.18) 100%)",
                        mixBlendMode: "screen",
                      }}
                    />
                    {/* Vignette — fade picture edges toward canvas */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(85% 95% at 50% 45%, transparent 50%, rgba(0,0,0,0.55) 100%)",
                      }}
                    />
                    {/* Faint scan-lines for technical reference vibe */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)",
                      }}
                    />
                  </div>

                  {/* Center reticle */}
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
                      <circle
                        cx="16"
                        cy="16"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="0.75"
                      />
                      <circle cx="16" cy="16" r="1" fill="currentColor" />
                      <line x1="16" y1="0" x2="16" y2="9" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="16" y1="23" x2="16" y2="32" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="0" y1="16" x2="9" y2="16" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="23" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="0.75" />
                    </svg>
                  </div>

                  {/* Corner registration brackets */}
                  <CornerBracket position="tl" />
                  <CornerBracket position="tr" />
                  <CornerBracket position="bl" />
                  <CornerBracket position="br" />

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
                </div>

                {/* Caption — read like a drawing's title block */}
                <figcaption className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-(--color-foreground-subtle) sm:mt-4 sm:text-[10px]">
                  <span>Front view</span>
                  <span className="text-(--color-foreground-muted)">
                    № {initials}-001
                  </span>
                  <span>1:1</span>
                </figcaption>
              </div>
            </figure>
          </FlyIn>
        </div>

        {/* ── Bottom dimension footer ───────────────────────────────── */}
        <FlyIn index={14}>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:mt-8 sm:pt-3 sm:text-[10px]">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-white/20 sm:w-10" />
              <span>Sheet 1/5</span>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span>Drawn</span>
              <span className="text-(--color-foreground-muted)">A. Dehghani</span>
              <span className="text-white/15">/</span>
              <span>Approved</span>
              <span className="text-(--color-foreground-muted)">A. Dehghani</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Units mm</span>
              <span className="h-px w-6 bg-white/20 sm:w-10" />
            </div>
          </div>
        </FlyIn>
      </div>
    </div>
  );
}

/* ─── helpers ────────────────────────────────────────────────────────── */

/**
 * A single titled spec row — `[LABEL] [content]` with a tiny mono label on
 * the left and the actual content on the right. When `accent` is set, the
 * row gains a left border in the brand cyan to mark it as a callout.
 */
function SpecRow({
  label,
  sub,
  accent = false,
  children,
}: {
  label: string;
  sub?: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-[3rem_1fr] items-baseline gap-3 sm:grid-cols-[3.5rem_1fr] sm:gap-4 ${
        accent ? "border-l-2 border-(--color-accent-3)/45 pl-3 sm:pl-4" : ""
      }`}
    >
      <div className="flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:text-[11px]">
          {label}
        </span>
        {sub && (
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/30 sm:text-[10px]">
            {sub}
          </span>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:text-[11px]">
        {children}
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

/**
 * Camera-style corner registration mark drawn just outside the picture
 * frame. Each corner is a small L-shape rotated to the appropriate corner.
 */
function CornerBracket({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
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
        <path
          d="M0 8 L0 0 L8 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}
