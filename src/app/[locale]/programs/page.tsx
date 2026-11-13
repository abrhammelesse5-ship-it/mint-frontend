import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CalendarRange, Rocket } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Program } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { Badge } from "@/components/ui/Badge";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/programs">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/programs", title: dict.pages.programs.title, description: dict.pages.programs.text });
}

const statusTone = { planned: "blue", ongoing: "green", completed: "gray" } as const;

export default async function ProgramsPage({ params, searchParams }: PageProps<"/[locale]/programs">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const status = s.get("status");
  const items = await getCollection<Program>("programs", locale, {
    filters: { ...searchFilter(s.q, ["title", "description"]), ...(status ? { programStatus: { $eq: status } } : {}) },
    sort: ["startDate:desc", "publishedAt:desc"],
    populate: { coverImage: true, sector: { fields: ["name", "slug"] } },
    pagination: { page: s.page, pageSize: 12 },
  });
  const filtered = !!(s.q || status);
  return (
    <ListShell theme="egov"
      locale={locale}
      dict={dict}
      title={dict.pages.programs.title}
      text={dict.pages.programs.text}
      eyebrow={dict.nav.policyPrograms}
      crumbs={[{ label: dict.nav.policyPrograms, href: `/${locale}/policy-and-programs` }, { label: dict.nav.programs }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/programs`, params: s.all }}
    >
      <Suspense>
        <FilterBar
          search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }}
          groups={[{ name: "status", label: dict.common.status, allLabel: dict.common.all, options: (["ongoing", "planned", "completed"] as const).map((v) => ({ value: v, label: dict.status[v] })) }]}
          clearLabel={dict.common.clear}
        />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.data.map((p) => (
            <RevealItem key={p.documentId} className="h-full">
              <Link href={`/${locale}/programs/${p.slug}`} className="card card-hover group flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <StrapiImage media={p.coverImage} sizes="(min-width:1024px) 33vw, 100vw" fallback={{ seed: p.slug, text: `${p.title} ${p.description ?? ""}` }} className="transition duration-700 group-hover:scale-105" />
                  {p.programStatus && (
                    <span className="absolute top-4 left-4">
                      <Badge tone={statusTone[p.programStatus]} dot className="bg-white/95 dark:bg-ink-950/80">
                        {dict.status[p.programStatus]}
                      </Badge>
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {p.sector && <p className="mb-2 text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300">{p.sector.name}</p>}
                  <h3 className="text-lg leading-snug font-semibold group-hover:text-brand-700">{p.title}</h3>
                  {p.description && <p className="mt-2 line-clamp-3 text-[15px] text-ink-500 dark:text-ink-300">{p.description}</p>}
                  <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                    {p.startDate ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-500">
                        <CalendarRange className="h-4 w-4" aria-hidden />
                        {formatDate(p.startDate, locale, "short")}
                        {p.endDate ? ` – ${formatDate(p.endDate, locale, "short")}` : ""}
                      </span>
                    ) : (
                      <span />
                    )}
                    <ArrowRight className="h-5 w-5 text-brand-600 transition group-hover:translate-x-1" aria-hidden />
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <EmptyState icon={Rocket} title={filtered ? dict.common.noResults : dict.empty.title} text={filtered ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
