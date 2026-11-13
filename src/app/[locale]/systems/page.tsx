import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowUpRight, Building2, Globe, MonitorSmartphone } from "lucide-react";
import { NavGlyph } from "@/components/layout/NavIcons";
import { ctx, readSearch } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";
import type { SystemApp } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[locale]/systems">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/systems", title: dict.pages.systems.title, description: dict.pages.systems.text });
}

const statusTone = { active: "green", maintenance: "amber", retired: "gray" } as const;

export default async function SystemsPage({ params, searchParams }: PageProps<"/[locale]/systems">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const type = s.get("type");
  const items = await getCollection<SystemApp>("system-apps", locale, {
    filters: type === "internal" || type === "external" ? { type: { $eq: type } } : {},
    sort: ["systemStatus:asc", "name:asc"],
    populate: { logo: true, owner: { fields: ["name"] } },
    pagination: { pageSize: 100 },
  });
  const title = type === "internal" ? dict.nav.internalSystems : type === "external" ? dict.nav.externalSystems : dict.pages.systems.title;
  return (
    <ListShell theme="egov" locale={locale} dict={dict} title={title} text={dict.pages.systems.text} eyebrow={dict.nav.systems} crumbs={[{ label: dict.nav.systems, href: `/${locale}/systems` }, ...(type ? [{ label: title }] : [])]}>
      <Suspense>
        <FilterBar
          groups={[{ name: "type", label: dict.common.category, allLabel: dict.common.all, options: [{ value: "external", label: dict.nav.externalSystems }, { value: "internal", label: dict.nav.internalSystems }] }]}
          clearLabel={dict.common.clear}
        />
      </Suspense>
      {items.data.length ? (
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.data.map((sys) => {
            const logo = mediaUrl(sys.logo?.url);
            const retired = sys.systemStatus === "retired";
            return (
              <RevealItem key={sys.documentId} className="h-full">
                <article className={cn("card group relative flex h-full flex-col overflow-hidden p-6", !retired && "card-hover")}>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700 opacity-0 transition group-hover:opacity-100" aria-hidden />
                  <div className="flex items-start justify-between gap-4">
                    <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-ink-50 text-brand-600 ring-1 ring-ink-100 dark:bg-white/5 dark:ring-white/10">
                      {logo ? <Image src={logo} alt="" fill sizes="56px" className="object-contain p-2" /> : <SystemIcon name={sys.name} />}
                    </span>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge tone={statusTone[sys.systemStatus]} dot>
                        {dict.status[sys.systemStatus]}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                        {sys.type === "internal" ? <Building2 className="h-3.5 w-3.5" aria-hidden /> : <Globe className="h-3.5 w-3.5" aria-hidden />}
                        {dict.status[sys.type]}
                      </span>
                    </div>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold">{sys.name}</h2>
                  {sys.description && <p className="mt-2 line-clamp-3 text-[15px] text-ink-500 dark:text-ink-300">{sys.description}</p>}
                  {sys.owner && <p className="mt-3 text-xs text-ink-400">{sys.owner.name}</p>}
                  <div className="mt-auto pt-6">
                    {retired ? (
                      <span className="text-sm text-ink-400">{dict.status.retired}</span>
                    ) : (
                      <a href={sys.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                        {dict.pages.openSystem}
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                        <span className="sr-only">{dict.common.opensNewTab}</span>
                      </a>
                    )}
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      ) : (
        <EmptyState icon={MonitorSmartphone} title={dict.empty.title} text={dict.empty.text} />
      )}
    </ListShell>
  );
}

function SystemIcon({ name }: { name: string }) {
  return <NavGlyph link={{ label: name }} className="h-7 w-7" />;
}
