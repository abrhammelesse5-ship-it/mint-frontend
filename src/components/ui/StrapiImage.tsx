import Image from "next/image";
import { UserRound } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { fallbackImage, realMedia, type FallbackSpec } from "@/lib/fallback-images";
import type { StrapiMedia } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  /** Small avatar-sized slot (people). */
  compact?: boolean;
  /** Kept for API compatibility: "dark" slots sit under a text overlay. */
  tone?: "light" | "dark";
  media?: StrapiMedia | null;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Fill the parent (parent must be relative and sized). */
  fill?: boolean;
  quality?: number;
  /**
   * Themed photo used when the media is missing or is only the MInT logo placeholder.
   * Pass a slug/title (or a FallbackSpec). Omit for people: they get a neutral avatar instead.
   */
  fallback?: FallbackSpec | string | null;
}

/** next/image for Strapi media, with themed photo fallbacks (never the logo as a stand-in). */
export function StrapiImage({ media, alt, className, sizes = "100vw", priority, fill = true, quality = 75, compact, fallback }: Props) {
  const real = realMedia(media);
  const src = mediaUrl(real?.url);
  if (!src) {
    if (fallback) {
      return <Image src={fallbackImage(fallback)} alt="" fill sizes={sizes} priority={priority} quality={quality} className={cn("object-cover", className)} />;
    }
    return <ImagePlaceholder className={className} compact={compact} />;
  }
  const altText = alt ?? real?.alternativeText ?? real?.caption ?? "";
  if (fill) {
    return <Image src={src} alt={altText} fill sizes={sizes} priority={priority} quality={quality} className={cn("object-cover", className)} />;
  }
  return (
    <Image
      src={src}
      alt={altText}
      width={real?.width ?? 800}
      height={real?.height ?? 600}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
    />
  );
}

/** Neutral placeholder for people without a photo: a soft branded avatar, not a logo or a stock face. */
export function ImagePlaceholder({ className, compact }: { className?: string; compact?: boolean; tone?: "light" | "dark" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-ink-50 to-brand-100 dark:from-ink-800 dark:via-ink-900 dark:to-brand-950",
        className,
      )}
    >
      <div className="bg-dots absolute inset-0 opacity-60" />
      <span className={cn("relative flex items-center justify-center rounded-full bg-white/80 text-brand-600 ring-1 ring-brand-100 dark:bg-white/10 dark:text-brand-300 dark:ring-white/10", compact ? "h-[70%] w-[70%]" : "h-24 w-24")}>
        <UserRound className={compact ? "h-1/2 w-1/2" : "h-12 w-12"} strokeWidth={1.5} />
      </span>
      {!compact && <div className="flag-stripe absolute inset-x-0 bottom-0 h-1" />}
    </div>
  );
}
