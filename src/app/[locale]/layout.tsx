import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { themeScript } from "@/components/layout/ThemeToggle";
import { getNavigation } from "@/lib/navigation";
import { FALLBACK_CONTACT, getGlobal } from "@/lib/site";
import { mediaUrl } from "@/lib/media";
import { SITE_URL } from "@/lib/seo";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["500", "600", "700", "800"] });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], variable: "--font-ethiopic", display: "swap", weight: ["400", "500", "600", "700"] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}


export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = getDictionary(locale);
  const global = await getGlobal(locale);
  const siteName = global?.siteName || dict.site.name;
  const favicon = mediaUrl(global?.favicon?.url);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteName, template: `%s | ${locale === "am" ? dict.site.name : "MInT"}` },
    description: global?.defaultSeo?.metaDescription || global?.siteTagline || dict.site.description,
    applicationName: siteName,
    ...(favicon ? { icons: { icon: favicon } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#07878c" },
    { media: "(prefers-color-scheme: dark)", color: "#07121d" },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const [global, nav] = await Promise.all([getGlobal(locale), getNavigation(locale, dict)]);

  return (
    <html lang={locale} className={`${body.variable} ${heading.variable} ${ethiopic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <I18nProvider locale={locale} dict={dict}>
          <MotionProvider>
            <Header nav={nav.header} logoUrl={mediaUrl(global?.logo?.url)} phone={global?.contactInfo?.phone || FALLBACK_CONTACT.phone} email={global?.contactInfo?.email || FALLBACK_CONTACT.email} />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <Footer locale={locale} dict={dict} global={global} links={nav.footer} sectors={nav.sectors} />
          </MotionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
