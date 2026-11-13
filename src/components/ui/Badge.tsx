import { cn } from "@/lib/utils";

export type Tone = "brand" | "green" | "amber" | "red" | "gray" | "blue" | "gold";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-600/15 dark:bg-brand-500/10 dark:text-brand-300",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-300",
  gray: "bg-ink-50 text-ink-600 ring-ink-500/15 dark:bg-white/5 dark:text-ink-300",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300",
  gold: "bg-gold-500 text-ink-950 ring-gold-600/30",
};

export function Badge({ children, tone = "brand", className, dot }: { children: React.ReactNode; tone?: Tone; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
