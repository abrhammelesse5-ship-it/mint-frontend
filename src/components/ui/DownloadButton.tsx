"use client";

import { Download } from "lucide-react";
import { PUBLIC_STRAPI_URL } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Counts the download (POST /api/documents/:documentId/download) then opens the file. */
export function DownloadButton({ documentId, url, label, className, variant = "solid" }: { documentId: string; url: string; label: string; className?: string; variant?: "solid" | "soft" }) {
  const onClick = () => {
    try {
      const key = `dl:${documentId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        void fetch(`${PUBLIC_STRAPI_URL}/api/documents/${documentId}/download`, { method: "POST", keepalive: true }).catch(() => undefined);
      }
    } catch {
      /* storage unavailable: still download */
    }
  };
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        variant === "solid" ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white dark:bg-white/5 dark:text-brand-300",
        className,
      )}
    >
      <Download className="h-4 w-4" aria-hidden />
      {label}
    </a>
  );
}
