import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, CalendarDays, Layers } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { TrainingAnnouncement } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { MetaCard } from "@/components/detail/MetaCard";
import { Attachments } from "@/components/detail/Attachments";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { BlocksRenderer, blocksToText } from "@/components/blocks/BlocksRenderer";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { ButtonLink } from "@/components/ui/Button";

const load = (slug: string, locale: Locale) => getBySlug<TrainingAnnouncement>("training-announcements", slug, locale, { populate: { beneficiaryList: true, sector: { fields: ["name", "slug"] } } });

export async function generateMetadata({ params }: PageProps<"/[locale]/trainings/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/trainings/${slug}`, title: item.title, description: blocksToText(item.description, 160) }) : {};
}

export default async function TrainingDetail({ params }: PageProps<"/[locale]/trainings/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={dict.nav.trainings}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.trainings, href: `/${locale}/trainings` }, { label: item.title }]}
        compact
      >
        {item.applicationUrl && (
          <ButtonLink href={item.applicationUrl} variant="gold">
            {dict.common.apply}
          </ButtonLink>
        )}
      </PageHero>
      <DetailLayout
        aside={
          <>
            <MetaCard
              title={dict.common.keyFacts}
              rows={[
                { icon: CalendarCheck, label: dict.common.opens, value: item.startDate ? formatDate(item.startDate, locale) : null },
                { icon: CalendarDays, label: dict.common.closes, value: item.endDate ? formatDate(item.endDate, locale) : null },
                { icon: Layers, label: dict.common.sector, value: item.sector?.name },
              ]}
            />
            <Attachments files={item.beneficiaryList} dict={dict} title={dict.pages.beneficiaries} />
          </>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        <BlocksRenderer content={item.description} />
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/trainings/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
