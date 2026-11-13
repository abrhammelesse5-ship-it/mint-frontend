import type { StrapiMedia } from "./types";

/** Browser-facing Strapi origin (media files, counters, forms). */
export const PUBLIC_STRAPI_URL = (process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || "http://localhost:1337").replace(/\/+$/, "");

export function mediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${PUBLIC_STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function pickFormat(media: StrapiMedia | null | undefined, preferred: "thumbnail" | "small" | "medium" | "large" = "large") {
  if (!media) return null;
  const order = ["thumbnail", "small", "medium", "large"] as const;
  const start = order.indexOf(preferred);
  for (let i = start; i < order.length; i++) {
    const f = media.formats?.[order[i]];
    if (f) return { url: mediaUrl(f.url)!, width: f.width, height: f.height };
  }
  return { url: mediaUrl(media.url)!, width: media.width ?? 1200, height: media.height ?? 800 };
}

export function fileSizeLabel(kb?: number | null): string {
  if (!kb && kb !== 0) return "";
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function fileExt(media?: StrapiMedia | null): string {
  if (!media) return "";
  return (media.ext || media.url.split(".").pop() || "").replace(".", "").toUpperCase();
}
