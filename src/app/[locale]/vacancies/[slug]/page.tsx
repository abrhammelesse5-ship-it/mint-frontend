import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, Building2, CalendarCheck, CalendarDays, MapPin, Users, Wallet } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Vacancy } from "@/lib/types";
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
  getBySlug<Vacancy>("vacancies", slug, locale, { populate: { attachments: { populate: { file: true } }, directorate: { fields: ["name", "slug"] } } });

export async function generateMetadata({ params }: PageProps<"/[locale]/vacancies/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/vacancies/${slug}`, title: item.title, description: blocksToText(item.jobDescription, 160) }) : {};
}

export default async function VacancyDetail({ params }: PageProps<"/[locale]/vacancies/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  const open = item.vacancyStatus === "open";
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={dict.nav.vacancies}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.announcements, href: `/${locale}/announcements` }, { label: dict.nav.vacancies, href: `/${locale}/vacancies` }, { label: item.title }]}
        compact
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={open ? "green" : "gray"} dot>
            {open ? dict.status.open : dict.status.closed}
          </Badge>
          <Badge tone="blue">{dict.employment[item.employmentType]}</Badge>
          {open && item.closingDate && <Countdown date={item.closingDate} size="lg" />}
        </div>
      </PageHero>
      <DetailLayout
        aside={
          <>
            <MetaCard
              title={dict.common.keyFacts}
              rows={[
                { icon: BriefcaseBusiness, label: dict.common.status, value: dict.employment[item.employmentType] },
                { icon: Building2, label: dict.employment.directorate, value: item.directorate?.name },
                { icon: MapPin, label: dict.common.location, value: item.location },
                { icon: Users, label: dict.employment.positions, value: item.numberOfPositions },
                { icon: Wallet, label: dict.employment.salary, value: item.salaryGrade },
                { icon: CalendarCheck, label: dict.common.opens, value: item.openDate ? formatDate(item.openDate, locale) : null },
                { icon: CalendarDays, label: dict.common.deadline, value: item.closingDate ? formatDate(item.closingDate, locale) : null },
              ]}
            />
            <Attachments items={item.attachments} dict={dict} />
          </>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        {hasBlocks(item.jobDescription) && (
          <section aria-labelledby="jd" className="mb-12">
            <h2 id="jd" className="mb-4 text-2xl font-bold">
              {dict.employment.description}
            </h2>
            <BlocksRenderer content={item.jobDescription} />
          </section>
        )}
        {hasBlocks(item.requirements) && (
          <section aria-labelledby="req" className="rounded-3xl border border-brand-100 bg-brand-50/50 p-8 dark:border-white/10 dark:bg-white/5">
            <h2 id="req" className="mb-4 text-2xl font-bold">
              {dict.employment.requirements}
            </h2>
            <BlocksRenderer content={item.requirements} />
          </section>
        )}
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/vacancies/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
