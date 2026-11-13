"use client";

import { useSyncExternalStore } from "react";
import { Hourglass, Lock } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { fill } from "@/i18n/t";
import { cn } from "@/lib/utils";

/* A shared 1-second clock; null on the server so markup stays deterministic. */
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
const getSnapshot = () => now || Date.now();
const getServerSnapshot = () => null;

export function endOf(value: string) {
  return new Date(value.length <= 10 ? `${value}T23:59:59+03:00` : value).getTime();
}

/** Closing-date countdown: "12 days left", live HH:MM:SS on the last day, "Closed" afterwards. */
export function Countdown({ date, closed, className, size = "sm" }: { date?: string | null; closed?: boolean; className?: string; size?: "sm" | "lg" }) {
  const { dict } = useI18n();
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!date) return null;
  const end = endOf(date);
  if (Number.isNaN(end)) return null;

  const base = cn(
    "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
    size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-0.5 text-xs",
    className,
  );

  if (current === null) {
    return <span className={cn(base, "bg-ink-50 text-ink-500 ring-ink-200 dark:bg-white/5 dark:ring-white/10")} aria-hidden>…</span>;
  }
  const diff = end - current;
  if (closed || diff <= 0) {
    return (
      <span className={cn(base, "bg-ink-100 text-ink-600 ring-ink-200 dark:bg-white/5 dark:text-ink-300 dark:ring-white/10")}>
        <Lock className="h-3.5 w-3.5" aria-hidden />
        {dict.status.closed}
      </span>
    );
  }
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) {
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      <span className={cn(base, "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300")} role="timer">
        <Hourglass className="h-3.5 w-3.5 animate-pulse" aria-hidden />
        {dict.common.closesToday} · <span className="tabular-nums">{`${pad(h)}:${pad(m)}:${pad(s)}`}</span>
      </span>
    );
  }
  const label = days === 1 ? dict.common.dayLeft : fill(dict.common.daysLeft, { n: days });
  const tone = days <= 3 ? "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300";
  return (
    <span className={cn(base, tone)}>
      <Hourglass className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
