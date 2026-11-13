import "server-only";
import { localizeHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { strapiGet, getCollection } from "./strapi";
import type { MenuNode, MenuTree, Sector } from "./types";
import { isExternalUrl } from "./utils";
import { resolveLegacyPath } from "./legacy-paths";

import { resolveNavIcon, type NavIcon } from "./nav-icon";

export type { NavIcon };

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
  icon?: NavIcon;
  children?: NavLink[];
}

export interface NavItem extends NavLink {
  /** "mega" renders column groups (sectors), "list" a dropdown with icons. */
  kind?: "mega" | "list";
}

type Builder = (ctx: { locale: Locale; dict: Dictionary; sectors: Sector[] }) => NavLink[];

const L = (locale: Locale, href: string) => localizeHref(href, locale);

/** Built-in sub-menus used when the CMS menu item has no children of its own. */
const builtInChildren: Record<string, Builder> = {
  "/about": ({ locale, dict }) => [
    { label: dict.nav.overview, href: L(locale, "/about"), icon: "info", description: dict.pages.about.text },
    { label: dict.nav.ministerMessage, href: L(locale, "/about/minister-message"), icon: "quote", description: dict.navDesc.ministerMessage },
    { label: dict.nav.visionMission, href: L(locale, "/about#vision"), icon: "target", description: dict.navDesc.visionMission },
    { label: dict.nav.structure, href: L(locale, "/about#structure"), icon: "network", description: dict.navDesc.structure },
    { label: dict.nav.powers, href: L(locale, "/about#powers"), icon: "scale", description: dict.navDesc.powers },
    { label: dict.nav.leadership, href: L(locale, "/about#leadership"), icon: "users", description: dict.navDesc.leadership },
  ],
  "/sectors": ({ locale, sectors }) =>
    sectors.map((s) => ({
      label: s.name,
      href: L(locale, `/sectors/${s.slug}`),
      children: (s.subSectors ?? []).map((c) => ({ label: c.name, href: L(locale, `/sectors/${c.slug}`) })),
    })),
  "/policy-and-programs": ({ locale, dict }) => [
    { label: dict.nav.programs, href: L(locale, "/programs"), icon: "rocket", description: dict.navDesc.programs },
    { label: dict.nav.policies, href: L(locale, "/resources?type=policyRegulationStrategy"), icon: "scale", description: dict.navDesc.policies },
    { label: dict.nav.guidelines, href: L(locale, "/resources?type=guidelineStandard"), icon: "clipboard", description: dict.navDesc.guidelines },
    { label: dict.nav.plansReports, href: L(locale, "/resources?type=planReport"), icon: "file", description: dict.navDesc.plansReports },
  ],
  "/resources": ({ locale, dict }) => [
    { label: dict.nav.documents, href: L(locale, "/resources"), icon: "library", description: dict.navDesc.documents },
    { label: dict.nav.policies, href: L(locale, "/resources?type=policyRegulationStrategy"), icon: "scale", description: dict.navDesc.policies },
    { label: dict.nav.guidelines, href: L(locale, "/resources?type=guidelineStandard"), icon: "clipboard", description: dict.navDesc.guidelines },
    { label: dict.nav.plansReports, href: L(locale, "/resources?type=planReport"), icon: "file", description: dict.navDesc.plansReports },
    { label: dict.nav.magazines, href: L(locale, "/magazines"), icon: "book", description: dict.navDesc.magazines },
    { label: dict.nav.faq, href: L(locale, "/faq"), icon: "help", description: dict.navDesc.faq },
  ],
  "/media": ({ locale, dict }) => [
    { label: dict.nav.news, href: L(locale, "/news"), icon: "newspaper", description: dict.navDesc.news },
    { label: dict.nav.pressReleases, href: L(locale, "/press-releases"), icon: "megaphone", description: dict.navDesc.pressReleases },
    { label: dict.nav.gallery, href: L(locale, "/gallery"), icon: "images", description: dict.navDesc.gallery },
    { label: dict.nav.events, href: L(locale, "/events"), icon: "calendar", description: dict.navDesc.events },
    { label: dict.nav.magazines, href: L(locale, "/magazines"), icon: "book", description: dict.navDesc.magazines },
  ],
  "/announcements": ({ locale, dict }) => [
    { label: dict.nav.notices, href: L(locale, "/notices"), icon: "bell", description: dict.navDesc.notices },
    { label: dict.nav.bids, href: L(locale, "/bids"), icon: "gavel", description: dict.navDesc.bids },
    { label: dict.nav.vacancies, href: L(locale, "/vacancies"), icon: "briefcase", description: dict.navDesc.vacancies },
    { label: dict.nav.conceptNotes, href: L(locale, "/concept-notes"), icon: "lightbulb", description: dict.navDesc.conceptNotes },
    { label: dict.nav.trainings, href: L(locale, "/trainings"), icon: "graduation", description: dict.navDesc.trainings },
  ],
  "/systems": ({ locale, dict }) => [
    { label: dict.nav.internalSystems, href: L(locale, "/systems?type=internal"), icon: "building", description: dict.navDesc.internalSystems },
    { label: dict.nav.externalSystems, href: L(locale, "/systems?type=external"), icon: "globe", description: dict.navDesc.externalSystems },
  ],
};

/** Default header when the CMS menu is empty or unreachable (mirrors the seeded menu). */
function defaultHeader(dict: Dictionary): { label: string; url: string }[] {
  return [
    { label: dict.nav.home, url: "/" },
    { label: dict.nav.about, url: "/about" },
    { label: dict.nav.sectors, url: "/sectors" },
    { label: dict.nav.policyPrograms, url: "/policy-and-programs" },
    { label: dict.nav.resources, url: "/resources" },
    { label: dict.nav.media, url: "/media" },
    { label: dict.nav.announcements, url: "/announcements" },
    { label: dict.nav.systems, url: "/systems" },
    { label: dict.nav.ecosystem, url: "/ecosystem" },
    { label: dict.nav.contact, url: "/contact" },
  ];
}

function nodeHref(node: MenuNode, locale: Locale): { href: string; external: boolean } {
  if (node.page?.slug) return { href: L(locale, `/${node.page.slug}`), external: false };
  const url = node.url || "/";
  const external = node.isExternal || isExternalUrl(url);
  return { href: external ? url : L(locale, resolveLegacyPath(url)), external };
}

function normalisePath(url: string | null) {
  if (!url) return "";
  return url.replace(/\/+$/, "").split("?")[0].toLowerCase() || "/";
}

/** "CALL FOR CONCEPT NOTES" -> "Call for concept notes" (Latin all-caps labels only). */
function tidyLabel(label: string) {
  return /[a-z]/.test(label) || !/[A-Z]{4,}/.test(label) ? label : label.charAt(0) + label.slice(1).toLowerCase();
}

function convert(node: MenuNode, locale: Locale): NavLink {
  const { href, external } = nodeHref(node, locale);
  return { label: tidyLabel(node.label), href, external, children: node.children?.map((c) => convert(c, locale)) };
}

/** CMS children get the icon/description of the matching built-in link, so dropdowns look the same either way. */
function enrich(children: NavLink[], builtIn: NavLink[]): NavLink[] {
  return children.map((c) => {
    const match = builtIn.find((b) => b.href === c.href);
    return match
      ? { ...c, icon: c.icon ?? match.icon, description: c.description ?? match.description, children: c.children?.length ? c.children : match.children }
      : c;
  });
}

export async function getMenuTree(locale: Locale): Promise<MenuTree> {
  const res = await strapiGet<{ data: MenuTree }>("/menu", { locale });
  return { header: res?.data?.header ?? [], footer: res?.data?.footer ?? [] };
}

export async function getTopSectors(locale: Locale): Promise<Sector[]> {
  const res = await getCollection<Sector>("sectors", locale, {
    filters: { parentSector: { $null: true } },
    sort: ["order:asc", "name:asc"],
    fields: ["name", "slug", "order"],
    populate: { subSectors: { fields: ["name", "slug", "order"], sort: ["order:asc"] } },
    pagination: { pageSize: 20 },
  });
  return res.data;
}

export async function getNavigation(locale: Locale, dict: Dictionary) {
  const [tree, sectors] = await Promise.all([getMenuTree(locale), getTopSectors(locale)]);
  const source: MenuNode[] = tree.header.length
    ? tree.header
    : defaultHeader(dict).map((d, i) => ({ documentId: `default-${i}`, label: d.label, url: d.url, isExternal: false, order: i, page: null, children: [] }));

  const header: NavItem[] = source.map((node) => {
    const base = convert(node, locale);
    const key = normalisePath(node.url);
    if (builtInChildren[key]) {
      const builtIn = builtInChildren[key]({ locale, dict, sectors });
      base.children = base.children?.length ? enrich(base.children, builtIn) : builtIn;
    }
    const kind: NavItem["kind"] = key === "/sectors" && base.children?.some((c) => c.children?.length) ? "mega" : "list";
    return { ...base, kind, children: base.children?.length ? base.children : undefined };
  });

  const footer: NavLink[] = tree.footer.length
    ? tree.footer.map((n) => convert(n, locale))
    : [
        { label: dict.nav.about, href: L(locale, "/about") },
        { label: dict.nav.news, href: L(locale, "/news") },
        { label: dict.nav.vacancies, href: L(locale, "/vacancies") },
        { label: dict.nav.bids, href: L(locale, "/bids") },
        { label: dict.nav.events, href: L(locale, "/events") },
        { label: dict.nav.ecosystem, href: L(locale, "/ecosystem") },
        { label: dict.nav.contact, href: L(locale, "/contact") },
      ];

  return { header: header.map(withIcons) as NavItem[], footer: footer.map(withIcons), sectors };
}

/** Every link gets an icon: its built-in one, or one inferred from its label/URL (CMS items). */
function withIcons<T extends NavLink>(link: T): T {
  return { ...link, icon: link.icon ?? resolveNavIcon(link.label, link.href), children: link.children?.map(withIcons) };
}

/** Links for a hub/landing page ("/media", "/announcements", ...). */
export function hubLinks(path: string, locale: Locale, dict: Dictionary): NavLink[] {
  return (builtInChildren[path]?.({ locale, dict, sectors: [] }) ?? []).map(withIcons);
}
