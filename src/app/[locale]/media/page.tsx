import type { Metadata } from "next";
import { ctx } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { newsCardPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import { hubLinks } from "@/lib/navigation";
import type { News } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { HubTiles } from "@/components/hub/HubTiles";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/cards/NewsCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

const one = { pagination: { pageSize: 1 }, fields: ["documentId"] };

export async function generateMetadata({ params }: PageProps<"/[locale]/media">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/media", title: dict.pages.media.title, description: dict.pages.media.text });
}

export default async function MediaHub({ params }: PageProps<"/[locale]/media">) {
  const { locale, dict } = await ctx(params);
  const [news, press, albums, events, mags] = await Promise.all([
    getCollection<News>("news-items", locale, { sort: ["publishDate:desc", "publishedAt:desc"], populate: newsCardPopulate, pagination: { pageSize: 3 } }),
    getCollection("press-releases", locale, one),
    getCollection("gallery-albums", locale, one),
    getCollection("events", locale, one),
    getCollection("magazines", locale, one),
  ]);
  const L = (p: string) => `/${locale}${p}`;
  const counts = { [L("/news")]: news.pagination.total, [L("/press-releases")]: press.pagination.total, [L("/gallery")]: albums.pagination.total, [L("/events")]: events.pagination.total, [L("/magazines")]: mags.pagination.total };
  return (
    <ListShell theme="events" locale={locale} dict={dict} title={dict.pages.media.title} text={dict.pages.media.text} eyebrow={dict.site.short} crumbs={[{ label: dict.nav.media }]}>
      <HubTiles links={hubLinks("/media", locale, dict)} counts={counts} locale={locale} countLabel={dict.common.items} countLabelOne={dict.common.item} />
      {!!news.data.length && (
        <section className="mt-20" aria-labelledby="latest-h">
          <SectionHeading
            id="latest-h"
            eyebrow={dict.nav.news}
            title={dict.home.latestNews}
            subtitle={dict.home.latestNewsSub}
            action={{ href: L("/news"), label: dict.common.viewAll }}
          />
          <RevealGroup className="grid gap-6 md:grid-cols-3">
            {news.data.map((n) => (
              <RevealItem key={n.documentId} className="h-full">
                <NewsCard item={n} locale={locale} viewsLabel={dict.common.views} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}
    </ListShell>
  );
}
