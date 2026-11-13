/* Types mirroring the MInT Strapi 5 schemas (src/api/*, src/components/*). */
import type { BlocksContent } from "@/components/blocks/types";

export type { BlocksContent };

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  mime?: string;
  size?: number;
}

export interface StrapiMedia {
  id: number;
  documentId?: string;
  name?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string;
  ext?: string;
  size?: number; // KB
  formats?: Partial<Record<"thumbnail" | "small" | "medium" | "large", StrapiMediaFormat>> | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface Collection<T> {
  data: T[];
  pagination: Pagination;
}

interface Base {
  id: number;
  documentId: string;
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

/* ---------- components ---------- */
export interface Seo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  shareImage?: StrapiMedia | null;
  canonicalUrl?: string | null;
}
export interface Link {
  id?: number;
  label: string;
  url: string;
  isExternal?: boolean | null;
  openInNewTab?: boolean | null;
}
export type SocialPlatform = "facebook" | "x" | "linkedin" | "youtube" | "telegram" | "flickr";
export interface SocialLink {
  id?: number;
  platform: SocialPlatform;
  url: string;
}
export interface ContactInfo {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  mapEmbedUrl?: string | null;
  workingHours?: string | null;
}
export interface Attachment {
  id?: number;
  title: string;
  file?: StrapiMedia[] | null;
  language?: "en" | "am" | null;
}
export interface Stat {
  id?: number;
  label: string;
  value: string;
  icon?: StrapiMedia | null;
}
export interface FocusArea {
  id?: number;
  title: string;
  icon?: StrapiMedia | null;
  description?: string | null;
}
export interface ValueItem {
  id?: number;
  title: string;
  description?: string | null;
}
export interface Duty {
  id?: number;
  title: string;
  description?: BlocksContent | null;
}
export interface DepartmentContact {
  id?: number;
  department: string;
  phone?: string | null;
  email?: string | null;
}
export interface Card {
  id?: number;
  title: string;
  description?: string | null;
  image?: StrapiMedia | null;
  link?: Link | null;
}

export type Section =
  | { __component: "sections.rich-text"; id: number; content?: BlocksContent | null }
  | { __component: "sections.image-gallery"; id: number; images?: StrapiMedia[] | null; caption?: string | null }
  | { __component: "sections.card-grid"; id: number; heading?: string | null; cards?: Card[] | null }
  | { __component: "sections.stats-bar"; id: number; heading?: string | null; stats?: Stat[] | null }
  | { __component: "sections.cta"; id: number; heading?: string | null; text?: string | null; button?: Link | null };

export interface StatsBar {
  id?: number;
  heading?: string | null;
  stats?: Stat[] | null;
}

/* ---------- collection types ---------- */
export interface Category extends Base {
  name: string;
  slug: string;
  type: "news" | "notice" | "magazine";
}
export interface Tag extends Base {
  name: string;
  slug: string;
}
export type DocumentCategoryType = "policyRegulationStrategy" | "guidelineStandard" | "planReport" | "other";
export interface DocumentCategory extends Base {
  name: string;
  slug: string;
  type: DocumentCategoryType;
  description?: string | null;
}
export interface HeroSlide extends Base {
  title: string;
  subtitle?: string | null;
  image?: StrapiMedia | null;
  link?: Link | null;
  order?: number | null;
  isActive?: boolean | null;
}
export interface AffiliatedInstitution extends Base {
  name: string;
  slug: string;
  acronym?: string | null;
  description?: string | null;
  logo?: StrapiMedia | null;
  websiteUrl?: string | null;
  socialLinks?: SocialLink[] | null;
  order?: number | null;
}
export interface Sector extends Base {
  name: string;
  slug: string;
  description?: BlocksContent | null;
  icon?: StrapiMedia | null;
  coverImage?: StrapiMedia | null;
  order?: number | null;
  content?: Section[] | null;
  seo?: Seo | null;
  parentSector?: Sector | null;
  subSectors?: Sector[] | null;
  directorates?: Directorate[] | null;
}
export type OfficialPosition = "minister" | "stateMinister" | "directorGeneral" | "director" | "other";
export interface Official extends Base {
  fullName: string;
  position: OfficialPosition;
  bio?: BlocksContent | null;
  photo?: StrapiMedia | null;
  email?: string | null;
  order?: number | null;
  isCurrent?: boolean | null;
}
export interface Directorate extends Base {
  name: string;
  slug: string;
  description?: BlocksContent | null;
  order?: number | null;
  head?: Official | null;
  sector?: Sector | null;
}
export interface OfficialDocument extends Base {
  title: string;
  slug: string;
  description?: string | null;
  file?: StrapiMedia | null;
  publishDate?: string | null;
  documentNumber?: string | null;
  language?: "en" | "am" | null;
  downloadCount?: number | null;
  category?: DocumentCategory | null;
  sector?: Sector | null;
  tags?: Tag[] | null;
}
export interface News extends Base {
  title: string;
  slug: string;
  summary?: string | null;
  content?: BlocksContent | null;
  coverImage?: StrapiMedia | null;
  gallery?: StrapiMedia[] | null;
  publishDate?: string | null;
  isFeatured?: boolean | null;
  viewCount?: number | null;
  seo?: Seo | null;
  category?: Category | null;
  tags?: Tag[] | null;
  sector?: Sector | null;
  author?: Official | null;
  relatedNews?: News[] | null;
}
export interface PressRelease extends Base {
  title: string;
  slug: string;
  content?: BlocksContent | null;
  attachments?: Attachment[] | null;
  publishDate?: string | null;
  tags?: Tag[] | null;
}
export interface Magazine extends Base {
  title: string;
  slug: string;
  issueNumber?: string | null;
  publishDate?: string | null;
  coverImage?: StrapiMedia | null;
  pdfFile?: StrapiMedia | null;
  description?: string | null;
}
export type NoticePriority = "normal" | "important" | "urgent";
export interface Notice extends Base {
  title: string;
  slug: string;
  content?: BlocksContent | null;
  attachments?: Attachment[] | null;
  publishDate?: string | null;
  expiryDate?: string | null;
  priority?: NoticePriority | null;
}
export interface Vacancy extends Base {
  title: string;
  slug: string;
  jobDescription?: BlocksContent | null;
  requirements?: BlocksContent | null;
  employmentType: "permanent" | "contract" | "internship";
  location?: string | null;
  salaryGrade?: string | null;
  numberOfPositions?: number | null;
  openDate?: string | null;
  closingDate?: string | null;
  vacancyStatus: "open" | "closed";
  attachments?: Attachment[] | null;
  directorate?: Directorate | null;
}
export interface ConceptNoteCall extends Base {
  title: string;
  slug: string;
  description?: BlocksContent | null;
  eligibility?: BlocksContent | null;
  openDate?: string | null;
  closingDate?: string | null;
  callStatus: "open" | "closed";
  attachments?: Attachment[] | null;
  sector?: Sector | null;
}
export interface TrainingAnnouncement extends Base {
  title: string;
  slug: string;
  description?: BlocksContent | null;
  startDate?: string | null;
  endDate?: string | null;
  beneficiaryList?: StrapiMedia[] | null;
  applicationUrl?: string | null;
  sector?: Sector | null;
}
export interface Program extends Base {
  title: string;
  slug: string;
  description?: string | null;
  content?: BlocksContent | null;
  coverImage?: StrapiMedia | null;
  startDate?: string | null;
  endDate?: string | null;
  programStatus?: "planned" | "ongoing" | "completed" | null;
  seo?: Seo | null;
  sector?: Sector | null;
  documents?: OfficialDocument[] | null;
}
export interface SystemApp extends Base {
  name: string;
  slug: string;
  description?: string | null;
  url: string;
  logo?: StrapiMedia | null;
  type: "internal" | "external";
  systemStatus: "active" | "maintenance" | "retired";
  owner?: Directorate | null;
}
export interface EventItem extends Base {
  title: string;
  slug: string;
  description?: BlocksContent | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  isOnline?: boolean | null;
  registrationUrl?: string | null;
  coverImage?: StrapiMedia | null;
  sector?: Sector | null;
  albums?: GalleryAlbum[] | null;
}
export interface GalleryAlbum extends Base {
  title: string;
  slug: string;
  coverImage?: StrapiMedia | null;
  photos?: StrapiMedia[] | null;
  externalUrl?: string | null;
  event?: EventItem | null;
}
export interface Page extends Base {
  title: string;
  slug: string;
  content?: Section[] | null;
  seo?: Seo | null;
  parent?: Page | null;
  children?: Page[] | null;
}
export type FaqCategory = "general" | "services" | "systems" | "vacancies";
export interface Faq extends Base {
  question: string;
  answer?: BlocksContent | null;
  order?: number | null;
  category: FaqCategory;
}
export type PartnerType = "startup" | "university" | "incubator" | "government" | "privateSector" | "international";
export interface EcosystemPartner extends Base {
  name: string;
  slug: string;
  description?: string | null;
  logo?: StrapiMedia | null;
  type: PartnerType;
  websiteUrl?: string | null;
  location?: string | null;
  sectors?: Sector[] | null;
}
export interface BidLink extends Base {
  title: string;
  externalUrl: string;
  publishDate?: string | null;
  closingDate?: string | null;
}

/* ---------- single types ---------- */
export interface Global extends Base {
  siteName: string;
  siteTagline?: string | null;
  logo?: StrapiMedia | null;
  favicon?: StrapiMedia | null;
  contactInfo?: ContactInfo | null;
  socialLinks?: SocialLink[] | null;
  footerText?: BlocksContent | null;
  defaultSeo?: Seo | null;
}
export interface HomePage extends Base {
  heroSlides?: HeroSlide[] | null;
  featuredNews?: News[] | null;
  highlightedSectors?: Sector[] | null;
  affiliatedInstitutions?: AffiliatedInstitution[] | null;
  focusAreas?: FocusArea[] | null;
  stats?: StatsBar | null;
  seo?: Seo | null;
}
export interface MinisterMessage extends Base {
  ministerName?: string | null;
  title?: string | null;
  photo?: StrapiMedia | null;
  message?: BlocksContent | null;
  official?: Official | null;
}
export interface VisionMissionValues extends Base {
  vision?: BlocksContent | null;
  mission?: BlocksContent | null;
  values?: ValueItem[] | null;
  establishmentHistory?: BlocksContent | null;
}
export interface PowersAndDuties extends Base {
  intro?: BlocksContent | null;
  duties?: Duty[] | null;
  legalBasis?: OfficialDocument[] | null;
}
export interface OrganizationalStructure extends Base {
  description?: BlocksContent | null;
  chartImage?: StrapiMedia | null;
  chartPdf?: StrapiMedia | null;
  directorates?: Directorate[] | null;
}
export interface ContactPage extends Base {
  contactInfo?: ContactInfo | null;
  departmentContacts?: DepartmentContact[] | null;
  seo?: Seo | null;
}

/* ---------- custom endpoints ---------- */
export interface MenuNode {
  documentId: string;
  label: string;
  url: string | null;
  isExternal: boolean;
  order: number;
  page: { documentId: string; title: string; slug: string } | null;
  children: MenuNode[];
}
export interface MenuTree {
  header: MenuNode[];
  footer: MenuNode[];
}
