import Image from "next/image";
import { Building2 } from "lucide-react";
import type { AffiliatedInstitution } from "@/lib/types";
import { mediaUrl } from "@/lib/media";

/** Infinite logo strip of affiliated institutions (pauses on hover). */
export function LogoMarquee({ items }: { items: AffiliatedInstitution[] }) {
  if (!items.length) return null;
  const loop = items.length < 6 ? [...items, ...items] : items;
  return (
    <div className="mask-fade-x group relative overflow-hidden py-2">
      <ul className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ ["--marquee-duration" as string]: `${Math.max(30, loop.length * 6)}s` }}>
        {[...loop, ...loop].map((inst, i) => {
          const logo = mediaUrl(inst.logo?.url);
          const hidden = i >= loop.length;
          const inner = (
            <>
              <span className="relative flex h-16 w-28 shrink-0 items-center justify-center">
                {logo ? (
                  <Image src={logo} alt="" fill sizes="112px" className="object-contain grayscale transition duration-300 group-hover/logo:grayscale-0" />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-white/5 dark:text-brand-300">
                    <Building2 className="h-7 w-7" aria-hidden />
                  </span>
                )}
              </span>
              <span className="max-w-56 min-w-0">
                {inst.acronym && <span className="block font-display text-lg font-bold text-ink-900 dark:text-white">{inst.acronym}</span>}
                <span className="line-clamp-2 block text-[13px] leading-snug text-ink-500 dark:text-ink-400">{inst.name}</span>
              </span>
            </>
          );
          const cls = "group/logo flex h-24 items-center gap-4 rounded-2xl border border-ink-100 bg-white px-5 shadow-card transition hover:border-brand-200 dark:border-white/10 dark:bg-ink-900";
          return (
            <li key={`${inst.documentId}-${i}`} aria-hidden={hidden || undefined}>
              {inst.websiteUrl ? (
                <a href={inst.websiteUrl} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined} className={cls}>
                  {inner}
                </a>
              ) : (
                <div className={cls}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
