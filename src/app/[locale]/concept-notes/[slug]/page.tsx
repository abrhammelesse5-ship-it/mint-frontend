import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, CalendarDays, Layers } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { ConceptNoteCall } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { MetaCard } from "@/components/detail/MetaCard";
import { Attachments } from "@/components/detail/Attachments";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { BlocksRenderer, blocksToText, hasBlocks } from "@/components/blocks/BlocksRenderer";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { Badge } from "@/components/ui/Badge";
import { Countdown } from "@/components/ui/Countdown";

const load = (slug: string, locale: Locale) =>
  getBySlug<ConceptNoteCall>("concept-note-calls", slug, locale, { populate: { attachments: { populate: { file: true } }, sector: { fields: ["name", "slug"] } } });

export async function generateMetadata({ params }: PageProps<"/[locale]/concept-notes/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/concept-notes/${slug}`, title: item.title, description: blocksToText(item.description, 160) }) : {};
}

export default async function ConceptNoteDetail({ params }: PageProps<"/[locale]/concept-notes/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  const open = item.callStatus === "open";
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={dict.nav.conceptNotes}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.conceptNotes, href: `/${locale}/concept-notes` }, { label: item.title }]}
        compact
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={open ? "green" : "gray"} dot>
            {open ? dict.status.open : dict.status.closed}
          </Badge>
          {open && item.closingDate && <Countdown date={item.closingDate} size="lg" />}
        </div>
      </PageHero>
      <DetailLayout
        aside={
          <>
            <MetaCard
              title={dict.common.keyFacts}
              rows={[
                { icon: Layers, label: dict.common.sector, value: item.sector ? <Link href={`/${locale}/sectors/${item.sector.slug}`}>{item.sector.name}</Link> : null },
                { icon: CalendarCheck, label: dict.common.opens, value: item.openDate ? formatDate(item.openDate, locale) : null },
                { icon: CalendarDays, label: dict.common.deadline, value: item.closingDate ? formatDate(item.closingDate, locale) : null },
              ]}
            />
            <Attachments items={item.attachments} dict={dict} />
          </>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        <BlocksRenderer content={item.description} />
        {hasBlocks(item.eligibility) && (
          <section aria-labelledby="elig" className="mt-12 rounded-3xl border border-brand-100 bg-brand-50/50 p-8 dark:border-white/10 dark:bg-white/5">
            <h2 id="elig" className="mb-4 text-2xl font-bold">
              {dict.pages.eligibility}
            </h2>
            <BlocksRenderer content={item.eligibility} />
          </section>
        )}
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/concept-notes/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
