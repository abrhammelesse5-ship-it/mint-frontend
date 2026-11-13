import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cache } from "react";
import { ctx } from "@/lib/page";
import { getBySlug } from "@/lib/strapi";
import { sectionsPopulate, seoPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import type { Page } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { DynamicZone } from "@/components/blocks/DynamicZone";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { EmptyState } from "@/components/ui/EmptyState";

const SLUG = /^[a-z0-9-]{1,120}$/i;

/** Generic CMS page, resolved by the last path segment (e.g. /en/about/history → slug "history"). */
const loadPage = cache(async (slugPath: string[], locale: Locale) => {
  const slug = slugPath.at(-1);
  if (!slug || !SLUG.test(slug) || slugPath.length > 4) return { item: null, fallback: false };
  return getBySlug<Page>("pages", slug, locale, {
    populate: {
      content: sectionsPopulate,
      seo: seoPopulate,
      parent: { fields: ["title", "slug"] },
      children: { fields: ["title", "slug"] },
    },
  });
});

export async function generateMetadata({ params }: PageProps<"/[locale]/[...slug]">): Promise<Metadata> {
  const { locale } = await ctx(params);
  const { slug } = await params;
  const { item } = await loadPage(slug, locale);
  if (!item) return {};
  return buildMetadata({ locale, path: `/${slug.join("/")}`, title: item.title, seo: item.seo });
}

export default async function CmsPage({ params }: PageProps<"/[locale]/[...slug]">) {
  const { locale, dict } = await ctx(params);
  const { slug } = await params;
  const { item: page, fallback } = await loadPage(slug, locale);
  if (!page) notFound();

  const crumbs = [...(page.parent ? [{ label: page.parent.title, href: `/${locale}/${page.parent.slug}` }] : []), { label: page.title }];
  return (
    <>
      <PageHero title={page.title} subtitle={page.seo?.metaDescription ?? undefined} homeHref={`/${locale}`} homeLabel={dict.nav.home} breadcrumbLabel={dict.common.breadcrumb} crumbs={crumbs} image={page.seo?.shareImage} compact />
      <div className="py-14 sm:py-16">
        {fallback && (
          <div className="container-page mb-8">
            <FallbackNotice text={dict.common.fallbackNotice} />
          </div>
        )}
        {page.content?.length ? (
          <div className="container-page">
            <DynamicZone sections={page.content} locale={locale} />
          </div>
        ) : (
          <div className="container-page">
            <EmptyState title={dict.common.contentComingSoon} />
          </div>
        )}
        {!!page.children?.length && (
          <nav aria-label={dict.common.related} className="container-page mt-14">
            <h2 className="mb-4 text-xl font-bold">{dict.common.related}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {page.children.map((c) => (
                <li key={c.documentId}>
                  <Link href={`/${locale}/${c.slug}`} className="card card-hover group flex items-center justify-between p-5 font-semibold">
                    {c.title}
                    <ArrowRight className="h-5 w-5 text-brand-600 transition group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}

/** Rendered on first request, then cached and revalidated (ISR). */
export function generateStaticParams() {
  return [];
}
