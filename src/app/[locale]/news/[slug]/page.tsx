import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Eye, FolderOpen, Layers, Tag as TagIcon, UserRound } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug, getCollection } from "@/lib/strapi";
import { newsCardPopulate, newsDetailPopulate } from "@/lib/populate";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate, formatNumber } from "@/lib/format";
import type { News } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { MetaCard } from "@/components/detail/MetaCard";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { ViewTracker } from "@/components/detail/ViewTracker";
import { BlocksRenderer, blocksToText } from "@/components/blocks/BlocksRenderer";
import { Gallery } from "@/components/media/Gallery";
import { NewsCard } from "@/components/cards/NewsCard";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { realMedia } from "@/lib/fallback-images";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { Reveal } from "@/components/ui/Reveal";

async function load(slug: string, locale: Parameters<typeof getBySlug>[2]) {
  return getBySlug<News>("news-items", slug, locale, { populate: newsDetailPopulate });
}

export async function generateMetadata({ params }: PageProps<"/[locale]/news/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  if (!item) return {};
  return buildMetadata({
    locale,
    path: `/news/${slug}`,
    title: item.title,
    description: item.summary || blocksToText(item.content, 160),
    seo: item.seo,
    image: item.coverImage,
    type: "article",
    publishedTime: item.publishDate,
  });
}

export default async function NewsDetail({ params }: PageProps<"/[locale]/news/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();

  let related = item.relatedNews ?? [];
  if (related.length < 3) {
    const more = await getCollection<News>("news-items", locale, {
      filters: {
        documentId: { $ne: item.documentId },
        ...(item.category ? { category: { slug: { $eq: item.category.slug } } } : {}),
      },
      sort: ["publishDate:desc"],
      populate: newsCardPopulate,
      pagination: { pageSize: 3 },
    });
    related = [...related, ...more.data.filter((m) => !related.some((r) => r.documentId === m.documentId))].slice(0, 3);
  }
  const date = formatDate(item.publishDate || item.publishedAt, locale);

  return (
    <article>
      <ViewTracker documentId={item.documentId} />
      <PageHero
        title={item.title}
        subtitle={item.summary}
        eyebrow={item.category?.name}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.news, href: `/${locale}/news` }, { label: item.title }]}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold-400" aria-hidden />
            <time dateTime={item.publishDate ?? undefined}>{date}</time>
          </span>
          {item.author && (
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-gold-400" aria-hidden />
              {dict.common.by} {item.author.fullName}
            </span>
          )}
        </div>
      </PageHero>
      <DetailLayout
        aside={
          <>
            <MetaCard
              title={dict.common.keyFacts}
              rows={[
                { icon: CalendarDays, label: dict.common.published, value: date },
                { icon: FolderOpen, label: dict.common.category, value: item.category?.name },
                {
                  icon: Layers,
                  label: dict.common.sector,
                  value: item.sector ? (
                    <Link className="hover:text-brand-700" href={`/${locale}/sectors/${item.sector.slug}`}>
                      {item.sector.name}
                    </Link>
                  ) : null,
                },
                { icon: Eye, label: dict.common.views, value: item.viewCount ? formatNumber(item.viewCount, locale) : null },
              ]}
            />
            {!!item.tags?.length && (
              <div className="card p-6">
                <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                  <TagIcon className="h-4 w-4 text-brand-600" aria-hidden />
                  {dict.common.tags}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/${locale}/news?tag=${t.slug}`} className="inline-block rounded-full bg-ink-50 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-white/5 dark:text-ink-200">
                        #{t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        {realMedia(item.coverImage) && (
          <Reveal className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-card">
            <StrapiImage media={item.coverImage} priority sizes="(min-width:1024px) 800px, 100vw" />
          </Reveal>
        )}
        <BlocksRenderer content={item.content} />
        {!!item.gallery?.length && (
          <section className="mt-12" aria-labelledby="gallery-h">
            <h2 id="gallery-h" className="mb-5 text-2xl font-bold">
              {dict.nav.gallery}
            </h2>
            <Gallery images={item.gallery} />
          </section>
        )}
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/news/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
      {related.length > 0 && (
        <section className="bg-ink-50/70 py-16 dark:bg-white/[0.02]" aria-labelledby="related-h">
          <div className="container-page">
            <h2 id="related-h" className="mb-8 text-2xl font-bold sm:text-3xl">
              {dict.pages.relatedNews}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((n) => (
                <NewsCard key={n.documentId} item={n} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
