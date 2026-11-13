import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { ctx } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { sectorCardPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import type { Sector } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { SectorCard, sectorIcon } from "@/components/cards/SectorCard";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { NavGlyph } from "@/components/layout/NavIcons";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { blocksToText } from "@/components/blocks/BlocksRenderer";

export async function generateMetadata({ params }: PageProps<"/[locale]/sectors">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/sectors", title: dict.pages.sectors.title, description: dict.pages.sectors.text });
}

export default async function SectorsPage({ params }: PageProps<"/[locale]/sectors">) {
  const { locale, dict } = await ctx(params);
  const sectors = await getCollection<Sector>("sectors", locale, {
    filters: { parentSector: { $null: true } },
    sort: ["order:asc", "name:asc"],
    populate: { ...sectorCardPopulate, subSectors: { fields: ["name", "slug", "order", "description"], sort: ["order:asc"], populate: { coverImage: true } } },
    pagination: { pageSize: 20 },
  });

  return (
    <>
      <PageHero theme="general" title={dict.pages.sectors.title} subtitle={dict.pages.sectors.text} eyebrow={dict.site.name} homeHref={`/${locale}`} homeLabel={dict.nav.home} breadcrumbLabel={dict.common.breadcrumb} crumbs={[{ label: dict.nav.sectors }]} />
      <div className="container-page py-16">
        {sectors.data.length ? (
          <>
            <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sectors.data.map((s) => (
                <RevealItem key={s.documentId}>
                  <SectorCard sector={s} locale={locale} />
                </RevealItem>
              ))}
            </RevealGroup>
            <div className="mt-20 space-y-16">
              {sectors.data
                .filter((s) => s.subSectors?.length)
                .map((s) => {
                  const Icon = sectorIcon(s.slug);
                  return (
                    <section key={s.documentId} aria-labelledby={`sec-${s.slug}`}>
                      <Reveal className="mb-6 flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                          <Icon className="h-6 w-6" aria-hidden />
                        </span>
                        <div>
                          <p className="eyebrow">{dict.pages.subSectors}</p>
                          <h2 id={`sec-${s.slug}`} className="text-2xl font-bold">
                            <Link href={`/${locale}/sectors/${s.slug}`} className="hover:text-brand-700">
                              {s.name}
                            </Link>
                          </h2>
                        </div>
                      </Reveal>
                      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {s.subSectors!.map((c, i) => (
                          <RevealItem key={c.documentId} className="h-full">
                            <Link href={`/${locale}/sectors/${c.slug}`} className="card card-hover group flex h-full flex-col overflow-hidden">
                              <span className="relative block aspect-[16/9] overflow-hidden">
                                <StrapiImage media={c.coverImage} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" fallback={{ seed: c.slug, text: [c.name, s.name], pick: i }} className="transition duration-700 group-hover:scale-105" />
                                <span className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" aria-hidden />
                                <span className="absolute top-4 right-4 font-display text-sm font-bold text-white/90">{String(i + 1).padStart(2, "0")}</span>
                              </span>
                              <span className="relative flex flex-1 flex-col p-6 pt-8">
                              <SubSectorIcon name={c.name} slug={c.slug} />
                              <h3 className="text-lg font-semibold group-hover:text-brand-700">{c.name}</h3>
                              {blocksToText(c.description, 140) && <p className="mt-2 line-clamp-3 text-[15px] text-ink-500 dark:text-ink-300">{blocksToText(c.description, 140)}</p>}
                              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand-700 dark:text-brand-300">
                                {dict.common.learnMore}
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                              </span>
                              </span>
                            </Link>
                          </RevealItem>
                        ))}
                      </RevealGroup>
                    </section>
                  );
                })}
            </div>
          </>
        ) : (
          <EmptyState icon={Layers} title={dict.empty.title} text={dict.empty.text} />
        )}
      </div>
    </>
  );
}

function SubSectorIcon({ name, slug }: { name: string; slug: string }) {
  return (
    <span className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/25 ring-4 ring-white transition group-hover:bg-gold-500 group-hover:text-ink-950 dark:ring-ink-900">
      <NavGlyph link={{ label: name, href: `/sectors/${slug}` }} className="h-6 w-6" />
    </span>
  );
}
