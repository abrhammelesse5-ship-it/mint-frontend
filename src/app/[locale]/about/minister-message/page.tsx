import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { ctx } from "@/lib/page";
import { getSingle } from "@/lib/strapi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import type { MinisterMessage } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { BlocksRenderer, blocksToText, hasBlocks } from "@/components/blocks/BlocksRenderer";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShareButtons } from "@/components/detail/ShareButtons";
import { Reveal } from "@/components/ui/Reveal";

const populate = { photo: true, official: { populate: { photo: true } } };

export async function generateMetadata({ params }: PageProps<"/[locale]/about/minister-message">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  const m = await getSingle<MinisterMessage>("minister-message", locale, { populate });
  return buildMetadata({ locale, path: "/about/minister-message", title: m?.title || dict.nav.ministerMessage, description: blocksToText(m?.message, 160), image: m?.photo });
}

export default async function MinisterMessagePage({ params }: PageProps<"/[locale]/about/minister-message">) {
  const { locale, dict } = await ctx(params);
  const m = await getSingle<MinisterMessage>("minister-message", locale, { populate });
  const name = m?.ministerName || m?.official?.fullName;
  return (
    <>
      <PageHero
        title={m?.title || dict.nav.ministerMessage}
        eyebrow={dict.nav.ministerMessage}
        homeHref={`/${locale}`}
        homeLabel={dict.nav.home}
        breadcrumbLabel={dict.common.breadcrumb}
        crumbs={[{ label: dict.nav.about, href: `/${locale}/about` }, { label: dict.nav.ministerMessage }]}
        compact
      />
      <div className="container-page py-16">
        {m && hasBlocks(m.message) ? (
          <div className="grid gap-12 lg:grid-cols-[340px_1fr]">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
                <StrapiImage media={m.photo ?? m.official?.photo} sizes="340px" className="object-top" alt={name ?? ""} fallback={{ seed: "admin-1", theme: "admin" }} />
              </div>
              {name && (
                <div className="mt-6">
                  <p className="font-display text-xl font-bold">{name}</p>
                  <p className="text-brand-700 dark:text-brand-300">{dict.positions.minister}</p>
                </div>
              )}
            </Reveal>
            <Reveal>
              <Quote className="mb-6 h-12 w-12 text-gold-500" aria-hidden />
              <BlocksRenderer content={m.message} className="prose-xl" />
              {name && <p className="mt-10 font-display text-lg font-bold italic">— {name}</p>}
              <div className="mt-10 border-t border-ink-100 pt-6 dark:border-white/10">
                <ShareButtons url={`${SITE_URL}/${locale}/about/minister-message`} title={m.title || dict.nav.ministerMessage} />
              </div>
            </Reveal>
          </div>
        ) : (
          <EmptyState icon={Quote} title={dict.common.contentComingSoon} />
        )}
      </div>
    </>
  );
}
