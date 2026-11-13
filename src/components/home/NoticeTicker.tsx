import Link from "next/link";
import { BellRing, ChevronRight } from "lucide-react";

export interface TickerItem {
  label: string;
  href: string;
  urgent?: boolean;
}

/** Scrolling announcements band (pauses on hover/focus; static list when motion is reduced). */
export function NoticeTicker({ items, badge, allHref, allLabel }: { items: TickerItem[]; badge: string; allHref: string; allLabel: string }) {
  if (!items.length) return null;
  const loop = items.length < 4 ? [...items, ...items, ...items] : items;
  return (
    <div className="relative z-10 border-b border-white/10 bg-ink-900 text-white">
      <div className="container-page flex h-14 items-center gap-4">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold-500 px-3 py-1.5 text-xs font-bold tracking-wider text-ink-950 uppercase">
          <BellRing className="h-4 w-4" aria-hidden />
          {badge}
        </span>
        <div className="mask-fade-x group relative flex-1 overflow-hidden">
          <ul className="flex w-max animate-ticker gap-10 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ ["--marquee-duration" as string]: `${Math.max(30, loop.length * 9)}s` }}>
            {[...loop, ...loop].map((item, i) => (
              <li key={`${item.href}-${i}`} className="flex items-center gap-3 whitespace-nowrap" aria-hidden={i >= loop.length || undefined}>
                <span className={item.urgent ? "h-2 w-2 animate-pulse rounded-full bg-red-500" : "h-1.5 w-1.5 rounded-full bg-brand-400"} aria-hidden />
                <Link href={item.href} tabIndex={i >= loop.length ? -1 : undefined} className="text-sm text-white/85 hover:text-gold-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href={allHref} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-gold-400 hover:text-gold-300 sm:inline-flex">
          {allLabel}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
