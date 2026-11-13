import Link from "next/link";
import Image from "next/image";
import { heroImageFor, realMedia, type ImageTheme } from "@/lib/fallback-images";
import { ChevronRight, House } from "lucide-react";
import type { StrapiMedia } from "@/lib/types";
import { StrapiImage } from "./StrapiImage";
import { HeroMotion } from "./HeroMotion";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  subtitle?: string | null;
  eyebrow?: string;
  crumbs?: Crumb[];
  homeHref: string;
  homeLabel: string;
  breadcrumbLabel: string;
  image?: StrapiMedia | null;
  children?: React.ReactNode;
  compact?: boolean;
  /** Theme for the photographic background when there is no CMS image (auto-detected from the title otherwise). */
  theme?: ImageTheme;
  /** Explicit background photo (public path). */
  background?: string;
}

/** Dark banner used at the top of every inner page (the header sits transparently over it). */
export function PageHero({ title, subtitle, eyebrow, crumbs = [], homeHref, homeLabel, breadcrumbLabel, image, children, compact, theme, background }: Props) {
  const media = realMedia(image);
  const bg = background ?? heroImageFor({ seed: title, text: [title, subtitle, eyebrow, ...crumbs.map((c) => c.label)], theme });
  return (
    <section className={cn("relative isolate overflow-hidden bg-ink-950 text-white", compact ? "pt-36 pb-14" : "pt-40 pb-20 md:pt-44 md:pb-24")}>
      <div className="absolute inset-0 -z-20" aria-hidden>
        {media ? (
          <StrapiImage media={media} priority sizes="100vw" className="opacity-45" alt="" />
        ) : (
          <Image src={bg} alt="" fill priority sizes="100vw" quality={75} className="animate-kenburns object-cover opacity-50" />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/35" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/50" aria-hidden />
      <div className="bg-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" aria-hidden />
      <div className="absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
      <div className="container-page relative">
        <HeroMotion>
          <nav aria-label={breadcrumbLabel} className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
              <li>
                <Link href={homeHref} className="inline-flex items-center gap-1 rounded hover:text-white">
                  <House className="h-3.5 w-3.5" aria-hidden />
                  <span>{homeLabel}</span>
                </Link>
              </li>
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-white/30" aria-hidden />
                  {c.href && i < crumbs.length - 1 ? (
                    <Link href={c.href} className="rounded hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current={i === crumbs.length - 1 ? "page" : undefined} className="line-clamp-1 text-white/85">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {eyebrow && <p className="eyebrow mb-4 text-gold-400 dark:text-gold-400">{eyebrow}</p>}
          <h1 className="max-w-4xl text-4xl font-bold text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/75">{subtitle}</p>}
          {children && <div className="mt-8">{children}</div>}
        </HeroMotion>
      </div>
      <div className="flag-stripe absolute inset-x-0 bottom-0 h-1 opacity-90" aria-hidden />
    </section>
  );
}
