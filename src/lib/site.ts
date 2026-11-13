import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { getSingle } from "./strapi";
import { globalPopulate } from "./populate";
import type { Global } from "./types";

/** Official fallbacks (from www.mint.gov.et) used until Global is filled in the CMS. */
export const FALLBACK_CONTACT = {
  phone: "+251 11 813 2191",
  email: "contact@mint.gov.et",
  address: { en: "Addis Ababa, Ethiopia", am: "አዲስ አበባ፣ ኢትዮጵያ" },
};

export const getGlobal = cache(async (locale: Locale): Promise<Global | null> => {
  const res = await getSingle<Global>("global", locale, { populate: globalPopulate });
  if (res || locale === "en") return res;
  return getSingle<Global>("global", "en", { populate: globalPopulate });
});
