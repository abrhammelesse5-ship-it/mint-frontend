import type { Metadata } from "next";
import { Suspense } from "react";
import { Bell, CalendarDays, Paperclip } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Notice } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { ListingCard } from "@/components/cards/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { blocksToText } from "@/components/blocks/BlocksRenderer";

export async function generateMetadata({ params }: PageProps<"/[locale]/notices">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/notices", title: dict.pages.notices.title, description: dict.pages.notices.text });
}

export default async function NoticesPage({ params, searchParams }: PageProps<"/[locale]/notices">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const priority = s.get("priority");
  const notices = await getCollection<Notice>("notices", locale, {
    filters: { ...searchFilter(s.q, ["title"]), ...(priority ? { priority: { $eq: priority } } : {}) },
    sort: ["publishDate:desc", "publishedAt:desc"],
    populate: { attachments: { populate: { file: true } } },
    pagination: { page: s.page, pageSize: 15 },
  });
  const filtered = !!(s.q || priority);
  return (
    <ListShell theme="admin"
      locale={locale}
      dict={dict}
      title={dict.pages.notices.title}
      text={dict.pages.notices.text}
      eyebrow={dict.nav.announcements}
      crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.notices }]}
      pagination={{ page: notices.pagination.page, pageCount: notices.pagination.pageCount, basePath: `/${locale}/notices`, params: s.all }}
    >
      <Suspense>
        <FilterBar
          search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }}
          groups={[{ name: "priority", label: dict.common.status, allLabel: dict.common.all, options: (["urgent", "important", "normal"] as const).map((p) => ({ value: p, label: dict.status[p] })) }]}
          clearLabel={dict.common.clear}
          resultsLabel={filtered ? fill(dict.common.results, { n: notices.pagination.total }) : undefined}
        />
      </Suspense>
      {notices.data.length ? (
        <RevealGroup className="space-y-4">
          {notices.data.map((n) => {
            const files = (n.attachments ?? []).reduce((sum, a) => sum + (a.file?.length ?? 0), 0);
            const expired = !!n.expiryDate && new Date(n.expiryDate).getTime() < new Date().getTime();
            return (
              <RevealItem key={n.documentId}>
                <ListingCard
                  href={`/${locale}/notices/${n.slug}`}
                  title={n.title}
                  excerpt={blocksToText(n.content, 200)}
                  icon={Bell}
                  accent={n.priority === "urgent" ? "red" : n.priority === "important" ? "amber" : "brand"}
                  badges={[
                    ...(n.priority && n.priority !== "normal" ? [{ label: dict.status[n.priority], tone: n.priority === "urgent" ? ("red" as const) : ("amber" as const), dot: true }] : []),
                    ...(expired ? [{ label: dict.status.expired, tone: "gray" as const }] : []),
                  ]}
                  meta={[
                    { icon: CalendarDays, label: formatDate(n.publishDate || n.publishedAt, locale) },
                    ...(files ? [{ icon: Paperclip, label: `${files} ${dict.common.attachments.toLowerCase()}` }] : []),
                  ]}
                  cta={dict.common.readMore}
                />
              </RevealItem>
            );
          })}
        </RevealGroup>
      ) : (
        <EmptyState icon={Bell} title={filtered ? dict.common.noResults : dict.empty.title} text={filtered ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
