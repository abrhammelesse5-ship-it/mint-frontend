import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { ctx, readSearch, searchFilter } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { fill } from "@/i18n/t";
import { navIcons } from "@/components/layout/NavIcons";
import type { NavIcon } from "@/lib/nav-icon";
import { ListShell } from "@/components/ui/ListShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/search">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return { ...buildMetadata({ locale, path: "/search", title: dict.pages.search.title, description: dict.pages.search.text }), robots: { index: false, follow: true } };
}

interface Hit {
  documentId: string;
  title: string;
  slug?: string;
  summary?: string | null;
  description?: string | null;
  publishDate?: string | null;
  startDate?: string | null;
  publishedAt?: string | null;
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[locale]/search">) {
  const { locale, dict } = await ctx(params);
  const { q } = await readSearch(searchParams);
  const term = q?.trim();

  const groups: { key: string; label: string; icon: NavIcon; plural: string; fields: string[]; extra: string[]; date: string; href: (h: Hit) => string; all: string }[] = [
    { key: "news", label: dict.nav.news, icon: "newspaper", plural: "news-items", fields: ["title", "summary"], extra: ["summary", "publishDate"], date: "publishDate", href: (h) => `/news/${h.slug}`, all: "/news" },
    { key: "docs", label: dict.nav.documents, icon: "library", plural: "documents", fields: ["title", "description", "documentNumber"], extra: ["description", "publishDate"], date: "publishDate", href: () => `/resources?q=${encodeURIComponent(term ?? "")}`, all: "/resources" },
    { key: "notices", label: dict.nav.notices, icon: "bell", plural: "notices", fields: ["title"], extra: ["publishDate"], date: "publishDate", href: (h) => `/notices/${h.slug}`, all: "/notices" },
    { key: "press", label: dict.nav.pressReleases, icon: "megaphone", plural: "press-releases", fields: ["title"], extra: ["publishDate"], date: "publishDate", href: (h) => `/press-releases/${h.slug}`, all: "/press-releases" },
    { key: "vac", label: dict.nav.vacancies, icon: "briefcase", plural: "vacancies", fields: ["title", "location"], extra: [], date: "publishedAt", href: (h) => `/vacancies/${h.slug}`, all: "/vacancies" },
    { key: "programs", label: dict.nav.programs, icon: "rocket", plural: "programs", fields: ["title", "description"], extra: ["description", "startDate"], date: "startDate", href: (h) => `/programs/${h.slug}`, all: "/programs" },
    { key: "events", label: dict.nav.events, icon: "calendar", plural: "events", fields: ["title", "location"], extra: ["startDate"], date: "startDate", href: (h) => `/events/${h.slug}`, all: "/events" },
    { key: "calls", label: dict.nav.conceptNotes, icon: "lightbulb", plural: "concept-note-calls", fields: ["title"], extra: [], date: "publishedAt", href: (h) => `/concept-notes/${h.slug}`, all: "/concept-notes" },
    { key: "trainings", label: dict.nav.trainings, icon: "graduation", plural: "training-announcements", fields: ["title"], extra: [], date: "publishedAt", href: (h) => `/trainings/${h.slug}`, all: "/trainings" },
  ];

  const results = term
    ? await Promise.all(
        groups.map(async (g) => {
          const res = await getCollection<Hit>(g.plural, locale, { filters: searchFilter(term, g.fields), fields: ["title", "slug", ...g.extra], sort: ["publishedAt:desc"], pagination: { pageSize: 5 } });
          return { ...g, hits: res.data, total: res.pagination.total };
        }),
      )
    : [];
  const found = results.filter((r) => r.hits.length);
  const total = found.reduce((n, r) => n + r.total, 0);

  return (
    <ListShell theme="general"
      locale={locale}
      dict={dict}
      title={dict.pages.search.title}
      text={dict.pages.search.text}
      crumbs={[{ label: dict.nav.search }]}
      heroChildren={
        <form action={`/${locale}/search`} role="search" className="mt-8 flex max-w-2xl items-center gap-2 rounded-full bg-white p-2 shadow-lift">
          <SearchIcon className="ml-3 h-5 w-5 shrink-0 text-ink-400" aria-hidden />
          <label htmlFor="q" className="sr-only">
            {dict.common.search}
          </label>
          <input id="q" name="q" type="search" defaultValue={term} maxLength={100} placeholder={dict.common.searchPlaceholder} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-ink-900 outline-none placeholder:text-ink-400" />
          <button type="submit" className="rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700">
            {dict.common.search}
          </button>
        </form>
      }
    >
      {!term ? (
        <EmptyState icon={SearchIcon} title={dict.pages.search.text} />
      ) : !found.length ? (
        <EmptyState icon={SearchIcon} title={dict.common.noResults} text={`“${term}”`} />
      ) : (
        <>
          <p className="mb-8 text-ink-500" aria-live="polite">
            {total === 1 ? dict.common.result : fill(dict.common.results, { n: total })} · <strong className="text-ink-900 dark:text-white">“{term}”</strong>
          </p>
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <nav aria-label={dict.pages.searchSections} className="hidden lg:block">
              <ul className="sticky top-28 space-y-1">
                {found.map((r) => (
                  <li key={r.key}>
                    <a href={`#${r.key}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-white/5">
                      {r.label}
                      <span className="rounded-full bg-ink-100 px-2 text-xs dark:bg-white/10">{r.total}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-10">
              {found.map((r) => {
                const Icon = navIcons[r.icon];
                return (
                  <Reveal as="section" key={r.key} className="scroll-mt-28">
                    <h2 id={r.key} className="mb-4 flex items-center gap-3 text-xl font-bold">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-white/5 dark:text-brand-300">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      {r.label}
                      <span className="text-sm font-medium text-ink-400">({r.total})</span>
                    </h2>
                    <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-ink-900">
                      {r.hits.map((h) => {
                        const date = (h as unknown as Record<string, string | null | undefined>)[r.date];
                        const text = h.summary || h.description;
                        return (
                          <li key={h.documentId}>
                            <Link href={`/${locale}${r.href(h)}`} className="group block p-5 transition hover:bg-brand-50/50 dark:hover:bg-white/5">
                              <span className="block font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">{h.title}</span>
                              {text && <span className="mt-1 line-clamp-2 block text-sm text-ink-500 dark:text-ink-300">{text}</span>}
                              {date && <span className="mt-1 block text-xs text-ink-400">{formatDate(date, locale)}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {r.total > r.hits.length && (
                      <Link href={`/${locale}${r.all}?q=${encodeURIComponent(term)}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                        {dict.common.viewAll} <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        </>
      )}
    </ListShell>
  );
}
