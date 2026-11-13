import "server-only";
import en from "./dictionaries/en.json";
import am from "./dictionaries/am.json";
import type { Locale } from "./config";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, am };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}
