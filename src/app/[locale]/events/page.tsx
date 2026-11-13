import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { ctx, readSearch } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import type { EventItem } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/events", title: dict.pages.events.title, description: dict.pages.events.text });
}

export default async function EventsPage({ params, searchParams }: PageProps<"/[locale]/events">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const now = new Date().toISOString().slice(0, 10);
  const [upcoming, past] = await Promise.all([
    getCollection<EventItem>("events", locale, { filters: { startDate: { $gte: now } }, sort: ["startDate:asc"], populate: { coverImage: true }, pagination: { pageSize: 12 } }),
    getCollection<EventItem>("events", locale, { filters: { startDate: { $lt: now } }, sort: ["startDate:desc"], populate: { coverImage: true }, pagination: { page: s.page, pageSize: 9 } }),
  ]);
  return (
    <ListShell theme="events"
      locale={locale}
      dict={dict}
      title={dict.pages.events.title}
      text={dict.pages.events.text}
      eyebrow={dict.nav.media}
      crumbs={[{ label: dict.nav.media, href: `/${locale}/media` }, { label: dict.nav.events }]}
      pagination={{ page: past.pagination.page, pageCount: past.pagination.pageCount, basePath: `/${locale}/events` }}
    >
      <section aria-labelledby="up-h">
        <h2 id="up-h" className="mb-6 flex items-center gap-3 text-2xl font-bold">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          {dict.pages.upcoming}
        </h2>
        {upcoming.data.length ? (
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.data.map((e) => (
              <RevealItem key={e.documentId}>
                <EventCard event={e} locale={locale} dict={dict} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <EmptyState icon={CalendarDays} title={dict.home.noEvents} className="py-12" />
        )}
      </section>
      {past.data.length > 0 && (
        <section aria-labelledby="past-h" className="mt-16">
          <h2 id="past-h" className="mb-6 text-2xl font-bold">
            {dict.pages.pastEvents}
          </h2>
          <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {past.data.map((e) => (
              <RevealItem key={e.documentId}>
                <EventCard event={e} locale={locale} dict={dict} variant="row" />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}
    </ListShell>
  );
}
