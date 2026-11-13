"use client";

import { useState } from "react";
import { CircleCheck, LoaderCircle, Send, TriangleAlert } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { postForm } from "./post";
import { cn } from "@/lib/utils";

type Field = "fullName" | "email" | "phone" | "subject" | "message";
const LIMITS: Record<Field, number> = { fullName: 150, email: 254, phone: 50, subject: 255, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const { dict } = useI18n();
  const t = dict.contact;
  const [values, setValues] = useState<Record<Field, string>>({ fullName: "", email: "", phone: "", subject: "", message: "" });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [banner, setBanner] = useState("");

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!values.fullName.trim()) e.fullName = t.required;
    if (!values.email.trim()) e.email = t.required;
    else if (!EMAIL_RE.test(values.email.trim())) e.email = t.invalidEmail;
    if (!values.message.trim()) e.message = t.required;
    (Object.keys(LIMITS) as Field[]).forEach((k) => {
      if (values[k].length > LIMITS[k]) e[k] = t.tooLong;
    });
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setState("sending");
    const res = await postForm("/api/contact-messages", {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      subject: values.subject.trim() || undefined,
      message: values.message.trim(),
      website,
    });
    if (res.ok) {
      setState("ok");
      setBanner(t.success);
      setValues({ fullName: "", email: "", phone: "", subject: "", message: "" });
    } else {
      setState("error");
      setBanner(res.status === 429 ? t.rateLimited : t.error);
      if (res.errors) {
        const mapped: Partial<Record<Field, string>> = {};
        Object.entries(res.errors).forEach(([k, v]) => {
          if (k in LIMITS) mapped[k as Field] = k === "email" ? t.invalidEmail : String(v);
        });
        setErrors(mapped);
      }
    }
  };

  const input = (name: Field, label: string, opts: { type?: string; required?: boolean; autoComplete?: string; textarea?: boolean } = {}) => (
    <div className={cn(opts.textarea && "sm:col-span-2")}>
      <label htmlFor={`contact-${name}`} className="mb-1.5 block text-sm font-semibold text-ink-800 dark:text-ink-100">
        {label}
        {opts.required && <span className="text-red-600"> *</span>}
      </label>
      {opts.textarea ? (
        <textarea
          id={`contact-${name}`}
          rows={6}
          value={values[name]}
          maxLength={LIMITS[name]}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
          required={opts.required}
          className={fieldClass(!!errors[name])}
        />
      ) : (
        <input
          id={`contact-${name}`}
          type={opts.type ?? "text"}
          value={values[name]}
          maxLength={LIMITS[name]}
          autoComplete={opts.autoComplete}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
          required={opts.required}
          className={fieldClass(!!errors[name])}
        />
      )}
      {errors[name] && (
        <p id={`contact-${name}-error`} className="mt-1.5 text-sm text-red-600">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="relative">
      {banner && (
        <div role="status" aria-live="polite" className={cn("mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium", state === "ok" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300")}>
          {state === "ok" ? <CircleCheck className="h-5 w-5 shrink-0" aria-hidden /> : <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden />}
          {banner}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {input("fullName", t.fullName, { required: true, autoComplete: "name" })}
        {input("email", t.email, { required: true, type: "email", autoComplete: "email" })}
        {input("phone", t.phone, { type: "tel", autoComplete: "tel" })}
        {input("subject", t.subject)}
        {input("message", t.message, { required: true, textarea: true })}
      </div>
      <div className="sr-honeypot" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-70"
      >
        {state === "sending" ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-5 w-5" aria-hidden />}
        {state === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}

function fieldClass(invalid: boolean) {
  return cn(
    "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink-900 shadow-sm transition outline-none placeholder:text-ink-400 focus:ring-4 dark:bg-ink-900 dark:text-white",
    invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500/15 dark:border-white/10",
  );
}
