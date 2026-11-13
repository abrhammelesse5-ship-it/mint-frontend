import type { Metadata } from "next";
import { Suspense } from "react";
import { BriefcaseBusiness, Building2, CalendarDays, MapPin, Users } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Vacancy } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { ListingCard } from "@/components/cards/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/vacancies">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/vacancies", title: dict.pages.vacancies.title, description: dict.pages.vacancies.text });
}

export default async function VacanciesPage({ params, searchParams }: PageProps<"/[locale]/vacancies">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const status = s.get("status");
  const type = s.get("type");
  const items = await getCollection<Vacancy>("vacancies", locale, {
    filters: {
      ...searchFilter(s.q, ["title", "location"]),
      ...(status ? { vacancyStatus: { $eq: status } } : {}),
      ...(type ? { employmentType: { $eq: type } } : {}),
    },
    sort: ["vacancyStatus:desc", "closingDate:asc", "publishedAt:desc"],
    populate: { directorate: { fields: ["name"] } },
    pagination: { page: s.page, pageSize: 15 },
  });
  const filtered = !!(s.q || status || type);
  return (
    <ListShell theme="admin"
      locale={locale}
      dict={dict}
      title={dict.pages.vacancies.title}
      text={dict.pages.vacancies.text}
      eyebrow={dict.nav.announcements}
      crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.vacancies }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/vacancies`, params: s.all }}
    >
      <Suspense>
        <FilterBar
          search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }}
          groups={[
            { name: "status", label: dict.common.status, allLabel: dict.common.all, options: [{ value: "open", label: dict.status.open }, { value: "closed", label: dict.status.closed }] },
            { name: "type", label: dict.employment.type, allLabel: dict.common.all, variant: "select", options: (["permanent", "contract", "internship"] as const).map((t) => ({ value: t, label: dict.employment[t] })) },
          ]}
          clearLabel={dict.common.clear}
          resultsLabel={filtered ? fill(dict.common.results, { n: items.pagination.total }) : undefined}
        />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="space-y-4">
          {items.data.map((v) => (
            <RevealItem key={v.documentId}>
              <ListingCard
                href={`/${locale}/vacancies/${v.slug}`}
                title={v.title}
                icon={BriefcaseBusiness}
                badges={[
                  { label: v.vacancyStatus === "open" ? dict.status.open : dict.status.closed, tone: v.vacancyStatus === "open" ? "green" : "gray", dot: true },
                  { label: dict.employment[v.employmentType], tone: "blue" },
                ]}
                deadline={v.vacancyStatus === "open" ? v.closingDate : null}
                closed={v.vacancyStatus === "closed"}
                meta={[
                  ...(v.directorate ? [{ icon: Building2, label: v.directorate.name }] : []),
                  ...(v.location ? [{ icon: MapPin, label: v.location }] : []),
                  ...(v.numberOfPositions ? [{ icon: Users, label: fill(v.numberOfPositions === 1 ? dict.employment.positionsOne : dict.employment.positionsMany, { n: v.numberOfPositions }) }] : []),
                  ...(v.closingDate ? [{ icon: CalendarDays, label: `${dict.common.deadline}: ${formatDate(v.closingDate, locale, "medium")}` }] : []),
                ]}
                cta={dict.common.readMore}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title={filtered ? dict.common.noResults : dict.empty.title} text={filtered ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
