import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, ChevronRight, Layers, UserRound } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug, getCollection } from "@/lib/strapi";
import { documentPopulate, newsCardPopulate, sectionsPopulate, seoPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import type { News, OfficialDocument, Program, Sector } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { BlocksRenderer, blocksToText, hasBlocks } from "@/components/blocks/BlocksRenderer";
import { DynamicZone } from "@/components/blocks/DynamicZone";
import { NewsCard } from "@/components/cards/NewsCard";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { SECTOR_ICONS, sectorIconKey } from "@/components/cards/SectorCard";

const populate = {
  icon: true,
  coverImage: true,
  seo: seoPopulate,
  content: sectionsPopulate,
  parentSector: { fields: ["name", "slug"], populate: { subSectors: { fields: ["name", "slug", "order"], sort: ["order:asc"] } } },
  subSectors: { fields: ["name", "slug", "order", "description"], sort: ["order:asc"], populate: { icon: true } },
  directorates: { fields: ["name", "slug", "order"], sort: ["order:asc"], populate: { head: { fields: ["fullName", "position"] } } },
};

const load = (slug: string, locale: Locale) => getBySlug<Sector>("sectors", slug, locale, { populate });

export async function generateMetadata({ params }: PageProps<"/[locale]/sectors/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  if (!item) return {};
  return buildMetadata({ locale, path: `/sectors/${slug}`, title: item.name, description: blocksToText(item.description, 160), seo: item.seo, image: item.coverImage });
}

export default async function SectorDetail({ params }: PageProps<"/[locale]/sectors/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();

  // Include sub-sectors when listing related content for a parent sector.
  const sectorSlugs = [item.slug, ...(item.subSectors ?? []).map((s) => s.slug)];
  const bySector = { sector: { slug: { $in: sectorSlugs } } };
  const [news, docs, programs] = await Promise.all([
    getCollection<News>("news-items", locale, { filters: bySector, sort: ["publishDate:desc"], populate: newsCardPopulate, pagination: { pageSize: 3 } }),
    getCollection<OfficialDocument>("documents", locale, { filters: bySector, sort: ["publishDate:desc"], populate: documentPopulate, pagination: { pageSize: 4 } }),
    getCollection<Program>("programs", locale, { filters: bySector, sort: ["startDate:desc"], populate: { coverImage: true }, pagination: { pageSize: 4 } }),
  ]);

  const siblings = item.parentSector?.subSectors ?? [];
  const Icon = SECTOR_ICONS[sectorIconKey(item.slug)];
  const crumbs = [
    { label: dict.nav.sectors, href: `/${locale}/sectors` },
    ...(item.parentSector ? [{ label: item.parentSector.name, href: `/${locale}/sectors/${item.parentSector.slug}` }] : []),
    { label: item.name },
  ];
  const hasBody = hasBlocks(item.description) || !!item.content?.length;

  return (
    <>
      <PageHero
        title={item.name}
        subtitle={blocksToText(item.description, 220) || undefined}
        eyebrow={item.parentSector?.name ?? dict.nav.sectors}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={crumbs}
        image={item.coverImage}
      />
      <DetailLayout
        aside={
          <>
            {(item.subSectors?.length || siblings.length) ? (
              <nav aria-label={dict.pages.subSectors} className="card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-ink-100 bg-ink-50/60 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                  <Icon className="h-5 w-5 text-brand-600" aria-hidden />
                  <h2 className="text-base font-bold">{item.parentSector ? item.parentSector.name : dict.pages.subSectors}</h2>
                </div>
                <ul className="p-2">
                  {(item.subSectors?.length ? item.subSectors : siblings).map((s) => {
                    const current = s.slug === item.slug;
                    return (
                      <li key={s.slug}>
                        <Link
                          href={`/${locale}/sectors/${s.slug}`}
                          aria-current={current ? "page" : undefined}
                          className={current ? "flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white" : "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-white/5"}
                        >
                          {s.name}
                          <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}
            {!!item.directorates?.length && (
              <div className="card p-6">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                  <Building2 className="h-5 w-5 text-brand-600" aria-hidden />
                  {dict.pages.directorates}
                </h2>
                <ul className="space-y-3">
                  {item.directorates.map((d) => (
                    <li key={d.documentId} className="rounded-xl bg-ink-50/70 p-3 dark:bg-white/5">
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">{d.name}</p>
                      {d.head && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                          <UserRound className="h-3.5 w-3.5" aria-hidden />
                          {d.head.fullName}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        {hasBody ? (
          <div className="space-y-12">
            <BlocksRenderer content={item.description} />
            <DynamicZone sections={item.content} locale={locale} />
          </div>
        ) : (
          <EmptyState icon={Layers} title={dict.common.contentComingSoon} />
        )}

        {!!item.subSectors?.length && (
          <section className="mt-16" aria-labelledby="subs-h">
            <h2 id="subs-h" className="mb-6 text-2xl font-bold">
              {dict.pages.subSectors}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {item.subSectors.map((s) => (
                <Link key={s.slug} href={`/${locale}/sectors/${s.slug}`} className="card card-hover group flex items-start gap-4 p-5">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand-600 dark:bg-white/5">
                    {s.icon ? <StrapiImage media={s.icon} sizes="44px" className="object-contain p-2" /> : <Layers className="h-5 w-5" aria-hidden />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold group-hover:text-brand-700">{s.name}</span>
                    {blocksToText(s.description, 100) && <span className="mt-1 line-clamp-2 block text-sm text-ink-500">{blocksToText(s.description, 100)}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {programs.data.length > 0 && (
          <section className="mt-16" aria-labelledby="prog-h">
            <h2 id="prog-h" className="mb-6 text-2xl font-bold">
              {dict.pages.sectorPrograms}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {programs.data.map((p) => (
                <Link key={p.documentId} href={`/${locale}/programs/${p.slug}`} className="card card-hover group flex items-center gap-4 p-4">
                  <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                    <StrapiImage media={p.coverImage} sizes="80px" fallback={{ seed: p.slug, text: p.title }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    {p.programStatus && <Badge tone={p.programStatus === "ongoing" ? "green" : p.programStatus === "planned" ? "blue" : "gray"}>{dict.status[p.programStatus]}</Badge>}
                    <span className="mt-1 line-clamp-2 block font-semibold group-hover:text-brand-700">{p.title}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-300" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        )}

        {docs.data.length > 0 && (
          <section className="mt-16" aria-labelledby="docs-h">
            <div className="mb-6 flex items-end justify-between">
              <h2 id="docs-h" className="text-2xl font-bold">
                {dict.pages.sectorDocuments}
              </h2>
              <Link href={`/${locale}/resources?sector=${item.slug}`} className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                {dict.common.viewAll}
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {docs.data.map((d) => (
                <DocumentCard key={d.documentId} doc={d} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        )}
      </DetailLayout>

      {news.data.length > 0 && (
        <section className="bg-ink-50/70 py-16 dark:bg-white/[0.02]" aria-labelledby="sector-news">
          <div className="container-page">
            <h2 id="sector-news" className="mb-8 text-2xl font-bold sm:text-3xl">
              {dict.pages.sectorNews}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.data.map((n) => (
                <NewsCard key={n.documentId} item={n} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
