import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Cpu, FlaskConical, Building2, Layers } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Sector } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { StrapiImage } from "@/components/ui/StrapiImage";
import { blocksToText } from "@/components/blocks/BlocksRenderer";

const SECTOR_ICONS = { ict: Cpu, research: FlaskConical, admin: Building2, other: Layers };

function sectorIconKey(slug: string): keyof typeof SECTOR_ICONS {
  if (/ict|digital|e-gov|infra/i.test(slug)) return "ict";
  if (/research|innovation|technology/i.test(slug)) return "research";
  if (/admin/i.test(slug)) return "admin";
  return "other";
}

/** Fallback icon for a sector without an uploaded icon. */
export function sectorIcon(slug: string) {
  return SECTOR_ICONS[sectorIconKey(slug)];
}

export { SECTOR_ICONS, sectorIconKey };

export function SectorCard({ sector, locale, subLabel }: { sector: Sector; locale: Locale; subLabel?: string }) {
  const Icon = SECTOR_ICONS[sectorIconKey(sector.slug)];
  const icon = mediaUrl(sector.icon?.url);
  const excerpt = blocksToText(sector.description, 140);
  return (
    <Link href={`/${locale}/sectors/${sector.slug}`} className="group relative isolate flex min-h-[380px] flex-col justify-end overflow-hidden rounded-3xl bg-ink-900 p-7 text-white shadow-card">
      <StrapiImage media={sector.coverImage} sizes="(min-width:1024px) 33vw, 100vw" fallback={{ seed: sector.slug, text: `${sector.name} ${sector.slug}` }} className="-z-20 opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/10" />
      <div className="absolute top-7 left-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur transition group-hover:bg-brand-600">
        {icon ? <Image src={icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" /> : <Icon className="h-7 w-7 text-gold-400 group-hover:text-white" aria-hidden />}
      </div>
      <ArrowUpRight className="absolute top-7 right-7 h-6 w-6 text-white/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
      <h3 className="text-2xl font-bold text-white">{sector.name}</h3>
      {excerpt && <p className="mt-2 line-clamp-2 text-white/70">{excerpt}</p>}
      {!!sector.subSectors?.length && (
        <div className="mt-5">
          {subLabel && <p className="sr-only">{subLabel}</p>}
          <ul className="flex flex-wrap gap-2">
            {sector.subSectors.slice(0, 4).map((s) => (
              <li key={s.documentId} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/15 backdrop-blur">
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Link>
  );
}
