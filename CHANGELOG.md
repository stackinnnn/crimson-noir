# Changelog

What changed in each release of Crimson Noir. Newest first. Install or update from Jellyfin's plugin
catalog (Dashboard > Plugins > Catalog).

## 1.0.3.4 (26 November 2026)

- **New settings page** (Dashboard > Plugins > Crimson Noir), in the theme's own look: grouped panels with a
  section index, switches and sliders, accent swatches with a live preview, and a save bar that shows unsaved
  changes (with Undo). It reads the same in light or dark dashboard themes.
- **New server options:** feature tiles, Pick for me, New episode badges (and how many days count as new),
  missing films and other work, the Continue Watching ×, Switch profile, and whether card details show always or
  on hover for people who haven't chosen. Everything is on by default, as before.
- **Family & sign-in:** an age limit for featured picks (the slideshow, feature tiles and Pick for me only suggest
  titles up to U, PG, 12 or 15, leaving unrated titles out), and the sign-in screen's artwork can be any title,
  family-friendly (U and PG) or none.
- **Slideshow content:** films and shows, films only, or shows only.
- The settings page uses the full width on big screens, with its panels in two columns.
- **Films missing from a collection, on the shelf:** box sets show the films you don't have as faded spines in
  release order ("Not here", "Requested" or the release date). Choosing one shows its art and story with
  **Request** (Seerr) or **View on TMDB**. Jellyfin Enhanced's separate "Missing from…" row is hidden when the
  shelf shows them.
- **Box sets fill the screen:** the shelf grows to the window height (it stopped at 1000px), and the big empty
  area under it is gone. Jellyfin reserves 60% of the window under every detail page's banner; the theme's pages
  no longer keep that empty space.
- **"More with [person]" on people's pages:** their best-known films and series that aren't in your library,
  under the library timeline, each with Request or View on TMDB. Talk shows, news, reality TV, "as Self"
  appearances and one-episode guest spots are left out.
- **Works without Jellyfin Enhanced:** both use Seerr through Jellyfin Enhanced when it's installed; otherwise
  they use TMDB through the Crimson Noir plugin. Add a free TMDB API key under Dashboard > Plugins > Crimson Noir
  > "Missing films and filmographies". The key stays on the server, and only signed-in users can use it.
- **"New episode" badges** on show posters (Shows, Home, Favourites, lists) when an episode you haven't watched
  aired in the last week ("3 new episodes" when there are more). It steps aside while you hover the card, so the
  card's own buttons stay clear.
- **Home slideshow:** the synopsis and details stay readable on bright artwork (a soft shadow under the text and a
  darker "More info" pill), without darkening the picture.
- **Continue Watching** no longer shows a watched tick on something you're part-way through again.
- **Movies / Shows:** Jellyfin's Filter and View buttons, which stay pinned top-right as you scroll, now sit on a
  dark glass pill instead of directly on top of the posters; its small page arrows are hidden (the pager under the
  grid replaces them).
- **Discover:** while there are more titles to load, the grid ends on a full row instead of a lone poster.
- **Calendar on narrow screens:** empty days shrink to a slim slip, so there's less swiping through the week.
- Removed the leftover coloured stripe beside a few old headings.
- **Faster Movies and Shows:** the theme no longer makes the browser re-lay-out the whole poster grid over and
  over while placing its feature tiles, and off-screen posters aren't laid out or painted until you scroll to
  them. In Jellium with 500 films, the page is ready in about 1 second instead of about 3, with far less stutter.
- **Feature tiles appear sooner:** their data is fetched as soon as Movies / Shows opens, and the last set is kept
  on the device for 6 hours, so after the first visit they show up with the posters (about 0.6 s).
- **Pager under Movies and Shows** (when a library page size is set): "1–100 of 500 films" with Previous / Next
  page, which takes you back to the top. Jellyfin's small arrows that sat over the posters in the top-right corner
  are hidden.
- Fix: feature tiles disappeared after changing page and didn't come back.
- **Detail pages:** the round buttons (Watched, Favourite, Watchlist, More…) have proper labels for screen
  readers and a tooltip on hover and keyboard focus. On episode and season pages, **[** and **]** step to the
  previous / next one.
- **Keyboard:** on every page, the first press of Tab shows a "Skip to content" link that jumps past the top bar.
- Headings run in order (h1 → h2) on Movies, Shows and detail pages; feature-tile tags are a little larger.
- **Movies and Shows:** the header says how the grid is sorted ("Name, A–Z"; click it to change), has an
  "Unwatched only" switch ("Not finished" on Shows), and Jellyfin's A–Z picker is back as a slim column on
  the right edge.
- **Watchlist:** Films can be sorted (newest releases, A–Z, shortest first, highest rated) and narrowed to
  "Not seen"; show cards say which episode is next ("Next S2:E3 · 5 episodes").
- **Requests:** search by title and "Only mine"; the detail panel uses the full width of the page.
- **Search:** filter chips for the results (All / Films / Shows / Collections / People / To request); recent
  searches are saved only when you open a result or press Enter, and each has a × to remove it.
- **Discover:** the browser tab says "Discover" (it said "Page not found"), and Request has a + icon instead of
  a download arrow.
- **Plugin shortcuts in the profile panel:** when Jellyfin Enhanced is installed, a "Jellyfin Enhanced" button
  opens its settings panel for everyone; when KefinTweaks is installed, administrators also get a "KefinTweaks"
  button that opens its configuration. No trip through the dashboard. Neither button shows if the plugin isn't there.
- **Your theme settings follow you:** accent colour, Metadata on hover and Backdrops are saved to your account,
  so setting them on one device sets them on your others (picked up when the app starts or comes back to the front).
- **Watched up to here:** on a season's episode list, a double tick (shown on hover) marks that episode and every
  one before it as watched. Undo puts them back as they were.
- **Pick for me:** Movies and Shows have a "Pick for me" button that suggests a random title, with quick filters
  (not seen yet, under 2 h / 95 min for films, genre), Play, Details and Another.
- **Remove from Continue Watching:** hover a card in Continue Watching for a × that takes it off the row (it
  clears the resume point; watched status doesn't change). Undo puts it back.
- **Play says what it plays:** "Play S2:E1" on shows and seasons (the episode Jellyfin will start), and
  "Resume · 1h 13m left" on part-watched films and episodes.
- **Season pages:** the episode list comes straight after the top of the page, before ratings and reviews; ‹ ›
  steps to the previous / next season; the next episode to watch is highlighted, with time left if you've
  started it. Seasons you're part-way through show a progress line on their cards.
- **Detail pages:** long synopses get a More / Less button and a comfortable line length; a little space
  between "Ends at" and "Directed by"; episodes use their own still when it's sharp enough (1280px+);
  IMDb / TMDB links are small pills; title logos with empty space around them line up with the text.
- **Box sets:** the Movies grid under the shelf is gone (the shelf already shows every film).
- **Times** follow Jellyfin's "Date time locale" display setting (24-hour for English (United Kingdom)).
- **Wording:** "Seerr" everywhere (search said "Jellyseerr").
- KefinTweaks breadcrumbs fade out once you scroll a detail page, instead of covering the Play button.
- **Switch profile:** the profile panel shows the other accounts; picking one signs you out and opens that
  account on the sign-in screen (passwordless accounts sign straight in).

## 1.0.3.3 (18 November 2026)

- **New Discover page** (needs Jellyfin Enhanced with Seerr): browse Seerr from a filter rail (All / Films / Shows,
  Trending, Popular, Coming soon, networks, studios, genres) with a featured banner and a sortable poster grid.
  Badges show what's already in your library, requested or processing. Titles you have open their page;
  anything else opens Seerr's window to request it. On phones, networks, studios and genres sit behind "More filters".
- **Seerr's windows match the theme:** More info opens as a dialog laid out like the theme's film pages
  (artwork behind the title, Request bottom-left, sections rising over it); the season picker uses the theme's black
  surfaces and white pill buttons instead of navy and purple, and scrolling in them no longer moves the page behind.
- **Arrange the top bar:** Dashboard > Plugins > Crimson Noir has a Top bar list: drag the links (or use the arrows)
  into any order and untick what you don't want. Hide Favourites,
  the library tabs, Watchlist, Discover, Requests, Calendar, Search or the dice. Home, Back and the profile
  button always stay.
- **Taller slideshow that runs behind the first row:** no black band under the picture; only the corner behind the
  title and buttons is shaded.
- **Less flicker:** going back to Home no longer shows black while the slideshow reloads (it is kept and put
  straight back); opening a title from Home or a library now fades straight from the page you clicked to the film
  page with no black flash; the slideshow and the backdrop behind Home's rows crossfade without dimming on each change; the
  Movies and Shows title no longer pushes the posters down when it arrives.
- **Back button** at the left end of the top bar on every page except Home. It goes to the page you came from,
  or Home if you opened the page directly, so you don't need a top-bar tab to get back.
- **No streaming-service logos on wide cards.** Jellyfin Enhanced's logo tags no longer show on the Watchlist's
  wide cards, the Movies/Shows feature tiles or Jellyfin's wide and thumbnail cards, whatever its settings.
  Poster cards still show them when Logo Tags are on.
- **One progress bar on box sets.** Box set cards (e.g. Home's "Browse by Collection") no longer show Jellyfin's
  bar on top of the theme's "N of M watched" line.
- **Play and action buttons scale with the screen:** about 44px tall on a laptop, 53px at 1920 wide, 60px at 2560,
  with the text and icons growing to match.
- **Collection spines:** no accent outline on the selected film and no progress line along the bottom; keyboard
  focus is drawn inside the spine so it's never cut off.

## 1.0.3.2 (17 November 2026)

### New
- **Full-screen artwork on film, show and episode pages.** The backdrop now fills the whole window, with the
  title, details and Play button along its bottom edge; ratings, reviews, awards and cast follow as you scroll.
- **More details on film and episode pages.** A "More details" button under the synopsis opens a panel with the
  tagline, release date, runtime, rating, genres and country; director, writers, cast and studios; and the
  video, audio, subtitle and file details. It's closed by default, so the page stays clean.
- **Easier-to-see Edit Images.** In ⋮ > Edit images, the image cards, their names and sizes, and the buttons are
  bigger (four cards across on a desktop instead of six).
- **Pick audio and subtitles before you press Play.** When a title has more than one audio track or has
  subtitles, those rows in "More details" become dropdowns.
- **Previous / next episode** arrows either side of the episode line on episode pages (they cross seasons).
- **Box set progress.** Collection pages say "3 of 5 watched" with a short bar, and part-watched box sets get a
  thin progress line on their cards (Collections, Home rows, Watchlist).
- **Smoother page changes.** Opening a film, show or person page crossfades from the page you were on
  (in browsers with view transitions: current Chrome, Edge, Safari and Jellium Desktop) instead of cutting to black.
- **Server-wide settings** on the plugin's page (Dashboard > Plugins > Crimson Noir): default accent (a preset or
  any colour), Home slideshow on/off, how many titles and how long each shows, unwatched titles only, and
  "More details" open by default. Everyone can still pick their own accent.

### Works better with other plugins
- **KefinTweaks**
  - Breadcrumbs now show, top-left beside the menu bar, with a matching season menu.
  - "Flatten single season shows" no longer gives you two episode rows: the theme uses KefinTweaks' row when that's on.
  - "Series info" episode counts now appear in the page header.
- **Jellyfin Enhanced**
  - Card tags (quality, ratings, network/provider logos, and so on) now also show on the theme's own cards:
    Watchlist, feature tiles, episode rows, season lists, person pages, collection spines and Search picks.
- **Watchlist tab:** the Watchlist link finds the tab wherever your server puts it, instead of assuming it's
  the third Home tab.
- **Checked and working:** Jellyfin Enhanced's quality, genre, language, rating, age-rating, status, awards and
  logo tags (on Jellyfin's cards and the theme's own); Intro Skipper's Skip Intro button (lines up with the
  player controls and skips correctly).

### Fixed
- **Flicker when opening pages.** Jellyfin's own page no longer flashes up for a moment before the theme's
  version replaces it.
- **The theme stopped re-running itself in the background** about eight times a second on every page except Home.
  That wasted battery and could make the screen flicker.

## 1.0.3.1 (17 November 2026)
- Film pages show a Version picker on films with more than one version.
- Jellyfin Enhanced's Random item dice appears in the top bar when that setting is on.
- Studio logos (Browse by Studio) no longer sit on a dark box.

## 1.0.3.0 (17 November 2026)
- Every library now gets its own top-bar tab: servers with several Movies or Shows libraries (e.g. 4K Movies,
  Anime) no longer only see the first one.

## 1.0.2.0 (16 November 2026)
- The header hides the moment you press Play.
- Skip Intro lines up with the player controls and no longer lingers after leaving the player.
- In Jellium Desktop, playback menus and Episode Preview use a smoked-glass panel that matches the web player.

## 1.0.1.0 (16 November 2026)
- Old browser engines (e.g. Jellyfin Media Player 1.x) now get stock Jellyfin instead of a broken half-theme.
- Fixed a missing Safari blur prefix.

## 1.0.0.0 (16 November 2026)
- First plugin release: install Crimson Noir from Jellyfin's plugin catalog (needs File Transformation).
