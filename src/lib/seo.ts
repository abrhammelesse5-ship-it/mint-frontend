import "server-only";
import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { mediaUrl } from "./media";
import { getGlobal } from "./site";
import type { Seo, StrapiMedia } from "./types";
import { truncate } from "./utils";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

interface Input {
  locale: Locale;
  /** Path without locale, e.g. "/news/my-story" ("" for home). */
  path: string;
  title?: string | null;
  description?: string | null;
  seo?: Seo | null;
  image?: StrapiMedia | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  noindex?: boolean;
}

/** Builds Next metadata from a shared.seo component with sensible fallbacks (Global.defaultSeo, dictionary). */
export async function buildMetadata({ locale, path, title, description, seo, image, type = "website", publishedTime, noindex }: Input): Promise<Metadata> {
  const dict = getDictionary(locale);
  const global = await getGlobal(locale);
  const siteName = global?.siteName || dict.site.name;
  const metaTitle = seo?.metaTitle || title || global?.defaultSeo?.metaTitle || siteName;
  const metaDescription = truncate(seo?.metaDescription || description || global?.defaultSeo?.metaDescription || global?.siteTagline || dict.site.description, 160);
  const share = mediaUrl((seo?.shareImage || image || global?.defaultSeo?.shareImage)?.url) ?? `${SITE_URL}/brand/mint-og-default.png`;
  const canonical = seo?.canonicalUrl || `${SITE_URL}/${locale}${path}`;
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical, languages: { ...languages, "x-default": `${SITE_URL}/en${path}` } },
    openGraph: {
      type,
      title: metaTitle,
      description: metaDescription,
      siteName,
      locale: locale === "am" ? "am_ET" : "en_US",
      url: canonical,
      images: [{ url: share }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: metaTitle, description: metaDescription, images: [share] },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
