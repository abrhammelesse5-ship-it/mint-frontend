import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowUpRight, Building, Globe2, GraduationCap, Handshake, Landmark, MapPin, Rocket, Sprout } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";
import type { EcosystemPartner, PartnerType } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

const TYPES: PartnerType[] = ["startup", "university", "incubator", "government", "privateSector", "international"];
const icons = { startup: Rocket, university: GraduationCap, incubator: Sprout, government: Landmark, privateSector: Building, international: Globe2 };

export async function generateMetadata({ params }: PageProps<"/[locale]/ecosystem">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/ecosystem", title: dict.pages.ecosystem.title, description: dict.pages.ecosystem.text });
}

export default async function EcosystemPage({ params, searchParams }: PageProps<"/[locale]/ecosystem">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const type = s.get("type") as PartnerType | undefined;
  const [items, ...counts] = await Promise.all([
    getCollection<EcosystemPartner>("ecosystem-partners", locale, {
      filters: { ...searchFilter(s.q, ["name", "description", "location"]), ...(type && TYPES.includes(type) ? { type: { $eq: type } } : {}) },
      sort: ["name:asc"],
      populate: { logo: true, sectors: { fields: ["name", "slug"] } },
      pagination: { page: s.page, pageSize: 24 },
    }),
    ...TYPES.map((t) => getCollection<EcosystemPartner>("ecosystem-partners", locale, { filters: { type: { $eq: t } }, fields: ["name"], pagination: { pageSize: 1 } })),
  ]);
  const filtered = !!(s.q || type);
  return (
    <ListShell theme="innovation"
      locale={locale}
      dict={dict}
      title={dict.pages.ecosystem.title}
      text={dict.pages.ecosystem.text}
      eyebrow={dict.nav.ecosystem}
      crumbs={[{ label: dict.nav.ecosystem }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/ecosystem`, params: s.all }}
      heroChildren={
        <dl className="grid max-w-3xl grid-cols-3 gap-3 sm:grid-cols-6">
          {TYPES.map((t, i) => {
            const Icon = icons[t];
            return (
              <div key={t} className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10 backdrop-blur">
                <Icon className="mx-auto h-5 w-5 text-gold-400" aria-hidden />
                <dd className="mt-1 font-display text-xl font-bold text-white">{counts[i].pagination.total}</dd>
                <dt className="truncate text-[11px] text-white/65">{dict.partnerTypes[t]}</dt>
              </div>
            );
          })}
        </dl>
      }
    >
      <Suspense>
        <FilterBar
          search={{ placeholder: dict.common.searchPlaceholder, label: dict.common.search }}
          groups={[{ name: "type", label: dict.common.category, allLabel: dict.common.all, options: TYPES.map((t) => ({ value: t, label: dict.partnerTypes[t] })) }]}
          clearLabel={dict.common.clear}
          resultsLabel={filtered ? fill(dict.common.results, { n: items.pagination.total }) : undefined}
        />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.data.map((p) => {
            const Icon = icons[p.type] ?? Handshake;
            const logo = mediaUrl(p.logo?.url);
            const body = (
              <>
                <div className="flex items-start justify-between">
                  <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100 dark:bg-white/5 dark:ring-white/10">
                    {logo ? <Image src={logo} alt="" fill sizes="64px" className="object-contain p-2" /> : <Icon className="h-7 w-7 text-brand-600" aria-hidden />}
                  </span>
                  {p.websiteUrl && <ArrowUpRight className="h-5 w-5 text-ink-300 transition group-hover:text-brand-600" aria-hidden />}
                </div>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {dict.partnerTypes[p.type]}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{p.name}</h2>
                {p.description && <p className="mt-2 line-clamp-3 text-sm text-ink-500 dark:text-ink-300">{p.description}</p>}
                {p.location && (
                  <p className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs text-ink-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {p.location}
                  </p>
                )}
              </>
            );
            return (
              <RevealItem key={p.documentId} className="h-full">
                {p.websiteUrl ? (
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="card card-hover group flex h-full flex-col p-6">
                    {body}
                  </a>
                ) : (
                  <div className="card group flex h-full flex-col p-6">{body}</div>
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      ) : (
        <EmptyState icon={Handshake} title={filtered ? dict.common.noResults : dict.empty.title} text={filtered ? dict.empty.filtered : dict.empty.text} />
      )}
    </ListShell>
  );
}
