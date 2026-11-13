"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, localeNames, switchLocalePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Links to the same page in the other language (slugs are shared between locales). */
export function LanguageSwitcher({ locale, label, className, tone = "light" }: { locale: Locale; label: string; className?: string; tone?: "light" | "dark" }) {
  const pathname = usePathname() || `/${locale}`;
  const search = useSearchParams()?.toString();
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center gap-1 rounded-full p-0.5", tone === "dark" ? "bg-white/10" : "bg-ink-100 dark:bg-white/10", className)}>
      <Languages className={cn("ml-2 h-4 w-4", tone === "dark" ? "text-white/70" : "text-ink-500 dark:text-ink-300")} aria-hidden />
      {locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={`${switchLocalePath(pathname, l)}${search ? `?${search}` : ""}`}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            scroll={false}
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;samesite=lax`;
            }}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition",
              active
                ? tone === "dark"
                  ? "bg-white text-ink-900"
                  : "bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white"
                : tone === "dark"
                  ? "text-white/80 hover:text-white"
                  : "text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white",
            )}
          >
            {localeNames[l].short}
          </Link>
        );
      })}
    </div>
  );
}
