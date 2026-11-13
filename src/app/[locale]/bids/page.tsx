import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarDays, Gavel } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { BidLink } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { ListingCard } from "@/components/cards/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/bids">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/bids", title: dict.pages.bids.title, description: dict.pages.bids.text });
}

export default async function BidsPage({ params, searchParams }: PageProps<"/[locale]/bids">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const items = await getCollection<BidLink>("bid-links", locale, {
    filters: searchFilter(s.q, ["title"]),
    sort: ["publishDate:desc", "publishedAt:desc"],
    pagination: { page: s.page, pageSize: 20 },
  });
  return (
    <ListShell theme="admin"
      locale={locale}
      dict={dict}
      title={dict.pages.bids.title}
      text={dict.pages.bids.text}
      eyebrow={dict.nav.announcements}
      crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.bids }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/bids`, params: s.all }}
    >
      <Suspense>
        <FilterBar search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }} clearLabel={dict.common.clear} resultsLabel={s.q ? fill(dict.common.results, { n: items.pagination.total }) : undefined} />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="space-y-4">
          {items.data.map((b) => (
            <RevealItem key={b.documentId}>
              <ListingCard
                href={b.externalUrl}
                external
                title={b.title}
                icon={Gavel}
                badges={[{ label: dict.common.external, tone: "gray" }]}
                deadline={b.closingDate}
                meta={[
                  ...(b.publishDate ? [{ icon: CalendarDays, label: `${dict.common.published}: ${formatDate(b.publishDate, locale, "medium")}` }] : []),
                  ...(b.closingDate ? [{ icon: CalendarDays, label: `${dict.common.deadline}: ${formatDate(b.closingDate, locale, "medium")}` }] : []),
                ]}
                cta={dict.pages.viewBid}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <EmptyState icon={Gavel} title={s.q ? dict.common.noResults : dict.empty.title} text={s.q ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
