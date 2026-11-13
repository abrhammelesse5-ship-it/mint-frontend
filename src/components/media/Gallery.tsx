"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl, pickFormat } from "@/lib/media";
import type { StrapiMedia } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";
import { fill } from "@/i18n/t";

interface Props {
  images: StrapiMedia[];
  className?: string;
  /** "masonry" for albums, "grid" for inline galleries */
  layout?: "grid" | "masonry";
}

/** Responsive photo grid with an accessible, keyboard- and swipe-friendly lightbox. */
export function Gallery({ images, className, layout = "grid" }: Props) {
  const { dict } = useI18n();
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const count = images.length;

  const close = useCallback(() => {
    setIndex(null);
    lastTrigger.current?.focus();
  }, []);
  const go = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + count) % count)), [count]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, go]);

  if (!count) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul
        className={cn(
          layout === "masonry" ? "columns-2 gap-4 sm:columns-3 lg:columns-4 [&>li]:mb-4" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
          className,
        )}
      >
        {images.map((img, i) => {
          const thumb = pickFormat(img, "small");
          return (
            <li key={img.id ?? i} className="break-inside-avoid">
              <button
                type="button"
                onClick={(e) => {
                  lastTrigger.current = e.currentTarget;
                  setIndex(i);
                }}
                aria-label={fill(dict.common.openImage, { n: i + 1 })}
                className={cn(
                  "group relative block w-full overflow-hidden rounded-xl bg-ink-100 dark:bg-white/5",
                  layout === "grid" && "aspect-square",
                )}
              >
                {thumb && (
                  <Image
                    src={thumb.url}
                    alt={img.alternativeText || img.caption || ""}
                    width={thumb.width}
                    height={thumb.height}
                    sizes="(min-width:1024px) 25vw, 50vw"
                    className={cn(
                      "w-full transition duration-500 group-hover:scale-105",
                      layout === "grid" ? "h-full object-cover" : "h-auto",
                    )}
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition group-hover:bg-ink-950/40 group-hover:opacity-100">
                  <Expand className="h-6 w-6 text-white" aria-hidden />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.caption || current.alternativeText || fill(dict.common.openImage, { n: index + 1 })}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              aria-label={dict.common.close}
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6"
                  aria-label={dict.common.previous}
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6"
                  aria-label={dict.common.next}
                >
                  <ChevronRight className="h-6 w-6" aria-hidden />
                </button>
              </>
            )}
            <motion.figure
              key={index}
              className="relative flex max-h-[85vh] w-full max-w-6xl flex-col items-center px-16"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                if (info.offset.x > 60) go(-1);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={mediaUrl(current.url)!}
                alt={current.alternativeText || current.caption || ""}
                width={current.width || 1600}
                height={current.height || 1000}
                sizes="90vw"
                quality={85}
                className="max-h-[78vh] w-auto rounded-lg object-contain"
              />
              <figcaption className="mt-4 text-center text-sm text-white/75">
                {current.caption && <span className="mr-2">{current.caption}</span>}
                <span className="tabular-nums text-white/50">
                  {index + 1} / {count}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
