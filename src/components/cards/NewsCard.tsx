import Link from "next/link";
import { ArrowUpRight, CalendarDays, Eye } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { News } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/format";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { Badge } from "@/components/ui/Badge";
import { cn, truncate } from "@/lib/utils";
import type { FallbackSpec } from "@/lib/fallback-images";

interface Props {
  item: News;
  locale: Locale;
  variant?: "default" | "featured" | "compact";
  featuredLabel?: string;
  viewsLabel?: string;
  priority?: boolean;
}

export function NewsCard({ item, locale, variant = "default", featuredLabel, viewsLabel, priority }: Props) {
  const href = `/${locale}/news/${item.slug}`;
  const date = formatDate(item.publishDate || item.publishedAt, locale);
  const fb: FallbackSpec = { seed: item.slug || item.documentId, text: [item.title, item.summary, item.category?.name] };

  if (variant === "featured") {
    return (
      <Link href={href} className="group relative isolate flex min-h-[440px] flex-col justify-end overflow-hidden rounded-3xl bg-ink-900 p-7 text-white shadow-card sm:p-9 lg:h-full">
        <StrapiImage media={item.coverImage} priority={priority} sizes="(min-width:1024px) 60vw, 100vw" fallback={fb} className="-z-20 transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/0" />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {featuredLabel && <Badge tone="gold">{featuredLabel}</Badge>}
          {item.category && <Badge tone="brand" className="bg-white/15 text-white ring-white/20">{item.category.name}</Badge>}
        </div>
        <h3 className="max-w-2xl text-2xl leading-snug font-bold text-white sm:text-3xl">{item.title}</h3>
        {item.summary && <p className="mt-3 line-clamp-2 max-w-2xl text-white/75">{item.summary}</p>}
        <div className="mt-5 flex items-center gap-4 text-sm text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {date}
          </span>
          <span className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-gold-500 group-hover:text-ink-950">
            <ArrowUpRight className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group flex gap-4 rounded-2xl p-2 transition hover:bg-ink-50 dark:hover:bg-white/5">
        <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:w-32">
          <StrapiImage media={item.coverImage} sizes="128px" fallback={fb} className="transition duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0 py-1">
          {item.category && <p className="mb-1 text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300">{item.category.name}</p>}
          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">{item.title}</h3>
          <p className="mt-1.5 text-xs text-ink-500">{date}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="card card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <StrapiImage media={item.coverImage} priority={priority} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" fallback={fb} className="transition duration-700 group-hover:scale-105" />
        {item.category && (
          <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-800 shadow-sm backdrop-blur dark:bg-ink-950/80 dark:text-white">{item.category.name}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-xs font-medium text-ink-500 dark:text-ink-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {date}
          </span>
          {viewsLabel && !!item.viewCount && (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              {formatNumber(item.viewCount, locale)} {viewsLabel}
            </span>
          )}
        </div>
        <h3 className={cn("line-clamp-2 text-lg leading-snug font-semibold text-ink-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300")}>{item.title}</h3>
        {item.summary && <p className="mt-2 line-clamp-3 text-[15px] text-ink-500 dark:text-ink-300">{truncate(item.summary, 180)}</p>}
      </div>
    </Link>
  );
}
