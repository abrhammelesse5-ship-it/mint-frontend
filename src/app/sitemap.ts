import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getAll } from "@/lib/strapi";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const staticPaths = [
  "", "/about", "/about/minister-message", "/sectors", "/news", "/press-releases", "/notices", "/vacancies", "/concept-notes", "/trainings",
  "/bids", "/events", "/gallery", "/magazines", "/resources", "/programs", "/policy-and-programs", "/media", "/announcements", "/systems",
  "/ecosystem", "/faq", "/contact",
];

const collections: { plural: string; base: string; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { plural: "sectors", base: "/sectors", freq: "monthly" },
  { plural: "news-items", base: "/news", freq: "weekly" },
  { plural: "press-releases", base: "/press-releases", freq: "monthly" },
  { plural: "notices", base: "/notices", freq: "weekly" },
  { plural: "vacancies", base: "/vacancies", freq: "weekly" },
  { plural: "concept-note-calls", base: "/concept-notes", freq: "weekly" },
  { plural: "training-announcements", base: "/trainings", freq: "monthly" },
  { plural: "events", base: "/events", freq: "weekly" },
  { plural: "gallery-albums", base: "/gallery", freq: "monthly" },
  { plural: "programs", base: "/programs", freq: "monthly" },
  { plural: "pages", base: "", freq: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const alt = (path: string) => ({ languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) });

  for (const path of staticPaths) {
    entries.push({ url: `${SITE_URL}/en${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7, alternates: alt(path) });
  }
  const lists = await Promise.all(
    collections.map((c) => getAll<{ slug: string; updatedAt?: string }>(c.plural, "en", { fields: ["slug", "updatedAt"] }).then((items) => ({ c, items }))),
  );
  for (const { c, items } of lists) {
    for (const item of items) {
      const path = `${c.base}/${item.slug}`;
      entries.push({ url: `${SITE_URL}/en${path}`, lastModified: item.updatedAt, changeFrequency: c.freq, priority: 0.6, alternates: alt(path) });
    }
  }
  return entries;
}
