import type { Metadata } from "next";
import { Suspense } from "react";
import { Library } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { documentPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import type { DocumentCategory, DocumentCategoryType, OfficialDocument, Sector } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

const TYPES: DocumentCategoryType[] = ["policyRegulationStrategy", "guidelineStandard", "planReport", "other"];

export async function generateMetadata({ params }: PageProps<"/[locale]/resources">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/resources", title: dict.pages.resources.title, description: dict.pages.resources.text });
}

export default async function ResourcesPage({ params, searchParams }: PageProps<"/[locale]/resources">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const category = s.get("category");
  const type = s.get("type") as DocumentCategoryType | undefined;
  const language = s.get("language");
  const sector = s.get("sector");

  const [docs, categories, sectors] = await Promise.all([
    getCollection<OfficialDocument>("documents", locale, {
      filters: {
        ...searchFilter(s.q, ["title", "description", "documentNumber"]),
        ...(category || (type && TYPES.includes(type))
          ? { category: { ...(category ? { slug: { $eq: category } } : {}), ...(type && TYPES.includes(type) ? { type: { $eq: type } } : {}) } }
          : {}),
        ...(language === "en" || language === "am" ? { language: { $eq: language } } : {}),
        ...(sector ? { sector: { slug: { $eq: sector } } } : {}),
      },
      sort: ["publishDate:desc", "publishedAt:desc"],
      populate: documentPopulate,
      pagination: { page: s.page, pageSize: 12 },
    }),
    getCollection<DocumentCategory>("document-categories", locale, { fields: ["name", "slug", "type"], sort: ["name:asc"], pagination: { pageSize: 50 } }),
    getCollection<Sector>("sectors", locale, { fields: ["name", "slug"], sort: ["order:asc"], pagination: { pageSize: 50 } }),
  ]);
  const filtered = !!(s.q || category || type || language || sector);
  const title = type && TYPES.includes(type) ? dict.docTypes[type] : dict.pages.resources.title;

  return (
    <ListShell theme="policy"
      locale={locale}
      dict={dict}
      title={title}
      text={dict.pages.resources.text}
      eyebrow={dict.nav.resources}
      crumbs={[{ label: dict.nav.resources, href: `/${locale}/resources` }, ...(type ? [{ label: title }] : [])]}
      pagination={{ page: docs.pagination.page, pageCount: docs.pagination.pageCount, basePath: `/${locale}/resources`, params: s.all }}
    >
      <Suspense>
        <FilterBar
          search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }}
          groups={[
            { name: "type", label: dict.common.category, allLabel: dict.common.all, options: TYPES.filter((t) => t !== "other").map((t) => ({ value: t, label: dict.docTypes[t] })) },
            ...(categories.data.length > 3 ? [{ name: "category", label: dict.common.category, allLabel: dict.common.all, variant: "select" as const, options: categories.data.map((c) => ({ value: c.slug, label: c.name })) }] : []),
            { name: "language", label: dict.common.language, allLabel: dict.common.all, variant: "select", options: [{ value: "en", label: dict.languages.en }, { value: "am", label: dict.languages.am }] },
            ...(sectors.data.length ? [{ name: "sector", label: dict.common.sector, allLabel: dict.common.all, variant: "select" as const, options: sectors.data.map((c) => ({ value: c.slug, label: c.name })) }] : []),
          ]}
          clearLabel={dict.common.clear}
          resultsLabel={fill(dict.common.results, { n: docs.pagination.total })}
        />
      </Suspense>
      {docs.data.length ? (
        <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {docs.data.map((d) => (
            <RevealItem key={d.documentId} className="h-full">
              <DocumentCard doc={d} locale={locale} dict={dict} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <EmptyState icon={Library} title={filtered ? dict.common.noResults : dict.empty.title} text={filtered ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
