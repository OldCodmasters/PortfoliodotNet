import Image from "next/image";
import type { HeroProfile } from "@/lib/types";
import { apiBase, resumeDownloadUrl } from "@/lib/api";
import { FlyIn } from "./FlyIn";

export function Hero({ hero }: { hero: HeroProfile }) {
  const imageSrc = hero.imageUrl.startsWith("http") ? hero.imageUrl : `${apiBase}${hero.imageUrl}`;

  return (
    <div className="mx-auto grid h-full w-full max-w-6xl gap-10 md:grid-cols-2 md:items-center">
      <div className="space-y-5">
        <FlyIn index={0}>
          <p className="text-sm uppercase tracking-[0.2em] text-(--color-foreground-muted)">
            Portfolio · 2026
          </p>
        </FlyIn>
        <FlyIn index={1}>
          <h1 className="text-5xl font-semibold leading-[1.05] md:text-6xl lg:text-7xl">
            Hi, I&apos;m <span className="accent-gradient-text">{hero.name}</span>
          </h1>
        </FlyIn>
        <FlyIn index={2}>
          <h2 className="text-xl font-medium text-(--color-foreground-muted) md:text-2xl">
            {hero.tagline}
          </h2>
        </FlyIn>
        <div className="space-y-3 text-base leading-relaxed text-(--color-foreground-muted)">
          {hero.bioLines.map((line, i) => (
            <FlyIn key={i} index={3 + i} as="p">
              {line}
            </FlyIn>
          ))}
        </div>
        <FlyIn index={10} className="flex flex-wrap gap-3 pt-2">
          <a href={resumeDownloadUrl} download className="pill-btn">
            Download CV
          </a>
          <a href={hero.linkedInUrl} target="_blank" rel="noreferrer" className="pill-btn">
            LinkedIn
          </a>
        </FlyIn>
      </div>

      <div className="space-y-5">
        <FlyIn index={5}>
          <div className="glass specular relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={imageSrc}
              alt={hero.name}
              fill
              sizes="(min-width: 768px) 40vw, 80vw"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </FlyIn>
        <FlyIn index={8}>
          <div className="glass glass-sm p-5 text-sm leading-relaxed text-(--color-foreground-muted) space-y-1.5">
            {hero.highlights.map((h, i) => (
              <p key={i}>{h}</p>
            ))}
          </div>
        </FlyIn>
      </div>
    </div>
  );
}
