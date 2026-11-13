import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NavLink } from "@/lib/navigation";
import { iconFor } from "@/components/layout/NavIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/config";

/** Large icon tiles linking to the sub-sections of a hub page, with optional item counts. */
export function HubTiles({ links, counts = {}, locale, countLabel, countLabelOne }: { links: NavLink[]; counts?: Record<string, number | { n: number; label: string } | undefined>; locale: Locale; countLabel: string; countLabelOne?: string }) {
  return (
    <RevealGroup className="relative z-10 -mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((l) => {
        const Icon = iconFor(l);
        const raw = counts[l.href];
        const count = typeof raw === "number" ? raw : raw?.n;
        const label = typeof raw === "object" ? raw.label : count === 1 && countLabelOne ? countLabelOne : countLabel;
        return (
          <RevealItem key={l.href} className="h-full">
            <Link href={l.href} className="card card-hover group relative flex h-full flex-col overflow-hidden p-7">
              <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand-500/5 transition-transform duration-500 group-hover:scale-150" aria-hidden />
              <span className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/25 transition-transform duration-300 group-hover:-rotate-6">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="relative text-xl font-bold text-ink-900 dark:text-white">{l.label}</h2>
              {l.description && <p className="relative mt-2 text-[15px] text-ink-500 dark:text-ink-300">{l.description}</p>}
              <span className="relative mt-auto flex items-center justify-between pt-6 text-sm font-semibold text-brand-700 dark:text-brand-300">
                {typeof count === "number" ? (
                  <span className="text-ink-500 dark:text-ink-400">
                    <strong className="font-display text-lg text-ink-900 dark:text-white">{formatNumber(count, locale)}</strong> {label}
                  </span>
                ) : (
                  <span />
                )}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
