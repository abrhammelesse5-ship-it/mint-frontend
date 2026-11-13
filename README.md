# MInT public website (Next.js frontend)

This is the bilingual (English / Amharic) public website of the **Ministry of Innovation and Technology (MInT), Ethiopia**.
All content comes from the Strapi 5 CMS in `mint-cms`.

- **Next.js 16** (App Router, TypeScript) and **React 19**
- **Tailwind CSS 4**, **framer-motion** and **lucide-react**
- Fonts: **Noto Sans Ethiopic**, plus Inter and Plus Jakarta Sans
- Routes are `/en/...` and `/am/...`. Visiting `/` redirects to the visitor's language, which defaults to English.
- Pages are statically generated and revalidated about every 60 seconds (ISR). Published CMS changes appear within a minute, with no rebuild.

## Requirements

- **Node.js 20.9 or newer.** Node 22 LTS is recommended.
- The MInT Strapi CMS must be running, for example on `http://localhost:1337`.

## Run on Windows (PowerShell)

```powershell
cd C:\Users\mint\mint-frontend
copy .env.example .env.local      # then edit .env.local if Strapi is not on http://localhost:1337
npm install
npm run build
npm start                          # http://localhost:3000
```

For development with hot reload, run `npm run dev` instead of `build` and `start`.

In the **Strapi** `.env`, `FRONTEND_URL` must include the website origin, for example
`FRONTEND_URL=http://localhost:3000`. CORS for the view counter, download counter, contact form, newsletter and
feedback depends on it. Restart Strapi after you change it.

## Environment variables (`.env.local`)

| Variable | Description |
| --- | --- |
| `STRAPI_URL` | Strapi base URL used by the Next.js server, e.g. `http://localhost:1337` |
| `NEXT_PUBLIC_STRAPI_URL` | Strapi URL used by browsers (media, counters, forms). It must be reachable by visitors. |
| `STRAPI_API_TOKEN` | Optional **read-only** API token. If it is empty, the Public role permissions are used. |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the website. Used for canonical and OpenGraph URLs, `sitemap.xml` and `robots.txt`. |
| `REVALIDATE_SECONDS` | ISR interval in seconds. The default is 60. |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build, including the type check |
| `npm start` | Serve the production build on port 3000 |
| `npm run lint` | ESLint (`eslint-config-next`) |

## Project structure

```
src/
  proxy.ts                 locale redirect (Next 16 "proxy", formerly middleware)
  app/[locale]/...         all pages (home, about, sectors, news, notices, vacancies, ...)
  app/[locale]/[...slug]   generic CMS "Page" by slug
  app/sitemap.ts, robots.ts
  components/              layout (header, footer), ui, cards, blocks renderer, forms, media
  i18n/dictionaries        en.json / am.json UI strings (see i18n/TRANSLATION_NOTES.md)
  lib/strapi.ts            typed Strapi client (ISR, timeouts, Amharic -> English fallback)
  lib/populate.ts          populate objects (dynamic zones use `on`)
  lib/types.ts             content types matching the CMS schemas
```

## Notes

- If the CMS is unreachable or a section is empty, pages render friendly empty states instead of errors.
- The header menu comes from `GET /api/menu?locale=`. Built-in sub-menus (About, Sectors, Media and so on) are added when a
  CMS menu item has no children. The Sectors mega menu is built from the sector tree.
- The view counter (`POST /api/news-items/:documentId/view`) and the download counter
  (`POST /api/documents/:documentId/download`) run once per browser session.
- The contact, newsletter and feedback forms include the `website` honeypot field the CMS expects, and handle HTTP 429 (rate limit).
- Dark mode follows the system setting and can be toggled. Reduced-motion preferences are respected.

## Brand assets (`public/brand/`)
Official MInT logos taken from the archived mint.gov.et (no SVG exists, so these are PNGs). `*-original.png` are the source files on white. The transparent versions were made from them by colour-to-alpha. `mint-emblem.png` is cropped from the logo and is used for the favicon (`src/app/icon.png`) and the apple-icon. `mint-og-default.png` is the default social share image. If `Global.logo` is set in Strapi, it overrides the bundled header and footer logo. When there is no image, placeholders show the logo. They never show people photos.
