import type { Locale } from "@/i18n/config";

/**
 * Amharic pages show dates in the Ethiopian calendar (ዓ.ም), which is what readers of
 * official Ethiopian government publications expect. Set to false to use Gregorian.
 */
export const ETHIOPIAN_CALENDAR_FOR_AM = true;

function intlLocale(locale: Locale) {
  return locale === "am" ? "am-ET" : "en-GB";
}

export function formatDate(
  value: string | null | undefined,
  locale: Locale,
  style: "long" | "medium" | "short" = "long",
): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const ethiopic = locale === "am" && ETHIOPIAN_CALENDAR_FOR_AM;
  const opts: Intl.DateTimeFormatOptions =
    style === "short"
      ? { day: "numeric", month: "short", year: "numeric" }
      : style === "medium"
        ? { day: "numeric", month: "short", year: "numeric" }
        : { day: "numeric", month: "long", year: "numeric" };
  try {
    const formatted = new Intl.DateTimeFormat(intlLocale(locale), {
      ...opts,
      timeZone: "Africa/Addis_Ababa",
      ...(ethiopic ? { calendar: "ethiopic" } : {}),
    }).format(date);
    // ICU renders the Ethiopic era as "AM"; Amharic readers write ዓ.ም.
    return ethiopic ? `${formatted.replace(/\s*(AM|ዓ\/ም|ዓ\.ም\.?)$/u, "")} ዓ.ም` : formatted;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function formatTime(value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
}

/** Day + short month parts for calendar-style date badges (Gregorian for both locales). */
export function dateBadge(value: string | null | undefined, locale: Locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const tz = "Africa/Addis_Ababa";
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: tz }).format(date),
    month: new Intl.DateTimeFormat(intlLocale(locale), { month: "short", timeZone: tz }).format(date),
    year: new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: tz }).format(date),
  };
}

export function formatNumber(value: number | null | undefined, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value ?? 0);
}

/** Days from now until the date (negative when past). */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const end = new Date(value.length <= 10 ? `${value}T23:59:59+03:00` : value).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / 86_400_000);
}

export function isPast(value: string | null | undefined): boolean {
  const d = daysUntil(value);
  return d !== null && d < 0;
}
