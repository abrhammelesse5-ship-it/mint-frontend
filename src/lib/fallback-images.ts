import type { StrapiMedia } from "./types";

/**
 * Themed photographic fallbacks (public/images/themes, public/images/hero).
 * Used wherever CMS content has no image, or only the MInT logo placeholder that the
 * importer attached to logo-only posts. A real photo from Strapi always wins.
 */

export type ImageTheme =
  | "egov" | "innovation" | "infrastructure" | "research" | "skills" | "coding" | "cyber"
  | "connectivity" | "policy" | "events" | "ai" | "economy" | "space" | "admin" | "general";

const T = (n: string) => `/images/themes/${n}.webp`;

export const THEME_IMAGES: Record<ImageTheme, string[]> = {
  egov: [T("egov-1"), T("egov-2"), T("egov-3")],
  innovation: [T("innovation-1"), T("innovation-2"), T("ai-1"), T("research-2"), T("youth-coding-2")],
  infrastructure: [T("infrastructure-1"), T("infrastructure-2"), T("space-1")],
  research: [T("research-1"), T("research-2"), T("innovation-2"), T("space-1"), T("ai-1")],
  skills: [T("skills-1"), T("skills-2"), T("youth-coding-1"), T("connectivity-2")],
  coding: [T("youth-coding-1"), T("youth-coding-2"), T("skills-1")],
  cyber: [T("cyber-1"), T("infrastructure-2")],
  connectivity: [T("connectivity-1"), T("connectivity-2"), T("infrastructure-1")],
  policy: [T("policy-1"), T("policy-3"), T("policy-2"), T("events-1"), T("admin-1"), T("egov-2")],
  events: [T("events-1"), T("innovation-1"), T("ai-1")],
  ai: [T("ai-1"), T("youth-coding-2"), T("research-2")],
  economy: [T("digital-economy-1"), T("digital-economy-2"), T("egov-1"), T("connectivity-1")],
  space: [T("space-1"), T("research-2")],
  admin: [T("admin-1"), T("egov-2"), T("policy-1")],
  general: [
    T("egov-1"), T("innovation-1"), T("infrastructure-2"), T("research-1"), T("skills-1"), T("cyber-1"),
    T("connectivity-1"), T("policy-1"), T("youth-coding-1"), T("ai-1"), T("digital-economy-1"), T("events-1"),
    T("egov-3"), T("innovation-2"), T("research-2"), T("connectivity-2"), T("youth-coding-2"), T("space-1"),
    T("skills-2"), T("policy-3"), T("digital-economy-2"), T("admin-1"),
  ],
};

/** Wide hero backgrounds (1600px). */
export const HERO_IMAGES = {
  ministry: "/images/hero/ministry.webp",
  innovation: "/images/hero/innovation.webp",
  connectivity: "/images/hero/connectivity.webp",
  datacenter: "/images/hero/datacenter.webp",
} as const;

const HERO_BY_THEME: Partial<Record<ImageTheme, string>> = {
  egov: HERO_IMAGES.ministry,
  policy: HERO_IMAGES.ministry,
  admin: HERO_IMAGES.ministry,
  general: HERO_IMAGES.ministry,
  innovation: HERO_IMAGES.innovation,
  events: HERO_IMAGES.innovation,
  infrastructure: HERO_IMAGES.datacenter,
  cyber: HERO_IMAGES.datacenter,
  connectivity: HERO_IMAGES.connectivity,
  economy: HERO_IMAGES.connectivity,
};

/** Keyword rules (English + Amharic), checked in order; first match wins. */
const RULES: [ImageTheme, RegExp][] = [
  ["cyber", /cyber|security|insa\b|ሳይበር|ደህንነት/i],
  ["ai", /artificial intelligence|\bai\b|robot|machine learning|አርቴፊሻል|ሰው ሰራሽ/i],
  ["space", /space|satellite|astronom|geospatial|ህዋ|ሳተላይት|ጠፈር/i],
  ["coding", /coder|coding|programm|software develop|hackathon|ኮደር|ኮዲንግ|ፕሮግራሚንግ/i],
  ["egov", /e-?gov|e-?service|digital id|fayda|government service|public service|portal|ኤሌክትሮኒክ|ዲጂታል መታወቂያ|ፋይዳ|አገልግሎት/i],
  ["infrastructure", /data ?cent|infrastructure|fib(er|re)|broadband|cloud|server|network|\bict\b|መሰረተ ልማት|መሠረተ ልማት|ዳታ ማዕከል/i],
  ["connectivity", /connectiv|rural|internet|telecom|mobile|\b[45]g\b|ገጠር|ኢንተርኔት|ቴሌኮም/i],
  ["economy", /econom|payment|fintech|e-?commerce|trade|invest|market|ኢኮኖሚ|ክፍያ|ንግድ|ኢንቨስት/i],
  ["research", /research|science|scien|laborator|biotech|nuclear|university|ምርምር|ሳይንስ|ዩኒቨርሲቲ|ላቦራቶሪ/i],
  ["skills", /training|skill|capacity|course|scholar|curriculum|ስልጠና|ስልጠኛ|ክህሎት|አቅም ግንባታ/i],
  ["innovation", /innovat|startup|start-up|incubat|technology (development|transfer)|entrepreneur|prototype|ኢኖቬሽን|ፈጠራ|ስታርት|ቴክኖሎጂ ሽግግር/i],
  ["events", /event|conference|forum|summit|exhibition|expo|\bweek\b|festival|award|ጉባኤ|ኤግዚቢሽን|ፎረም|ሳምንት|ዐውደ ርዕይ|ሽልማት/i],
  ["policy", /policy|strateg|law|proclamation|regulat|directive|agreement|\bmou\b|memorandum|\bsign|cooperat|partnership|meeting|delegation|minister|bilateral|ፖሊሲ|ስትራቴጂ|አዋጅ|ስምምነት|ውይይት|ስብሰባ|ትብብር|ሚኒስትር/i],
  ["admin", /administration|finance|human resource|procurement|audit|\bbids?\b|tender|vacanc|አስተዳደር|ፋይናንስ|ግዥ|ጨረታ/i],
  ["egov", /digital|ዲጂታ/i],
];

/** Boilerplate that appears in almost every post and would skew keyword theming. */
const BOILERPLATE = /ministry of innovation and technology|innovation and technology minister|\bmint\b|የኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር|ኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር|ኢኖቬሽንና ቴክኖሎጂ ሚኒስትር|ሚኒስቴር መሥሪያ ቤት/gi;

function matchTheme(text: string): ImageTheme | null {
  const clean = text.replace(BOILERPLATE, " ");
  for (const [theme, re] of RULES) if (re.test(clean)) return theme;
  return null;
}

/** Theme from the first text that matches (pass the most specific text first, e.g. title, then category, then summary). */
export function themeFor(...texts: (string | null | undefined)[]): ImageTheme {
  for (const t of texts) {
    if (!t) continue;
    const theme = matchTheme(t);
    if (theme) return theme;
  }
  return "general";
}

/** Small stable string hash (FNV-1a). */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface FallbackSpec {
  /** Stable id used to pick within the themed set (slug / documentId). */
  seed: string;
  /** Text(s) used for keyword theming, most specific first (title, category, summary...). */
  text?: string | null | (string | null | undefined)[];
  /** Force a theme instead of keyword detection. */
  theme?: ImageTheme;
  /** Pick this index in the themed set instead of hashing the seed (keeps a row of cards distinct). */
  pick?: number;
}

export function fallbackImage(spec: FallbackSpec | string): string {
  const s = typeof spec === "string" ? { seed: spec, text: spec } : spec;
  const theme = s.theme ?? themeFor(...[s.text].flat(), s.seed.replace(/[-_]+/g, " "));
  const pool = THEME_IMAGES[theme];
  const i = typeof s.pick === "number" ? s.pick : hashString(s.seed || "mint");
  return pool[i % pool.length];
}

export function heroImageFor(spec: FallbackSpec | string): string {
  const s = typeof spec === "string" ? { seed: spec, text: spec } : spec;
  const theme = s.theme ?? themeFor(...[s.text].flat(), s.seed);
  return HERO_BY_THEME[theme] ?? fallbackImage({ ...s, theme });
}

/** The importer attached the MInT logo to logo-only posts; treat it as "no image". */
export function isPlaceholderMedia(media?: StrapiMedia | null): boolean {
  if (!media?.url) return true;
  const hay = `${media.name ?? ""} ${media.url}`;
  return /mint[-_ ]?logo|logo24|\/brand\//i.test(hay);
}

/** Media to show, or null when it is missing / only the logo placeholder. */
export function realMedia(media?: StrapiMedia | null): StrapiMedia | null {
  return media && !isPlaceholderMedia(media) ? media : null;
}
