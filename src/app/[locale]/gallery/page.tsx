import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Images } from "lucide-react";
import { ctx, readSearch } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import type { GalleryAlbum } from "@/lib/types";
import { fill } from "@/i18n/t";
import { ListShell } from "@/components/ui/ListShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[locale]/gallery">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/gallery", title: dict.pages.gallery.title, description: dict.pages.gallery.text });
}

export default async function GalleryPage({ params, searchParams }: PageProps<"/[locale]/gallery">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const albums = await getCollection<GalleryAlbum>("gallery-albums", locale, {
    sort: ["publishedAt:desc"],
    populate: { coverImage: true, photos: { fields: ["url", "formats", "width", "height"] } },
    pagination: { page: s.page, pageSize: 12 },
  });
  return (
    <ListShell theme="events"
      locale={locale}
      dict={dict}
      title={dict.pages.gallery.title}
      text={dict.pages.gallery.text}
      eyebrow={dict.nav.media}
      crumbs={[{ label: dict.nav.media, href: `/${locale}/media` }, { label: dict.nav.gallery }]}
      pagination={{ page: albums.pagination.page, pageCount: albums.pagination.pageCount, basePath: `/${locale}/gallery` }}
    >
      {albums.data.length ? (
        <RevealGroup className="grid auto-rows-[260px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.data.map((a, i) => {
            const cover = a.coverImage ?? a.photos?.[0];
            const big = i % 7 === 0;
            const href = a.photos?.length || !a.externalUrl ? `/${locale}/gallery/${a.slug}` : a.externalUrl;
            return (
              <RevealItem key={a.documentId} className={cn(big && "sm:col-span-2 sm:row-span-2")}>
                <Link href={href} target={href.startsWith("http") ? "_blank" : undefined} className="group relative isolate flex h-full items-end overflow-hidden rounded-3xl p-6 text-white shadow-card">
                  <StrapiImage media={cover} sizes={big ? "66vw" : "33vw"} fallback={{ seed: a.slug, text: a.title }} className="-z-20 transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
                  <span className="flex w-full items-end justify-between gap-4">
                    <span>
                      <span className={cn("block font-bold text-white", big ? "text-2xl" : "text-lg")}>{a.title}</span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/75">
                        <Images className="h-4 w-4" aria-hidden />
                        {fill(dict.common.photos, { n: a.photos?.length ?? 0 })}
                      </span>
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-gold-500 group-hover:text-ink-950">
                      <ArrowUpRight className="h-5 w-5" aria-hidden />
                    </span>
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      ) : (
        <EmptyState icon={Images} title={dict.empty.title} text={dict.empty.text} />
      )}
    </ListShell>
  );
}
