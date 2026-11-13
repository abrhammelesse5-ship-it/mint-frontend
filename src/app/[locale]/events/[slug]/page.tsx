import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Clock, Images, Layers, MapPin, MonitorPlay } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { formatDate, formatTime } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { EventItem } from "@/lib/types";
import { fill } from "@/i18n/t";
import { PageHero } from "@/components/ui/PageHero";
import { DetailLayout } from "@/components/detail/DetailLayout";
import { MetaCard } from "@/components/detail/MetaCard";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { BlocksRenderer, blocksToText } from "@/components/blocks/BlocksRenderer";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StrapiImage } from "@/components/ui/StrapiImage";

const load = (slug: string, locale: Locale) =>
  getBySlug<EventItem>("events", slug, locale, {
    populate: { coverImage: true, sector: { fields: ["name", "slug"] }, albums: { fields: ["title", "slug"], populate: { coverImage: true, photos: { fields: ["url"] } } } },
  });

export async function generateMetadata({ params }: PageProps<"/[locale]/events/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/events/${slug}`, title: item.title, description: blocksToText(item.description, 160), image: item.coverImage }) : {};
}

export default async function EventDetail({ params }: PageProps<"/[locale]/events/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  const upcoming = new Date(item.startDate).getTime() > new Date().getTime();
  const when = `${formatDate(item.startDate, locale)}${item.endDate && item.endDate.slice(0, 10) !== item.startDate.slice(0, 10) ? ` – ${formatDate(item.endDate, locale)}` : ""}`;
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={dict.nav.events}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.media, href: `/${locale}/media` }, { label: dict.nav.events, href: `/${locale}/events` }, { label: item.title }]}
        image={item.coverImage}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={upcoming ? "green" : "gray"} dot>
            {upcoming ? dict.status.upcoming : dict.status.past}
          </Badge>
          <span className="inline-flex items-center gap-2 text-sm text-white/80">
            <CalendarDays className="h-4 w-4 text-gold-400" aria-hidden />
            {when}
          </span>
          {upcoming && item.registrationUrl && (
            <ButtonLink href={item.registrationUrl} variant="gold" size="sm" className="ml-2">
              {dict.common.register}
            </ButtonLink>
          )}
        </div>
      </PageHero>
      <DetailLayout
        aside={
          <MetaCard
            title={dict.common.keyFacts}
            rows={[
              { icon: CalendarDays, label: dict.common.date, value: when },
              { icon: Clock, label: dict.common.date, value: `${formatTime(item.startDate, locale)}${item.endDate ? ` – ${formatTime(item.endDate, locale)}` : ""}` },
              { icon: item.isOnline ? MonitorPlay : MapPin, label: dict.common.location, value: item.isOnline ? dict.common.online : item.location },
              { icon: Layers, label: dict.common.sector, value: item.sector ? <Link href={`/${locale}/sectors/${item.sector.slug}`}>{item.sector.name}</Link> : null },
            ]}
          >
            {upcoming && item.registrationUrl && (
              <ButtonLink href={item.registrationUrl} className="w-full">
                {dict.common.register}
              </ButtonLink>
            )}
          </MetaCard>
        }
      >
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        <BlocksRenderer content={item.description} />
        {!!item.albums?.length && (
          <section className="mt-12" aria-labelledby="albums-h">
            <h2 id="albums-h" className="mb-5 text-2xl font-bold">
              {dict.pages.albums}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {item.albums.map((a) => (
                <Link key={a.slug} href={`/${locale}/gallery/${a.slug}`} className="group relative isolate flex aspect-[16/10] items-end overflow-hidden rounded-2xl p-5 text-white">
                  <StrapiImage media={a.coverImage} sizes="400px" fallback={{ seed: a.slug, text: `${a.title} event` }} className="-z-20 transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/90 to-transparent" />
                  <span>
                    <span className="block font-semibold">{a.title}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-white/75">
                      <Images className="h-4 w-4" aria-hidden />
                      {fill(dict.common.photos, { n: a.photos?.length ?? 0 })}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="mt-12 border-t border-ink-100 pt-6 dark:border-white/10">
          <ShareButtons url={`${SITE_URL}/${locale}/events/${item.slug}`} title={item.title} />
        </div>
      </DetailLayout>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
