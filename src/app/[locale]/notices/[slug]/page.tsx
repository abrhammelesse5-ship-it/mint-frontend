import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, CalendarX2, Flag } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Notice } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { MetaCard } from "@/components/detail/MetaCard";
import { Attachments } from "@/components/detail/Attachments";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { BlocksRenderer, blocksToText } from "@/components/blocks/BlocksRenderer";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { Badge } from "@/components/ui/Badge";

const load = (slug: string, locale: Locale) => getBySlug<Notice>("notices", slug, locale, { populate: { attachments: { populate: { file: true } } } });

export async function generateMetadata({ params }: PageProps<"/[locale]/notices/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/notices/${slug}`, title: item.title, description: blocksToText(item.content, 160) }) : {};
}

export default async function NoticeDetail({ params }: PageProps<"/[locale]/notices/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={dict.nav.notices}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.notices, href: `/${locale}/notices` }, { label: item.title }]}
        compact
      >
        {item.priority && item.priority !== "normal" && <Badge tone={item.priority === "urgent" ? "red" : "amber"} dot>{dict.status[item.priority]}</Badge>}
      </PageHero>
      <DetailLayout
        aside={
          <>
            <MetaCard
              title={dict.common.keyFacts}
              rows={[
                { icon: CalendarDays, label: dict.common.published, value: formatDate(item.publishDate || item.publishedAt, locale) },
                { icon: CalendarX2, label: dict.status.expired, value: item.expiryDate ? formatDate(item.expiryDate, locale) : null },
                { icon: Flag, label: dict.common.status, value: item.priority ? dict.status[item.priority] : null },
              ]}
            />
            <Attachments items={item.attachments} dict={dict} />
          </>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        <BlocksRenderer content={item.content} />
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/notices/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
