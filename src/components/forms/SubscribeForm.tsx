"use client";

import { useState } from "react";
import { CircleCheck, LoaderCircle, Send, TriangleAlert } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { postForm } from "./post";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function SubscribeForm({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const { locale, dict } = useI18n();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const t = dict.newsletter;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState("error");
      setMessage(t.invalid);
      return;
    }
    setState("sending");
    const res = await postForm("/api/subscribers", { email: email.trim(), language: locale, website });
    if (res.ok) {
      setState("ok");
      setMessage(t.success);
      setEmail("");
    } else {
      setState("error");
      setMessage(res.status === 409 ? t.duplicate : res.status === 400 ? t.invalid : t.error);
    }
  };

  const dark = tone === "dark";
  return (
    <form onSubmit={submit} noValidate className={cn("w-full", className)}>
      <div className={cn("flex flex-col gap-2 rounded-full p-1.5 sm:flex-row", dark ? "bg-white/10 ring-1 ring-white/15 backdrop-blur" : "bg-white ring-1 ring-ink-200 dark:bg-ink-900 dark:ring-white/10")}>
        <label htmlFor={`subscribe-${tone}`} className="sr-only">
          {t.placeholder}
        </label>
        <input
          id={`subscribe-${tone}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          aria-invalid={state === "error"}
          aria-describedby={`subscribe-msg-${tone}`}
          className={cn("h-11 min-w-0 flex-1 rounded-full bg-transparent px-5 outline-none", dark ? "text-white placeholder:text-white/50" : "text-ink-900 placeholder:text-ink-400 dark:text-white")}
        />
        {/* Honeypot: hidden from people, filled by bots */}
        <div className="sr-honeypot" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-bold text-ink-950 transition hover:bg-gold-400 disabled:opacity-70"
        >
          {state === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {state === "sending" ? t.sending : t.button}
        </button>
      </div>
      <p id={`subscribe-msg-${tone}`} role="status" aria-live="polite" className={cn("mt-3 flex min-h-5 items-center gap-1.5 px-2 text-sm", state === "ok" ? (dark ? "text-emerald-300" : "text-emerald-700") : state === "error" ? (dark ? "text-red-300" : "text-red-600") : dark ? "text-white/55" : "text-ink-500")}>
        {state === "ok" && <CircleCheck className="h-4 w-4" aria-hidden />}
        {state === "error" && <TriangleAlert className="h-4 w-4" aria-hidden />}
        {message || t.privacy}
      </p>
    </form>
  );
}
