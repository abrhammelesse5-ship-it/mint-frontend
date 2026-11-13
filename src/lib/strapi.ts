import "server-only";
import qs from "qs";
import type { Locale } from "@/i18n/config";
import type { Collection, Pagination } from "./types";

/** Server-side base URL (can be an internal hostname). */
export const STRAPI_URL = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/+$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN || "";
export const REVALIDATE = Number(process.env.REVALIDATE_SECONDS || 60) || 60;
const TIMEOUT_MS = 10_000;

export type Query = Record<string, unknown>;

interface FetchOptions {
  /** ISR window in seconds. 0 = no cache. */
  revalidate?: number;
  tags?: string[];
}

export class StrapiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const warned = new Set<string>();
function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[strapi] ${message}`);
}

/**
 * Low-level GET against the Strapi REST API. Never throws for network/404 problems:
 * returns null so pages can render their empty states while the CMS is offline or empty.
 */
export async function strapiGet<T>(path: string, query: Query = {}, options: FetchOptions = {}): Promise<T | null> {
  const search = qs.stringify(query, { encodeValuesOnly: true, skipNulls: true });
  const url = `${STRAPI_URL}/api${path}${search ? `?${search}` : ""}`;
  const revalidate = options.revalidate ?? REVALIDATE;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
      next: { revalidate, tags: options.tags ?? ["strapi"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      warnOnce(`${res.status}:${path}`, `${res.status} on ${path}: ${body.slice(0, 300)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    warnOnce(`net:${path}`, `request to ${url.split("?")[0]} failed (${(error as Error).message}). Is Strapi running at ${STRAPI_URL}?`);
    return null;
  }
}

const emptyPagination = (pageSize = 25): Pagination => ({ page: 1, pageSize, pageCount: 0, total: 0 });

/** GET a collection type. Always resolves to a (possibly empty) collection. */
export async function getCollection<T>(plural: string, locale: Locale | null, query: Query = {}, options?: FetchOptions): Promise<Collection<T>> {
  const res = await strapiGet<{ data: T[]; meta?: { pagination?: Pagination } }>(
    `/${plural}`,
    { ...(locale ? { locale } : {}), ...query },
    options,
  );
  const pageSize = (query.pagination as { pageSize?: number } | undefined)?.pageSize;
  return {
    data: Array.isArray(res?.data) ? res!.data : [],
    pagination: res?.meta?.pagination ?? emptyPagination(pageSize),
  };
}

/**
 * GET a single type. When the Amharic version has not been created yet the English
 * one is used, so pages are never empty. Resolves to null when nothing is published.
 */
export async function getSingle<T>(singular: string, locale: Locale, query: Query = {}, options?: FetchOptions): Promise<T | null> {
  const res = await strapiGet<{ data: T | null }>(`/${singular}`, { locale, ...query }, options);
  if (res?.data || locale === "en") return res?.data ?? null;
  const en = await strapiGet<{ data: T | null }>(`/${singular}`, { locale: "en", ...query }, options);
  return en?.data ?? null;
}

/**
 * Find one entry by slug. When the Amharic version does not exist yet, falls back to
 * English so links never break; `fallback` tells the page to show a notice.
 */
export async function getBySlug<T>(
  plural: string,
  slug: string,
  locale: Locale,
  query: Query = {},
): Promise<{ item: T | null; fallback: boolean }> {
  const run = async (loc: Locale) => {
    const res = await getCollection<T>(plural, loc, {
      ...query,
      filters: { ...((query.filters as object) ?? {}), slug: { $eq: slug } },
      pagination: { pageSize: 1 },
    });
    return res.data[0] ?? null;
  };
  const item = await run(locale);
  if (item || locale === "en") return { item, fallback: false };
  const en = await run("en");
  return { item: en, fallback: !!en };
}

/** Fetch every entry of a collection (paginated, capped) e.g. for the sitemap. */
export async function getAll<T>(plural: string, locale: Locale, query: Query = {}, max = 1000): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  while (out.length < max) {
    const res = await getCollection<T>(plural, locale, { ...query, pagination: { page, pageSize: 100 } });
    out.push(...res.data);
    if (page >= res.pagination.pageCount || res.data.length === 0) break;
    page += 1;
  }
  return out;
}
