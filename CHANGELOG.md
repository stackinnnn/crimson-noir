# Changelog

What changed in each release of Crimson Noir. Newest first. Install or update from Jellyfin's plugin
catalog (Dashboard > Plugins > Catalog).

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
