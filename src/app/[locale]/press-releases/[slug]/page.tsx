import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { PressRelease } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { MetaCard } from "@/components/detail/MetaCard";
import { Attachments } from "@/components/detail/Attachments";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { BlocksRenderer, blocksToText } from "@/components/blocks/BlocksRenderer";
import { FallbackNotice } from "@/components/ui/FallbackNotice";

const load = (slug: string, locale: Locale) =>
  getBySlug<PressRelease>("press-releases", slug, locale, { populate: { attachments: { populate: { file: true } }, tags: { fields: ["name", "slug"] } } });

export async function generateMetadata({ params }: PageProps<"/[locale]/press-releases/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/press-releases/${slug}`, title: item.title, description: blocksToText(item.content, 160), type: "article", publishedTime: item.publishDate }) : {};
}

export default async function PressReleaseDetail({ params }: PageProps<"/[locale]/press-releases/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={dict.nav.pressReleases}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.media, href: `/${locale}/media` }, { label: dict.nav.pressReleases, href: `/${locale}/press-releases` }, { label: item.title }]}
        compact
      />
      <DetailLayout
        aside={
          <>
            <MetaCard title={dict.common.keyFacts} rows={[{ icon: CalendarDays, label: dict.common.published, value: formatDate(item.publishDate || item.publishedAt, locale) }]}>
              {!!item.tags?.length && (
                <ul className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/${locale}/news?tag=${t.slug}`} className="inline-block rounded-full bg-ink-50 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50 dark:bg-white/5 dark:text-ink-200">
                        #{t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </MetaCard>
            <Attachments items={item.attachments} dict={dict} />
          </>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        <BlocksRenderer content={item.content} />
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/press-releases/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
