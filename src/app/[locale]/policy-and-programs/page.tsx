import type { Metadata } from "next";
import { ctx } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { documentPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import { hubLinks } from "@/lib/navigation";
import type { OfficialDocument } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { HubTiles } from "@/components/hub/HubTiles";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

const one = { pagination: { pageSize: 1 }, fields: ["documentId"] };

export async function generateMetadata({ params }: PageProps<"/[locale]/policy-and-programs">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/policy-and-programs", title: dict.pages.policyPrograms.title, description: dict.pages.policyPrograms.text });
}

export default async function PolicyHub({ params }: PageProps<"/[locale]/policy-and-programs">) {
  const { locale, dict } = await ctx(params);
  const byType = (type: string) => getCollection("documents", locale, { ...one, filters: { category: { type: { $eq: type } } } });
  const [programs, pol, guide, plans, latest] = await Promise.all([
    getCollection("programs", locale, one),
    byType("policyRegulationStrategy"),
    byType("guidelineStandard"),
    byType("planReport"),
    getCollection<OfficialDocument>("documents", locale, {
      filters: { category: { type: { $in: ["policyRegulationStrategy", "guidelineStandard"] } } },
      sort: ["publishDate:desc", "publishedAt:desc"],
      populate: documentPopulate,
      pagination: { pageSize: 3 },
    }),
  ]);
  const L = (p: string) => `/${locale}${p}`;
  const counts = {
    [L("/programs")]: programs.pagination.total,
    [L("/resources?type=policyRegulationStrategy")]: pol.pagination.total,
    [L("/resources?type=guidelineStandard")]: guide.pagination.total,
    [L("/resources?type=planReport")]: plans.pagination.total,
  };
  return (
    <ListShell theme="policy" locale={locale} dict={dict} title={dict.pages.policyPrograms.title} text={dict.pages.policyPrograms.text} eyebrow={dict.site.short} crumbs={[{ label: dict.nav.policyPrograms }]}>
      <HubTiles links={hubLinks("/policy-and-programs", locale, dict)} counts={counts} locale={locale} countLabel={dict.common.items} countLabelOne={dict.common.item} />
      {!!latest.data.length && (
        <section className="mt-20" aria-labelledby="docs-h">
          <SectionHeading
            id="docs-h"
            eyebrow={dict.nav.resources}
            title={dict.nav.policies}
            action={{ href: L("/resources"), label: dict.common.viewAll }}
          />
          <RevealGroup className="grid gap-6 md:grid-cols-3">
            {latest.data.map((d) => (
              <RevealItem key={d.documentId} className="h-full">
                <DocumentCard doc={d} locale={locale} dict={dict} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}
    </ListShell>
  );
}
