"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  label: string;
  items: { id: string; question: string; answer: React.ReactNode }[];
}

/** Category tabs + accessible accordion (button[aria-expanded] + region). */
export function FaqAccordion({ groups, initial, allLabel }: { groups: Group[]; initial?: string; allLabel: string }) {
  const [active, setActive] = useState<string>(groups.some((g) => g.id === initial) ? initial! : "all");
  const [open, setOpen] = useState<string | null>(groups[0]?.items[0]?.id ?? null);
  const base = useId();
  const visible = active === "all" ? groups : groups.filter((g) => g.id === active);

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <div role="tablist" aria-orientation="vertical" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {[{ id: "all", label: allLabel, count: groups.reduce((n, g) => n + g.items.length, 0) }, ...groups.map((g) => ({ id: g.id, label: g.label, count: g.items.length }))].map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "flex shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition",
              active === t.id ? "bg-brand-600 text-white shadow-sm" : "bg-white text-ink-700 ring-1 ring-ink-100 hover:ring-brand-200 dark:bg-ink-900 dark:text-ink-200 dark:ring-white/10",
            )}
          >
            {t.label}
            <span className={cn("rounded-full px-2 py-0.5 text-xs", active === t.id ? "bg-white/20" : "bg-ink-100 dark:bg-white/10")}>{t.count}</span>
          </button>
        ))}
      </div>
      <div className="space-y-10" role="tabpanel">
        {visible.map((g) => (
          <section key={g.id} aria-labelledby={`${base}-${g.id}`}>
            {active === "all" && (
              <h2 id={`${base}-${g.id}`} className="mb-4 text-xl font-bold">
                {g.label}
              </h2>
            )}
            <ul className="space-y-3">
              {g.items.map((item) => {
                const isOpen = open === item.id;
                return (
                  <li key={item.id} className={cn("overflow-hidden rounded-2xl border bg-white transition dark:bg-ink-900", isOpen ? "border-brand-200 shadow-card dark:border-brand-700" : "border-ink-100 dark:border-white/10")}>
                    <h3>
                      <button
                        type="button"
                        id={`${base}-q-${item.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`${base}-a-${item.id}`}
                        onClick={() => setOpen(isOpen ? null : item.id)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[16px] font-semibold text-ink-900 dark:text-white"
                      >
                        {item.question}
                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300", isOpen ? "rotate-45 bg-brand-600 text-white" : "bg-ink-50 text-ink-600 dark:bg-white/5 dark:text-ink-300")}>
                          <Plus className="h-4 w-4" aria-hidden />
                        </span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`${base}-a-${item.id}`}
                          role="region"
                          aria-labelledby={`${base}-q-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-6 pb-6 text-ink-600 dark:text-ink-300">{item.answer}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
