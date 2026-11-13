import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Section } from "@/lib/types";
import { BlocksRenderer } from "./BlocksRenderer";
import { Gallery } from "@/components/media/Gallery";
import { StatsCounter } from "@/components/home/StatsCounter";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { localizeHref, type Locale } from "@/i18n/config";
import { isExternalUrl } from "@/lib/utils";

/** Renders the sections.* dynamic zone used by Sector and Page. */
export function DynamicZone({ sections, locale }: { sections?: Section[] | null; locale: Locale }) {
  if (!sections?.length) return null;
  return (
    <div className="space-y-16">
      {sections.map((section) => (
        <Reveal key={`${section.__component}-${section.id}`}>{renderSection(section, locale)}</Reveal>
      ))}
    </div>
  );
}

function renderSection(section: Section, locale: Locale) {
  switch (section.__component) {
    case "sections.rich-text":
      return <BlocksRenderer content={section.content} />;
    case "sections.image-gallery":
      return section.images?.length ? (
        <figure>
          <Gallery images={section.images} />
          {section.caption && <figcaption className="mt-3 text-center text-sm text-ink-500">{section.caption}</figcaption>}
        </figure>
      ) : null;
    case "sections.card-grid":
      return (
        <div>
          {section.heading && <h2 className="mb-6 text-2xl font-bold sm:text-3xl">{section.heading}</h2>}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(section.cards ?? []).map((card, i) => {
              const href = card.link?.url ? (isExternalUrl(card.link.url) ? card.link.url : localizeHref(card.link.url, locale)) : null;
              const inner = (
                <>
                  {card.image && (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                      <StrapiImage media={card.image} sizes="(min-width:1024px) 33vw, 100vw" fallback={{ seed: `${card.title}-${i}`, text: card.title }} className="transition duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    {card.description && <p className="mt-2 text-ink-500 dark:text-ink-300">{card.description}</p>}
                    {card.link?.label && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
                        {card.link.label}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                      </span>
                    )}
                  </div>
                </>
              );
              return href ? (
                <Link
                  key={card.id ?? i}
                  href={href}
                  target={card.link?.openInNewTab ? "_blank" : undefined}
                  className="card card-hover group block overflow-hidden"
                >
                  {inner}
                </Link>
              ) : (
                <div key={card.id ?? i} className="card group overflow-hidden">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      );
    case "sections.stats-bar":
      return section.stats?.length ? (
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-ink-900 p-8 text-white sm:p-10">
          {section.heading && <h2 className="mb-8 text-2xl font-bold text-white">{section.heading}</h2>}
          <StatsCounter stats={section.stats} variant="dark" />
        </div>
      ) : null;
    case "sections.cta":
      return (
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-8 py-12 text-white sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-70" aria-hidden />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              {section.heading && <h2 className="text-2xl font-bold text-white sm:text-3xl">{section.heading}</h2>}
              {section.text && <p className="mt-3 text-white/75">{section.text}</p>}
            </div>
            {section.button?.url && (
              <ButtonLink
                href={isExternalUrl(section.button.url) ? section.button.url : localizeHref(section.button.url, locale)}
                variant="gold"
                newTab={section.button.openInNewTab ?? undefined}
                size="lg"
              >
                {section.button.label}
              </ButtonLink>
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
}
