import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Download, Eye, Gem, History, Network, Quote, Scale, Target, Users } from "lucide-react";
import { ctx } from "@/lib/page";
import { getCollection, getSingle } from "@/lib/strapi";
import { documentPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";
import type { MinisterMessage, Official, OrganizationalStructure, PowersAndDuties, VisionMissionValues } from "@/lib/types";
import { PageHero } from "@/components/ui/PageHero";
import { BlocksRenderer, blocksToText, hasBlocks } from "@/components/blocks/BlocksRenderer";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Gallery } from "@/components/media/Gallery";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/about", title: dict.pages.about.title, description: dict.pages.about.text });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale, dict } = await ctx(params);
  const [vmv, powers, structure, minister, officials] = await Promise.all([
    getSingle<VisionMissionValues>("vision-mission-values", locale, { populate: { values: true } }),
    getSingle<PowersAndDuties>("powers-and-duties", locale, { populate: { duties: true, legalBasis: { populate: documentPopulate } } }),
    getSingle<OrganizationalStructure>("organizational-structure", locale, {
      populate: { chartImage: true, chartPdf: true, directorates: { sort: ["order:asc"], populate: { head: { fields: ["fullName", "position"], populate: { photo: true } }, sector: { fields: ["name", "slug"] } } } },
    }),
    getSingle<MinisterMessage>("minister-message", locale, { populate: { photo: true, official: { populate: { photo: true } } } }),
    getCollection<Official>("officials", locale, { filters: { isCurrent: { $eq: true } }, sort: ["order:asc", "fullName:asc"], populate: { photo: true }, pagination: { pageSize: 30 } }),
  ]);

  const sections = [
    { id: "minister", label: dict.nav.ministerMessage, icon: Quote, show: !!minister },
    { id: "vision", label: dict.nav.visionMission, icon: Target, show: true },
    { id: "powers", label: dict.nav.powers, icon: Scale, show: true },
    { id: "structure", label: dict.nav.structure, icon: Network, show: true },
    { id: "leadership", label: dict.nav.leadership, icon: Users, show: true },
  ].filter((s) => s.show);
  const chartPdf = mediaUrl(structure?.chartPdf?.url);
  const leaders = officials.data;
  const [top, ...restLeaders] = leaders;

  return (
    <>
      <PageHero theme="general" title={dict.pages.about.title} subtitle={dict.pages.about.text} eyebrow={dict.site.name} homeHref={`/${locale}`} homeLabel={dict.nav.home} breadcrumbLabel={dict.common.breadcrumb} crumbs={[{ label: dict.nav.about }]} />

      {/* In-page navigation */}
      <nav aria-label={dict.common.onThisPage} className="sticky top-[75px] z-30 border-b border-ink-100 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/90">
        <ul className="container-page flex gap-1 overflow-x-auto py-3">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink-600 transition hover:bg-brand-50 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-white/5">
                <s.icon className="h-4 w-4" aria-hidden />
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {minister && (
        <section id="minister" className="container-page scroll-mt-40 py-20" aria-labelledby="minister-h">
          <Reveal className="grid items-center gap-12 lg:grid-cols-[400px_1fr]">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-4 rotate-3 rounded-[2rem] bg-gradient-to-br from-brand-500 to-gold-500 opacity-20" aria-hidden />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
                <StrapiImage media={minister.photo ?? minister.official?.photo} sizes="400px" className="object-top" alt={minister.ministerName ?? ""} fallback={{ seed: "admin-1", theme: "admin" }} />
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">{dict.nav.ministerMessage}</p>
              <h2 id="minister-h" className="text-3xl font-bold sm:text-4xl">
                {minister.title || dict.nav.ministerMessage}
              </h2>
              <blockquote className="mt-6 border-l-4 border-gold-500 pl-6 text-lg leading-relaxed text-ink-600 dark:text-ink-300">{blocksToText(minister.message, 520)}</blockquote>
              <p className="mt-6 font-display text-lg font-bold">{minister.ministerName || minister.official?.fullName}</p>
              <p className="text-sm text-ink-500">{dict.positions.minister}</p>
              <Link href={`/${locale}/about/minister-message`} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline dark:text-brand-300">
                {dict.home.readFullMessage}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* Vision / Mission / Values */}
      <section id="vision" className="scroll-mt-40 bg-ink-50/70 py-20 dark:bg-white/[0.02]" aria-labelledby="vision-h">
        <div className="container-page">
          <Reveal className="mb-10">
            <p className="eyebrow mb-3">{dict.site.short}</p>
            <h2 id="vision-h" className="text-3xl font-bold sm:text-4xl">
              {dict.nav.visionMission}
            </h2>
          </Reveal>
          {vmv ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { title: dict.pages.vision, icon: Eye, body: vmv.vision },
                  { title: dict.pages.mission, icon: Compass, body: vmv.mission },
                ].map((c, i) => (
                  <Reveal key={c.title} delay={i * 0.1} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-ink-900 p-8 text-white shadow-lift sm:p-10">
                    <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
                    <c.icon className="relative mb-5 h-10 w-10 text-gold-400" aria-hidden />
                    <h3 className="relative text-2xl font-bold text-white">{c.title}</h3>
                    <BlocksRenderer content={c.body} className="relative mt-4 prose-invert [&_li]:text-white/85 [&_li]:marker:text-gold-400 [&_p]:text-white/85 [&_strong]:text-white" />
                  </Reveal>
                ))}
              </div>
              {!!vmv.values?.length && (
                <div className="mt-12">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                    <Gem className="h-5 w-5 text-brand-600" aria-hidden />
                    {dict.pages.values}
                  </h3>
                  <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {vmv.values.map((v, i) => (
                      <RevealItem key={v.id ?? i} className="h-full">
                        <div className="card h-full p-6">
                          <span className="font-display text-3xl font-extrabold text-brand-200 dark:text-brand-800">{String(i + 1).padStart(2, "0")}</span>
                          <h4 className="mt-2 text-lg font-semibold">{v.title}</h4>
                          {v.description && <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">{v.description}</p>}
                        </div>
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </div>
              )}
              {hasBlocks(vmv.establishmentHistory) && (
                <Reveal className="mt-12 rounded-3xl border border-ink-100 bg-white p-8 sm:p-10 dark:border-white/10 dark:bg-ink-900">
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                    <History className="h-5 w-5 text-brand-600" aria-hidden />
                    {dict.pages.history}
                  </h3>
                  <BlocksRenderer content={vmv.establishmentHistory} />
                </Reveal>
              )}
            </>
          ) : (
            <EmptyState title={dict.common.contentComingSoon} />
          )}
        </div>
      </section>

      {/* Powers & duties */}
      <section id="powers" className="container-page scroll-mt-40 py-20" aria-labelledby="powers-h">
        <Reveal className="mb-10 max-w-3xl">
          <p className="eyebrow mb-3">{dict.pages.legalBasis}</p>
          <h2 id="powers-h" className="text-3xl font-bold sm:text-4xl">
            {dict.pages.duties}
          </h2>
          {powers?.intro && <BlocksRenderer content={powers.intro} className="mt-4" />}
        </Reveal>
        {powers?.duties?.length ? (
          <ol className="grid gap-4 md:grid-cols-2">
            {powers.duties.map((d, i) => (
              <Reveal as="li" key={d.id ?? i} delay={Math.min(i, 6) * 0.04} className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{d.title}</h3>
                  {d.description && <BlocksRenderer content={d.description} className="prose-base mt-1 text-ink-500" />}
                </div>
              </Reveal>
            ))}
          </ol>
        ) : (
          <EmptyState title={dict.common.contentComingSoon} />
        )}
        {!!powers?.legalBasis?.length && (
          <div className="mt-10">
            <h3 className="mb-4 text-xl font-bold">{dict.pages.legalBasis}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {powers.legalBasis.map((doc) => (
                <DocumentCard key={doc.documentId} doc={doc} locale={locale} dict={dict} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Organizational structure */}
      <section id="structure" className="scroll-mt-40 bg-ink-50/70 py-20 dark:bg-white/[0.02]" aria-labelledby="structure-h">
        <div className="container-page">
          <Reveal className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="eyebrow mb-3">{dict.site.short}</p>
              <h2 id="structure-h" className="text-3xl font-bold sm:text-4xl">
                {dict.pages.structure}
              </h2>
              {structure?.description && <BlocksRenderer content={structure.description} className="mt-4" />}
            </div>
            {chartPdf && (
              <a href={chartPdf} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                <Download className="h-4 w-4" aria-hidden />
                {dict.pages.viewChart}
              </a>
            )}
          </Reveal>
          {structure?.chartImage && (
            <Reveal className="mb-12 rounded-3xl border border-ink-100 bg-white p-4 shadow-card dark:border-white/10 dark:bg-ink-900">
              <Gallery images={[structure.chartImage]} className="!grid-cols-1 [&_button]:!aspect-[16/9] [&_img]:!object-contain" />
            </Reveal>
          )}
          {structure?.directorates?.length ? (
            <>
              <h3 className="mb-5 text-xl font-bold">{dict.pages.directorates}</h3>
              <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {structure.directorates.map((d) => (
                  <RevealItem key={d.documentId} className="h-full">
                    <div className="card flex h-full items-start gap-4 p-5">
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-brand-600 dark:bg-white/5">
                        <StrapiImage media={d.head?.photo} sizes="48px" compact />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold">{d.name}</h4>
                        {d.head && <p className="text-sm text-ink-500">{d.head.fullName}</p>}
                        {d.sector && (
                          <Link href={`/${locale}/sectors/${d.sector.slug}`} className="mt-2 inline-block rounded-full bg-ink-50 px-2.5 py-0.5 text-xs text-ink-600 hover:text-brand-700 dark:bg-white/5 dark:text-ink-300">
                            {d.sector.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          ) : !structure?.chartImage ? (
            <EmptyState title={dict.common.contentComingSoon} />
          ) : null}
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="container-page scroll-mt-40 py-20" aria-labelledby="lead-h">
        <Reveal className="mb-10">
          <p className="eyebrow mb-3">{dict.site.short}</p>
          <h2 id="lead-h" className="text-3xl font-bold sm:text-4xl">
            {dict.pages.leadership}
          </h2>
        </Reveal>
        {leaders.length ? (
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[top, ...restLeaders].map((o) => (
              <RevealItem key={o.documentId}>
                <article className="group text-center">
                  <div className="relative mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100 to-ink-100 dark:from-white/5 dark:to-white/10">
                    <StrapiImage media={o.photo} sizes="260px" className="object-top transition duration-500 group-hover:scale-105" alt={o.fullName} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{o.fullName}</h3>
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{dict.positions[o.position]}</p>
                  {o.email && (
                    <a href={`mailto:${o.email}`} className="mt-1 inline-block text-sm text-ink-500 hover:text-brand-700">
                      {o.email}
                    </a>
                  )}
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <EmptyState icon={Users} title={dict.common.contentComingSoon} />
        )}
      </section>
    </>
  );
}
