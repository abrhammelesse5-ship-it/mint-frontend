import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Locale routing: every page lives under /en/... or /am/...
 * A request without a locale prefix is redirected, preferring the visitor's
 * last choice (NEXT_LOCALE cookie), then Accept-Language, then English.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  let locale = isLocale(cookie) ? cookie : undefined;
  if (!locale) {
    const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
    locale = accept.startsWith("am") ? "am" : defaultLocale;
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, metadata files and anything with a file extension.
  matcher: ["/((?!_next|api|favicon.ico|icon.png|robots.txt|sitemap.xml|.*\\..*).*)"],
};

