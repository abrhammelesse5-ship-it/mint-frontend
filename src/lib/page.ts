import "server-only";
import { asLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { first, toInt } from "./utils";

export async function ctx(params: Promise<{ locale: string }>): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = asLocale((await params).locale);
  return { locale, dict: getDictionary(locale) };
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function readSearch(searchParams: SearchParams) {
  const sp = await searchParams;
  return {
    page: toInt(sp.page, 1),
    q: first(sp.q)?.slice(0, 100),
    get: (key: string) => first(sp[key])?.slice(0, 100),
    all: Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, first(v)])) as Record<string, string | undefined>,
  };
}

/** Case-insensitive "contains" across several fields. */
export function searchFilter(q: string | undefined, fields: string[]) {
  if (!q) return {};
  return { $or: fields.map((f) => ({ [f]: { $containsi: q } })) };
}
