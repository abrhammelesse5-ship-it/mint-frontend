import type { Metadata } from "next";
import { CircleHelp } from "lucide-react";
import { ctx, readSearch } from "@/lib/page";
import { getAll } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import type { Faq, FaqCategory } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { BlocksRenderer, blocksToText } from "@/components/blocks/BlocksRenderer";
import { ButtonLink } from "@/components/ui/Button";

const CATS: FaqCategory[] = ["general", "services", "systems", "vacancies"];

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/faq", title: dict.pages.faq.title, description: dict.pages.faq.text });
}

export default async function FaqPage({ params, searchParams }: PageProps<"/[locale]/faq">) {
  const { locale, dict } = await ctx(params);
  const s = await readSearch(searchParams);
  const faqs = await getAll<Faq>("faqs", locale, { sort: ["order:asc", "question:asc"] }, 300);
  const groups = CATS.map((c) => ({
    id: c,
    label: dict.faqCategories[c],
    items: faqs.filter((f) => f.category === c).map((f) => ({ id: f.documentId, question: f.question, answer: <BlocksRenderer content={f.answer} className="prose-base" /> })),
  })).filter((g) => g.items.length);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: blocksToText(f.answer, 1000) } })),
  };

  return (
    <ListShell theme="egov" locale={locale} dict={dict} title={dict.pages.faq.title} text={dict.pages.faq.text} eyebrow={dict.nav.resources} crumbs={[{ label: dict.nav.resources, href: `/${locale}/resources` }, { label: dict.nav.faq }]}>
      {groups.length ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
          <FaqAccordion groups={groups} initial={s.get("category")} allLabel={dict.common.all} />
        </>
      ) : (
        <EmptyState icon={CircleHelp} title={dict.empty.title} text={dict.empty.text} />
      )}
      <div className="mt-16 flex flex-col items-start justify-between gap-4 rounded-3xl bg-brand-50 p-8 sm:flex-row sm:items-center dark:bg-white/5">
        <div>
          <h2 className="text-xl font-bold">{dict.contact.getInTouch}</h2>
          <p className="mt-1 text-ink-600 dark:text-ink-300">{dict.contact.subtitle}</p>
        </div>
        <ButtonLink href={`/${locale}/contact`}>{dict.nav.contact}</ButtonLink>
      </div>
    </ListShell>
  );
}
