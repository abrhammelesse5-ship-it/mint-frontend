"use client";

import Image from "next/image";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { NavGlyph } from "@/components/layout/NavIcons";
import { mediaUrl } from "@/lib/media";
import type { Stat } from "@/lib/types";
import { cn } from "@/lib/utils";

function parse(value: string) {
  const m = value.match(/^(\D*?)([\d][\d,.]*)(.*)$/);
  if (!m) return null;
  const num = Number(m[2].replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return { prefix: m[1], num, suffix: m[3], decimals, grouped: m[2].includes(",") };
}

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const parsed = parse(value);
  // Starts with the real value (no-JS, crawlers, screenshots); counts up from 0 once scrolled into view.
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!parsed || !inView) return;
    const fmt = (n: number) => {
      const fixed = n.toFixed(parsed.decimals);
      const body = parsed.grouped || n >= 10000 ? Number(fixed).toLocaleString("en-US", { minimumFractionDigits: parsed.decimals }) : fixed;
      return `${parsed.prefix}${body}${parsed.suffix}`;
    };
    if (reduce) return;
    const controls = animate(0, parsed.num, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setDisplay(fmt(v)) });
    return () => {
      controls.stop();
      setDisplay(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums" aria-label={value}>
      <span aria-hidden>{reduce || !parsed || display === null ? value : display}</span>
    </span>
  );
}

function StatIcon({ label }: { label: string }) {
  return <NavGlyph link={{ label }} className="h-5 w-5" />;
}

/** Animated statistics (counts up when scrolled into view). */
export function StatsCounter({ stats, variant = "light" }: { stats: Stat[]; variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <dl className={cn("grid grid-cols-2 gap-6 lg:gap-8", stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {stats.map((s, i) => {
        const icon = mediaUrl(s.icon?.url);
        return (
          <div key={s.id ?? i} className={cn("relative flex flex-col gap-3", dark ? "text-white" : "")}>
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", dark ? "bg-white/10 text-gold-400" : "bg-brand-50 text-brand-600")}>
              {icon ? <Image src={icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" /> : <StatIcon label={s.label} />}
            </div>
            <dt className={cn("order-last text-sm font-medium", dark ? "text-white/70" : "text-ink-500")}>{s.label}</dt>
            <dd className={cn("font-display text-4xl font-bold tracking-tight sm:text-5xl", dark ? "text-white" : "text-ink-900 dark:text-white")}>
              <Counter value={s.value} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
