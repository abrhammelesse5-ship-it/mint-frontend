"use client";

import { useState } from "react";
import { Check, Link2, Mail } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { useI18n } from "@/components/providers/I18nProvider";
import { fill } from "@/i18n/t";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const { dict } = useI18n();
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "Facebook", platform: "facebook" as const, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X", platform: "x" as const, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "LinkedIn", platform: "linkedin" as const, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "Telegram", platform: "telegram" as const, href: `https://t.me/share/url?url=${u}&text=${t}` },
  ];
  const btn = "flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-600 transition hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white dark:bg-white/5 dark:text-ink-300";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-ink-700 dark:text-ink-200">{dict.common.share}</span>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={fill(dict.common.shareOn, { network: l.name })} className={btn}>
          <SocialIcon platform={l.platform} />
        </a>
      ))}
      <a href={`mailto:?subject=${t}&body=${u}`} aria-label={fill(dict.common.shareOn, { network: "Email" })} className={btn}>
        <Mail className="h-4 w-4" aria-hidden />
      </a>
      <button
        type="button"
        className={btn}
        aria-label={copied ? dict.common.copied : dict.common.copyLink}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard blocked */
          }
        }}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? dict.common.copied : ""}
      </span>
    </div>
  );
}
