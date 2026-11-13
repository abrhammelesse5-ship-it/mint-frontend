/** Icon names for navigation links; resolved to lucide icons in components/layout/NavIcons.tsx. */
export type NavIcon =
  | "home" | "info" | "quote" | "target" | "network" | "scale" | "users" | "layers" | "rocket" | "file" | "book"
  | "clipboard" | "library" | "newspaper" | "megaphone" | "images" | "calendar" | "bell" | "gavel"
  | "briefcase" | "lightbulb" | "graduation" | "monitor" | "globe" | "help" | "cpu" | "building"
  | "flask" | "wifi" | "shield" | "brain" | "satellite" | "landmark" | "phone" | "mail" | "search"
  | "handshake" | "chart" | "coins" | "server" | "code" | "map" | "link" | "video" | "award" | "lock"
  | "accessibility" | "sitemap" | "transfer" | "microscope" | "id" | "store" | "settings" | "download";

/** Ordered keyword rules over "label + href" (English and Amharic). First match wins. */
const RULES: [NavIcon, RegExp][] = [
  ["home", /^\/?(en|am)?\/?$|^home$|^መነሻ|^ዋና ገጽ/i],
  ["lock", /privacy|terms|cookie|ግላዊነት/i],
  ["mail", /e-?mail|webmail|ኢሜይል/i],
  ["graduation", /e-?learning|learning|lms\b|ትምህርት/i],
  ["gavel", /e-?gp\b|procurement|ግዥ/i],
  ["coins", /ifmis|financial|payroll/i],
  ["settings", /it support|help ?desk|support|ድጋፍ/i],
  ["chart", /quality|measure|survey|dashboard|statistic/i],
  ["library", /knowledge|repository|archive|እውቀት/i],
  ["landmark", /e-?service|digital service|ኤሌክትሮኒክ አገልግሎት/i],
  ["quote", /minister-message|minister'?s message|message|መልእክት/i],
  ["target", /vision|mission|values|#vision|ራዕይ|ተልዕኮ/i],
  ["sitemap", /\bstructure|organi[sz]ation|organogram|#structure|መዋቅር/i],
  ["scale", /powers|duties|mandate|#powers|polic|regulat|law|proclamation|legal|ሥልጣን|ስልጣን|ፖሊሲ|ሕግ|አዋጅ/i],
  ["users", /leadership|officials|management|team|staff|#leadership|አመራር|ኃላፊዎች/i],
  ["shield", /cyber|security|ደህንነት|ሳይበር/i],
  ["brain", /artificial|\bai\b|አርቴፊሻል/i],
  ["satellite", /space|satellite|geospatial|ህዋ|ሳተላይት/i],
  ["code", /coder|coding|software|developer|ኮደር/i],
  ["id", /digital id|fayda|identity|መታወቂያ/i],
  ["wifi", /connectiv|broadband|internet|telecom|ኢንተርኔት|ቴሌኮም/i],
  ["server", /infrastructure|data ?cent|cloud|መሠረተ ልማት|መሰረተ ልማት/i],
  ["landmark", /e-?gov|government|public service|መንግስት|መንግሥት/i],
  ["coins", /econom|finance|budget|payment|fintech|ኢኮኖሚ|ፋይናንስ|በጀት/i],
  ["transfer", /technology (development and )?transfer|transfer|ሽግግር/i],
  ["microscope", /research|science|laborator|ምርምር|ሳይንስ/i],
  ["lightbulb", /innovat|concept|idea|ኢኖቬሽን|ፈጠራ|ፅንሰ|ጽንሰ/i],
  ["rocket", /program|project|initiative|startup|ፕሮግራም|ፕሮጀክት/i],
  ["clipboard", /guideline|standard|directive|መመሪያ|ደረጃ/i],
  ["chart", /plan|report|statistic|performance|እቅድ|ሪፖርት/i],
  ["library", /resources|documents|publications|download|ሰነድ|ሀብት/i],
  ["book", /magazine|journal|newsletter|መጽሔት/i],
  ["help", /faq|question|help|ጥያቄ/i],
  ["newspaper", /news|ዜና/i],
  ["megaphone", /press|media release|መግለጫ/i],
  ["images", /gallery|photo|album|ፎቶ|ምስል/i],
  ["video", /video|ቪዲዮ/i],
  ["calendar", /event|calendar|ሁነት|ክስተት|ዝግጅት/i],
  ["bell", /notice|announcement|ማስታወቂያ/i],
  ["gavel", /bid|tender|procurement|ጨረታ|ግዥ/i],
  ["briefcase", /vacanc|career|job|employment|ክፍት የሥራ|ሥራ ቦታ|ስራ/i],
  ["graduation", /training|course|scholar|skill|ስልጠና|ክህሎት/i],
  ["handshake", /ecosystem|partner|stakeholder|institution|affiliat|cooperat|አጋር|ተቋማት/i],
  ["building", /internal|admin|directorate|office|human resource|አስተዳደር|ዳይሬክቶሬት|የውስጥ/i],
  ["globe", /external|international|portal|website|የውጭ/i],
  ["monitor", /system|platform|application|app\b|ሲስተም|ሥርዓት/i],
  ["phone", /contact|call|አግኙን|ያግኙን/i],
  ["mail", /subscribe|newsletter|email|feedback|ኢሜይል|አስተያየት/i],
  ["search", /search|ፈልግ/i],
  ["accessibility", /accessib|ተደራሽ/i],
  ["map", /map|location|address|ካርታ|አድራሻ/i],
  ["award", /award|prize|ሽልማት/i],
  ["images", /media|ሚዲያ/i],
  ["layers", /sector|ዘርፍ/i],
  ["info", /about|overview|history|ስለ|አጠቃላይ/i],
  ["cpu", /ict|digital|technology|ቴክኖሎጂ|ዲጂታል/i],
];

export function resolveNavIcon(label: string, href = ""): NavIcon {
  const external = /^https?:/i.test(href);
  const path = external ? href.replace(/^https?:\/\/[^/]+/i, "") : href.replace(/^\/(en|am)(?=\/|$)/, "");
  if (href && !external && (path === "" || path === "/")) return "home";
  const text = `${label} ${path.replace(/[-_/]+/g, " ")} ${href.includes("#") ? href.slice(href.indexOf("#")) : ""}`;
  for (const [icon, re] of RULES.slice(1)) if (re.test(text)) return icon;
  return external ? "link" : "layers";
}
