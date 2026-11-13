import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official MInT logo (from mint.gov.et), bundled so the site is branded even before Global.logo is uploaded. */
export const MINT_LOGO = { src: "/brand/mint-logo-horizontal.png", width: 727, height: 112 };
export const MINT_LOGO_STACKED = { src: "/brand/mint-logo-stacked.png", width: 413, height: 241 };
export const MINT_EMBLEM = { src: "/brand/mint-emblem.png", width: 512, height: 512 };

/**
 * The official logo. Its colours are made for white, so on dark surfaces (transparent hero header,
 * footer, dark mode) it sits on a white plate instead of being recoloured.
 */
export function BrandMark({
  logoUrl,
  name,
  invert,
  className,
  size = "md",
}: {
  logoUrl?: string | null;
  name: string;
  invert?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl transition-all duration-300",
        invert ? "bg-white px-3 py-1.5 shadow-lg shadow-black/10 ring-1 ring-black/5" : "dark:bg-white dark:px-3 dark:py-1.5",
        className,
      )}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS logo of unknown dimensions
        <img src={logoUrl} alt={name} className={cn("w-auto object-contain", size === "sm" ? "h-8" : "h-8 sm:h-10 xl:h-9 2xl:h-10")} />
      ) : (
        <Image
          src={MINT_LOGO.src}
          alt={name}
          width={MINT_LOGO.width}
          height={MINT_LOGO.height}
          priority
          sizes="300px"
          className={cn("w-auto", size === "sm" ? "h-8" : "h-8 sm:h-10 xl:h-9 2xl:h-10")}
        />
      )}
    </span>
  );
}
