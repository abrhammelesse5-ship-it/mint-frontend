import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarDays, Megaphone, Paperclip } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { PressRelease } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { ListingCard } from "@/components/cards/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { blocksToText } from "@/components/blocks/BlocksRenderer";

export async function generateMetadata({ params }: PageProps<"/[locale]/press-releases">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/press-releases", title: dict.pages.pressReleases.title, description: dict.pages.pressReleases.text });
}

export default async function PressReleasesPage({ params, searchParams }: PageProps<"/[locale]/press-releases">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const items = await getCollection<PressRelease>("press-releases", locale, {
    filters: searchFilter(s.q, ["title"]),
    sort: ["publishDate:desc", "publishedAt:desc"],
    populate: { attachments: { populate: { file: true } } },
    pagination: { page: s.page, pageSize: 15 },
  });
  return (
    <ListShell theme="policy"
      locale={locale}
      dict={dict}
      title={dict.pages.pressReleases.title}
      text={dict.pages.pressReleases.text}
      eyebrow={dict.nav.media}
      crumbs={[{ label: dict.nav.media, href: `/${locale}/media` }, { label: dict.nav.pressReleases }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/press-releases`, params: s.all }}
    >
      <Suspense>
        <FilterBar search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }} clearLabel={dict.common.clear} resultsLabel={s.q ? fill(dict.common.results, { n: items.pagination.total }) : undefined} />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="space-y-4">
          {items.data.map((p) => {
            const files = (p.attachments ?? []).reduce((sum, a) => sum + (a.file?.length ?? 0), 0);
            return (
              <RevealItem key={p.documentId}>
                <ListingCard
                  href={`/${locale}/press-releases/${p.slug}`}
                  title={p.title}
                  excerpt={blocksToText(p.content, 200)}
                  icon={Megaphone}
                  meta={[{ icon: CalendarDays, label: formatDate(p.publishDate || p.publishedAt, locale) }, ...(files ? [{ icon: Paperclip, label: String(files) }] : [])]}
                  cta={dict.common.readMore}
                />
              </RevealItem>
            );
          })}
        </RevealGroup>
      ) : (
        <EmptyState icon={Megaphone} title={s.q ? dict.common.noResults : dict.empty.title} text={s.q ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
