import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";
import { ctx } from "@/lib/page";
import { getCollection } from "@/lib/strapi";
import { buildMetadata } from "@/lib/seo";
import { hubLinks } from "@/lib/navigation";
import { formatDate } from "@/lib/format";
import type { Notice } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { HubTiles } from "@/components/hub/HubTiles";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

const one = { pagination: { pageSize: 1 }, fields: ["documentId"] };

export async function generateMetadata({ params }: PageProps<"/[locale]/announcements">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  return buildMetadata({ locale, path: "/announcements", title: dict.pages.announcements.title, description: dict.pages.announcements.text });
}

export default async function AnnouncementsHub({ params }: PageProps<"/[locale]/announcements">) {
  const { locale, dict } = await ctx(params);
  const open = (field: string) => ({ ...one, filters: { [field]: { $eq: "open" } } });
  const [notices, bids, vac, calls, trainings] = await Promise.all([
    getCollection<Notice>("notices", locale, { sort: ["publishDate:desc", "publishedAt:desc"], fields: ["title", "slug", "publishDate", "priority", "publishedAt"], pagination: { pageSize: 6 } }),
    getCollection("bid-links", locale, one),
    getCollection("vacancies", locale, open("vacancyStatus")),
    getCollection("concept-note-calls", locale, open("callStatus")),
    getCollection("training-announcements", locale, one),
  ]);
  const L = (p: string) => `/${locale}${p}`;
  const counts = { [L("/notices")]: notices.pagination.total, [L("/bids")]: bids.pagination.total, [L("/vacancies")]: { n: vac.pagination.total, label: dict.home.openNow }, [L("/concept-notes")]: { n: calls.pagination.total, label: dict.home.openNow }, [L("/trainings")]: trainings.pagination.total };
  return (
    <ListShell theme="admin" locale={locale} dict={dict} title={dict.pages.announcements.title} text={dict.pages.announcements.text} eyebrow={dict.site.short} crumbs={[{ label: dict.nav.announcements }]}>
      <HubTiles
        links={hubLinks("/announcements", locale, dict)}
        counts={counts}
        locale={locale}
        countLabel={dict.common.items} countLabelOne={dict.common.item}
      />
      {!!notices.data.length && (
        <section className="mt-20" aria-labelledby="notices-h">
          <SectionHeading
            id="notices-h"
            eyebrow={dict.nav.notices}
            title={dict.home.noticesTitle}
            action={{ href: L("/notices"), label: dict.common.viewAll }}
          />
          <Reveal>
            <ul className="divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-ink-900">
              {notices.data.map((n) => (
                <li key={n.documentId}>
                  <Link href={L(`/notices/${n.slug}`)} className="group flex items-center gap-4 p-5 transition hover:bg-brand-50/50 dark:hover:bg-white/5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                      <Bell className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white">{n.title}</span>
                      <span className="text-sm text-ink-500">{formatDate(n.publishDate || n.publishedAt, locale)}</span>
                    </span>
                    {n.priority && n.priority !== "normal" && <Badge tone={n.priority === "urgent" ? "red" : "gold"}>{dict.status[n.priority]}</Badge>}
                    <ArrowRight className="h-5 w-5 shrink-0 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}
    </ListShell>
  );
}
