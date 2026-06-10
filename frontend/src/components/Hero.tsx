import type { HeroProfile } from "@/lib/types";
import { apiBase } from "@/lib/api";
import { FlyIn } from "./FlyIn";
import { DecoderText } from "./DecoderText";
import { PortraitViewport } from "./PortraitViewport";

/**
 * Hero — engineering datasheet aesthetic, now with cinematic instruments.
 *
 * The page reads like a technical spec sheet for the person:
 *   • a "datasheet" header strip with part-number / revision metadata and a
 *     pulsing availability LED,
 *   • the name decodes itself like a machine readout (DecoderText),
 *   • a structured spec column with monospaced labels (PART, FUNC, DESC,
 *     S01..Sn) cueing each block of content,
 *   • a portrait "viewport" with auto scan-sweep, drawn-in reticle and
 *     pointer tilt (PortraitViewport),
 *   • a CTA row wired to the CV download and LinkedIn,
 *   • a footer dimension strip echoing an engineering drawing's edge.
 */
export function Hero({ hero }: { hero: HeroProfile }) {
  const imageSrc = hero.imageUrl.startsWith("http")
    ? hero.imageUrl
    : `${apiBase}${hero.imageUrl}`;
  const cvHref = hero.cvUrl.startsWith("http")
    ? hero.cvUrl
    : `${apiBase}${hero.cvUrl}`;

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
            {/* PART · title block — name decodes in like a part number */}
            <FlyIn index={1}>
              <SpecRow label="Part" sub="001">
                <h1 className="text-3xl font-semibold leading-[1.05] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                  Hi, I&apos;m{" "}
                  <DecoderText
                    text={hero.name}
                    delay={350}
                    className="accent-gradient-text"
                  />
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

            {/* INTERFACE · CTA row — the datasheet's "ordering information" */}
            <div className="mt-5 sm:mt-7">
              <SectionLabel>Interface</SectionLabel>
              <FlyIn index={12}>
                <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <a href={cvHref} download className="pill-btn text-sm">
                    <DownloadIcon />
                    Download CV
                  </a>
                  <a
                    href={hero.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn text-sm"
                  >
                    <LinkedInIcon />
                    LinkedIn
                  </a>
                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-(--color-foreground-subtle) sm:inline">
                    I/O ports · 2 active
                  </span>
                </div>
              </FlyIn>
            </div>
          </div>

          {/* Right: portrait viewport */}
          <FlyIn index={5}>
            <PortraitViewport src={imageSrc} name={hero.name} initials={initials} />
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

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
