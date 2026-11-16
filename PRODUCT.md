# Product

<!-- impeccable:product-schema 1 -->

> Written without an interview (the owner skipped the questions); facts come from building the theme, plugin and repo. Lines marked *(inferred)* are assumptions to confirm.

## Platform

web

## Users

- **Jellyfin self-hosters browsing GitHub, Reddit or plugin lists** who decide in seconds whether a theme is worth installing on their server. They judge mostly by screenshots. *(inferred)*
- **People the owner sends the link to** (other users of the owner's server and friends) who already want it and need clear install steps.
- **The owner** (GitHub: stackinnnn), who maintains it and releases updates through GitHub Actions.

## Product Purpose

Crimson Noir is a theme for Jellyfin 12's web client: a black interface that lets each title's artwork backdrop show through, with an accent colour picker (red by default). It also rebuilds many pages: Home slideshow, detail pages, collections, seasons, people, search, settings, watchlist, requests, calendar and the video player. Success = someone lands on the repo, sees what it looks like, and installs it from the plugin catalog without help.

## Positioning

Not just a stylesheet: it rebuilds whole pages (box-set shelf collections, career-timeline person pages, list-and-preview search, Ready-to-watch watchlist), and it works alongside Jellyfin Enhanced and KefinTweaks rather than replacing them. It installs from the Jellyfin plugin catalog, the same way SleekFin does.

## Operating Context

- Installed from Dashboard → Plugins → Repositories with `https://raw.githubusercontent.com/stackinnnn/crimson-noir/main/manifest.json`. It requires the File Transformation plugin.
- A manual install (Custom CSS + JavaScript Injector) is also possible.
- The repo page is read on GitHub, usually in dark mode, on desktop and on phones. GitHub strips custom CSS and fonts from READMEs; only images, tables, HTML alignment, `<picture>` and `<details>` are available.

## Capabilities and Constraints

- Jellyfin 12 only (targetAbi 12.0.0.0; tested on 12.4.0).
- Needs a modern browser engine (CSS `:has()` + `color-mix()`): Chrome/Edge 111+, Safari 16.4+, Firefox 121+. Older engines get stock Jellyfin.
- Tested: Chrome, Zen, Jellium Desktop. Safari has been analysed but not tested on a device. Jellyfin Media Player 1.x falls back to stock. Mobile and TV apps are untested.
- Per-person settings in the profile panel: accent colour (8 + custom), backdrops, metadata on hover.
- Plugin settings: enable theme, Jellium Desktop support.
- Requests and Calendar pages need Jellyfin Enhanced. The Watchlist tab needs KefinTweaks.

## Brand Commitments

- Name: **Crimson Noir**. Default accent crimson/red (#e50914-like); the theme's own look is near-black surfaces with blurred artwork backdrops.
- Existing assets: `assets/banner.png`, `assets/thumb.png` (catalog image), and screenshots in `docs/screenshots/` (Home in crimson, accent picker, collection shelf, season episodes, Movies library, person page, search, watchlist, calendar, requests).
- **Screenshots must stay prominent** (owner's explicit request).
- Personal names must be blurred in any screenshot (owner's explicit request).

## Evidence on Hand

- Real screenshots of the owner's server (10 in `docs/screenshots/`).
- No users, download counts, testimonials or reviews yet. Never invent them.
- Credits owed: SleekFin (MIT, plugin approach), File Transformation (IAmParadox27), Jellyfin Enhanced and JavaScript Injector (n00bcodr), KefinTweaks (ranaldsgift).

## Product Principles

1. Show, then tell: the theme sells itself through screenshots, so they lead.
2. Install in one sitting: the catalog URL and steps are never more than one scroll away.
3. Honest compatibility: say what's tested, what isn't, and what falls back.
4. Works with the ecosystem: credit and explain the companion plugins instead of hiding the dependencies.
