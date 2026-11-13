import { cn } from "@/lib/utils";

export function Section({ children, className, tone = "white", id, labelledBy }: { children: React.ReactNode; className?: string; tone?: "white" | "muted" | "dark"; id?: string; labelledBy?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative py-20 sm:py-24",
        tone === "muted" && "bg-ink-50/70 dark:bg-white/[0.02]",
        tone === "dark" && "bg-ink-950 text-white",
        className,
      )}
    >
      <div className="container-page relative">{children}</div>
    </section>
  );
}
