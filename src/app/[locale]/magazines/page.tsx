import type { Metadata } from "next";
import { BookOpen, Download } from "lucide-react";
import { ctx, readSearch } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { fileSizeLabel, mediaUrl } from "@/lib/media";
import type { Magazine } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { realMedia } from "@/lib/fallback-images";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/magazines">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/magazines", title: dict.pages.magazines.title, description: dict.pages.magazines.text });
}

export default async function MagazinesPage({ params, searchParams }: PageProps<"/[locale]/magazines">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const items = await getCollection<Magazine>("magazines", locale, { sort: ["publishDate:desc"], populate: { coverImage: true, pdfFile: true }, pagination: { page: s.page, pageSize: 12 } });
  return (
    <ListShell theme="research"
      locale={locale}
      dict={dict}
      title={dict.pages.magazines.title}
      text={dict.pages.magazines.text}
      eyebrow={dict.nav.resources}
      crumbs={[{ label: dict.nav.resources, href: `/${locale}/resources` }, { label: dict.nav.magazines }]}
      pagination={{ page: items.pagination.page, pageCount: items.pagination.pageCount, basePath: `/${locale}/magazines` }}
    >
      {items.data.length ? (
        <RevealGroup className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.data.map((m) => {
            const pdf = mediaUrl(m.pdfFile?.url);
            return (
              <RevealItem key={m.documentId}>
                <article className="group">
                  <a href={pdf ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={`${m.title} (PDF)`} className="relative block aspect-[3/4] overflow-hidden rounded-xl bg-ink-100 shadow-[0_20px_40px_-20px_rgb(15_31_48/0.45)] ring-1 ring-ink-900/5 transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[-1deg] group-hover:shadow-[0_30px_60px_-20px_rgb(7_135_140/0.5)]">
                    <StrapiImage media={m.coverImage} sizes="(min-width:1024px) 25vw, 50vw" fallback={{ seed: m.slug ?? m.title, text: m.title }} />
                    {!realMedia(m.coverImage) && (
                      <span className="absolute inset-0 flex bg-gradient-to-t from-ink-950/90 via-ink-950/50 to-ink-950/20 flex-col items-center justify-center p-6 text-center text-white">
                        <BookOpen className="mb-3 h-10 w-10 text-gold-400" aria-hidden />
                        <span className="font-display text-lg font-bold">{m.title}</span>
                      </span>
                    )}
                    <span className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
                    {m.issueNumber && <span className="absolute top-3 right-3 rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-ink-950">{`${dict.common.issue} ${m.issueNumber}`}</span>}
                  </a>
                  <h3 className="mt-5 line-clamp-2 text-lg font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm text-ink-500">{formatDate(m.publishDate, locale)}</p>
                  {m.description && <p className="mt-2 line-clamp-2 text-sm text-ink-500 dark:text-ink-300">{m.description}</p>}
                  {pdf && (
                    <a href={pdf} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                      <Download className="h-4 w-4" aria-hidden />
                      {dict.common.download} PDF {m.pdfFile?.size ? `· ${fileSizeLabel(m.pdfFile.size)}` : ""}
                    </a>
                  )}
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      ) : (
        <EmptyState icon={BookOpen} title={dict.empty.title} text={dict.empty.text} />
      )}
    </ListShell>
  );
}
