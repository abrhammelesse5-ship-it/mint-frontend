import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { PageHero, type Crumb } from "./PageHero";
import type { ImageTheme } from "@/lib/fallback-images";
import { Pagination } from "./Pagination";

interface Props {
  locale: Locale;
  dict: Dictionary;
  title: string;
  text?: string;
  eyebrow?: string;
  crumbs: Crumb[];
  children: React.ReactNode;
  pagination?: { page: number; pageCount: number; basePath: string; params?: Record<string, string | undefined> };
  heroChildren?: React.ReactNode;
  theme?: ImageTheme;
}

/** Inner-page frame: dark hero with breadcrumbs, content container and pagination. */
export function ListShell({ locale, dict, title, text, eyebrow, crumbs, children, pagination, heroChildren, theme }: Props) {
  return (
    <>
      <PageHero title={title} subtitle={text} eyebrow={eyebrow} homeHref={`/${locale}`} homeLabel={dict.nav.home} breadcrumbLabel={dict.common.breadcrumb} crumbs={crumbs} theme={theme}>
        {heroChildren}
      </PageHero>
      <div className="container-page py-14 sm:py-16">
        {children}
        {pagination && <Pagination {...pagination} labels={{ previous: dict.common.previous, next: dict.common.next, page: dict.common.page }} />}
      </div>
    </>
  );
}
