import { Download, FileText } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Attachment, StrapiMedia } from "@/lib/types";
import { fileExt, fileSizeLabel, mediaUrl } from "@/lib/media";

export function Attachments({ items, files, dict, title }: { items?: Attachment[] | null; files?: StrapiMedia[] | null; dict: Dictionary; title?: string }) {
  const rows: { key: string; label: string; media: StrapiMedia; lang?: string }[] = [];
  (items ?? []).forEach((a, i) =>
    (a.file ?? []).forEach((f, j) => rows.push({ key: `${i}-${j}`, label: (a.file?.length ?? 0) > 1 ? `${a.title} (${j + 1})` : a.title, media: f, lang: a.language ? dict.languages[a.language] : undefined })),
  );
  (files ?? []).forEach((f, i) => rows.push({ key: `f-${i}`, label: f.caption || f.name || `${dict.common.fileType} ${i + 1}`, media: f }));
  if (!rows.length) return null;
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-bold">{title ?? dict.common.attachments}</h2>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.key}>
            <a href={mediaUrl(r.media.url)!} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-ink-100 p-3 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-white/10 dark:hover:bg-white/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-white/5 dark:text-brand-300">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-sm font-semibold text-ink-900 dark:text-white">{r.label}</span>
                <span className="text-xs text-ink-500">
                  {[fileExt(r.media), fileSizeLabel(r.media.size), r.lang].filter(Boolean).join(" · ")}
                </span>
              </span>
              <Download className="h-4 w-4 text-ink-400 transition group-hover:text-brand-600" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
