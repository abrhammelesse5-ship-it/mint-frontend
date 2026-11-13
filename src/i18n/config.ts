export const locales = ["en", "am"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, { native: string; short: string }> = {
  en: { native: "English", short: "EN" },
  am: { native: "አማርኛ", short: "አማ" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function asLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Prefix an internal path with the locale. External / absolute URLs pass through. */
export function localizeHref(href: string | null | undefined, locale: Locale): string {
  if (!href) return `/${locale}`;
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  const clean = href.startsWith("/") ? href : `/${href}`;
  const first = clean.split("/")[1];
  if (isLocale(first)) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Swap the locale segment of a pathname, keeping the rest of the path. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) {
    parts[1] = target;
    return parts.join("/") || `/${target}`;
  }
  return `/${target}${pathname === "/" ? "" : pathname}`;
}
