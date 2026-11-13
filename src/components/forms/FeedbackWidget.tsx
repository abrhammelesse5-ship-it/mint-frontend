"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Star, CircleCheck } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { fill } from "@/i18n/t";
import { postForm } from "./post";
import { cn } from "@/lib/utils";

/** "Was this page helpful?" rating that posts to /api/feedbacks. */
export function FeedbackWidget() {
  const { dict } = useI18n();
  const t = dict.feedback;
  const pathname = usePathname();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");

  if (state === "ok") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
        <CircleCheck className="h-5 w-5" aria-hidden /> {t.thanks}
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setState("sending");
    const res = await postForm("/api/feedbacks", {
      rating,
      comment: comment.trim() || undefined,
      pageUrl: typeof window !== "undefined" ? window.location.origin + pathname : pathname,
      website,
    });
    setState(res.ok ? "ok" : "error");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <fieldset className="flex items-center gap-3">
        <legend className="mr-3 float-left text-sm font-semibold text-ink-800 dark:text-ink-100">{t.question}</legend>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} className="peer sr-only" checked={rating === n} onChange={() => setRating(n)} />
              <span className="sr-only">{fill(t.rate, { n })}</span>
              <Star
                aria-hidden
                className={cn("h-6 w-6 rounded transition peer-focus-visible:outline-2 peer-focus-visible:outline-gold-500", (hover || rating) >= n ? "fill-gold-500 text-gold-500" : "text-ink-300 dark:text-ink-600")}
              />
            </label>
          ))}
        </div>
      </fieldset>
      {rating > 0 && (
        <div className="flex flex-1 gap-2">
          <label htmlFor="feedback-comment" className="sr-only">
            {t.comment}
          </label>
          <input
            id="feedback-comment"
            value={comment}
            maxLength={2000}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.comment}
            className="h-10 min-w-0 flex-1 rounded-full border border-ink-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-ink-900"
          />
          <div className="sr-honeypot" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <button type="submit" disabled={state === "sending"} className="h-10 rounded-full bg-ink-900 px-4 text-sm font-semibold text-white hover:bg-ink-800 dark:bg-white dark:text-ink-900">
            {t.submit}
          </button>
        </div>
      )}
      {state === "error" && <p className="text-sm text-red-600">{t.error}</p>}
    </form>
  );
}
