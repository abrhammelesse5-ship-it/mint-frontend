"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dict } = useI18n();
  return (
    <section className="flex min-h-[70vh] items-center bg-ink-950 pt-32 pb-20 text-white">
      <div className="container-page text-center">
        <TriangleAlert className="mx-auto h-12 w-12 text-gold-400" aria-hidden />
        <h1 className="mt-6 text-3xl font-bold text-white">{dict.error.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">{dict.error.text}</p>
        <button type="button" onClick={reset} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink-900 hover:bg-brand-50">
          <RotateCcw className="h-4 w-4" aria-hidden />
          {dict.error.retry}
        </button>
      </div>
    </section>
  );
}
