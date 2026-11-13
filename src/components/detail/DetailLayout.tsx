import { cn } from "@/lib/utils";

/** Two-column article layout: content + sticky sidebar. */
export function DetailLayout({ children, aside, className }: { children: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("container-page py-14 sm:py-16", className)}>
      <div className={cn("grid gap-12", aside && "lg:grid-cols-[minmax(0,1fr)_340px]")}>
        <div className="min-w-0">{children}</div>
        {aside && <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">{aside}</aside>}
      </div>
    </div>
  );
}
