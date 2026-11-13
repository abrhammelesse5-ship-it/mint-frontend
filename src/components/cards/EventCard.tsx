import Link from "next/link";
import { MapPin, MonitorPlay, Clock } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { EventItem } from "@/lib/types";
import { dateBadge, formatDate, formatTime } from "@/lib/format";
import { StrapiImage } from "@/components/ui/StrapiImage";

export function EventCard({ event, locale, dict, variant = "card" }: { event: EventItem; locale: Locale; dict: Dictionary; variant?: "card" | "row" }) {
  const badge = dateBadge(event.startDate, locale);
  const href = `/${locale}/events/${event.slug}`;
  const meta = (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500 dark:text-ink-400">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-brand-500" aria-hidden />
        {formatDate(event.startDate, locale, "medium")} · {formatTime(event.startDate, locale)}
      </span>
      {(event.location || event.isOnline) && (
        <span className="inline-flex items-center gap-1.5">
          {event.isOnline ? <MonitorPlay className="h-4 w-4 text-brand-500" aria-hidden /> : <MapPin className="h-4 w-4 text-brand-500" aria-hidden />}
          {event.isOnline ? dict.common.online : event.location}
        </span>
      )}
    </div>
  );
  const dateBox = badge && (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shadow-brand-900/20">
      <span className="font-display text-2xl leading-none font-bold">{badge.day}</span>
      <span className="mt-0.5 text-[11px] font-semibold tracking-wide uppercase">{badge.month}</span>
    </div>
  );

  if (variant === "row") {
    return (
      <Link href={href} className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-brand-200 hover:shadow-card dark:border-white/10 dark:bg-ink-900">
        {dateBox}
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">{event.title}</h3>
          {meta}
        </div>
      </Link>
    );
  }
  return (
    <Link href={href} className="card card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <StrapiImage media={event.coverImage} sizes="(min-width:1024px) 33vw, 100vw" fallback={{ seed: event.slug, text: `${event.title} event` }} className="transition duration-700 group-hover:scale-105" />
        <div className="absolute top-4 left-4">{dateBox}</div>
      </div>
      <div className="p-6">
        <h3 className="line-clamp-2 text-lg font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">{event.title}</h3>
        {meta}
      </div>
    </Link>
  );
}
