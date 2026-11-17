---
version: 1
slug: "discover"
primary_target: "#/discover"
related_targets: ["js/crimson-noir.js","css/crimson-noir.css"]
---

# Discover page (#/discover)

Scope: a new page inside the established Crimson Noir theme (js/crimson-noir.js + css/crimson-noir.css). Mode: Operate.
Audience: people on the server browsing for something new to watch or request. Job: see what's trending/popular/coming, find
by network, studio or genre, and request what isn't on the server. Data: Jellyfin Enhanced's Seerr proxy
(/JellyfinEnhanced/jellyseerr/discover/{trending,movies,tv,movies/upcoming,tv/upcoming,genreslider/{movie|tv}}, studio/network
feeds). Requesting opens JE's Seerr dialog (JE.jellyseerrMoreInfo.open(tmdbId, mediaType)), the user's choice. Needs Jellyfin
Enhanced with Seerr linked; without it the nav link is hidden.

## Direction contract

THESIS: Discover is a browsing tool for what you don't have yet: a filter rail and one big poster grid under a featured banner. It refuses a separate visual language and the many-shelves default; it reuses the theme's pills, badges and backdrop shading.
separate visual language; it reuses Home's slideshow and the theme's shelves so Discover feels native.

OWN-WORLD: Crimson Noir as built: black ground, full-bleed blurred-to-black backdrop, white pill primary button, smoked-glass
ghost buttons, Noto Sans heavy titles, red nav pill for the active page, status pills (green In library, violet Requested,
amber Processing, outlined Request).

STORY: The visitor sees what's trending this week, recognises what they already have from the badges, and requests the rest
without leaving the page.

FIRST VIEWPORT: Top bar with Discover active; left rail (search, All/Films/Shows, Lists, Networks, Studios, Genres), sticky; right: wide featured banner of the first title (rank or release date, Request/Open, More info), heading with sort pills, poster grid with status badges and Show more.

FORM: Browse (filter rail + grid), dealt lead of re-roll 1 (2026-11-17), seed:090a19ad81e3ab51; replaces the earlier Spotlight & shelves build.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
