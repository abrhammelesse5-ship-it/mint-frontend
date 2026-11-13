import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Building2 } from "lucide-react";
import { ctx } from "@/lib/page";
import { getSingle } from "@/lib/strapi";
import { seoPopulate } from "@/lib/populate";
import { buildMetadata } from "@/lib/seo";
import { FALLBACK_CONTACT, getGlobal } from "@/lib/site";
import type { ContactPage } from "@/lib/types";
import { ListShell } from "@/components/ui/ListShell";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale, dict } = await ctx(params);
  const page = await getSingle<ContactPage>("contact-page", locale, { populate: { seo: seoPopulate } });
  return buildMetadata({ locale, path: "/contact", title: dict.contact.title, description: dict.contact.subtitle, seo: page?.seo });
}

/** Only allow map embeds from Google Maps / OpenStreetMap. */
function safeMap(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return /(^|\.)google\.[a-z.]+$|(^|\.)openstreetmap\.org$/.test(u.hostname) && u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export default async function ContactRoute({ params }: PageProps<"/[locale]/contact">) {
  const { locale, dict } = await ctx(params);
  const [page, global] = await Promise.all([getSingle<ContactPage>("contact-page", locale, { populate: { contactInfo: true, departmentContacts: true } }), getGlobal(locale)]);
  const info = { ...global?.contactInfo, ...Object.fromEntries(Object.entries(page?.contactInfo ?? {}).filter(([, v]) => v)) };
  const phone = info.phone || FALLBACK_CONTACT.phone;
  const email = info.email || FALLBACK_CONTACT.email;
  const address = info.address || FALLBACK_CONTACT.address[locale];
  const map = safeMap(info.mapEmbedUrl) ?? "https://www.openstreetmap.org/export/embed.html?bbox=38.70%2C8.95%2C38.82%2C9.06&layer=mapnik";
  const cards = [
    { icon: Phone, label: dict.contact.phone, value: phone, href: `tel:${phone.replace(/\s+/g, "")}`, ltr: true },
    { icon: Mail, label: dict.contact.email, value: email, href: `mailto:${email}` },
    { icon: MapPin, label: dict.contact.address, value: address },
    ...(info.workingHours ? [{ icon: Clock, label: dict.contact.workingHours, value: info.workingHours }] : []),
  ];

  return (
    <ListShell theme="admin" locale={locale} dict={dict} title={dict.contact.title} text={dict.contact.subtitle} eyebrow={dict.contact.getInTouch} crumbs={[{ label: dict.nav.contact }]}>
      <RevealGroup className="relative z-10 -mt-20 mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <RevealItem key={c.label} className="h-full">
            <div className="card flex h-full flex-col p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-700/25">
                <c.icon className="h-6 w-6" aria-hidden />
              </span>
              <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{c.label}</p>
              {c.href ? (
                <a href={c.href} dir={c.ltr ? "ltr" : undefined} className="mt-1 font-semibold break-words text-ink-900 hover:text-brand-700 dark:text-white">
                  {c.value}
                </a>
              ) : (
                <p className="mt-1 font-semibold whitespace-pre-line text-ink-900 dark:text-white">{c.value}</p>
              )}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <h2 className="text-2xl font-bold sm:text-3xl">{dict.contact.formTitle}</h2>
          <p className="mt-2 mb-8 text-ink-500 dark:text-ink-300">{dict.contact.formText}</p>
          <ContactForm />
        </Reveal>
        <Reveal from="right" className="space-y-8">
          <div className="overflow-hidden rounded-3xl border border-ink-100 shadow-card dark:border-white/10">
            <iframe title={dict.contact.map} src={map} className="h-80 w-full border-0 grayscale-[30%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
          {!!page?.departmentContacts?.length && (
            <div>
              <h2 className="mb-4 text-xl font-bold">{dict.contact.departments}</h2>
              <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-ink-900">
                {page.departmentContacts.map((d, i) => (
                  <li key={d.id ?? i} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-3 font-semibold text-ink-900 dark:text-white">
                      <Building2 className="h-5 w-5 text-brand-600" aria-hidden />
                      {d.department}
                    </span>
                    <span className="flex flex-wrap gap-x-4 gap-y-1 pl-8 text-sm text-ink-600 sm:pl-0 dark:text-ink-300">
                      {d.phone && (
                        <a href={`tel:${d.phone.replace(/\s+/g, "")}`} dir="ltr" className="hover:text-brand-700">
                          {d.phone}
                        </a>
                      )}
                      {d.email && (
                        <a href={`mailto:${d.email}`} className="hover:text-brand-700">
                          {d.email}
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </div>
    </ListShell>
  );
}
