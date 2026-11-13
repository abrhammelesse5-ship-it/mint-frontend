import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  text,
  icon: Icon = Inbox,
  className,
  action,
}: {
  title: string;
  text?: string;
  icon?: LucideIcon;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]",
        className,
      )}
    >
      <div className="bg-dots absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card dark:bg-ink-900 dark:text-brand-300">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="relative text-lg font-semibold">{title}</h3>
      {text && <p className="relative mt-2 max-w-md text-ink-500 dark:text-ink-300">{text}</p>}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}
