/** Reusable Strapi 5 populate fragments (object syntax, dynamic zones via `on`). */

export const img = true;

export const seoPopulate = { populate: { shareImage: true } };
export const linkPopulate = true;
export const attachmentsPopulate = { populate: { file: true } };

export const sectionsPopulate = {
  on: {
    "sections.rich-text": true,
    "sections.image-gallery": { populate: { images: true } },
    "sections.card-grid": { populate: { cards: { populate: { image: true, link: true } } } },
    "sections.stats-bar": { populate: { stats: { populate: { icon: true } } } },
    "sections.cta": { populate: { button: true } },
  },
};

export const newsCardPopulate = {
  coverImage: img,
  category: { fields: ["name", "slug"] },
};

export const newsDetailPopulate = {
  coverImage: img,
  gallery: img,
  seo: seoPopulate,
  category: { fields: ["name", "slug"] },
  tags: { fields: ["name", "slug"] },
  sector: { fields: ["name", "slug"] },
  author: { fields: ["fullName", "position"], populate: { photo: true } },
  relatedNews: { fields: ["title", "slug", "summary", "publishDate"], populate: newsCardPopulate },
};

export const documentPopulate = {
  file: img,
  category: { fields: ["name", "slug", "type"] },
  sector: { fields: ["name", "slug"] },
};

export const sectorCardPopulate = {
  icon: img,
  coverImage: img,
  subSectors: { fields: ["name", "slug", "order"], sort: ["order:asc"] },
};

export const globalPopulate = {
  logo: img,
  favicon: img,
  contactInfo: true,
  socialLinks: true,
  defaultSeo: seoPopulate,
};

export const homePopulate = {
  heroSlides: { populate: { image: img, link: linkPopulate } },
  featuredNews: { populate: newsCardPopulate },
  highlightedSectors: { populate: sectorCardPopulate },
  affiliatedInstitutions: { populate: { logo: img } },
  focusAreas: { populate: { icon: img } },
  stats: { populate: { stats: { populate: { icon: img } } } },
  seo: seoPopulate,
};
