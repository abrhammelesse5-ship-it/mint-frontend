import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Gavel, GraduationCap, Lightbulb, Quote, ArrowUpRight, Wrench } from "lucide-react";
import { asLocale, localizeHref, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { getCollection, getSingle } from "@/lib/strapi";
import { homePopulate, newsCardPopulate, sectorCardPopulate } from "@/lib/populate";
import { mediaUrl } from "@/lib/media";
import { HERO_IMAGES, realMedia } from "@/lib/fallback-images";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { isExternalUrl } from "@/lib/utils";
import type {
  AffiliatedInstitution, ConceptNoteCall, EventItem, HeroSlide, HomePage, MinisterMessage, News, Notice, OfficialDocument, Sector, Stat, SystemApp, TrainingAnnouncement, Vacancy, BidLink,
} from "@/lib/types";
import { HeroSlider, type HeroSlideView } from "@/components/home/HeroSlider";
import { NoticeTicker } from "@/components/home/NoticeTicker";
import { FocusAreas } from "@/components/home/FocusAreas";
import { StatsCounter } from "@/components/home/StatsCounter";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { NewsCard } from "@/components/cards/NewsCard";
import { SectorCard } from "@/components/cards/SectorCard";
import { EventCard } from "@/components/cards/EventCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { Badge } from "@/components/ui/Badge";
import { blocksToText } from "@/components/blocks/BlocksRenderer";
import { NavGlyph } from "@/components/layout/NavIcons";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const home = await getSingle<HomePage>("home-page", locale, { populate: { seo: { populate: { shareImage: true } } } });
  return buildMetadata({ locale, path: "", seo: home?.seo });
}

const today = () => new Date().toISOString().slice(0, 10);

async function loadHome(locale: Locale) {
  const now = today();
  const [home, slides, news, featured, notices, events, minister, sectors, institutions, systems, vacancies, calls, trainings, bids, docCount] = await Promise.all([
    getSingle<HomePage>("home-page", locale, { populate: homePopulate }),
    getCollection<HeroSlide>("hero-slides", locale, { filters: { isActive: { $eq: true } }, sort: ["order:asc"], populate: { image: true, link: true }, pagination: { pageSize: 8 } }),
    getCollection<News>("news-items", locale, { sort: ["publishDate:desc", "publishedAt:desc"], populate: newsCardPopulate, pagination: { pageSize: 7 } }),
    getCollection<News>("news-items", locale, { filters: { isFeatured: { $eq: true } }, sort: ["publishDate:desc"], populate: newsCardPopulate, pagination: { pageSize: 1 } }),
    getCollection<Notice>("notices", locale, {
      filters: { $or: [{ expiryDate: { $null: true } }, { expiryDate: { $gte: now } }] },
      sort: ["publishDate:desc"],
      fields: ["title", "slug", "priority", "publishDate"],
      pagination: { pageSize: 8 },
    }),
    getCollection<EventItem>("events", locale, { filters: { startDate: { $gte: now } }, sort: ["startDate:asc"], populate: { coverImage: true }, pagination: { pageSize: 3 } }),
    getSingle<MinisterMessage>("minister-message", locale, { populate: { photo: true, official: { populate: { photo: true } } } }),
    getCollection<Sector>("sectors", locale, { filters: { parentSector: { $null: true } }, sort: ["order:asc"], populate: sectorCardPopulate, pagination: { pageSize: 6 } }),
    getCollection<AffiliatedInstitution>("affiliated-institutions", locale, { sort: ["order:asc", "name:asc"], populate: { logo: true }, pagination: { pageSize: 30 } }),
    getCollection<SystemApp>("system-apps", locale, { filters: { systemStatus: { $ne: "retired" } }, sort: ["type:asc", "name:asc"], populate: { logo: true }, pagination: { pageSize: 6 } }),
    getCollection<Vacancy>("vacancies", locale, { filters: { vacancyStatus: { $eq: "open" } }, fields: ["title"], pagination: { pageSize: 1 } }),
    getCollection<ConceptNoteCall>("concept-note-calls", locale, { filters: { callStatus: { $eq: "open" } }, fields: ["title"], pagination: { pageSize: 1 } }),
    getCollection<TrainingAnnouncement>("training-announcements", locale, { fields: ["title"], pagination: { pageSize: 1 } }),
    getCollection<BidLink>("bid-links", locale, { filters: { $or: [{ closingDate: { $null: true } }, { closingDate: { $gte: now } }] }, fields: ["title"], pagination: { pageSize: 1 } }),
    getCollection<OfficialDocument>("documents", locale, { fields: ["title"], pagination: { pageSize: 1 } }),
  ]);
  return { home, slides, news, featured, notices, events, minister, sectors, institutions, systems, vacancies, calls, trainings, bids, docCount };
}

export default async function HomePageRoute({ params }: PageProps<"/[locale]">) {
  const locale = asLocale((await params).locale);
  const dict = getDictionary(locale);
  const d = await loadHome(locale);
  const L = (p: string) => localizeHref(p, locale);

  /* Hero */
  const heroSource = d.home?.heroSlides?.filter((s) => s.isActive !== false).length ? d.home.heroSlides!.filter((s) => s.isActive !== false) : d.slides.data;
  const heroBgs = [HERO_IMAGES.ministry, HERO_IMAGES.innovation, HERO_IMAGES.connectivity, HERO_IMAGES.datacenter];
  const exploreLink = { label: dict.home.exploreSectors, href: L("/sectors"), external: false, newTab: false };
  const slides: HeroSlideView[] = heroSource.length
    ? heroSource.map((s, i) => {
        const img = realMedia(s.image);
        return {
          id: s.documentId,
          title: s.title,
          subtitle: s.subtitle || (i === 0 ? dict.home.heroSubtitle : null),
          // Real slide photo, else a photo of the Ministry's work (never the logo).
          image: img ? mediaUrl(img.formats?.large?.url || img.url) : heroBgs[i % heroBgs.length],
          link: s.link?.url
            ? { label: s.link.label, href: isExternalUrl(s.link.url) ? s.link.url : L(s.link.url), external: !!s.link.isExternal || isExternalUrl(s.link.url), newTab: !!s.link.openInNewTab }
            : exploreLink,
        };
      })
    : dict.home.defaultSlides.map((s, i) => ({ id: `default-${i}`, title: s.title, subtitle: s.subtitle, image: heroBgs[i % heroBgs.length], link: exploreLink }));

  /* News: featured first */
  const featured = d.home?.featuredNews?.[0] ?? d.featured.data[0] ?? d.news.data[0];
  const others = d.news.data.filter((n) => n.documentId !== featured?.documentId).slice(0, 4);

  const sectors = d.home?.highlightedSectors?.length ? d.home.highlightedSectors : d.sectors.data;
  const institutions = d.home?.affiliatedInstitutions?.length ? d.home.affiliatedInstitutions : d.institutions.data;
  const focus = d.home?.focusAreas?.length ? d.home.focusAreas : dict.home.defaultFocus;
  const stats: Stat[] = d.home?.stats?.stats?.length
    ? d.home.stats.stats
    : [
        { label: dict.home.liveStats.news, value: String(d.news.pagination.total) },
        { label: dict.home.liveStats.documents, value: String(d.docCount.pagination.total) },
        { label: dict.home.liveStats.institutions, value: String(d.institutions.pagination.total) },
        { label: dict.home.liveStats.systems, value: String(d.systems.pagination.total) },
      ].filter((s) => s.value !== "0");

  const ticker = d.notices.data.map((n) => ({ label: n.title, href: L(`/notices/${n.slug}`), urgent: n.priority === "urgent" }));

  return (
    <>
      <HeroSlider slides={slides} secondary={{ label: dict.nav.about, href: L("/about") }} functions={dict.home.heroFunctions} functionsTitle={dict.home.whatWeDo} />
      <NoticeTicker items={ticker} badge={dict.home.announcementsBadge} allHref={L("/announcements")} allLabel={dict.common.viewAll} />

      {/* Minister message + focus areas */}
      <Section labelledBy="focus-heading" className="overflow-hidden">
        <div className="bg-dots pointer-events-none absolute -top-10 right-0 h-64 w-64 opacity-60" aria-hidden />
        {d.minister && <MinisterTeaser minister={d.minister} locale={locale} dict={dict} />}
        <SectionHeading id="focus-heading" eyebrow={dict.site.short} title={dict.home.focusAreas} subtitle={dict.home.focusAreasSub} />
        <FocusAreas items={focus} defaults={dict.home.defaultFocus} />
      </Section>

      {/* Stats */}
      {stats.length > 0 && (
        <section aria-labelledby="stats-heading" className="relative overflow-hidden bg-ink-950 py-20 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-ink-950 to-ink-950" aria-hidden />
          <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
          <div className="container-page relative grid gap-12 lg:grid-cols-[1fr_2.2fr] lg:items-center">
            <Reveal>
              <p className="eyebrow mb-3 text-gold-400 dark:text-gold-400">{dict.site.short}</p>
              <h2 id="stats-heading" className="text-3xl font-bold text-white sm:text-4xl">
                {d.home?.stats?.heading || dict.home.statsTitle}
              </h2>
            </Reveal>
            <StatsCounter stats={stats} variant="dark" />
          </div>
        </section>
      )}

      {/* Sectors */}
      <Section tone="muted" labelledBy="sectors-heading">
        <SectionHeading id="sectors-heading" eyebrow={dict.nav.sectors} title={dict.home.sectorsTitle} subtitle={dict.home.sectorsSub} action={{ href: L("/sectors"), label: dict.nav.allSectors }} />
        {sectors.length ? (
          <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sectors.map((s) => (
              <RevealItem key={s.documentId}>
                <SectorCard sector={s} locale={locale} subLabel={dict.pages.subSectors} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <EmptyState title={dict.empty.title} text={dict.empty.text} />
        )}
      </Section>

      {/* News */}
      <Section labelledBy="news-heading">
        <SectionHeading id="news-heading" eyebrow={dict.nav.media} title={dict.home.latestNews} subtitle={dict.home.latestNewsSub} action={{ href: L("/news"), label: dict.common.viewAll }} />
        {featured ? (
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
            <Reveal from="left">
              <NewsCard item={featured} locale={locale} variant="featured" featuredLabel={dict.home.featured} />
            </Reveal>
            <Reveal from="right" className="flex flex-col gap-2">
              {others.map((n) => (
                <NewsCard key={n.documentId} item={n} locale={locale} variant="compact" />
              ))}
              <Link href={L("/news")} className="mt-2 inline-flex items-center gap-2 self-start rounded-full px-2 py-1 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">
                {dict.common.viewAll} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        ) : (
          <EmptyState title={dict.empty.title} text={dict.empty.text} />
        )}
      </Section>

      {/* Events + notices + opportunities */}
      <Section tone="muted" labelledBy="events-heading">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="events-heading" eyebrow={dict.nav.events} title={dict.home.eventsTitle} action={{ href: L("/events"), label: dict.common.viewAll }} className="mb-8 md:mb-8" />
            {d.events.data.length ? (
              <RevealGroup className="space-y-3">
                {d.events.data.map((e) => (
                  <RevealItem key={e.documentId}>
                    <EventCard event={e} locale={locale} dict={dict} variant="row" />
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : (
              <EmptyState icon={CalendarDays} title={dict.home.noEvents} className="py-12" />
            )}
          </div>
          <div>
            <SectionHeading eyebrow={dict.nav.announcements} title={dict.home.noticesTitle} action={{ href: L("/notices"), label: dict.common.viewAll }} className="mb-8 md:mb-8" />
            {d.notices.data.length ? (
              <Reveal className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-ink-900">
                {d.notices.data.slice(0, 5).map((n) => (
                  <Link key={n.documentId} href={L(`/notices/${n.slug}`)} className="group flex items-start gap-4 p-4 transition hover:bg-brand-50/50 dark:hover:bg-white/5">
                    <span className={n.priority === "urgent" ? "mt-2 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-500" : n.priority === "important" ? "mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-500" : "mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-400"} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium text-ink-900 group-hover:text-brand-700 dark:text-white">{n.title}</p>
                      <p className="mt-1 text-xs text-ink-500">{formatDate(n.publishDate || n.publishedAt, locale, "medium")}</p>
                    </div>
                    {n.priority && n.priority !== "normal" && <Badge tone={n.priority === "urgent" ? "red" : "amber"}>{dict.status[n.priority]}</Badge>}
                  </Link>
                ))}
              </Reveal>
            ) : (
              <EmptyState title={dict.empty.title} className="py-12" />
            )}
          </div>
        </div>

        <div className="mt-16">
          <h3 className="mb-6 text-xl font-bold">{dict.home.opportunitiesTitle}</h3>
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BriefcaseBusiness, label: dict.nav.vacancies, count: d.vacancies.pagination.total, href: "/vacancies", sub: dict.home.openNow },
              { icon: Lightbulb, label: dict.nav.conceptNotes, count: d.calls.pagination.total, href: "/concept-notes", sub: dict.home.openNow },
              { icon: GraduationCap, label: dict.nav.trainings, count: d.trainings.pagination.total, href: "/trainings", sub: dict.home.published },
              { icon: Gavel, label: dict.nav.bids, count: d.bids.pagination.total, href: "/bids", sub: dict.home.openNow },
            ].map((o) => (
              <RevealItem key={o.href} className="h-full">
                <Link href={L(o.href)} className="group flex h-full items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift dark:border-white/10 dark:bg-ink-900">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white transition group-hover:bg-gold-500 group-hover:text-ink-950">
                    <o.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink-900 dark:text-white">{o.label}</span>
                    <span className="text-sm text-ink-500">
                      <span className="font-bold text-brand-700 tabular-nums dark:text-brand-300">{o.count}</span> {o.sub}
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* Systems */}
      {d.systems.data.length > 0 && (
        <Section labelledBy="systems-heading">
          <SectionHeading id="systems-heading" eyebrow={dict.nav.systems} title={dict.home.systemsTitle} subtitle={dict.home.systemsSub} action={{ href: L("/systems"), label: dict.common.viewAll }} />
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {d.systems.data.map((s) => {
              const logo = mediaUrl(s.logo?.url);
              return (
                <RevealItem key={s.documentId}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex h-full items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-brand-300 hover:shadow-lift dark:border-white/10 dark:bg-ink-900">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-50 text-brand-600 dark:bg-white/5">
                      {logo ? <Image src={logo} alt="" fill sizes="48px" className="object-contain p-1.5" /> : <SystemIcon name={s.name} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">
                        {s.name}
                        {s.systemStatus === "maintenance" && <Wrench className="h-4 w-4 text-gold-600" aria-label={dict.status.maintenance} />}
                      </span>
                      {s.description && <span className="mt-1 line-clamp-2 block text-sm text-ink-500 dark:text-ink-400">{s.description}</span>}
                    </span>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-300 transition group-hover:text-brand-600" aria-hidden />
                  </a>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Section>
      )}

      {/* Institutions */}
      {institutions.length > 0 && (
        <Section tone="muted" labelledBy="inst-heading" className="overflow-hidden">
          <SectionHeading id="inst-heading" eyebrow={dict.nav.ecosystem} title={dict.home.institutionsTitle} subtitle={dict.home.institutionsSub} align="center" />
          <LogoMarquee items={institutions} />
        </Section>
      )}
    </>
  );
}

function SystemIcon({ name }: { name: string }) {
  return <NavGlyph link={{ label: name }} className="h-6 w-6" />;
}

function MinisterTeaser({ minister, locale, dict }: { minister: MinisterMessage; locale: Locale; dict: Dictionary }) {
  const photo = minister.photo ?? minister.official?.photo;
  const text = blocksToText(minister.message, 360);
  const name = minister.ministerName || minister.official?.fullName;
  return (
    <Reveal className="mb-24">
      <div className="relative grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 text-white shadow-lift lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[380px]">
          <StrapiImage media={photo} sizes="(min-width:1024px) 380px, 100vw" className="object-top" alt={name ?? ""} fallback={{ seed: "admin-1", theme: "admin" }} />
          {<div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-brand-800/30" aria-hidden />}
        </div>
        <div className="relative flex flex-col justify-center p-8 sm:p-12">
          <Quote className="mb-5 h-12 w-12 text-gold-400" aria-hidden />
          <p className="eyebrow mb-3 text-gold-300 dark:text-gold-300">{dict.home.ministerMessage}</p>
          {minister.title && <h2 className="text-2xl font-bold text-white sm:text-3xl">{minister.title}</h2>}
          {text && <p className="mt-4 line-clamp-4 text-lg leading-relaxed text-white/80">{text}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            {name && (
              <div>
                <p className="font-display font-bold text-white">{name}</p>
                <p className="text-sm text-white/65">{dict.positions.minister}</p>
              </div>
            )}
            <Link href={`/${locale}/about/minister-message`} className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-gold-400">
              {dict.home.readFullMessage}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
