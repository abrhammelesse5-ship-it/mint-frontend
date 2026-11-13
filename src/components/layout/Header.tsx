"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronRight, House, Mail, Menu, Phone, Search, X } from "lucide-react";
import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavItem, NavLink } from "@/lib/navigation";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { iconFor, NavGlyph } from "./NavIcons";

interface HeaderProps {
  nav: NavItem[];
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
}

function isActive(pathname: string, href: string, locale: Locale) {
  const path = href.split(/[?#]/)[0];
  if (path === `/${locale}`) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function itemActive(pathname: string, item: NavLink, locale: Locale): boolean {
  if (!item.external && isActive(pathname, item.href, locale)) return true;
  return !!item.children?.some((c) => itemActive(pathname, c, locale));
}

/** Index of the one top-level item to highlight: an exact section match wins over a child-link match. */
function activeIndex(pathname: string, items: NavLink[], locale: Locale): number {
  const own = items.findIndex((i) => !i.external && isActive(pathname, i.href, locale));
  return own >= 0 ? own : items.findIndex((i) => itemActive(pathname, i, locale));
}

export function Header({ nav, logoUrl, phone, email }: HeaderProps) {
  const { locale, dict } = useI18n();
  const pathname = usePathname() || `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close menus on navigation (state update during render, React-recommended pattern).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
    setDrawer(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer || searchOpen ? "hidden" : "";
  }, [drawer, searchOpen]);

  const enter = (i: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(i);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };

  const solid = scrolled || open !== null;
  const home = `/${locale}`;
  const items = nav.filter((n) => n.href !== home);
  const contactItem = items.find((n) => /\/contact$/.test(n.href));
  const mainItems = items.filter((n) => n !== contactItem);
  const activeMain = activeIndex(pathname, mainItems, locale);

  return (
    <>
      <a href="#main" className="fixed top-2 left-2 z-[200] -translate-y-24 rounded-full bg-gold-500 px-5 py-2.5 font-semibold text-ink-950 shadow-lg transition focus:translate-y-0">
        {dict.nav.skipToContent}
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          solid
            ? "bg-white/90 shadow-[0_1px_0_rgb(15_31_48/0.06),0_8px_24px_-12px_rgb(15_31_48/0.18)] backdrop-blur-xl dark:bg-ink-950/85 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)]"
            : "bg-gradient-to-b from-ink-950/70 to-transparent",
        )}
      >
        <div className="flag-stripe h-[3px]" aria-hidden />
        {/* Utility bar */}
        <div
          className={cn(
            "hidden overflow-hidden transition-all duration-300 lg:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
            solid ? "border-b border-ink-100 dark:border-white/10" : "border-b border-white/10",
          )}
        >
          <div className={cn("container-page flex h-10 max-w-[88rem] items-center justify-between text-[13px]", solid ? "text-ink-500 dark:text-ink-300" : "text-white/75")}>
            <span className="font-medium">{dict.site.country}</span>
            <div className="flex items-center gap-5">
              {phone && (
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-brand-500">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  <span dir="ltr">{phone}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-brand-500">
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  {email}
                </a>
              )}
              <Suspense fallback={null}>
                <LanguageSwitcher locale={locale} label={dict.common.language} tone={solid ? "light" : "dark"} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="container-page flex h-[72px] max-w-[88rem] items-center justify-between gap-4">
          <Link href={home} className="shrink-0 rounded-lg" aria-label={dict.site.name}>
            <BrandMark logoUrl={logoUrl} name={dict.site.name} invert={!solid} />
          </Link>

          <nav ref={navRef} aria-label={dict.nav.mainNav} className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              <li className="hidden 2xl:block">
                <Link
                  href={home}
                  aria-label={dict.nav.home}
                  aria-current={pathname === home ? "page" : undefined}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition",
                    solid ? "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-white/5" : "text-white/90 hover:bg-white/10",
                    pathname === home && (solid ? "text-brand-700 dark:text-brand-300" : "text-white"),
                  )}
                >
                  <House className="h-[18px] w-[18px]" aria-hidden />
                </Link>
              </li>
              {mainItems.map((item, i) => (
                <DesktopItem
                  key={`${item.href}-${i}`}
                  item={item}
                  index={i}
                  open={open === i}
                  active={i === activeMain}
                  solid={solid}
                  onEnter={() => item.children && enter(i)}
                  onLeave={leave}
                  onToggle={() => setOpen(open === i ? null : i)}
                />
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={dict.nav.search}
              className={cn("flex h-10 w-10 items-center justify-center rounded-full transition", solid ? "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-white/5" : "text-white hover:bg-white/10")}
            >
              <Search className="h-[18px] w-[18px]" aria-hidden />
            </button>
            <ThemeToggle
              label={dict.common.toggleTheme}
              className={cn("hidden h-10 w-10 sm:inline-flex", solid ? "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-white/5" : "text-white hover:bg-white/10")}
            />
            {contactItem && (
              <Link
                href={contactItem.href}
                className={cn(
                  "ml-1 hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition md:inline-flex",
                  solid ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-white text-ink-900 hover:bg-brand-50",
                )}
              >
                {contactItem.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label={dict.nav.openMenu}
              aria-expanded={drawer}
              aria-controls="mobile-drawer"
              className={cn("flex h-10 w-10 items-center justify-center rounded-full transition xl:hidden", solid ? "text-ink-800 hover:bg-ink-50 dark:text-white dark:hover:bg-white/5" : "text-white hover:bg-white/10")}
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} nav={nav} pathname={pathname} phone={phone} email={email} logoUrl={logoUrl} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function DesktopItem({
  item,
  index,
  open,
  active,
  solid,
  onEnter,
  onLeave,
  onToggle,
}: {
  item: NavItem;
  index: number;
  open: boolean;
  active: boolean;
  solid: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
}) {
  const id = useId();
  const linkClass = cn(
    "relative inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-[13.5px] font-semibold whitespace-nowrap transition 2xl:px-3.5 2xl:text-[14px]",
    solid ? "text-ink-700 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-white/5 dark:hover:text-white" : "text-white/90 hover:bg-white/10 hover:text-white",
    active && (solid ? "text-brand-700 dark:text-brand-300" : "text-white"),
  );
  const indicator = active && <span className={cn("absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full", solid ? "bg-brand-600" : "bg-gold-400")} aria-hidden />;

  if (!item.children?.length) {
    return (
      <li>
        {item.external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {item.label}
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </a>
        ) : (
          <Link href={item.href} className={linkClass} aria-current={active ? "page" : undefined}>
            {item.label}
            {indicator}
          </Link>
        )}
      </li>
    );
  }

  const mega = item.kind === "mega";
  return (
    <li className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button type="button" className={linkClass} aria-expanded={open} aria-controls={id} onClick={onToggle}>
        {item.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden />
        {indicator}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute top-full z-50 pt-3",
              mega ? "left-1/2 w-[min(860px,90vw)] -translate-x-1/2" : index > 4 ? "right-0 w-[380px]" : "left-0 w-[380px]",
            )}
          >
            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white p-2 shadow-2xl shadow-ink-950/15 dark:border-white/10 dark:bg-ink-900">
              {mega ? (
                <div className="grid gap-2 p-2 sm:grid-cols-3">
                  {item.children.map((group) => {
                    const GroupIcon = iconFor(group);
                    return (
                      <div key={group.href} className="rounded-xl bg-ink-50/60 p-3 dark:bg-white/[0.03]">
                        <Link href={group.href} className="group mb-3 flex items-center gap-3 rounded-lg font-display text-[15px] font-bold text-ink-900 hover:text-brand-700 dark:text-white">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-900/20 transition group-hover:bg-gold-500 group-hover:text-ink-950">
                            <GroupIcon className="h-5 w-5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1 leading-snug">{group.label}</span>
                          <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" aria-hidden />
                        </Link>
                        <ul className="space-y-0.5">
                          {(group.children ?? []).map((c) => {
                            const Icon = iconFor(c);
                            return (
                              <li key={c.href}>
                                <Link href={c.href} className="group/sub flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink-600 transition hover:bg-white hover:text-brand-700 hover:shadow-sm dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white">
                                  <Icon className="h-4 w-4 shrink-0 text-brand-500 transition group-hover/sub:scale-110" aria-hidden />
                                  {c.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ul>
                  {item.children.map((c) => {
                    const Icon = iconFor(c);
                    const content = (
                      <>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition duration-200 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600 dark:bg-white/5 dark:text-brand-300 dark:ring-white/10">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{c.label}</span>
                          {c.description && <span className="line-clamp-1 block text-[13px] text-ink-500 dark:text-ink-400">{c.description}</span>}
                        </span>
                        {c.external ? (
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-300" aria-hidden />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 -translate-x-1 text-brand-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                        )}
                      </>
                    );
                    const cls = "group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-brand-50/60 dark:hover:bg-white/5";
                    return (
                      <li key={c.href}>
                        {c.external ? (
                          <a href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>
                            {content}
                          </a>
                        ) : (
                          <Link href={c.href} className={cls}>
                            {content}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function MobileIcon({ link, active }: { link: NavLink; active?: boolean }) {
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition", active ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600 dark:bg-white/5 dark:text-brand-300")}>
      <NavGlyph link={link} className="h-[18px] w-[18px]" />
    </span>
  );
}

function SubIcon({ link, nested }: { link: NavLink; nested?: boolean }) {
  return <NavGlyph link={link} className={cn("shrink-0 text-brand-500", nested ? "h-3.5 w-3.5 opacity-80" : "h-4 w-4")} />;
}

function MobileDrawer({
  open,
  onClose,
  nav,
  pathname,
  phone,
  email,
  logoUrl,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  pathname: string;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}) {
  const { locale, dict } = useI18n();
  const [expanded, setExpanded] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] xl:hidden" id="mobile-drawer">
          <motion.div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menu}
            className="absolute inset-y-0 right-0 flex w-[min(420px,92vw)] flex-col bg-white shadow-2xl dark:bg-ink-950"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flag-stripe h-[3px]" aria-hidden />
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-white/10">
              <BrandMark logoUrl={logoUrl} name={dict.site.name} size="sm" />
              <button ref={closeRef} type="button" onClick={onClose} aria-label={dict.nav.closeMenu} className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-50 dark:text-white dark:hover:bg-white/5">
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <nav aria-label={dict.nav.mainNav} className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {nav.map((item) => {
                  const active = itemActive(pathname, item, locale);
                  if (!item.children?.length) {
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[16px] font-semibold", active ? "bg-brand-50 text-brand-700 dark:bg-white/5 dark:text-brand-300" : "text-ink-800 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-white/5")}
                        >
                          <MobileIcon link={item} active={active} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  }
                  const isOpen = expanded === item.href;
                  const flat = item.children.flatMap((c) => [c, ...(c.children ?? []).map((g) => ({ ...g, nested: true }))]) as (NavLink & { nested?: boolean })[];
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : item.href)}
                        className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[16px] font-semibold", active ? "text-brand-700 dark:text-brand-300" : "text-ink-800 dark:text-ink-100", "hover:bg-ink-50 dark:hover:bg-white/5")}
                      >
                        <MobileIcon link={item} active={active || isOpen} />
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} aria-hidden />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            {flat.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  target={c.external ? "_blank" : undefined}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-lg py-2.5 pr-4 text-[15px] text-ink-600 hover:bg-ink-50 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-white/5",
                                    c.nested ? "pl-[4.25rem] text-[14px]" : "pl-[3.25rem] font-medium",
                                  )}
                                >
                                  <SubIcon link={c} nested={c.nested} />
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="space-y-4 border-t border-ink-100 p-5 dark:border-white/10">
              <div className="flex items-center justify-between">
                <Suspense fallback={null}>
                  <LanguageSwitcher locale={locale} label={dict.common.language} />
                </Suspense>
                <ThemeToggle label={dict.common.toggleTheme} className="h-10 w-10 bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-white" />
              </div>
              <div className="space-y-1.5 text-sm text-ink-600 dark:text-ink-300">
                {phone && (
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-brand-600" aria-hidden />
                    <span dir="ltr">{phone}</span>
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-600" aria-hidden />
                    {email}
                  </a>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!q.trim()) return;
      router.push(`/${locale}/search?q=${encodeURIComponent(q.trim())}`);
      onClose();
    },
    [q, locale, router, onClose],
  );
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  const shortcuts = [
    { label: dict.nav.news, href: `/${locale}/news` },
    { label: dict.nav.documents, href: `/${locale}/resources` },
    { label: dict.nav.vacancies, href: `/${locale}/vacancies` },
    { label: dict.nav.notices, href: `/${locale}/notices` },
    { label: dict.nav.systems, href: `/${locale}/systems` },
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-start justify-center bg-ink-950/70 px-4 pt-[12vh] backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.search}
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-ink-900"
            initial={{ y: -16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form role="search" onSubmit={submit} className="flex items-center gap-3 border-b border-ink-100 px-5 dark:border-white/10">
              <Search className="h-5 w-5 text-brand-600" aria-hidden />
              <label htmlFor="site-search" className="sr-only">
                {dict.nav.search}
              </label>
              <input
                ref={inputRef}
                id="site-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={dict.common.searchPlaceholder}
                className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-400"
              />
              <button type="button" onClick={onClose} className="rounded-lg border border-ink-200 px-2 py-1 text-xs font-semibold text-ink-500 dark:border-white/10">
                Esc
              </button>
            </form>
            <div className="flex flex-wrap gap-2 p-5">
              {shortcuts.map((s) => (
                <Link key={s.href} href={s.href} onClick={onClose} className="rounded-full bg-ink-50 px-3.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-white/5 dark:text-ink-200">
                  {s.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
