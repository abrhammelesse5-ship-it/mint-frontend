/**
 * Paths used by the old mint.gov.et menu (imported into the CMS) mapped to routes of this site.
 * Used to rewrite CMS menu links and as permanent redirects (next.config.ts).
 */
export const LEGACY_PATHS: Record<string, string> = {
  "/message": "/about/minister-message",
  "/minister-message": "/about/minister-message",
  "/vision-mission-values": "/about#vision",
  "/organizational-structure": "/about#structure",
  "/power-duties": "/about#powers",
  "/powers-duties": "/about#powers",
  "/leadership": "/about#leadership",
  "/resources/policy-regulation-strategy": "/resources?type=policyRegulationStrategy",
  "/resources/guideline-standard": "/resources?type=guidelineStandard",
  "/resources/plan-report": "/resources?type=planReport",
  "/concept-note-calls": "/concept-notes",
  "/training-announcements": "/trainings",
  "/press-release": "/press-releases",
  "/magazine": "/magazines",
  "/vacancy": "/vacancies",
};

export function resolveLegacyPath(url: string): string {
  const [path, rest = ""] = url.split(/(?=[?#])/);
  const key = path.replace(/\/+$/, "").toLowerCase();
  return LEGACY_PATHS[key] ?? (rest ? path + rest : url);
}
