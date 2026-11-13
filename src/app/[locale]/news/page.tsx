import type { Metadata } from "next";
import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { newsCardPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import type { Category, News, Tag } from "@/lib/types";
import { fill } from "@/i18n/t";
import { PageHero } from "@/components/ui/PageHero";
import { FilterBar } from "@/components/ui/FilterBar";
import { NewsCard } from "@/components/cards/NewsCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/news">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/news", title: dict.pages.news.title, description: dict.pages.news.text });
}

const PAGE_SIZE = 12;

export default async function NewsPage({ params, searchParams }: PageProps<"/[locale]/news">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const category = s.get("category");
  const tag = s.get("tag");

  const [news, categories, tags] = await Promise.all([
    getCollection<News>("news-items", locale, {
      filters: {
        ...searchFilter(s.q, ["title", "summary"]),
        ...(category ? { category: { slug: { $eq: category } } } : {}),
        ...(tag ? { tags: { slug: { $eq: tag } } } : {}),
      },
      sort: ["publishDate:desc", "publishedAt:desc"],
      populate: newsCardPopulate,
      pagination: { page: s.page, pageSize: PAGE_SIZE },
    }),
    getCollection<Category>("categories", locale, { filters: { type: { $eq: "news" } }, fields: ["name", "slug"], sort: ["name:asc"], pagination: { pageSize: 50 } }),
    getCollection<Tag>("tags", locale, { fields: ["name", "slug"], sort: ["name:asc"], pagination: { pageSize: 100 } }),
  ]);
  const total = news.pagination.total;
  const filtered = !!(s.q || category || tag);
  const [lead, ...rest] = news.data;
  const showLead = !filtered && s.page === 1 && lead;

  return (
    <>
      <PageHero theme="policy"
        title={dict.pages.news.title}
        subtitle={dict.pages.news.text}
        eyebrow={dict.nav.media}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.media, href: `/${locale}/media` }, { label: dict.nav.news }]}
      />
      <div className="container-page py-14">
        <Suspense>
          <FilterBar
            search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }}
            groups={[
              ...(categories.data.length ? [{ name: "category", label: dict.common.category, allLabel: dict.common.all, options: categories.data.map((c) => ({ value: c.slug, label: c.name })) }] : []),
              ...(tags.data.length ? [{ name: "tag", label: dict.common.tags, allLabel: dict.common.all, variant: "select" as const, options: tags.data.map((t) => ({ value: t.slug, label: t.name })) }] : []),
            ]}
            clearLabel={dict.common.clear}
            resultsLabel={filtered ? (total === 1 ? dict.common.result : fill(dict.common.results, { n: total })) : undefined}
          />
        </Suspense>
        {news.data.length ? (
          <>
            {showLead && (
              <div className="mb-8">
                <NewsCard item={lead} locale={locale} variant="featured" featuredLabel={dict.home.featured} priority />
              </div>
            )}
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(showLead ? rest : news.data).map((n) => (
                <RevealItem key={n.documentId}>
                  <NewsCard item={n} locale={locale} viewsLabel={dict.common.views} />
                </RevealItem>
              ))}
            </RevealGroup>
          </>
        ) : (
          <EmptyState icon={Newspaper} title={filtered ? dict.common.noResults : dict.empty.title} text={filtered ? dict.empty.filtered : dict.empty.text} />
        )}
        <Pagination page={news.pagination.page} pageCount={news.pagination.pageCount} basePath={`/${locale}/news`} params={s.all} labels={{ previous: dict.common.previous, next: dict.common.next, page: dict.common.page }} />
      </div>
    </>
  );
}
