import type { LucideIcon } from "lucide-react";

export interface MetaRow {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}

export function MetaCard({ title, rows, children }: { title: string; rows: MetaRow[]; children?: React.ReactNode }) {
  const visible = rows.filter((r) => r.value !== null && r.value !== undefined && r.value !== "");
  if (!visible.length && !children) return null;
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      <dl className="space-y-4">
        {visible.map((r) => (
          <div key={r.label} className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-white/5 dark:text-brand-300">
              <r.icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium tracking-wide text-ink-500 uppercase dark:text-ink-400">{r.label}</dt>
              <dd className="mt-0.5 text-[15px] font-semibold text-ink-900 dark:text-white">{r.value}</dd>
            </div>
          </div>
        ))}
      </dl>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
