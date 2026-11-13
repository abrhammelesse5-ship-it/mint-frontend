# Amharic translation notes

All interface strings live in `dictionaries/en.json` and `dictionaries/am.json`. Both files have the same keys.
The Amharic was written for this project and **should be checked by the Ministry's communications team** before launch.
The strings below are the ones that most need review.

| Key | Amharic used | English | Why it needs review |
| --- | --- | --- | --- |
| `nav.ecosystem` | ኢኮሲስተም | Ecosystem | Transliteration. Another option is "የፈጠራ ምህዳር". |
| `partnerTypes.startup` | ስታርትአፖች | Startups | Transliteration. Another option is "ጀማሪ ኩባንያዎች". |
| `partnerTypes.incubator` | ኢንኩቤተሮች | Incubators | Transliteration. Another option is "የፈጠራ ማበልጸጊያ ማዕከላት". |
| `nav.conceptNotes` / `pages.conceptNotes.title` | የፅንሰ-ሀሳብ ማቅረቢያ ጥሪዎች | Calls for concept notes | Check that this matches MInT's official wording. |
| `positions.stateMinister` | ሚኒስትር ዴኤታ | State Minister | This is the common government usage. Confirm it is right. |
| `positions.other` | ሥራ አስፈጻሚ | Executive | Generic. A more specific title may be wanted. |
| `nav.systems` | ሲስተሞች | Systems | Transliteration. Another option is "ሥርዓቶች". |
| `home.featured` | ተመራጭ | Featured | Another option is "ተለይቶ የቀረበ". |
| `status.normal` | ማሳሰቢያ | Normal (notice priority) | Shown as the badge on normal-priority notices. |
| `site.short` | MInT | MInT | The Latin acronym is used in both languages because it is the brand name. |
| `contact.workingHours` and other time text | – | – | Times in content are entered by editors. Ethiopian clock times (e.g. 2:30) should be written in the CMS. |

## Dates

When the locale is Amharic, dates are shown in the **Ethiopian calendar** with the "ዓ.ም" suffix. This uses
`Intl.DateTimeFormat("am-ET", { calendar: "ethiopic" })`. To show Gregorian dates instead, set
`ETHIOPIAN_CALENDAR_FOR_AM = false` in `src/lib/format.ts`.

## Content fallback

If an entry has no Amharic version in Strapi, the Amharic site shows the English version.

- Detail pages show a small notice saying the content is in English.
- Single types (Global, Home page, About sections and so on) fall back to English silently.
