import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Global, Sector } from "@/lib/types";
import type { NavLink } from "@/lib/navigation";
import { iconFor } from "./NavIcons";
import { mediaUrl } from "@/lib/media";
import { FALLBACK_CONTACT } from "@/lib/site";
import { BlocksRenderer, hasBlocks } from "@/components/blocks/BlocksRenderer";
import { SocialIcon, socialLabels } from "@/components/ui/SocialIcon";
import { SubscribeForm } from "@/components/forms/SubscribeForm";
import { FeedbackWidget } from "@/components/forms/FeedbackWidget";
import { BrandMark } from "./BrandMark";
import { BackToTop } from "./BackToTop";

interface Props {
  locale: Locale;
  dict: Dictionary;
  global: Global | null;
  links: NavLink[];
  sectors: Sector[];
}

export function Footer({ locale, dict, global, links, sectors }: Props) {
  const contact = global?.contactInfo;
  const phone = contact?.phone || FALLBACK_CONTACT.phone;
  const email = contact?.email || FALLBACK_CONTACT.email;
  const address = contact?.address || FALLBACK_CONTACT.address[locale];
  const socials = global?.socialLinks ?? [];
  const L = (p: string) => `/${locale}${p}`;
  const resources = [
    { label: dict.nav.documents, href: L("/resources") },
    { label: dict.nav.programs, href: L("/programs") },
    { label: dict.nav.magazines, href: L("/magazines") },
    { label: dict.nav.pressReleases, href: L("/press-releases") },
    { label: dict.nav.gallery, href: L("/gallery") },
    { label: dict.nav.faq, href: L("/faq") },
    { label: dict.nav.systems, href: L("/systems") },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden bg-ink-950 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        {dict.site.name}
      </h2>
      {/* Feedback strip */}
      <div className="border-b border-white/5 bg-ink-50 dark:bg-ink-900">
        <div className="container-page py-5">
          <FeedbackWidget />
        </div>
      </div>

      {/* Newsletter */}
      <div className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-800 via-brand-700 to-ink-900" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="container-page relative grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-14">
          <div>
            <h3 className="text-2xl font-bold text-white sm:text-3xl">{dict.newsletter.title}</h3>
            <p className="mt-2 max-w-lg text-white/75">{dict.newsletter.text}</p>
          </div>
          <SubscribeForm tone="dark" />
        </div>
      </div>

      <div className="container-page relative grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <BrandMark logoUrl={mediaUrl(global?.logo?.url)} name={global?.siteName || dict.site.name} invert />
          <div className="mt-6 text-[15px] leading-relaxed text-white/65">
            {hasBlocks(global?.footerText) ? (
              <BlocksRenderer content={global!.footerText} className="prose-sm [&_p]:text-white/65" />
            ) : (
              <p>{global?.siteTagline || dict.footer.about}</p>
            )}
          </div>
          {socials.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-white/90">{dict.footer.followUs}</p>
              <ul className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={`${s.platform}-${s.url}`}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${socialLabels[s.platform]} ${dict.common.opensNewTab}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/80 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
                    >
                      <SocialIcon platform={s.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <FooterColumn title={dict.footer.quickLinks} links={links} className="lg:col-span-2" />
        <FooterColumn
          title={dict.nav.sectors}
          links={sectors.length ? sectors.map((s) => ({ label: s.name, href: L(`/sectors/${s.slug}`) })) : [{ label: dict.nav.allSectors, href: L("/sectors") }]}
          className="lg:col-span-3"
        />
        <div className="lg:col-span-3">
          <h3 className="mb-5 text-sm font-semibold tracking-wider text-gold-400 uppercase">{dict.footer.contact}</h3>
          <ul className="space-y-4 text-[15px] text-white/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden />
              <span className="whitespace-pre-line">{address}</span>
            </li>
            <li>
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex gap-3 hover:text-white">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden />
                <span dir="ltr">{phone}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="flex gap-3 hover:text-white">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden />
                {email}
              </a>
            </li>
            {contact?.workingHours && (
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden />
                {contact.workingHours}
              </li>
            )}
          </ul>
          <h3 className="mt-8 mb-4 text-sm font-semibold tracking-wider text-gold-400 uppercase">{dict.footer.resources}</h3>
          <ul className="flex flex-wrap gap-2">
            {resources.slice(0, 5).map((r) => {
              const Icon = iconFor(r);
              return (
                <li key={r.href}>
                  <Link href={r.href} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[13px] text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white">
                    <Icon className="h-3.5 w-3.5 text-brand-300" aria-hidden />
                    {r.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {global?.siteName || dict.site.name}. {dict.footer.rights}
          </p>
          <p className="flex items-center gap-3">
            <span className="flag-stripe inline-block h-2.5 w-6 rounded-sm" aria-hidden />
            {dict.footer.government}
          </p>
        </div>
      </div>
      <BackToTop label={dict.common.scrollTop} />
    </footer>
  );
}

function FooterColumn({ title, links, className }: { title: string; links: NavLink[]; className?: string }) {
  return (
    <div className={className}>
      <h3 className="mb-5 text-sm font-semibold tracking-wider text-gold-400 uppercase">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => {
          const Icon = iconFor(l);
          const inner = (
            <>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-300 ring-1 ring-white/10 transition group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-500">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="transition group-hover:translate-x-0.5">{l.label}</span>
            </>
          );
          const cls = "group inline-flex items-center gap-3 text-[15px] text-white/70 transition hover:text-white";
          return (
            <li key={`${l.href}-${l.label}`}>
              {l.external ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link href={l.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
