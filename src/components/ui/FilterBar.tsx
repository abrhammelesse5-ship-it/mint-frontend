"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  name: string;
  label: string;
  options: FilterOption[];
  allLabel: string;
  /** "chips" renders pills (good for few options); "select" a dropdown. */
  variant?: "chips" | "select";
}

interface Props {
  groups?: FilterGroup[];
  search?: { placeholder: string; label: string };
  clearLabel: string;
  resultsLabel?: string;
}

/** URL-driven filters (?category=...&q=...): server components re-render with the new params. */
export function FilterBar({ groups = [], search, clearLabel, resultsLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const update = (changes: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    sp.delete("page");
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const active = groups.some((g) => params.get(g.name)) || !!params.get("q");

  return (
    <div className="mb-10 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {search && (
          <form
            role="search"
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: q.trim() || null });
            }}
          >
            <label htmlFor="filter-q" className="sr-only">
              {search.label}
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="filter-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={search.placeholder}
              className="h-12 w-full rounded-full border border-ink-200 bg-white pr-28 pl-12 text-[15px] shadow-sm transition outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-ink-900"
            />
            <button
              type="submit"
              className="absolute top-1.5 right-1.5 inline-flex h-9 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {search.label}
            </button>
          </form>
        )}
        {groups
          .filter((g) => g.variant === "select")
          .map((g) => (
            <div key={g.name} className="lg:w-64">
              <label htmlFor={`filter-${g.name}`} className="sr-only">
                {g.label}
              </label>
              <select
                id={`filter-${g.name}`}
                value={params.get(g.name) ?? ""}
                onChange={(e) => update({ [g.name]: e.target.value || null })}
                className="h-12 w-full cursor-pointer rounded-full border border-ink-200 bg-white px-5 text-[15px] shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-ink-900"
              >
                <option value="">
                  {g.label}: {g.allLabel}
                </option>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </div>

      {groups
        .filter((g) => g.variant !== "select")
        .map((g) => {
          const current = params.get(g.name) ?? "";
          return (
            <div key={g.name} role="group" aria-label={g.label} className="flex flex-wrap gap-2">
              {[{ value: "", label: g.allLabel }, ...g.options].map((o) => {
                const selected = current === o.value;
                return (
                  <button
                    key={o.value || "all"}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update({ [g.name]: o.value || null })}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      selected
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                        : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-ink-900 dark:text-ink-300",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          );
        })}

      {(active || resultsLabel) && (
        <div className="flex items-center justify-between text-sm text-ink-500 dark:text-ink-400">
          <span aria-live="polite">{resultsLabel}</span>
          {active && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                update(Object.fromEntries([...groups.map((g) => [g.name, null]), ["q", null]]));
              }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" aria-hidden />
              {clearLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
