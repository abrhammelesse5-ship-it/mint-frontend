import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarDays, Layers, Lightbulb } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { ConceptNoteCall } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { ListingCard } from "@/components/cards/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { blocksToText } from "@/components/blocks/BlocksRenderer";

export async function generateMetadata({ params }: PageProps<"/[locale]/concept-notes">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/concept-notes", title: dict.pages.conceptNotes.title, description: dict.pages.conceptNotes.text });
}

export default async function ConceptNotesPage({ params, searchParams }: PageProps<"/[locale]/concept-notes">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const status = s.get("status");
  const items = await getCollection<ConceptNoteCall>("concept-note-calls", locale, {
    filters: { ...searchFilter(s.q, ["title"]), ...(status ? { callStatus: { $eq: status } } : {}) },
    sort: ["callStatus:desc", "closingDate:asc"],
    populate: { sector: { fields: ["name", "slug"] } },
    pagination: { page: s.page, pageSize: 15 },
  });
  const filtered = !!(s.q || status);
  return (
    <ListShell theme="innovation"
      locale={locale}
      dict={dict}
      title={dict.pages.conceptNotes.title}
      text={dict.pages.conceptNotes.text}
      eyebrow={dict.nav.announcements}
      crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.conceptNotes }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/concept-notes`, params: s.all }}
    >
      <Suspense>
        <FilterBar
          search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }}
          groups={[{ name: "status", label: dict.common.status, allLabel: dict.common.all, options: [{ value: "open", label: dict.status.open }, { value: "closed", label: dict.status.closed }] }]}
          clearLabel={dict.common.clear}
          resultsLabel={filtered ? fill(dict.common.results, { n: items.pagination.total }) : undefined}
        />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="space-y-4">
          {items.data.map((c) => (
            <RevealItem key={c.documentId}>
              <ListingCard
                href={`/${locale}/concept-notes/${c.slug}`}
                title={c.title}
                excerpt={blocksToText(c.description, 200)}
                icon={Lightbulb}
                badges={[{ label: c.callStatus === "open" ? dict.status.open : dict.status.closed, tone: c.callStatus === "open" ? "green" : "gray", dot: true }]}
                deadline={c.callStatus === "open" ? c.closingDate : null}
                meta={[
                  ...(c.sector ? [{ icon: Layers, label: c.sector.name }] : []),
                  ...(c.closingDate ? [{ icon: CalendarDays, label: `${dict.common.deadline}: ${formatDate(c.closingDate, locale, "medium")}` }] : []),
                ]}
                cta={dict.common.readMore}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <EmptyState icon={Lightbulb} title={filtered ? dict.common.noResults : dict.empty.title} text={filtered ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
