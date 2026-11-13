import { Languages } from "lucide-react";

export function FallbackNotice({ text }: { text: string }) {
  return (
    <div role="note" className="mb-8 flex items-start gap-3 rounded-2xl border border-gold-300 bg-gold-300/20 px-5 py-4 text-sm text-ink-800 dark:border-gold-500/40 dark:bg-gold-500/10 dark:text-gold-300">
      <Languages className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden />
      <p>{text}</p>
    </div>
  );
}
