import Image from "next/image";
import { Cpu, FlaskConical, Handshake, Lightbulb, Rocket, ShieldCheck, Satellite, Wifi, type LucideIcon } from "lucide-react";
import type { FocusArea } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { fallbackImage } from "@/lib/fallback-images";

const keywordIcons: [RegExp, LucideIcon][] = [
  [/research|ምርምር/i, FlaskConical],
  [/innovat|ፈጠራ|ኢኖቬ/i, Lightbulb],
  [/transfer|ሽግግር/i, Handshake],
  [/digital|ዲጂታል|e-?gov/i, Cpu],
  [/cyber|security|ደህንነት/i, ShieldCheck],
  [/space|satellite|ጠፈር/i, Satellite],
  [/infra|connect|ict|አይሲቲ/i, Wifi],
];
const fallbacks: LucideIcon[] = [FlaskConical, Lightbulb, Handshake, Cpu, Rocket, ShieldCheck];

function iconFor(title: string, i: number): LucideIcon {
  return keywordIcons.find(([re]) => re.test(title))?.[1] ?? fallbacks[i % fallbacks.length];
}

export function FocusAreas({ items, defaults = [] }: { items: FocusArea[]; defaults?: { title: string; description: string }[] }) {
  return (
    <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f, i) => {
        const Icon = iconFor(f.title, i);
        const img = mediaUrl(f.icon?.url);
        const description = f.description || defaults[i]?.description;
        const photo = fallbackImage({ seed: f.title, text: [f.title, defaults[i]?.title], pick: i });
        return (
          <RevealItem key={f.id ?? i} className="h-full">
            <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift dark:border-white/10 dark:bg-ink-900">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={photo} alt="" fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent" aria-hidden />
                <span className="absolute top-4 right-5 font-display text-4xl font-extrabold text-white/80 drop-shadow" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="relative flex flex-1 flex-col p-6 pt-9">
                <div className="absolute -top-7 left-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/30 ring-4 ring-white transition duration-300 group-hover:rotate-[-6deg] dark:ring-ink-900">
                  {img ? <Image src={img} alt="" width={28} height={28} className="h-7 w-7 object-contain brightness-0 invert" /> : <Icon className="h-7 w-7" aria-hidden />}
                </div>
                <h3 className="text-lg font-bold transition group-hover:text-brand-700 dark:group-hover:text-brand-300">{f.title}</h3>
                {description && <p className="mt-2 text-[15px] leading-relaxed text-ink-500 dark:text-ink-300">{description}</p>}
              </div>
            </article>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
