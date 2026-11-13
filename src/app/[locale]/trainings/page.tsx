import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarDays, GraduationCap, Layers, ListChecks } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { TrainingAnnouncement } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { ListingCard } from "@/components/cards/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { blocksToText } from "@/components/blocks/BlocksRenderer";

export async function generateMetadata({ params }: PageProps<"/[locale]/trainings">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/trainings", title: dict.pages.trainings.title, description: dict.pages.trainings.text });
}

export default async function TrainingsPage({ params, searchParams }: PageProps<"/[locale]/trainings">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const items = await getCollection<TrainingAnnouncement>("training-announcements", locale, {
    filters: searchFilter(s.q, ["title"]),
    sort: ["startDate:desc", "publishedAt:desc"],
    populate: { sector: { fields: ["name"] }, beneficiaryList: true },
    pagination: { page: s.page, pageSize: 15 },
  });
  return (
    <ListShell theme="skills"
      locale={locale}
      dict={dict}
      title={dict.pages.trainings.title}
      text={dict.pages.trainings.text}
      eyebrow={dict.nav.announcements}
      crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.trainings }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/trainings`, params: s.all }}
    >
      <Suspense>
        <FilterBar search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }} clearLabel={dict.common.clear} resultsLabel={s.q ? fill(dict.common.results, { n: items.pagination.total }) : undefined} />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="space-y-4">
          {items.data.map((t) => (
            <RevealItem key={t.documentId}>
              <ListingCard
                href={`/${locale}/trainings/${t.slug}`}
                title={t.title}
                excerpt={blocksToText(t.description, 200)}
                icon={GraduationCap}
                meta={[
                  ...(t.startDate ? [{ icon: CalendarDays, label: [formatDate(t.startDate, locale, "medium"), t.endDate ? formatDate(t.endDate, locale, "medium") : ""].filter(Boolean).join(" – ") }] : []),
                  ...(t.sector ? [{ icon: Layers, label: t.sector.name }] : []),
                  ...(t.beneficiaryList?.length ? [{ icon: ListChecks, label: `${dict.pages.beneficiaries} (${t.beneficiaryList.length})` }] : []),
                ]}
                cta={dict.common.readMore}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <EmptyState icon={GraduationCap} title={s.q ? dict.common.noResults : dict.empty.title} text={s.q ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
