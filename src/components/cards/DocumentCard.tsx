import { FileSpreadsheet, FileText, FileArchive, FileImage, File } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { OfficialDocument } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/format";
import { fileExt, fileSizeLabel, mediaUrl } from "@/lib/media";
import { Badge } from "@/components/ui/Badge";
import { DownloadButton } from "@/components/ui/DownloadButton";

const FILE_ICONS = { sheet: FileSpreadsheet, archive: FileArchive, image: FileImage, text: FileText, other: File };

function iconKey(ext: string): keyof typeof FILE_ICONS {
  if (["XLS", "XLSX", "CSV"].includes(ext)) return "sheet";
  if (["ZIP", "RAR", "7Z"].includes(ext)) return "archive";
  if (["PNG", "JPG", "JPEG", "WEBP"].includes(ext)) return "image";
  if (["PDF", "DOC", "DOCX", "TXT"].includes(ext)) return "text";
  return "other";
}

export function DocumentCard({ doc, locale, dict }: { doc: OfficialDocument; locale: Locale; dict: Dictionary }) {
  const ext = fileExt(doc.file) || "PDF";
  const Icon = FILE_ICONS[iconKey(ext)];
  const url = mediaUrl(doc.file?.url);
  return (
    <article className="card card-hover group flex h-full flex-col p-6">
      <div className="flex items-start gap-4">
        <div className="relative flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-200/60 dark:from-white/5 dark:to-white/10 dark:text-brand-300 dark:ring-white/10">
          <Icon className="h-6 w-6" aria-hidden />
          <span className="absolute -bottom-2 rounded bg-brand-700 px-1.5 text-[10px] font-bold text-white">{ext}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {doc.category && <Badge tone="brand">{doc.category.name}</Badge>}
            {doc.language && <Badge tone="gray">{dict.languages[doc.language]}</Badge>}
          </div>
          <h3 className="line-clamp-2 text-[16px] leading-snug font-semibold text-ink-900 dark:text-white">{doc.title}</h3>
          {doc.description && <p className="mt-1.5 line-clamp-2 text-sm text-ink-500 dark:text-ink-300">{doc.description}</p>}
        </div>
      </div>
      <dl className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
        {doc.publishDate && (
          <div className="flex gap-1">
            <dt className="sr-only">{dict.common.published}</dt>
            <dd>{formatDate(doc.publishDate, locale, "medium")}</dd>
          </div>
        )}
        {doc.documentNumber && (
          <div className="flex gap-1">
            <dt>{dict.common.documentNumber}</dt>
            <dd className="font-medium text-ink-700 dark:text-ink-200">{doc.documentNumber}</dd>
          </div>
        )}
        {doc.file?.size ? (
          <div>
            <dt className="sr-only">{dict.common.fileType}</dt>
            <dd>{fileSizeLabel(doc.file.size)}</dd>
          </div>
        ) : null}
        {!!doc.downloadCount && (
          <div>
            <dd>
              {formatNumber(doc.downloadCount, locale)} {dict.common.downloads}
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-auto pt-5">
        {url ? <DownloadButton documentId={doc.documentId} url={url} label={dict.common.download} variant="soft" /> : null}
      </div>
    </article>
  );
}
