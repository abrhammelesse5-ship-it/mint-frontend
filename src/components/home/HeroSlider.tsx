"use client";

import Image from "next/image";
import { navIcons } from "@/components/layout/NavIcons";
import type { NavIcon } from "@/lib/nav-icon";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { fill } from "@/i18n/t";
import { cn } from "@/lib/utils";

export interface HeroSlideView {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  link?: { label: string; href: string; external: boolean; newTab: boolean } | null;
}

const INTERVAL = 7000;

export interface HeroFunction {
  title: string;
  text: string;
  icon: string;
}

export function HeroSlider({
  slides,
  secondary,
  functions = [],
  functionsTitle,
}: {
  slides: HeroSlideView[];
  secondary?: { label: string; href: string };
  functions?: HeroFunction[];
  functionsTitle?: string;
}) {
  const { dict } = useI18n();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = slides.length;
  const playing = count > 1 && !paused && !hovered && !reduce;

  const go = useCallback((n: number) => setIndex((n + count) % count), [count]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, playing, go]);

  const slide = slides[index];

  return (
    <section
      className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-ink-950 text-white md:h-[92vh] md:max-h-[880px]"
      aria-roledescription="carousel"
      aria-label={dict.site.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      {/* Background images (crossfade + Ken Burns) */}
      <AnimatePresence initial={false}>
        <motion.div key={slide.id} className="absolute inset-0 -z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: "easeInOut" }}>
          {slide.image ? (
            <Image src={slide.image} alt="" fill priority={index === 0} sizes="100vw" quality={85} className="animate-kenburns object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-ink-950 to-ink-900">
              <div className="bg-grid absolute inset-0" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/95 via-ink-950/70 to-ink-950/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[520px] w-[520px] rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
      {/* What the Ministry does: glass panel over the photo (desktop) */}
      {functions.length > 0 && (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full items-center lg:flex">
          <div className="container-page flex justify-end">
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-[340px] rounded-3xl bg-ink-950/45 p-5 ring-1 ring-white/15 backdrop-blur-md xl:w-[380px]"
            >
              {functionsTitle && <p className="mb-3 px-1 text-xs font-semibold tracking-[0.16em] text-gold-400 uppercase">{functionsTitle}</p>}
              <ul className="space-y-2">
                {functions.map((f, i) => {
                  const Icon = navIcons[f.icon as NavIcon] ?? navIcons.layers;
                  return (
                    <motion.li
                      key={f.title}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-white/10"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-900/40 transition group-hover:scale-105">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-white">{f.title}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-white/65">{f.text}</span>
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      )}

      <div className="container-page relative w-full pt-40 pb-28 md:pb-32">
        <div className="max-w-3xl lg:max-w-[calc(100%-400px)] xl:max-w-[calc(100%-440px)]" aria-live={playing ? "off" : "polite"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${count}`}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } }, exit: { opacity: 0, transition: { duration: 0.25 } } }}
            >
              <motion.p
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-white/90 uppercase ring-1 ring-white/20 backdrop-blur"
              >
                <span className="flag-stripe h-2 w-5 rounded-sm" aria-hidden />
                {dict.home.heroEyebrow}
              </motion.p>
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-4xl leading-[1.08] font-extrabold text-white sm:text-5xl lg:text-6xl"
              >
                {slide.title}
              </motion.h1>
              {slide.subtitle && (
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                  {slide.subtitle}
                </motion.p>
              )}
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="mt-9 flex flex-wrap gap-3">
                {slide.link && (
                  <Link
                    href={slide.link.href}
                    target={slide.link.newTab || slide.link.external ? "_blank" : undefined}
                    rel={slide.link.external ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition hover:bg-gold-400"
                  >
                    {slide.link.label}
                    {slide.link.external ? <ArrowUpRight className="h-5 w-5" aria-hidden /> : <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden />}
                  </Link>
                )}
                {secondary && (
                  <Link href={secondary.href} className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/10">
                    {secondary.label}
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-10">
          <div className="container-page flex items-center justify-between gap-6">
            <div className="flex flex-1 items-center gap-2" role="tablist" aria-label={dict.common.goToSlide.replace("{n}", "")}>
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={fill(dict.common.goToSlide, { n: i + 1 })}
                  onClick={() => go(i)}
                  className="group relative h-8 flex-1 max-w-24"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                    <span
                      key={`${s.id}-${i === index ? index : "x"}-${playing}`}
                      className={cn("block h-full rounded-full bg-gold-400", i < index && "w-full", i > index && "w-0")}
                      style={i === index ? { width: playing ? undefined : "100%", animation: playing ? `hero-progress ${INTERVAL}ms linear forwards` : undefined } : undefined}
                    />
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur">
              <button type="button" onClick={() => go(index - 1)} aria-label={dict.common.previousSlide} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <span className="min-w-12 text-center text-sm font-semibold tabular-nums text-white/85">
                {String(index + 1).padStart(2, "0")}
                <span className="text-white/40"> / {String(count).padStart(2, "0")}</span>
              </span>
              <button type="button" onClick={() => go(index + 1)} aria-label={dict.common.nextSlide} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? dict.common.playSlides : dict.common.pauseSlides}
                aria-pressed={paused}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15"
              >
                {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes hero-progress{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}
