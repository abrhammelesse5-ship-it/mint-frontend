"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Newspaper, FileText, Phone } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

export default function NotFound() {
  const { locale, dict } = useI18n();
  const links = [
    { label: dict.nav.news, href: `/${locale}/news`, icon: Newspaper },
    { label: dict.nav.documents, href: `/${locale}/resources`, icon: FileText },
    { label: dict.nav.contact, href: `/${locale}/contact`, icon: Phone },
  ];
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden bg-ink-950 pt-44 pb-24 text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink-950 via-brand-950 to-ink-900" />
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="container-page text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
          <Compass className="h-10 w-10 text-gold-400" aria-hidden />
        </div>
        <p className="font-display text-7xl font-extrabold text-white/15 sm:text-9xl">404</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{dict.notFound.title}</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">{dict.notFound.text}</p>
        <Link href={`/${locale}`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-semibold text-ink-950 transition hover:bg-gold-400">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {dict.notFound.back}
        </Link>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {links.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10">
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
