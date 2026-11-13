import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, CalendarDays, Layers, Activity } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { documentPopulate, seoPopulate } from "@/lib/populate";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Program } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { MetaCard } from "@/components/detail/MetaCard";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { BlocksRenderer } from "@/components/blocks/BlocksRenderer";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { Badge } from "@/components/ui/Badge";

const tone = { planned: "blue", ongoing: "green", completed: "gray" } as const;
const load = (slug: string, locale: Locale) =>
  getBySlug<Program>("programs", slug, locale, { populate: { coverImage: true, seo: seoPopulate, sector: { fields: ["name", "slug"] }, documents: { populate: documentPopulate } } });

export async function generateMetadata({ params }: PageProps<"/[locale]/programs/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/programs/${slug}`, title: item.title, description: item.description, seo: item.seo, image: item.coverImage }) : {};
}

export default async function ProgramDetail({ params }: PageProps<"/[locale]/programs/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  return (
    <>
      <PageHero
        title={item.title}
        subtitle={item.description}
        eyebrow={item.sector?.name ?? dict.nav.programs}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.programs, href: `/${locale}/programs` }, { label: item.title }]}
        image={item.coverImage}
      >
        {item.programStatus && (
          <Badge tone={tone[item.programStatus]} dot>
            {dict.status[item.programStatus]}
          </Badge>
        )}
      </PageHero>
      <DetailLayout
        aside={
          <MetaCard
            title={dict.common.keyFacts}
            rows={[
              { icon: Activity, label: dict.common.status, value: item.programStatus ? dict.status[item.programStatus] : null },
              { icon: CalendarCheck, label: dict.common.opens, value: item.startDate ? formatDate(item.startDate, locale) : null },
              { icon: CalendarDays, label: dict.common.closes, value: item.endDate ? formatDate(item.endDate, locale) : null },
              { icon: Layers, label: dict.common.sector, value: item.sector ? <Link href={`/${locale}/sectors/${item.sector.slug}`}>{item.sector.name}</Link> : null },
            ]}
          />
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        <BlocksRenderer content={item.content} />
        {!!item.documents?.length && (
          <section className="mt-14" aria-labelledby="pdocs">
            <h2 id="pdocs" className="mb-6 text-2xl font-bold">
              {dict.pages.relatedDocuments}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {item.documents.map((d) => (
                <DocumentCard key={d.documentId} doc={d} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        )}
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/programs/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
