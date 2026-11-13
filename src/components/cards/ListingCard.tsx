import Link from "next/link";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Countdown } from "@/components/ui/Countdown";
import { cn } from "@/lib/utils";

export interface ListingMeta {
  icon: LucideIcon;
  label: string;
}

interface Props {
  href: string;
  external?: boolean;
  title: string;
  excerpt?: string | null;
  icon: LucideIcon;
  badges?: { label: string; tone: Tone; dot?: boolean }[];
  meta?: ListingMeta[];
  deadline?: string | null;
  closed?: boolean;
  cta?: string;
  accent?: "brand" | "red" | "amber";
}

/** Shared row card for notices, vacancies, calls, trainings, bids and press releases. */
export function ListingCard({ href, external, title, excerpt, icon: Icon, badges = [], meta = [], deadline, closed, cta, accent = "brand" }: Props) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-l-2xl transition-all duration-300 group-hover:w-1.5",
          accent === "red" ? "bg-red-500" : accent === "amber" ? "bg-gold-500" : "bg-brand-500",
        )}
        aria-hidden
      />
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-white/5 dark:text-brand-300">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        {(badges.length > 0 || deadline) && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {badges.map((b) => (
              <Badge key={b.label} tone={b.tone} dot={b.dot}>
                {b.label}
              </Badge>
            ))}
            {deadline && <Countdown date={deadline} closed={closed} />}
          </div>
        )}
        <h3 className="text-[17px] leading-snug font-semibold text-ink-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{title}</h3>
        {excerpt && <p className="mt-1.5 line-clamp-2 text-[15px] text-ink-500 dark:text-ink-300">{excerpt}</p>}
        {meta.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-500 dark:text-ink-400">
            {meta.map((m) => (
              <li key={m.label} className="inline-flex items-center gap-1.5">
                <m.icon className="h-4 w-4 text-ink-400" aria-hidden />
                {m.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 self-center text-sm font-semibold text-brand-700 sm:inline-flex dark:text-brand-300">
        {cta}
        <Arrow className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </>
  );
  const cls = "group relative flex gap-5 rounded-2xl border border-ink-100 bg-white p-5 pl-6 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift sm:p-6 sm:pl-7 dark:border-white/10 dark:bg-ink-900";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
