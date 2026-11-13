import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pageCount: number;
  basePath: string;
  params?: Record<string, string | undefined>;
  labels: { previous: string; next: string; page: string };
}

function href(basePath: string, params: Record<string, string | undefined>, page: number) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && k !== "page" && sp.set(k, v));
  if (page > 1) sp.set("page", String(page));
  const q = sp.toString();
  return q ? `${basePath}?${q}` : basePath;
}

function pages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1]);
  const list = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, basePath, params = {}, labels }: Props) {
  if (pageCount <= 1) return null;
  const base = "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition";
  return (
    <nav aria-label={labels.page} className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(basePath, params, page - 1)} className={cn(base, "gap-1 text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-white/5")} rel="prev">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{labels.previous}</span>
        </Link>
      ) : null}
      {pages(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(basePath, params, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              base,
              p === page ? "bg-brand-600 text-white shadow-sm" : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-white/5",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={href(basePath, params, page + 1)} className={cn(base, "gap-1 text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-white/5")} rel="next">
          <span className="hidden sm:inline">{labels.next}</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
