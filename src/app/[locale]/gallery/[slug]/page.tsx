import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, Images } from "lucide-react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import type { GalleryAlbum } from "@/lib/types";
import { fill } from "@/i18n/t";
import { PageHero } from "@/components/ui/PageHero";
import { Gallery } from "@/components/media/Gallery";
import { EmptyState } from "@/components/ui/EmptyState";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { ButtonLink } from "@/components/ui/Button";

const load = (slug: string, locale: Locale) => getBySlug<GalleryAlbum>("gallery-albums", slug, locale, { populate: { coverImage: true, photos: true, event: { fields: ["title", "slug"] } } });

export async function generateMetadata({ params }: PageProps<"/[locale]/gallery/[slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await load(slug, locale);
  return item ? buildMetadata({ locale, path: `/gallery/${slug}`, title: item.title, image: item.coverImage ?? item.photos?.[0] }) : {};
}

export default async function AlbumPage({ params }: PageProps<"/[locale]/gallery/[slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item, fallback } = await load(slug, locale);
  if (!item) notFound();
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={fill(dict.common.photos, { n: item.photos?.length ?? 0 })}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.media, href: `/${locale}/media` }, { label: dict.nav.gallery, href: `/${locale}/gallery` }, { label: item.title }]}
        image={item.coverImage ?? item.photos?.[0]}
      >
        <div className="flex flex-wrap gap-3">
          {item.event && (
            <ButtonLink href={`/${locale}/events/${item.event.slug}`} variant="outline-light" size="sm" arrow={false}>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {item.event.title}
              </span>
            </ButtonLink>
          )}
          {item.externalUrl && (
            <ButtonLink href={item.externalUrl} variant="gold" size="sm">
              <span className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" aria-hidden />
                Flickr
              </span>
            </ButtonLink>
          )}
        </div>
      </PageHero>
      <div className="container-page py-14">
        {fallback && <FallbackNotice text={dict.common.fallbackNotice} />}
        {item.photos?.length ? <Gallery images={item.photos} layout="masonry" /> : <EmptyState icon={Images} title={dict.empty.title} />}
      </div>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
