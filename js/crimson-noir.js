/* Crimson Noir for Jellyfin 12: loads the theme and adds a random-media slideshow to Home.
   Install: Dashboard > JavaScript Injector, paste this whole file, save, then hard-refresh.
   Jellyfin 12 page hooks were informed by SleekFin (MIT, varunaditya-plus). */
(function () {
  'use strict';

  /* ---- Server-wide settings ----
     The plugin writes the choices from Dashboard > Plugins > Crimson Noir into the page as
     window.CrimsonNoirSettings. Anything missing (older plugin, or the script pasted into JavaScript
     Injector) falls back to the defaults below. */
  const SERVER = window.CrimsonNoirSettings && typeof window.CrimsonNoirSettings === 'object' ? window.CrimsonNoirSettings : {};
  const serverNumber = (value, fallback, min, max) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : fallback;
  };

  /* ---- Settings you can change ---- */
  const CONFIG = {
    slideshow: SERVER.HomeSlideshow !== false, // the Home slideshow; false leaves Jellyfin's own Home rows
    slides: serverNumber(SERVER.SlideshowCount, 8, 2, 20), // how many titles to feature
    seconds: serverNumber(SERVER.SlideshowSeconds, 9, 4, 30), // how long each stays on screen
    types: 'Movie,Series', // or just 'Movie' or 'Series'
    unwatchedOnly: SERVER.SlideshowUnwatchedOnly === true, // true hides anything already watched
    defaultAccent: typeof SERVER.DefaultAccent === 'string' && SERVER.DefaultAccent ? SERVER.DefaultAccent : 'Crimson', // until someone picks their own
    moreDetailsOpen: SERVER.MoreDetailsOpen === true, // film/episode pages open with "More details" showing
    // top-bar items to leave out: favourites, movies, shows, collections, watchlist, discover, requests, calendar, search, random
    hiddenNav: Array.isArray(SERVER.HiddenNavItems) ? SERVER.HiddenNavItems.filter((k) => /^[a-z]+$/.test(k)) : [],
    // top-bar link order after Home, as arranged on the plugin page (empty keeps the default order)
    navOrder: Array.isArray(SERVER.NavOrder) ? SERVER.NavOrder.filter((k) => /^[a-z]+$/.test(k)) : [],
    watchlistUrl: '#/home?tab=2&pageTab=watchlist', // fallback for the Watchlist tab: the theme follows KefinTweaks' own Watchlist link when there is one; empty uses the old pop-up panel
    watchlistRows: 1, // rows of titles shown per Watchlist section before "Show all" (fits screen width)
  };

  if (window.__crimsonNoir) return;
  window.__crimsonNoir = true;

  // Older browser engines (e.g. Jellyfin Media Player 1.x = Chromium 83) can't run the theme:
  // they drop every :has()/color-mix() rule and lack replaceChildren(), so pages half-break.
  // Stand down there and leave stock Jellyfin, which works.
  // (window.CSS: this script declares its own `CSS` constant further down)
  const cssApi = window.CSS;
  const cnSupported = !!(cssApi && cssApi.supports && cssApi.supports('selector(:has(*))')
    && cssApi.supports('color', 'color-mix(in srgb, red, blue)') && Element.prototype.replaceChildren);
  if (!cnSupported || window.__crimsonNoirUnsupported) {
    window.__crimsonNoirUnsupported = true;
    document.querySelectorAll('link[data-crimson-noir="css"]').forEach((l) => { l.media = 'not all'; });
    document.querySelectorAll('style').forEach((s) => { if (s.textContent.indexOf('Crimson Noir') !== -1) s.disabled = true; });
    console.info('[Crimson Noir] This browser engine is too old for the theme; showing stock Jellyfin.');
    return;
  }

  // Crimson Noir is already dark: stop Dark Reader from recolouring it
  if (!document.querySelector('meta[name="darkreader-lock"]')) {
    const lock = document.createElement('meta');
    lock.name = 'darkreader-lock';
    document.head.append(lock);
  }

  const CSS = "html.cn-ui:root {\n    --cn-black: #000;\n    --cn-surface: #0b0a0b;\n    --cn-raised: #171416;\n    --cn-line: rgba(255, 255, 255, 0.1);\n    --cn-line-strong: rgba(255, 255, 255, 0.22);\n    --cn-text: #f3efef;\n    --cn-muted: #aaa4a5;\n    --cn-accent: #db0000;\n    --cn-accent-hover: #f01a1a;\n    --cn-accent-text: #ff5a5a;\n    --cn-accent-wash: rgba(219, 0, 0, 0.16);\n    --cn-radius: 8px;\n    --cn-gutter: clamp(20px, 5vw, 88px);\n    --cn-ease: cubic-bezier(0.22, 0.8, 0.26, 1);\n    --jf-palette-background-default: var(--cn-black);\n    --jf-palette-background-defaultImage: none;\n    --jf-palette-background-paper: var(--cn-surface);\n    --jf-palette-background-paperChannel: 11 10 11;\n    --jf-palette-common-backgroundChannel: 0 0 0;\n    --jf-palette-common-onBackground: var(--cn-text);\n    --jf-palette-common-onBackgroundChannel: 243 239 239;\n    --jf-palette-text-primary: var(--cn-text);\n    --jf-palette-text-primaryChannel: 243 239 239;\n    --jf-palette-text-secondary: var(--cn-muted);\n    --jf-palette-text-secondaryChannel: 170 164 165;\n    --jf-palette-text-disabled: rgba(170, 164, 165, 0.6);\n    --jf-palette-text-icon: var(--cn-muted);\n    --jf-palette-divider: var(--cn-line);\n    --jf-palette-dividerChannel: 38 36 37;\n    --jf-palette-primary-main: var(--cn-accent);\n    --jf-palette-primary-mainChannel: 219 0 0;\n    --jf-palette-primary-dark: #a80000;\n    --jf-palette-primary-darkChannel: 168 0 0;\n    --jf-palette-primary-light: var(--cn-accent-text);\n    --jf-palette-primary-lightChannel: 255 90 90;\n    --jf-palette-primary-contrastText: #fff;\n    --jf-palette-primary-contrastTextChannel: 255 255 255;\n    --jf-palette-secondary-main: var(--cn-accent);\n    --jf-palette-secondary-mainChannel: 219 0 0;\n    --jf-palette-secondary-dark: #a80000;\n    --jf-palette-secondary-darkChannel: 168 0 0;\n    --jf-palette-secondary-light: var(--cn-accent-text);\n    --jf-palette-secondary-lightChannel: 255 90 90;\n    --jf-palette-secondary-contrastText: #fff;\n    --jf-palette-secondary-contrastTextChannel: 255 255 255;\n    --jf-palette-action-active: var(--cn-text);\n    --jf-palette-action-activeChannel: 243 239 239;\n    --jf-palette-action-hover: rgba(255, 255, 255, 0.07);\n    --jf-palette-action-focus: rgba(255, 255, 255, 0.12);\n    --jf-palette-action-selected: var(--cn-accent-wash);\n    --jf-palette-action-selectedChannel: 219 0 0;\n    --jf-palette-AppBar-defaultBg: var(--cn-black);\n    --jf-palette-AppBar-darkBg: var(--cn-black);\n    --jf-palette-AppBar-darkColor: var(--cn-text);\n    --jf-palette-AppBar-transparentBg: rgba(0, 0, 0, 0.6);\n    --jf-palette-AppBar-gradient: none;\n    --jf-palette-Avatar-defaultBg: var(--cn-raised);\n    --jf-palette-Chip-defaultBorder: var(--cn-line);\n    --jf-palette-FilledInput-bg: var(--cn-surface);\n    --jf-palette-FilledInput-borderColor: var(--cn-line);\n    --jf-palette-FilledInput-hoverBg: var(--cn-raised);\n    --jf-palette-LinearProgress-primaryBg: #470000;\n    --jf-palette-LinearProgress-secondaryBg: #470000;\n    --jf-palette-Skeleton-bg: rgba(255, 255, 255, 0.08);\n    --jf-palette-Slider-primaryTrack: #470000;\n    --jf-palette-SnackbarContent-bg: var(--cn-raised);\n    --jf-palette-SnackbarContent-color: var(--cn-text);\n    --jf-palette-Tooltip-bg: rgba(23, 20, 22, 0.96);\n    --jf-palette-starIcon-main: var(--cn-accent);\n    --jf-palette-starIcon-mainChannel: 219 0 0;\n}\nhtml.cn-ui:not(.transparentDocument),\nhtml.cn-ui:not(.transparentDocument) body,\nhtml.cn-ui .backgroundContainer:not(.withBackdrop):not(.backgroundContainer-transparent),\nhtml.cn-ui .dialog,\nhtml.cn-ui .nowPlayingPlaylist {\n    background-color: var(--cn-black) !important;\n    background-image: none !important;\n}\nhtml.cn-ui body { color: var(--cn-text); }\nhtml.cn-ui ::selection { background: var(--cn-accent); color: #fff; }\nhtml.cn-ui { scrollbar-color: #3a3436 transparent; }\nhtml.cn-ui ::-webkit-scrollbar { height: 8px; width: 8px; }\nhtml.cn-ui ::-webkit-scrollbar-track { background: transparent; }\nhtml.cn-ui ::-webkit-scrollbar-thumb { background: #3a3436; border-radius: 8px; }\nhtml.cn-ui ::-webkit-scrollbar-thumb:hover { background: var(--cn-accent); }\nhtml.cn-ui a:not(.emby-button):not(.card):not(.navMenuOption):not(.textActionButton):not([class*=\"cn-\"]),\nhtml.cn-ui .button-link { color: var(--cn-accent-text); }\nhtml.cn-ui :is(button, a, input, select, textarea):focus-visible {\n    outline: 2px solid var(--cn-accent-text);\n    outline-offset: 2px;\n}\nhtml.cn-ui.layout-tv :is(button, a, input, select, textarea, .focusable):not(.card):focus {\n    outline: 3px solid var(--cn-accent);\n    outline-offset: 2px;\n}\nhtml.cn-ui :is(.mdl-spinner__circle, .progressring-spiner) { border-color: var(--cn-accent) !important; }\nhtml.cn-nav-on .skinHeader,\nhtml.cn-nav-on header.MuiAppBar-root {\n    background: transparent !important;\n    background-image: none !important;\n    box-shadow: none !important;\n    pointer-events: none;\n}\nhtml.cn-nav-on header.MuiAppBar-root > .MuiToolbar-root:first-child,\nhtml.cn-nav-on .skinHeader .headerTop {\n    min-height: 72px !important;\n    visibility: hidden;\n}\nhtml.cn-nav-on header.MuiAppBar-root > .MuiToolbar-root + .MuiToolbar-root,\nhtml.cn-nav-on .skinHeader .headerTabs {\n    background: var(--cn-black);\n    pointer-events: auto;\n}\nhtml.cn-nav-on.cn-hero-on .skinHeader .headerTabs { display: none; }\nhtml.cn-ui:is(.cn-hero-on, .cn-details-on) header.MuiAppBar-root + div[aria-hidden=\"true\"] { height: 0 !important; }\nhtml.cn-ui .emby-tab-button { color: var(--cn-muted); transition: color 160ms ease; }\nhtml.cn-ui .emby-tab-button:hover { color: var(--cn-text); }\nhtml.cn-ui .emby-tab-button-active,\nhtml.cn-ui .emby-tab-button-active.emby-button-focusable { color: #fff !important; }\nhtml.cn-ui .emby-tab-button-active { box-shadow: inset 0 -2px 0 var(--cn-accent); }\nhtml.cn-ui :is(.mainDrawer, .MuiDrawer-paper) {\n    background: var(--cn-surface) !important;\n    border-right: 1px solid var(--cn-line);\n}\nhtml.cn-ui .navMenuOption { border-radius: var(--cn-radius); color: var(--cn-text); }\nhtml.cn-ui .navMenuOption:hover { background: rgba(255, 255, 255, 0.06) !important; }\nhtml.cn-ui .navMenuOption-selected,\nhtml.cn-ui .MuiListItemButton-root.Mui-selected {\n    background: var(--cn-accent-wash) !important;\n    box-shadow: inset 2px 0 0 var(--cn-accent);\n    color: #fff !important;\n}\nhtml.cn-ui .navMenuSectionHeader,\nhtml.cn-ui .sidebarHeader { color: var(--cn-muted); }\nhtml.cn-ui .sectionTitle { color: var(--cn-text); font-weight: 650; letter-spacing: -0.01em; }\nhtml.cn-ui #indexPage .sectionTitle.sectionTitle-cards::before {\n    background: var(--cn-accent);\n    border-radius: 2px;\n    content: \"\";\n    display: inline-block;\n    height: 0.82em;\n    margin-right: 0.55em;\n    vertical-align: -0.06em;\n    width: 3px;\n}\nhtml.cn-ui .sectionTitleTextButton { color: var(--cn-text) !important; }\nhtml.cn-ui .sectionTitleTextButton:hover .sectionTitle,\nhtml.cn-ui .sectionTitleTextButton:hover .material-icons { color: var(--cn-accent-text); }\nhtml.cn-ui .homeLibraryButton {\n    background: var(--cn-raised) !important;\n    border: 1px solid var(--cn-line);\n    border-radius: var(--cn-radius);\n}\nhtml.cn-ui .homeLibraryButton:hover { border-color: var(--cn-accent); }\nhtml.cn-ui .cardScalable,\nhtml.cn-ui .visualCardBox {\n    background: var(--cn-surface);\n    border-radius: var(--cn-radius);\n    transition: box-shadow 180ms var(--cn-ease), transform 180ms var(--cn-ease);\n}\nhtml.cn-ui .visualCardBox { border: 1px solid var(--cn-line); overflow: hidden; }\nhtml.cn-ui .cardBox:not(.visualCardBox) :is(.cardContent, .cardImageContainer, .cardOverlayContainer, .blurhash-canvas) { border-radius: var(--cn-radius); }\nhtml.cn-ui .cardPadder .cardImageIcon { color: var(--cn-raised) !important; }\nhtml.cn-ui .cardBox:not(.visualCardBox) .cardPadder { background-color: var(--cn-surface) !important; }\n/* Logo cards (e.g. KefinTweaks' Browse by Studio) draw a transparent logo as a mask, so drop the placeholder box behind them */\nhtml.cn-ui .cardScalable:has(.cardImageContainer[style*=mask-image]),\nhtml.cn-ui .cardScalable:has(.cardImageContainer[style*=mask-image]) :is(.cardPadder, .cardOverlayContainer) { background: transparent !important; box-shadow: none !important; }\nhtml.cn-ui .cardScalable,\nhtml.cn-ui .visualCardBox { position: relative; }\nhtml.cn-ui .cardBox:not(.visualCardBox) .cardScalable::after,\nhtml.cn-ui .visualCardBox::after {\n    border: 2px solid var(--cn-accent);\n    border-radius: inherit;\n    box-sizing: border-box;\n    content: \"\";\n    inset: 0;\n    opacity: 0;\n    pointer-events: none;\n    position: absolute;\n    transition: opacity 160ms ease;\n    z-index: 4;\n}\nhtml.cn-ui .card:hover .cardBox:not(.visualCardBox) .cardScalable::after,\nhtml.cn-ui .card:hover .visualCardBox::after,\nhtml.cn-ui .card:focus .cardBox:not(.visualCardBox) .cardScalable::after,\nhtml.cn-ui .card:focus .visualCardBox::after { opacity: 1; }\nhtml.cn-hover-cards #indexPage .card:where(:not([data-type=\"CollectionFolder\"], [data-type=\"UserView\"])) .cardBox { margin-bottom: 0; padding-bottom: 0; position: relative; }\nhtml.cn-hover-cards #indexPage .card:where(:not([data-type=\"CollectionFolder\"], [data-type=\"UserView\"])) .cardFooter {\n    background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.62) 55%, transparent 100%);\n    border-radius: 0 0 var(--cn-radius) var(--cn-radius);\n    bottom: 0;\n    box-sizing: border-box;\n    left: 0;\n    margin: 0;\n    opacity: 0;\n    padding: 34px 11px 11px;\n    pointer-events: none;\n    position: absolute;\n    right: 0;\n    transform: translateY(8px);\n    transition: opacity 240ms ease, transform 240ms var(--cn-ease);\n    z-index: 3;\n}\nhtml.cn-hover-cards #indexPage .card:hover .cardFooter,\nhtml.cn-hover-cards #indexPage .card:focus .cardFooter,\nhtml.cn-hover-cards #indexPage .card:focus-within .cardFooter { opacity: 1; transform: none; }\nhtml.cn-hover-cards #indexPage .card .cardFooter .cardText { font-size: 0.86rem; line-height: 1.3; overflow: hidden; padding: 0; text-align: left; text-overflow: ellipsis; white-space: nowrap; }\nhtml.cn-hover-cards #indexPage .card .cardFooter .cardText-first { font-weight: 700; }\nhtml.cn-hover-cards #indexPage .card:where(:not([data-type=\"CollectionFolder\"], [data-type=\"UserView\"])) .cardOverlayButton-br:not(button) { bottom: auto; right: 6px; top: 6px; }\nhtml.cn-hover-cards #indexPage .card:hover .cardIndicators { opacity: 0; }\nhtml.cn-ui .cardIndicators { transition: opacity 160ms ease; }\nhtml.cn-ui .card:focus { outline: none; }\nhtml.cn-ui .cardOverlayContainer { background: linear-gradient(0deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.12)); }\nhtml.cn-ui :is(.cardText, .cardText-secondary, .cardText a, .cardText .textActionButton) { color: #fff !important; }\nhtml.cn-ui .cardText a { text-decoration: none; }\nhtml.cn-ui button.cardOverlayFab-primary,\nhtml.cn-ui button.cardOverlayButton-centered {\n    background: var(--cn-accent) !important;\n    color: #fff !important;\n}\nhtml.cn-ui button.cardOverlayFab-primary:hover,\nhtml.cn-ui button.cardOverlayButton-centered:hover { background: var(--cn-accent-hover) !important; }\nhtml.cn-ui button.cardOverlayButton:hover { color: var(--cn-accent-text); }\nhtml.cn-ui :is(.playedIndicator, .countIndicator, .fullSyncIndicator, .mediaSourceIndicator) {\n    background: var(--cn-accent) !important;\n    color: #fff !important;\n}\nhtml.cn-ui .itemProgressBar { background: rgba(255, 255, 255, 0.22) !important; }\nhtml.cn-ui .itemProgressBarForeground,\nhtml.cn-ui .itemLinearProgress .MuiLinearProgress-bar { background: var(--cn-accent) !important; }\nhtml.cn-ui .itemBackdrop::after {\n    background: linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.55) 72%, var(--cn-black) 100%);\n    content: \"\";\n    display: block;\n    height: 100%;\n}\nhtml.cn-ui :is(.detailPagePrimaryContainer, .detailPageSecondaryContainer, .detailPageContent) { background: transparent !important; }\nhtml.cn-ui .itemName { font-weight: 720; letter-spacing: -0.02em; }\nhtml.cn-ui :is(.itemMiscInfo, .itemGenres, .itemDetailsGroup, .detailsGroupItem .label) { color: var(--cn-muted); }\nhtml.cn-ui .overview { color: var(--cn-text); line-height: 1.6; }\nhtml.cn-ui .detailButton:hover .detailButton-content { color: var(--cn-accent-text); }\nhtml.cn-ui .mainDetailButtons .btnPlay .detailButton-icon,\nhtml.cn-ui .mainDetailButtons .btnPlay .detailButton-content { color: var(--cn-accent-text); }\nhtml.cn-ui :is(.ratingbutton-icon-withrating, .playstatebutton-icon-played, .starIcon) { color: var(--cn-accent) !important; }\nhtml.cn-ui .detailImageContainer .cardScalable { box-shadow: 0 18px 48px -14px rgba(0, 0, 0, 0.9); }\nhtml.cn-ui .raised,\nhtml.cn-ui .MuiButton-outlined {\n    background: var(--cn-raised);\n    border-radius: var(--cn-radius);\n    color: var(--cn-text);\n}\nhtml.cn-ui .raised:hover { background: #241f22; }\nhtml.cn-ui .button-submit,\nhtml.cn-ui .emby-button.button-submit,\nhtml.cn-ui .MuiButton-containedPrimary {\n    background: var(--cn-accent) !important;\n    border-radius: var(--cn-radius);\n    color: #fff !important;\n}\nhtml.cn-ui .button-submit:hover,\nhtml.cn-ui .MuiButton-containedPrimary:hover { background: var(--cn-accent-hover) !important; }\nhtml.cn-ui .paper-icon-button-light:hover:not(:disabled) { background: rgba(255, 255, 255, 0.08); color: var(--cn-accent-text); }\nhtml.cn-ui .listItem-border { border-bottom: 1px solid var(--cn-line); }\nhtml.cn-ui :is(.paperList, .collapseContent, .visualCardBox) { background-color: var(--cn-surface) !important; }\nhtml.cn-ui .emby-collapsible-button { border-color: var(--cn-line); }\nhtml.cn-ui :is(.emby-input, .emby-select-withcolor, .emby-textarea) {\n    background: var(--cn-surface) !important;\n    border: 1px solid var(--cn-line-strong) !important;\n    border-radius: var(--cn-radius);\n    color: var(--cn-text) !important;\n}\nhtml.cn-ui :is(.emby-input, .emby-select-withcolor, .emby-textarea):focus { border-color: var(--cn-accent) !important; }\nhtml.cn-ui :is(.inputLabelFocused, .selectLabelFocused, .textareaLabelFocused) { color: var(--cn-accent-text) !important; }\nhtml.cn-ui .emby-select-withcolor option { background: var(--cn-surface); color: var(--cn-text); }\nhtml.cn-ui .emby-checkbox:checked + span + .checkboxOutline {\n    background: var(--cn-accent) !important;\n    border-color: var(--cn-accent) !important;\n}\nhtml.cn-ui .emby-checkbox:checked + span + .checkboxOutline > .checkboxIcon-checked { color: #fff !important; }\nhtml.cn-ui .emby-checkbox:focus + span + .checkboxOutline { border-color: var(--cn-accent-text) !important; }\nhtml.cn-ui .dialog { border: 1px solid var(--cn-line); border-radius: 12px; }\nhtml.cn-ui :is(.formDialogHeader:not(.formDialogHeader-clear), .formDialogFooter:not(.formDialogFooter-clear)) { background: var(--cn-surface) !important; border-color: var(--cn-line); }\nhtml.cn-ui .actionSheet { background: var(--cn-raised) !important; }\nhtml.cn-ui .actionSheetMenuItem:hover { background: var(--cn-accent-wash) !important; }\nhtml.cn-ui .dialogBackdrop { background: rgba(0, 0, 0, 0.72) !important; }\nhtml.cn-ui .nowPlayingBar { background: var(--cn-surface) !important; border-top: 1px solid var(--cn-line); }\nhtml.cn-ui .sliderBubble { background: var(--cn-raised) !important; }\nhtml.cn-ui .mdl-slider-background-lower { background: var(--cn-accent) !important; }\nhtml.cn-ui .mdl-slider::-webkit-slider-thumb { background: var(--cn-accent) !important; }\nhtml.cn-ui .mdl-slider::-moz-range-thumb { background: var(--cn-accent) !important; }\nhtml.cn-ui .emby-slider-background-lower { background: var(--cn-accent) !important; }\n#indexPage.homePage.libraryPage:has(.cn-hero) { padding-top: 0 !important; }\n.cn-hero {\n    background: #000;\n    color: var(--cn-text);\n    display: block;\n    height: clamp(460px, 80vh, 960px);\n    overflow: hidden;\n    position: relative;\n    touch-action: pan-y;\n    width: 100%;\n}\n.cn-hero[data-state=\"loading\"]::after {\n    animation: cn-sweep 1.6s linear infinite;\n    background: linear-gradient(105deg, transparent 35%, rgba(219, 0, 0, 0.12) 50%, transparent 65%);\n    content: \"\";\n    inset: 0;\n    position: absolute;\n}\n@keyframes cn-sweep {\n    from { transform: translateX(-100%); }\n    to { transform: translateX(100%); }\n}\n.cn-slide {\n    background: radial-gradient(90% 90% at 78% 30%, rgba(219, 0, 0, 0.22), transparent 70%);\n    inset: 0;\n    opacity: 0;\n    position: absolute;\n    transition: opacity 1.1s ease, visibility 0s linear 1.1s;\n    visibility: hidden;\n}\n.cn-slide[data-active=\"true\"] {\n    opacity: 1;\n    transition: opacity 1.1s ease;\n    visibility: visible;\n    z-index: 1;\n}\n.cn-backdrop {\n    height: 100%;\n    inset: 0;\n    object-fit: cover;\n    object-position: center 22%;\n    opacity: 0;\n    position: absolute;\n    transform: scale(1.02);\n    transition: opacity 700ms ease, transform 0s linear 1.1s;\n    width: 100%;\n}\n.cn-backdrop[data-loaded=\"true\"] { opacity: 1; }\n.cn-slide[data-active=\"true\"] .cn-backdrop {\n    transform: scale(1.1) translate3d(-1.2%, -0.8%, 0);\n    transition: opacity 700ms ease, transform calc(var(--cn-seconds, 9s) + 2s) linear;\n}\n.cn-shade {\n    background:\n        linear-gradient(0deg, #000 0%, rgba(0, 0, 0, 0.66) 20%, transparent 56%),\n        linear-gradient(90deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.6) 34%, transparent 68%);\n    inset: 0;\n    position: absolute;\n}\n.cn-content {\n    bottom: clamp(30px, 6vh, 72px);\n    box-sizing: border-box;\n    left: 0;\n    max-width: min(660px, 100%);\n    padding: 0 var(--cn-gutter);\n    position: absolute;\n}\n.cn-slide:not([data-active=\"true\"]) .cn-content { opacity: 0; transition: opacity 180ms ease; }\n.cn-slide[data-active=\"true\"] .cn-content > * { animation: cn-rise 640ms var(--cn-ease) both; }\n.cn-slide[data-active=\"true\"] .cn-content > :nth-child(2) { animation-delay: 70ms; }\n.cn-slide[data-active=\"true\"] .cn-content > :nth-child(3) { animation-delay: 130ms; }\n.cn-slide[data-active=\"true\"] .cn-content > :nth-child(4) { animation-delay: 190ms; }\n@keyframes cn-rise {\n    from { opacity: 0; transform: translateY(14px); }\n    to { opacity: 1; transform: none; }\n}\n.cn-title {\n    color: #fff;\n    font-size: clamp(2.1rem, 4.6vw, 4.2rem);\n    font-weight: 800;\n    letter-spacing: -0.03em;\n    line-height: 1.02;\n    margin: 0 0 14px;\n    text-wrap: balance;\n}\n.cn-title img {\n    display: block;\n    max-height: clamp(84px, 17vh, 170px);\n    max-width: min(460px, 78vw);\n    object-fit: contain;\n    object-position: left bottom;\n}\n.cn-meta {\n    align-items: center;\n    color: #dcd6d7;\n    display: flex;\n    flex-wrap: wrap;\n    font-size: 0.95rem;\n    gap: 4px 14px;\n    margin-bottom: 12px;\n}\n.cn-meta b { color: var(--cn-accent-text); font-weight: 700; }\n.cn-meta .cn-cert { border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 3px; font-size: 0.78rem; padding: 0 5px; }\n.cn-overview {\n    -webkit-box-orient: vertical;\n    -webkit-line-clamp: 3;\n    color: #e4dfdf;\n    display: -webkit-box;\n    font-size: 1.02rem;\n    line-height: 1.55;\n    margin: 0 0 22px;\n    overflow: hidden;\n}\n.cn-actions { display: flex; flex-wrap: wrap; gap: 12px; }\n.cn-btn {\n    align-items: center;\n    border: 0;\n    border-radius: var(--cn-radius);\n    box-sizing: border-box;\n    cursor: pointer;\n    display: inline-flex;\n    font: inherit;\n    font-weight: 700;\n    gap: 8px;\n    min-height: 46px;\n    padding: 0 24px 0 18px;\n    text-decoration: none;\n    transition: background-color 160ms ease, transform 160ms var(--cn-ease);\n}\n.cn-btn:active { transform: scale(0.97); }\n.cn-btn svg { fill: currentColor; height: 22px; width: 22px; }\n.cn-btn-primary { background: var(--cn-accent); color: #fff; }\n.cn-btn-primary:hover { background: var(--cn-accent-hover); }\n.cn-btn-ghost { background: rgba(255, 255, 255, 0.14); color: #fff; }\n.cn-btn-ghost:hover { background: rgba(255, 255, 255, 0.24); }\n.cn-arrow {\n    align-items: center;\n    background: rgba(0, 0, 0, 0.5);\n    border: 1px solid var(--cn-line-strong);\n    border-radius: 50%;\n    color: #fff;\n    cursor: pointer;\n    display: flex;\n    height: 48px;\n    justify-content: center;\n    opacity: 0;\n    padding: 0;\n    position: absolute;\n    top: 46%;\n    transition: background-color 160ms ease, opacity 200ms ease;\n    width: 48px;\n    z-index: 3;\n}\n.cn-arrow svg { fill: currentColor; height: 26px; width: 26px; }\n.cn-arrow:hover { background: var(--cn-accent); }\n.cn-prev { left: 16px; }\n.cn-next { right: 16px; }\n.cn-hero:hover .cn-arrow,\n.cn-arrow:focus-visible,\nhtml.layout-tv .cn-arrow { opacity: 1; }\nhtml.layout-tv .cn-hero :is(.cn-btn, .cn-arrow):focus { outline: 3px solid #fff; outline-offset: 2px; }\n@media (max-width: 767px), (pointer: coarse) {\n    .cn-arrow { display: none; }\n    html.layout-tv .cn-arrow { display: flex; }\n}\n@media (max-width: 600px) {\n    .cn-hero { height: clamp(460px, 74svh, 720px); }\n    .cn-shade { background: linear-gradient(0deg, #000 8%, rgba(0, 0, 0, 0.74) 44%, rgba(0, 0, 0, 0.1) 78%); }\n    .cn-overview { -webkit-line-clamp: 2; font-size: 0.95rem; margin-bottom: 16px; }\n}\n@media (prefers-reduced-motion: reduce) {\n    .cn-slide, .cn-slide[data-active=\"true\"], .cn-backdrop, .cn-slide[data-active=\"true\"] .cn-backdrop { transition: none; }\n    .cn-backdrop, .cn-slide[data-active=\"true\"] .cn-backdrop { transform: none; }\n    .cn-slide[data-active=\"true\"] .cn-content > * { animation: none; }\n    .cn-hero[data-state=\"loading\"]::after { animation: none; }\n}\n.cn-nav {\n    -webkit-backdrop-filter: blur(16px) saturate(140%);\n    align-items: center;\n    backdrop-filter: blur(16px) saturate(140%);\n    background: rgba(0, 0, 0, 0.3);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 999px;\n    box-sizing: border-box;\n    display: flex;\n    gap: 6px;\n    left: 50%;\n    max-width: calc(100vw - 24px);\n    padding: 5px;\n    position: fixed;\n    top: 14px;\n    transform: translateX(-50%);\n    transition: background-color 240ms ease;\n    z-index: 1200;\n}\n.cn-nav[hidden] { display: none; }\nhtml.cn-scrolled .cn-nav { background: rgba(0, 0, 0, 0.62); }\n.cn-nav-links {\n    display: flex;\n    gap: 2px;\n    min-width: 0;\n    overflow-x: auto;\n    scrollbar-width: none;\n}\n.cn-nav-links::-webkit-scrollbar { display: none; }\n.cn-nav-tools {\n    border-left: 1px solid rgba(255, 255, 255, 0.16);\n    display: flex;\n    flex: none;\n    gap: 2px;\n    padding-left: 6px;\n}\n.cn-nav-link,\n.cn-nav-icon {\n    align-items: center;\n    background: none;\n    border: 0;\n    border-radius: 999px;\n    color: #f3efef;\n    cursor: pointer;\n    display: inline-flex;\n    flex: none;\n    font: inherit;\n    font-size: 0.93rem;\n    font-weight: 600;\n    height: 38px;\n    justify-content: center;\n    position: relative;\n    text-decoration: none;\n    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);\n    transition: background-color 160ms ease, color 160ms ease;\n    white-space: nowrap;\n}\n.cn-nav-link { padding: 0 15px; }\n.cn-nav-link[hidden] { display: none; }\n.cn-nav-icon { width: 38px; }\n.cn-nav-icon svg { fill: currentColor; height: 21px; width: 21px; }\n.cn-nav-icon[hidden] { display: none; }\n/* Jellyfin Enhanced random-item dice, mirrored from the native header */\n.cn-nav-icon.cn-random svg { fill: none; }\n.cn-random .je-dice-spin, .cn-random .je-dice-face { align-items: center; display: inline-flex; height: 22px; justify-content: center; width: 22px; }\n.cn-random:not(.loading):hover .je-dice-spin { animation: dice 1.5s; }\n.cn-random.loading .je-dice-spin { animation: dice 0.6s linear infinite; }\n.cn-nav-link:hover,\n.cn-nav-icon:hover { background: rgba(255, 255, 255, 0.14); }\n.cn-nav-link[aria-current=\"page\"] { background: var(--cn-accent); color: #fff; text-shadow: none; }\n@media (max-width: 860px) {\n    .cn-nav { left: 12px; right: 12px; transform: none; }\n    .cn-nav-links { flex: 1; }\n    .cn-nav-link { font-size: 0.88rem; padding: 0 12px; }\n}\nhtml.cn-details-loading #itemDetailPage:not([data-cn]) { opacity: 0; }\nhtml.cn-ui #itemDetailPage[data-cn] { background: #000; padding-top: 0 !important; }\n#itemDetailPage[data-cn] > #itemBackdrop,\n#itemDetailPage[data-cn] .detailPagePrimaryContainer > :is(.detailImageContainer, .detailRibbon),\n#itemDetailPage[data-cn] :is(.detailLogo, .nameContainer, .overview, .overview-controls, .itemMiscInfo-primary, .trackSelections, .itemTags),\n#itemDetailPage[data-cn-eps] #childrenCollapsible { display: none !important; }\n#itemDetailPage[data-cn] .detailPageWrapperContainer { background: transparent; margin-top: 0; padding-top: 0; }\n#itemDetailPage[data-cn] .detailPagePrimaryContainer { display: block; margin: 0; padding: 0 var(--cn-gutter); }\n#itemDetailPage[data-cn] .detailPagePrimaryContent { margin: 0; max-width: none; padding: 0; width: 100%; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer { box-sizing: border-box; margin: 0; max-width: none; padding: 0 var(--cn-gutter) 56px !important; width: 100%; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer :is(.padded-left, .padded-right) { padding-left: 0 !important; padding-right: 0 !important; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer .emby-scroller { margin-left: 0; margin-right: 0; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer .verticalSection { padding-left: 0; padding-right: 0; }\n#itemDetailPage[data-cn] .streaming-lookup-container { box-sizing: border-box; margin-left: 0 !important; max-width: none; width: 100%; }\n.cn-dh {\n    background: #000;\n    box-sizing: border-box;\n    display: flex;\n    flex-direction: column;\n    justify-content: flex-end;\n    min-height: clamp(520px, 70vh, 860px);\n    overflow: hidden;\n    padding: 110px var(--cn-gutter) 36px;\n    position: relative;\n}\n.cn-dh-back {\n    height: 100%;\n    inset: 0;\n    object-fit: cover;\n    object-position: center 18%;\n    opacity: 0;\n    position: absolute;\n    transition: opacity 500ms ease;\n    width: 100%;\n}\n.cn-dh-back[data-loaded=\"true\"] { opacity: 1; }\n.cn-dh-shade {\n    background:\n        linear-gradient(0deg, #000 0%, rgba(0, 0, 0, 0.72) 22%, transparent 58%),\n        linear-gradient(90deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.42) 30%, transparent 62%);\n    inset: 0;\n    position: absolute;\n}\n.cn-dh-stack { max-width: 620px; position: relative; }\n.cn-dh-title { color: #fff; font-size: clamp(2.2rem, 4.2vw, 3.8rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; margin: 0 0 16px; }\n.cn-dh-title img { display: block; max-height: clamp(84px, 15vh, 150px); max-width: min(420px, 78vw); object-fit: contain; object-position: left bottom; }\n.cn-dh-sub { color: #fff; font-size: 1.3rem; font-weight: 650; margin: -4px 0 12px; }\n.cn-dh-facts,\n.cn-dh-genres { align-items: center; color: #efeaea; display: flex; flex-wrap: wrap; font-size: 0.95rem; }\n.cn-dh-facts { margin-bottom: 8px; }\n.cn-dh-genres { color: #d9d3d4; font-size: 0.9rem; margin-bottom: 20px; }\n.cn-dh-facts > * + *::before,\n.cn-dh-genres > * + *::before { color: rgba(255, 255, 255, 0.5); content: \"·\"; margin: 0 9px; }\n.cn-dh-facts > .cn-cert::before { display: none; }\n.cn-dh-facts .cn-cert { border: 1px solid rgba(255, 255, 255, 0.42); border-radius: 4px; font-size: 0.76rem; margin-left: 12px; padding: 0 6px; }\n.cn-star { color: var(--cn-accent); }\n.cn-dh-overview {\n    -webkit-box-orient: vertical;\n    -webkit-line-clamp: 4;\n    color: #e6e1e2;\n    display: -webkit-box;\n    line-height: 1.55;\n    margin: 0 0 24px;\n    overflow: hidden;\n}\nhtml.cn-ui #itemDetailPage .cn-dactions { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; margin: 0; padding: 0; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .detailButton {\n    -webkit-backdrop-filter: blur(12px);\n    align-items: center;\n    backdrop-filter: blur(12px);\n    background: rgba(20, 18, 19, 0.62);\n    border: 1px solid rgba(255, 255, 255, 0.14);\n    border-radius: 999px;\n    color: #fff;\n    display: inline-flex;\n    height: 46px;\n    justify-content: center;\n    margin: 0;\n    min-width: 0;\n    padding: 0;\n    width: 46px;\n}\nhtml.cn-ui #itemDetailPage .cn-dactions > .detailButton.hide { display: none; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .detailButton:hover { background: rgba(60, 54, 56, 0.8); }\nhtml.cn-ui #itemDetailPage .cn-dactions .detailButton-content { align-items: center; color: inherit; display: flex; }\nhtml.cn-ui #itemDetailPage .cn-dactions .detailButton-icon { color: inherit; font-size: 22px; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay {\n    -webkit-backdrop-filter: none;\n    backdrop-filter: none;\n    background: #fff;\n    border-color: #fff;\n    color: #000;\n    flex: none !important;\n    flex-direction: row !important;\n    font-size: 1.06rem;\n    font-weight: 700;\n    gap: 10px;\n    height: 52px !important;\n    min-width: 152px !important;\n    order: -2;\n    padding: 0 34px 0 26px !important;\n    white-space: nowrap;\n    width: auto !important;\n}\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay .detailButton-icon { font-size: 28px; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay:hover { background: #e4dfe0; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay::after { content: attr(title); }\nhtml.cn-ui #itemDetailPage .cn-dactions > .cn-watch { cursor: pointer; order: -1; }\n.cn-watch svg { fill: currentColor; height: 22px; width: 22px; }\n.cn-watch[aria-pressed=\"true\"] svg { color: var(--cn-accent-text); }\n.cn-eps { box-sizing: border-box; padding: 26px var(--cn-gutter) 12px; }\n.cn-eps-head { align-items: center; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; margin-bottom: 16px; }\n.cn-eps-title { border-left: 3px solid var(--cn-accent); padding-left: 11px; }\n.cn-eps-count { color: var(--cn-muted); font-size: 0.9rem; margin-top: 2px; }\nhtml.cn-ui .cn-season,\n.cn-season-text {\n    -webkit-appearance: none;\n    appearance: none;\n    background: transparent;\n    background-image: linear-gradient(45deg, transparent 50%, #aaa4a5 50%), linear-gradient(135deg, #aaa4a5 50%, transparent 50%);\n    background-position: right 7px top 58%, right 2px top 58%;\n    background-repeat: no-repeat;\n    background-size: 5px 5px;\n    border: 0;\n    color: #fff;\n    cursor: pointer;\n    font: inherit;\n    font-size: 1.45rem;\n    font-weight: 650;\n    padding: 0 22px 0 0;\n}\n.cn-season-text { background: none; cursor: default; display: block; padding: 0; }\nhtml.cn-ui .cn-season option { background: #0b0a0b; color: #f3efef; font-size: 1rem; }\n.cn-eps-tools { align-items: center; display: flex; gap: 8px; }\n.cn-tool-group { background: var(--cn-raised); border-radius: 10px; display: flex; }\n.cn-tool {\n    align-items: center;\n    background: var(--cn-raised);\n    border: 0;\n    border-radius: 10px;\n    color: var(--cn-muted);\n    cursor: pointer;\n    display: flex;\n    height: 38px;\n    justify-content: center;\n    width: 38px;\n}\n.cn-tool svg { fill: currentColor; height: 19px; width: 19px; }\n.cn-tool:hover { color: #fff; }\n.cn-tool[aria-pressed=\"true\"] { background: #342e31; color: #fff; }\n.cn-eps-search {\n    background: var(--cn-surface);\n    border: 1px solid var(--cn-line-strong);\n    border-radius: 10px;\n    box-sizing: border-box;\n    color: var(--cn-text);\n    font: inherit;\n    height: 38px;\n    padding: 0 12px;\n    width: min(220px, 46vw);\n}\n.cn-eps-search[hidden] { display: none; }\n.cn-eplist { display: flex; gap: 12px; overflow-x: auto; padding: 4px 2px 14px; scroll-snap-type: x proximity; }\n.cn-eplist[data-view=\"list\"] { flex-direction: column; overflow-x: visible; }\n.cn-ep { aspect-ratio: 16 / 9; border-radius: 12px; flex: 0 0 clamp(270px, 24vw, 370px); overflow: hidden; position: relative; scroll-snap-align: start; }\n.cn-eplist[data-view=\"list\"] .cn-ep { aspect-ratio: auto; flex: none; min-height: 150px; }\n.cn-ep-main { background: var(--cn-raised); border: 0; color: #fff; cursor: pointer; display: block; font: inherit; height: 100%; inset: 0; padding: 0; position: absolute; text-align: left; width: 100%; }\n.cn-eplist[data-view=\"list\"] .cn-ep-main { position: relative; }\n.cn-ep-main img { height: 100%; inset: 0; object-fit: cover; position: absolute; transition: transform 360ms var(--cn-ease); width: 100%; }\n.cn-ep-main:hover img { transform: scale(1.04); }\n.cn-ep::after { border: 2px solid var(--cn-accent); border-radius: inherit; box-sizing: border-box; content: \"\"; inset: 0; opacity: 0; pointer-events: none; position: absolute; transition: opacity 160ms ease; z-index: 3; }\n.cn-ep:hover::after,\n.cn-ep:focus-within::after { opacity: 1; }\n.cn-ep-shade { background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 8%, rgba(0, 0, 0, 0.5) 52%, rgba(0, 0, 0, 0.05) 86%); inset: 0; position: absolute; }\n.cn-ep-copy { bottom: 0; box-sizing: border-box; display: block; left: 0; padding: 12px 14px; position: absolute; right: 0; }\n.cn-eplist[data-view=\"list\"] .cn-ep-copy { max-width: 760px; }\n.cn-ep-eyebrow { color: #cfc9ca; display: block; font-size: 0.66rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }\n.cn-ep-name { display: block; font-size: 1.04rem; font-weight: 700; margin: 2px 0 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cn-ep-over { -webkit-box-orient: vertical; -webkit-line-clamp: 2; color: #d7d1d2; display: -webkit-box; font-size: 0.8rem; line-height: 1.35; overflow: hidden; }\n.cn-ep-foot { align-items: center; color: #d7d1d2; display: flex; font-size: 0.76rem; justify-content: space-between; margin-top: 6px; }\n.cn-ep-prog { background: rgba(255, 255, 255, 0.24); bottom: 0; height: 3px; left: 0; position: absolute; right: 0; }\n.cn-ep-prog i { background: var(--cn-accent); display: block; height: 100%; }\n.cn-ep-dl { align-items: center; background: rgba(20, 18, 19, 0.7); border-radius: 8px; color: #fff; display: flex; height: 32px; justify-content: center; position: absolute; right: 9px; top: 9px; width: 32px; }\n.cn-ep-dl svg { fill: currentColor; height: 18px; width: 18px; }\n.cn-ep-dl:hover { background: var(--cn-accent); }\n.cn-eps-msg { color: var(--cn-muted); padding: 20px 0; }\n.cn-wl { background: #000; box-sizing: border-box; inset: 0; overflow-y: auto; padding: 88px var(--cn-gutter) 40px; position: fixed; z-index: 1150; }\n.cn-wl-head { align-items: center; display: flex; justify-content: space-between; margin-bottom: 20px; }\n.cn-wl-head h2 { border-left: 3px solid var(--cn-accent); font-size: 1.6rem; margin: 0; padding-left: 11px; }\n.cn-wl-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }\n.cn-wl-card { color: var(--cn-text); display: block; font-size: 0.9rem; text-decoration: none; }\n.cn-wl-poster { aspect-ratio: 2 / 3; background: var(--cn-raised); border-radius: var(--cn-radius); display: block; margin-bottom: 7px; overflow: hidden; }\n.cn-wl-poster img { display: block; height: 100%; object-fit: cover; width: 100%; }\n.cn-wl-card:hover .cn-wl-poster,\n.cn-wl-card:focus-visible .cn-wl-poster { outline: 2px solid var(--cn-accent); outline-offset: -2px; }\n.cn-wl-group + .cn-wl-group { margin-top: 34px; }\n.cn-wl-group h3 { font-size: 1.15rem; font-weight: 650; margin: 0 0 12px; }\n@media (max-width: 600px) {\n    .cn-dh { min-height: 76svh; padding-top: 90px; }\n    .cn-dh-shade { background: linear-gradient(0deg, #000 8%, rgba(0, 0, 0, 0.76) 46%, rgba(0, 0, 0, 0.12) 80%); }\n    .cn-wl-grid { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); }\n}\n\n/* Version picker: shown only on films with more than one version (merged items); Video/Audio/Subtitles stay hidden */\nhtml.cn-ui #itemDetailPage[data-cn] .detailPagePrimaryContainer .trackSelections:has(> .selectSourceContainer:not(.hide)) { display: flex !important; margin: 18px 0 4px !important; padding: 0 !important; max-width: none !important; }\nhtml.cn-ui #itemDetailPage[data-cn] .trackSelections > .selectContainer:not(.selectSourceContainer) { display: none !important; }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer { align-items: center !important; display: flex !important; gap: 12px; margin: 0 !important; max-width: 100%; position: relative; width: auto !important; }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer .selectLabel { color: var(--cn-muted) !important; flex: none; font-size: 0.8rem !important; font-weight: 700; letter-spacing: 0.08em; margin: 0 !important; text-transform: uppercase; width: auto !important; }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer select.selectSource { appearance: none; background: rgba(255, 255, 255, 0.08) !important; border: 1px solid var(--cn-line-strong) !important; border-radius: 999px !important; color: var(--cn-text) !important; cursor: pointer; font: inherit; font-size: 0.93rem !important; font-weight: 600 !important; height: 40px; max-width: min(460px, 70vw); min-width: 220px; padding: 0 42px 0 18px !important; text-overflow: ellipsis; transition: background-color 160ms ease, border-color 160ms ease; width: auto !important; }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer select.selectSource:hover { background: rgba(255, 255, 255, 0.14) !important; }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer select.selectSource:focus { box-shadow: none !important; outline: none; }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer select.selectSource:focus-visible { border-color: rgba(255, 255, 255, 0.6) !important; }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer select.selectSource option { background: #171416; color: var(--cn-text); }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer .selectArrowContainer { color: var(--cn-muted); pointer-events: none; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); }\nhtml.cn-ui #itemDetailPage[data-cn] .selectSourceContainer .selectArrowContainer > div:empty { display: none; }";

  const ICONS = {
    play: 'M8 5v14l11-7z',
    info: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    prev: 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z',
    next: 'M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z',
    search: 'M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
    person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z',
    bookmark: 'M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2zm0 15-5-2.2L7 18V5h10z',
    bookmarked: 'M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z',
    close: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z',
    grid: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
    list: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
    sort: 'M7 4 3 8h3v9h2V8h3zm9 16 4-4h-3V7h-2v9h-3z',
    download: 'M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z',
  };

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  // Server settings: top-bar items switched off and the links' order, from Dashboard > Plugins > Crimson Noir.
  // The order is applied with flex `order`, so the links never move in the page itself (several libraries
  // of one type share a position and keep their own order).
  if (CONFIG.hiddenNav.length || CONFIG.navOrder.length) {
    const rules = [];
    if (CONFIG.hiddenNav.length) rules.push(CONFIG.hiddenNav.map((key) => '.cn-nav [data-cn-nav="' + key + '"]').join(',\n') + ' { display: none !important; }');
    if (CONFIG.navOrder.length) {
      rules.push('.cn-nav-links > * { order: 50; }', '.cn-nav-links > [data-cn-nav="home"] { order: 0; }');
      CONFIG.navOrder.forEach((key, index) => rules.push('.cn-nav-links > [data-cn-nav="' + key + '"] { order: ' + (index + 1) + '; }'));
    }
    const navStyle = document.createElement('style');
    navStyle.id = 'crimson-noir-nav-hide';
    navStyle.textContent = rules.join('\n');
    (document.head || root).append(navStyle);
  }

  let hero = null;
  let pending = null;
  let generation = 0;
  let failedHost = null;
  let reconcileTimer = 0;
  let retryTimer = 0;
  let nav = null;
  let detail = null;
  let activeDetailPage = null;
  let concealTimer = 0;
  let pageFade = null; // the running page crossfade (view transition), if any
  let pageFadeDone = null; // call to let it fade into the new page
  let pageFadeFor = ''; // the item id that crossfade is heading to

  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function isTv() {
    return root.classList.contains('layout-tv');
  }

  function isDashboard() {
    const route = (location.hash.slice(1) || location.pathname).split('?')[0].toLowerCase();
    return (document.body && document.body.classList.contains('dashboardDocument')) || route === '/dashboard' || route.startsWith('/dashboard/') || route === '/configurationpage' || route === '/metadata';
  }

  function isHome() {
    const match = location.hash.match(/^#!?\/(?:home(?:\.html)?)?(?:\?([^#]*))?$/);
    if (!match) return false;
    const tab = new URLSearchParams(match[1] || '').get('tab');
    return !tab || tab === '0';
  }

  function findHost() {
    if (!CONFIG.slideshow || !isHome()) return null;
    return Array.from(document.querySelectorAll('#indexPage #homeTab.is-active .sections')).find((node) => node.getClientRects().length) || null;
  }

  function imageUrl(client, item, type) {
    const tag = type === 'Backdrop' ? (item.BackdropImageTags || [])[0] : (item.ImageTags || {})[type];
    if (!tag) return '';
    const width = Math.min(3840, Math.round(window.innerWidth * (window.devicePixelRatio || 1)));
    return client.getImageUrl(item.Id, type === 'Backdrop'
      ? { type, tag, index: 0, maxWidth: width, quality: 90 }
      : { type, tag, maxWidth: 800 });
  }

  function loadItems(client) {
    const query = {
      IncludeItemTypes: CONFIG.types,
      Recursive: true,
      SortBy: 'Random',
      ImageTypes: 'Backdrop',
      Limit: CONFIG.slides,
      Fields: 'Overview,Genres',
      EnableTotalRecordCount: false,
    };
    if (CONFIG.unwatchedOnly) query.IsPlayed = false;
    return client.getItems(client.getCurrentUserId(), query)
      .then((result) => (result.Items || []).filter((item) => (item.BackdropImageTags || []).length));
  }

  function runtime(ticks) {
    const minutes = Math.round((ticks || 0) / 600000000);
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    return hours ? hours + 'h ' + (minutes % 60) + 'm' : minutes + 'm';
  }

  function buildMeta(item) {
    const meta = el('div', 'cn-meta');
    if (item.CommunityRating) {
      const score = el('b', '', '★ ' + Number(item.CommunityRating).toFixed(1));
      score.setAttribute('aria-label', 'Rated ' + Number(item.CommunityRating).toFixed(1));
      meta.append(score);
    }
    if (item.ProductionYear) meta.append(el('span', '', String(item.ProductionYear)));
    if (item.OfficialRating) meta.append(el('span', 'cn-cert', item.OfficialRating));
    const length = item.Type === 'Series' ? 'Series' : runtime(item.RunTimeTicks);
    if (length) meta.append(el('span', '', length));
    if ((item.Genres || []).length) meta.append(el('span', '', item.Genres.slice(0, 2).join(' · ')));
    return meta;
  }

  function buildActions(client, item) {
    const serverId = item.ServerId || client.serverId();
    const position = (item.UserData && item.UserData.PlaybackPositionTicks) || 0;

    // Jellyfin's items container handles these attributes, so playback uses the normal player flow.
    const play = el('button', 'cn-btn cn-btn-primary itemAction');
    play.type = 'button';
    play.innerHTML = icon('play');
    play.append(position > 0 ? 'Resume' : 'Play');
    play.dataset.action = position > 0 ? 'resume' : 'play';
    play.dataset.id = item.Id;
    play.dataset.serverid = serverId;
    play.dataset.type = item.Type;
    play.dataset.mediatype = item.MediaType || 'Video';
    play.dataset.isfolder = String(Boolean(item.IsFolder));
    if (position > 0) play.dataset.positionticks = String(position);

    const more = el('a', 'cn-btn cn-btn-ghost');
    more.href = '#/details?id=' + encodeURIComponent(item.Id) + '&serverId=' + encodeURIComponent(serverId);
    more.innerHTML = icon('info');
    more.append('More info');

    const actions = el('div', 'cn-actions');
    actions.append(play, more);
    return actions;
  }

  // A backdrop whose right edge is flat black is really a poster with bars baked in; it leaves half the banner empty.
  function heroRightEdgeEmpty(image) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 36;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, 64, 36);
      const data = ctx.getImageData(56, 0, 8, 36).data;
      let sum = 0;
      let sumSq = 0;
      const count = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        const light = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        sum += light;
        sumSq += light * light;
      }
      const mean = sum / count;
      const spread = Math.sqrt(Math.max(0, sumSq / count - mean * mean));
      return mean < 1.5 && spread < 1.5;
    } catch (error) {
      return false;
    }
  }

  function buildSlide(client, item, index, total) {
    const slide = el('section', 'cn-slide');
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', (index + 1) + ' of ' + total + ': ' + item.Name);

    const backdrop = el('img', 'cn-backdrop');
    backdrop.alt = '';
    backdrop.decoding = 'async';
    backdrop.dataset.src = imageUrl(client, item, 'Backdrop');
    backdrop.addEventListener('load', () => {
      backdrop.dataset.loaded = 'true';
      // Some "backdrops" are really tall posters; those make a broken-looking banner, so skip that title
      if (backdrop.naturalWidth && (backdrop.naturalWidth / backdrop.naturalHeight < 1.4 || heroRightEdgeEmpty(backdrop))) {
        slide.dataset.narrow = 'true';
        slide.dispatchEvent(new CustomEvent('cn-narrow', { bubbles: true }));
      }
    });

    const title = el('h2', 'cn-title', item.Name);
    const logoUrl = imageUrl(client, item, 'Logo');
    if (logoUrl) {
      const logo = el('img');
      logo.alt = item.Name;
      logo.dataset.src = logoUrl;
      logo.addEventListener('error', () => { title.textContent = item.Name; });
      title.replaceChildren(logo);
    }

    const content = el('div', 'cn-content');
    content.append(title, buildMeta(item));
    if (item.Overview) content.append(el('p', 'cn-overview', item.Overview));
    content.append(buildActions(client, item));

    slide.append(backdrop, el('div', 'cn-shade'), content);
    return slide;
  }

  function createShell(host) {
    // The `is` attribute has to be parsed for Jellyfin's custom element to attach its click handling.
    const parser = el('div');
    parser.innerHTML = '<div is="emby-itemscontainer" class="cn-hero itemsContainer" data-contextmenu="false" data-multiselect="false" data-state="loading"></div>';
    const node = parser.firstElementChild;
    node.setAttribute('role', 'region');
    node.setAttribute('aria-roledescription', 'carousel');
    node.setAttribute('aria-label', 'Featured from your library');
    node.style.setProperty('--cn-seconds', CONFIG.seconds + 's');
    host.parentNode.insertBefore(node, host);
    if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(node);
    return node;
  }

  function createHero(node, client, items) {
    const slides = items.map((item, index) => buildSlide(client, item, index, items.length));
    const pauseReasons = new Set(reducedMotion ? ['reduced-motion'] : []);
    const TICK = 250;
    let elapsed = 0;
    let current = -1;
    let touchStart = null;
    let timer = 0;

    node.replaceChildren(...slides);
    node.addEventListener('cn-narrow', (event) => { if (event.target === slides[current]) go(current + 1); });

    function syncPause() {
      node.dataset.paused = String(pauseReasons.size > 0);
    }

    function setPause(reason, paused) {
      if (paused) pauseReasons.add(reason); else pauseReasons.delete(reason);
      syncPause();
    }

    function load(index) {
      slides[index].querySelectorAll('img[data-src]').forEach((image) => {
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
      });
    }

    function go(index) {
      let next = (index + slides.length) % slides.length;
      const step = index < current ? -1 : 1;
      for (let guard = slides.length; guard > 0 && slides[next].dataset.narrow === 'true'; guard--) next = (next + step + slides.length) % slides.length;
      if (next === current) return;
      current = next;
      load(current);
      load((current + 1) % slides.length);
      slides.forEach((slide, i) => { slide.dataset.active = String(i === current); });
      elapsed = 0;
    }

    function button(className, name, label, onClick) {
      const control = el('button', className);
      control.type = 'button';
      control.innerHTML = icon(name);
      control.setAttribute('aria-label', label);
      control.addEventListener('click', onClick);
      return control;
    }

    // Directional hand-off for drags, swipes, arrows and keys: the old slide keeps drifting the way it was
    // thrown while it fades; the new one glides in from the other side. Autoplay keeps its plain crossfade.
    let flickTimer = 0;
    function settle(slide) {
      if (!slide) return;
      slide.getBoundingClientRect();
      slide.style.transition = '';
      slide.classList.add('cn-settling');
      slide.style.translate = '0px 0';
      setTimeout(() => { slide.classList.remove('cn-settling'); slide.style.translate = ''; }, 400);
    }
    function flick(step, fromOffset) {
      const outgoing = slides[current];
      if (reducedMotion || !outgoing) { go(current + step); return; }
      clearTimeout(flickTimer);
      slides.forEach((slide) => { if (slide !== outgoing) { slide.classList.remove('cn-leaving', 'cn-settling'); slide.style.translate = ''; slide.style.transition = ''; } });
      outgoing.style.transition = 'none';
      outgoing.style.translate = (fromOffset || 0).toFixed(1) + 'px 0';
      outgoing.getBoundingClientRect();
      outgoing.style.transition = '';
      outgoing.classList.add('cn-leaving');
      const before = current;
      node.dataset.dir = step > 0 ? 'next' : 'prev';
      go(current + step);
      if (current === before) { outgoing.classList.remove('cn-leaving'); delete node.dataset.dir; settle(outgoing); return; }
      const from = (fromOffset || 0).toFixed(1);
      outgoing.style.translate = 'calc(' + from + 'px ' + (step > 0 ? '- 4%' : '+ 4%') + ') 0';
      flickTimer = setTimeout(() => {
        outgoing.classList.remove('cn-leaving');
        outgoing.style.translate = '';
        delete node.dataset.dir;
      }, 820);
    }

    if (slides.length > 1) {
      node.append(
        button('cn-arrow cn-prev', 'prev', 'Previous', () => flick(-1, 0)),
        button('cn-arrow cn-next', 'next', 'Next', () => flick(1, 0))
      );

      timer = window.setInterval(() => {
        if (pauseReasons.size) return;
        elapsed += TICK;
        if (elapsed >= CONFIG.seconds * 1000) go(current + 1);
      }, TICK);

      // Only pause over the text and controls, so a parked mouse doesn't stop the slideshow.
      node.addEventListener('pointerover', (event) => {
        if (event.pointerType === 'mouse') setPause('hover', Boolean(event.target.closest('.cn-actions, .cn-arrow')));
      });
      node.addEventListener('pointerleave', () => setPause('hover', false));

      if (!isTv()) {
        node.addEventListener('focusin', (event) => setPause('focus', event.target.matches(':focus-visible')));
        node.addEventListener('focusout', () => setPause('focus', false));
        node.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowLeft') flick(-1, 0);
          if (event.key === 'ArrowRight') flick(1, 0);
        });
      }

      node.addEventListener('pointerdown', (event) => {
        touchStart = event.pointerType === 'touch' ? event.clientX : null;
      });
      node.addEventListener('pointerup', (event) => {
        if (touchStart === null) return;
        const distance = event.clientX - touchStart;
        touchStart = null;
        if (Math.abs(distance) > 50) flick(distance < 0 ? 1 : -1, 0);
      });

      // Mouse: press and drag left or right to flick between slides (buttons and links still click normally)
      let drag = null;
      node.addEventListener('dragstart', (event) => event.preventDefault());
      node.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        if (event.target.closest('.cn-actions, .cn-arrow, button, input, select, textarea')) return;
        drag = { x: event.clientX, y: event.clientY, moved: false, id: event.pointerId };
      });
      const onMove = (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(event.clientY - drag.y)) {
          drag.moved = true;
          node.classList.add('cn-dragging');
          setPause('drag', true);
          const selection = window.getSelection && window.getSelection();
          if (selection && selection.removeAllRanges) selection.removeAllRanges();
        }
        if (drag.moved && !reducedMotion) {
          // Follows the pointer with soft resistance, easing off rather than hitting a wall
          drag.offset = 170 * Math.tanh(dx / 520);
          const slide = slides[current];
          slide.style.transition = 'opacity 750ms ease';
          slide.style.translate = drag.offset.toFixed(1) + 'px 0';
        }
      };
      const onUp = (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.x;
        const moved = drag.moved;
        const offset = drag.offset || 0;
        drag = null;
        node.classList.remove('cn-dragging');
        setPause('drag', false);
        if (!moved) return;
        // A drag is not a click: swallow the click that follows on whatever sits under the pointer
        const swallow = (click) => { click.preventDefault(); click.stopPropagation(); };
        window.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener('click', swallow, true), 0);
        if (Math.abs(dx) > 50) flick(dx < 0 ? 1 : -1, offset); else settle(slides[current]);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }

    const onVisibility = () => setPause('hidden', document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new IntersectionObserver(([entry]) => setPause('offscreen', !entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);

    syncPause();
    go(0);
    node.dataset.state = 'ready';

    return {
      node,
      pause: (paused) => setPause('away', paused),
      destroy() {
        window.clearInterval(timer);
        document.removeEventListener('visibilitychange', onVisibility);
        observer.disconnect();
        node.remove();
      },
    };
  }

  function unmount() {
    generation += 1;
    if (hero) hero.destroy();
    if (pending) pending.remove();
    hero = null;
    pending = null;
    root.classList.toggle('cn-hero-on', false); // toggle() leaves the attribute alone when nothing changes
  }

  function mount(host) {
    const client = window.ApiClient;
    const token = ++generation;
    const node = createShell(host);
    pending = node;
    root.classList.add('cn-hero-on');

    loadItems(client).then((items) => {
      if (token !== generation) return;
      if (!items.length) throw new Error('No items with backdrops');
      pending = null;
      hero = createHero(node, client, items);
      hero.mountedAt = Date.now();
      hero.userId = client.getCurrentUserId();
    }).catch((error) => {
      if (token !== generation) return;
      console.warn('[Crimson Noir] Slideshow unavailable:', error);
      node.remove();
      pending = null;
      failedHost = host;
      root.classList.remove('cn-hero-on');
    });
  }

  /* ---- Floating header ---- */

  function routePath() {
    return (location.hash.slice(1) || location.pathname).split('?')[0].toLowerCase().replace(/^!/, '');
  }

  function navAllowed() {
    return !isDashboard() && !root.classList.contains('transparentDocument')
      && !/^\/(video|login|selectserver|forgotpassword|connectlogin|wizard)/.test(routePath());
  }

  function showNav(visible) {
    if (nav) nav.node.hidden = !visible;
    root.classList.toggle('cn-nav-on', visible);
  }

  // Prefer the link Jellyfin itself renders for a library, so its route stays correct across versions.
  function libraryHref(view, fallback) {
    const links = document.querySelectorAll('header a[href], .skinHeader a[href], .mainDrawer a[href], .MuiDrawer-root a[href]');
    const native = Array.from(links).find((link) => link.getAttribute('href').includes(view.Id));
    return native ? native.getAttribute('href') : fallback;
  }

  function createNav(client) {
    const serverId = () => encodeURIComponent(client.serverId());
    const node = el('nav', 'cn-nav');
    node.setAttribute('aria-label', 'Main');
    const links = el('div', 'cn-nav-links');
    const tools = el('div', 'cn-nav-tools');
    const entries = [];

    function link(label, href, isActive, view) {
      const anchor = el('a', 'cn-nav-link', label);
      if (href) anchor.href = href; else anchor.hidden = true;
      links.append(anchor);
      const entry = { anchor, isActive, view };
      entries.push(entry);
      return entry;
    }

    const tabIs = (value) => new URLSearchParams(location.hash.split('?')[1] || '').get('tab') === value;

    link('Home', '#/home', isHome).anchor.dataset.cnNav = 'home';
    link('Favourites', '#/home?tab=1', () => /^\/(home)?$/.test(routePath()) && tabIs('1')).anchor.dataset.cnNav = 'favourites';
    // Library tabs are filled in once the user's libraries load (see addLibraryTabs).
    const libraryMarker = document.createComment(' libraries ');
    links.append(libraryMarker);

    // One tab per library, grouped by type in the user's own library order. A type with a
    // single library keeps the short label ("Movies"); several get their own names
    // ("Movies", "4K Movies", "Kids Movies") so every library is one click away.
    function addLibraryTabs(views) {
      [
        ['Movies', 'movies', (id) => '#/movies?topParentId=' + id + '&collectionType=movies'],
        ['Shows', 'tvshows', (id) => '#/tv?topParentId=' + id + '&collectionType=tvshows'],
        ['Collections', 'boxsets', (id) => '#/list?parentId=' + id + '&serverId=' + serverId()],
      ].forEach(([label, type, fallback]) => {
        const matches = views.filter((view) => view.CollectionType === type);
        matches.forEach((view) => {
          const anchor = el('a', 'cn-nav-link', matches.length > 1 ? view.Name : label);
          anchor.dataset.cnNav = type === 'tvshows' ? 'shows' : type === 'boxsets' ? 'collections' : 'movies';
          anchor.hidden = true;
          links.insertBefore(anchor, libraryMarker);
          entries.push({
            anchor,
            view: { source: view, fallback: () => fallback(view.Id) },
            isActive: () => location.hash.includes(view.Id),
          });
        });
      });
    }

    if (CONFIG.watchlistUrl) {
      const entry = link('Watchlist', watchlistHref(), () => /^\/(home)?$/.test(routePath()) && tabIs(watchlistTab()));
      entry.dynamicHref = watchlistHref;
      entry.anchor.dataset.cnNav = 'watchlist';
    } else {
      const watch = el('button', 'cn-nav-link', 'Watchlist');
      watch.type = 'button';
      watch.dataset.cnNav = 'watchlist';
      watch.addEventListener('click', () => openWatchlist(client));
      links.append(watch);
    }

    // Discover (Seerr): hidden until Jellyfin Enhanced reports Seerr is set up (syncNav)
    const discoverLink = link('Discover', '#/discover', () => routePath() === '/discover');
    discoverLink.anchor.hidden = true;
    discoverLink.anchor.dataset.cnNav = 'discover';
    link('Requests', '#/downloads', () => routePath() === '/downloads').anchor.dataset.cnNav = 'requests';
    link('Calendar', '#/calendar', () => routePath() === '/calendar').anchor.dataset.cnNav = 'calendar';

    const search = el('a', 'cn-nav-icon');
    search.href = '#/search';
    search.innerHTML = icon('search');
    search.setAttribute('aria-label', 'Search');
    search.dataset.cnNav = 'search';

    const profile = el('button', 'cn-nav-icon');
    profile.type = 'button';
    profile.innerHTML = icon('person');
    profile.setAttribute('aria-label', 'Profile and settings');
    profile.addEventListener('click', () => {
      const native = document.querySelector('[aria-controls="app-user-menu"], .headerUserButton');
      if (native) native.click(); else location.hash = '#/mypreferencesmenu';
    });

    const palette = el('button', 'cn-nav-icon cn-accent-btn');
    palette.type = 'button';
    palette.innerHTML = PALETTE_ICON;
    palette.setAttribute('aria-label', 'Accent colour');
    palette.setAttribute('aria-haspopup', 'dialog');
    palette.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleAccentPicker(palette);
    });

    // Jellyfin Enhanced's "Random item" dice lives in the native header, which this theme
    // replaces. Mirror it here and press the real one, so JE keeps its own logic and shortcut.
    // Shown only while JE has the button turned on (syncRandom).
    const random = el('button', 'cn-nav-icon cn-random');
    random.type = 'button';
    random.dataset.cnNav = 'random';
    random.hidden = true;
    random.setAttribute('aria-label', 'Random item');
    random.addEventListener('click', () => {
      const native = document.getElementById('randomItemButton');
      if (native && !native.disabled) native.click();
    });

    tools.append(search, profile, random);

    // Back: left end of the bar, shown everywhere except Home. Goes to the page you came from;
    // if this page was opened directly (nothing earlier in Jellyfin to go back to), goes Home.
    const backWrap = el('div', 'cn-nav-backwrap');
    const back = el('button', 'cn-nav-icon cn-nav-back');
    back.type = 'button';
    back.setAttribute('aria-label', 'Back');
    back.title = 'Back';
    back.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>';
    back.addEventListener('click', () => {
      if (visited.length > 1) window.history.back();
      else location.hash = '#/home';
    });
    backWrap.append(back);

    node.append(backWrap, links, tools);
    document.body.append(node);

    const state = { node, entries, random, back: backWrap, discoverLink, views: null };
    client.getUserViews({}, client.getCurrentUserId()).then((result) => {
      state.views = result.Items || [];
      addLibraryTabs(state.views);
      schedule();
    }).catch((error) => console.warn('[Crimson Noir] Could not load libraries:', error));
    return state;
  }

  // Back is hidden on Home and shown everywhere else (only written when it changes). Run straight
  // from hashchange/popstate as well as each reconcile, so it never waits on a pass that may not come.
  function syncBack() {
    if (!nav) return;
    const onHome = isHome();
    if (nav.back.hidden !== onHome) nav.back.hidden = onHome;
  }
  ['hashchange', 'popstate'].forEach((name) => window.addEventListener(name, syncBack));

  // Pages visited in Jellyfin this session, so Back knows whether there is anywhere to go back to.
  // Going back to the previous page pops it; anything else is a new step.
  const visited = [location.hash];
  window.addEventListener('hashchange', () => {
    const now = location.hash;
    if (visited.length > 1 && visited[visited.length - 2] === now) visited.pop();
    else if (visited[visited.length - 1] !== now) visited.push(now);
    if (visited.length > 200) visited.splice(0, visited.length - 200);
  });

  // The Watchlist home tab sits wherever the server's tab setup puts it (KefinTweaks / Custom Tabs),
  // so take its position from the Watchlist link KefinTweaks adds to Jellyfin's own header and menu.
  // CONFIG.watchlistUrl is the fallback until (or unless) that link exists.
  let foundWatchlistHref = '';
  function watchlistHref() {
    const native = Array.from(document.querySelectorAll('a[href*="#/home?tab="]'))
      .find((a) => !a.closest('.cn-nav') && /watchlist/i.test(a.textContent || ''));
    const tab = native && new URLSearchParams((native.getAttribute('href') || '').split('?')[1] || '').get('tab');
    if (tab) foundWatchlistHref = '#/home?tab=' + tab + '&pageTab=watchlist';
    return foundWatchlistHref || CONFIG.watchlistUrl;
  }
  function watchlistTab() {
    return new URLSearchParams(watchlistHref().split('?')[1] || '').get('tab') || '';
  }

  function syncNav(client) {
    if (!document.body) return;
    if (!nav) nav = createNav(client);
    const visible = navAllowed();
    showNav(visible);
    // Before the early return: the bar can be hidden for a moment mid-navigation (e.g. leaving the
    // player), and Back must still be right when it comes back.
    syncBack();
    if (!visible) return;
    const showDiscover = discoverAvailable();
    if (nav.discoverLink.anchor.hidden === showDiscover) nav.discoverLink.anchor.hidden = !showDiscover;
    // Width of the nav pill, so things beside it (KefinTweaks breadcrumbs) know how much room is left
    const navWidth = nav.node.offsetWidth + 'px';
    if (root.style.getPropertyValue('--cn-nav-w') !== navWidth) root.style.setProperty('--cn-nav-w', navWidth);

    nav.entries.forEach((entry) => {
      if (entry.view) {
        const href = libraryHref(entry.view.source, entry.view.fallback());
        if (entry.anchor.getAttribute('href') !== href) entry.anchor.setAttribute('href', href);
        entry.anchor.hidden = false;
      } else if (entry.dynamicHref) {
        const href = entry.dynamicHref();
        if (entry.anchor.getAttribute('href') !== href) entry.anchor.setAttribute('href', href);
      }
      // A hidden link (e.g. Discover before Jellyfin Enhanced is ready) isn't marked yet, so it gets
      // scrolled into view once it shows rather than measured at zero width while hidden
      const active = !entry.anchor.hidden && Boolean(entry.isActive && entry.isActive());
      if (active) {
        // On narrow screens the link row scrolls, so bring the current page into view. Redone whenever the
        // row's contents change width (library tabs and Discover arrive after the first pass).
        const row = entry.anchor.parentNode;
        const key = entry.anchor.textContent + '|' + row.scrollWidth + '|' + row.clientWidth;
        if (row.dataset.cnCentred !== key && row.clientWidth) {
          row.dataset.cnCentred = key;
          row.scrollLeft = entry.anchor.offsetLeft - row.offsetLeft - (row.clientWidth - entry.anchor.offsetWidth) / 2;
        }
      }
      if (active) entry.anchor.setAttribute('aria-current', 'page');
      else entry.anchor.removeAttribute('aria-current');
    });
    syncRandom(nav.random);
  }

  function syncRandom(button) {
    const native = document.getElementById('randomItemButton');
    const je = window.JellyfinEnhanced;
    const on = Boolean(native && je && je.currentSettings && je.currentSettings.randomButtonEnabled);
    button.hidden = !on;
    if (!on) return;
    // Copy the current dice face and the rolling state while JE picks an item.
    if (button.innerHTML !== native.innerHTML) button.innerHTML = native.innerHTML;
    if (native.title && button.title !== native.title) button.title = native.title;
    button.classList.toggle('loading', native.classList.contains('loading'));
    button.disabled = native.disabled;
  }

  /* ---- Watchlist (Jellyfin stores it as the item's "Likes" flag) ---- */

  let watchlistPanel = null;

  function closeWatchlist() {
    if (watchlistPanel) watchlistPanel.remove();
    watchlistPanel = null;
  }

  function watchlistCard(client, item) {
    const card = el('a', 'cn-wl-card');
    card.href = '#/details?id=' + encodeURIComponent(item.Id) + '&serverId=' + encodeURIComponent(item.ServerId || client.serverId());
    const poster = el('span', 'cn-wl-poster');
    const tag = (item.ImageTags || {}).Primary;
    if (tag) {
      const image = el('img');
      image.alt = '';
      image.loading = 'lazy';
      image.src = client.getImageUrl(item.Id, { type: 'Primary', tag, maxHeight: 480 });
      poster.append(image);
    }
    card.append(poster, item.Name);
    return card;
  }

  function openWatchlist(client) {
    closeWatchlist();
    const panel = el('div', 'cn-wl');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Watchlist');
    const head = el('div', 'cn-wl-head');
    const close = el('button', 'cn-tool');
    close.type = 'button';
    close.innerHTML = icon('close');
    close.setAttribute('aria-label', 'Close watchlist');
    close.addEventListener('click', closeWatchlist);
    head.append(el('h2', '', 'Watchlist'), close);
    const body = el('div', 'cn-eps-msg', 'Loading…');
    panel.append(head, body);
    panel.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeWatchlist(); });
    document.body.append(panel);
    watchlistPanel = panel;
    close.focus();

    client.getItems(client.getCurrentUserId(), {
      Filters: 'Likes',
      IncludeItemTypes: 'Movie,Series',
      Recursive: true,
      SortBy: 'SortName',
      EnableTotalRecordCount: false,
    }).then((result) => {
      if (watchlistPanel !== panel) return;
      const items = result.Items || [];
      if (!items.length) {
        body.textContent = 'Nothing on your watchlist yet. Use the Add to watchlist button on any title.';
        return;
      }
      const content = el('div');
      [['Movies', 'Movie'], ['Shows', 'Series']].forEach(([label, type]) => {
        const matching = items.filter((item) => item.Type === type);
        if (!matching.length) return;
        const group = el('section', 'cn-wl-group');
        const grid = el('div', 'cn-wl-grid');
        matching.forEach((item) => grid.append(watchlistCard(client, item)));
        group.append(el('h3', '', label), grid);
        const more = el('button', 'cn-wl-more');
        more.type = 'button';
        let open = false;
        let lastWidth = -1;
        const fit = () => {
          const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
          const limit = columns * (CONFIG.watchlistRows || 1);
          Array.from(grid.children).forEach((card, index) => { card.hidden = !open && index >= limit; });
          more.hidden = matching.length <= limit;
          more.textContent = open ? 'Show less' : 'Show all ' + matching.length;
          more.setAttribute('aria-expanded', String(open));
        };
        more.addEventListener('click', () => { open = !open; fit(); });
        group.append(more);
        new ResizeObserver((entries) => {
          const width = Math.round(entries[0].contentRect.width);
          if (width !== lastWidth) { lastWidth = width; fit(); }
        }).observe(grid);
        content.append(group);
      });
      body.replaceWith(content);
    }).catch((error) => {
      console.warn('[Crimson Noir] Watchlist failed:', error);
      if (watchlistPanel === panel) body.textContent = 'Couldn\'t load your watchlist. Try again in a moment.';
    });
  }

  /* ---- Details page ---- */

  function detailRoute() {
    const match = location.hash.match(/^#!?\/details[?&](.*)$/);
    return match ? new URLSearchParams(match[1]).get('id') : '';
  }

  function findDetailPage() {
    if (activeDetailPage && activeDetailPage.isConnected && !activeDetailPage.classList.contains('hide')) return activeDetailPage;
    const pages = Array.from(document.querySelectorAll('#itemDetailPage:not(.hide)')).filter((page) => page.getClientRects().length);
    return pages[pages.length - 1] || null;
  }

  function conceal(active) {
    window.clearTimeout(concealTimer);
    root.classList.toggle('cn-details-loading', active);
    // Never leave the page blank if the item request stalls.
    if (active) concealTimer = window.setTimeout(() => root.classList.remove('cn-details-loading'), 2500);
    // Showing the page by any route (themed or not) ends a pending crossfade; heroReady() runs first
    // on the themed routes and has already taken it, so this only catches the rest.
    else if (pageFadeDone) pageFadeDone();
  }

  function artwork(client, item, type) {
    const own = type === 'Backdrop' ? (item.BackdropImageTags || [])[0] : (item.ImageTags || {}).Logo;
    const width = Math.min(3840, Math.round(window.innerWidth * (window.devicePixelRatio || 1)));
    const options = type === 'Backdrop' ? { type, index: 0, maxWidth: width, quality: 90 } : { type, maxWidth: 800 };
    if (own) return client.getImageUrl(item.Id, { ...options, tag: own });
    const parentTag = type === 'Backdrop' ? (item.ParentBackdropImageTags || [])[0] : item.ParentLogoImageTag;
    const parentId = type === 'Backdrop' ? item.ParentBackdropItemId : item.ParentLogoItemId;
    return parentTag && parentId ? client.getImageUrl(parentId, { ...options, tag: parentTag }) : '';
  }

  // Box sets: how many of their titles you've watched. From a list of the set's titles, or from the set item's
  // own counts (ChildCount, UserData.UnplayedItemCount). Null when it can't tell.
  function setWatched(item, kids) {
    if (kids && kids.length) {
      return { watched: kids.filter((kid) => kid.UserData && kid.UserData.Played).length, total: kids.length };
    }
    if (!item || item.Type !== 'BoxSet' || !item.ChildCount || !item.UserData || item.UserData.UnplayedItemCount == null) return null;
    const total = item.ChildCount;
    return { watched: Math.max(0, Math.min(total, total - item.UserData.UnplayedItemCount)), total };
  }

  // A thin progress line plus "3 of 5 watched", for a box set part-way through
  function setProgress(done, withText) {
    if (!done || !done.total || done.watched <= 0 || done.watched >= done.total) return null;
    const wrap = el('span', 'cn-setp');
    const words = done.watched + ' of ' + done.total + ' watched';
    wrap.setAttribute('aria-label', words);
    wrap.title = words;
    const bar = el('span', 'cn-setp-bar');
    const fill = el('i');
    fill.style.width = Math.round((done.watched / done.total) * 100) + '%';
    bar.append(fill);
    if (withText) wrap.append(el('span', 'cn-setp-text', words));
    wrap.append(bar);
    return wrap;
  }

  // Jellyfin Enhanced draws its card tags (quality, ratings, network/provider logos...) on anything shaped like
  // a Jellyfin card: an element with the item's data-id holding .cardScalable > .cardImageContainer. The
  // theme's own cards get an invisible copy of that shape over their artwork, so the tags show on them too.
  function jeTagTarget(art, itemId) {
    if (!art || !itemId || art.querySelector(':scope > .cn-jet')) return;
    art.dataset.id = itemId;
    art.classList.add('cn-jet-host');
    const box = el('div', 'cn-jet cardScalable');
    box.setAttribute('aria-hidden', 'true');
    box.append(el('div', 'cn-jet-img cardImageContainer'));
    art.append(box);
  }

  // KefinTweaks features the user has switched on (KefinTweaks > Scripts), so the theme can make room for them
  function kefinOn(name) {
    const config = window.KefinTweaksConfig;
    return Boolean(config && config.enabled !== false && config.scripts && config.scripts[name]);
  }

  function buildFacts(item, seasons) {
    const facts = el('div', 'cn-dh-facts');
    if (item.Type === 'BoxSet') {
      const kids = seasons || [];
      const count = kids.length || item.ChildCount || 0;
      const films = kids.length > 0 && kids.every((kid) => kid.Type === 'Movie');
      if (count) facts.append(el('span', '', count + ' ' + (films ? (count === 1 ? 'film' : 'films') : (count === 1 ? 'title' : 'titles'))));
      const years = kids.map((kid) => kid.ProductionYear).filter(Boolean);
      if (years.length) {
        const first = Math.min(...years);
        const last = Math.max(...years);
        facts.append(el('span', '', first === last ? String(first) : first + '\u2013' + last));
      }
      const progress = setProgress(setWatched(item, kids), true);
      if (progress) facts.append(progress);
      if (item.OfficialRating) facts.append(el('span', 'cn-cert', item.OfficialRating));
      return facts;
    }
    if (item.CommunityRating) {
      const score = el('span');
      score.setAttribute('aria-label', 'Rated ' + Number(item.CommunityRating).toFixed(1));
      score.append(el('span', 'cn-star', '★ '), Number(item.CommunityRating).toFixed(1));
      facts.append(score);
    }
    if (item.ProductionYear) facts.append(el('span', '', String(item.ProductionYear)));
    if (item.Type === 'Series') {
      const count = seasons.filter((season) => Number(season.IndexNumber) > 0).length;
      if (count) facts.append(el('span', '', count + (count === 1 ? ' Season' : ' Seasons')));
      // KefinTweaks "Series info" adds an episode count to Jellyfin's info line, which the hero replaces
      const episodes = kefinOn('seriesInfo') ? item.RecursiveItemCount : 0;
      if (episodes) facts.append(el('span', '', episodes + (episodes === 1 ? ' Episode' : ' Episodes')));
    } else if (runtime(item.RunTimeTicks)) {
      facts.append(el('span', '', runtime(item.RunTimeTicks)));
    }
    if (item.OfficialRating) facts.append(el('span', 'cn-cert', item.OfficialRating));
    return facts;
  }

  function buildWatchButton(client, item) {
    const button = el('button', 'detailButton cn-watch');
    button.type = 'button';
    let saved = Boolean(item.UserData && item.UserData.Likes);

    function paint() {
      const label = saved ? 'In watchlist' : 'Add to watchlist';
      button.innerHTML = '<div class="detailButton-content">' + icon('bookmarked') + '</div>';
      button.title = label;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(saved));
    }

    button.addEventListener('click', () => {
      const next = !saved;
      const query = { userId: client.getCurrentUserId() };
      if (next) query.likes = true;
      button.disabled = true;
      client.ajax({ type: next ? 'POST' : 'DELETE', url: client.getUrl('UserItems/' + item.Id + '/Rating', query) })
        .then(() => { saved = next; paint(); })
        .catch((error) => console.warn('[Crimson Noir] Watchlist update failed:', error))
        .then(() => { button.disabled = false; });
    });

    paint();
    return button;
  }

  // Collections: a box set on a shelf. Each film is a full-height spine; the chosen one stands open on the stage.
  const SHELF_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.3 5.9 20.7l1.5-6.7L2.3 9.4l6.8-.7z"/></svg>';
  const SHELF_TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function shelfPoster(client, kid) {
    const tags = kid.ImageTags || {};
    if (tags.Primary) return client.getImageUrl(kid.Id, { type: 'Primary', tag: tags.Primary, maxHeight: 1100, quality: 90 });
    const back = (kid.BackdropImageTags || [])[0];
    return back ? client.getImageUrl(kid.Id, { type: 'Backdrop', tag: back, maxWidth: 900, quality: 85 }) : '';
  }

  function buildShelf(client, item, kids, actions) {
    const hero = el('section', 'cn-dh cn-shelf');
    const stage = el('div', 'cn-shelf-stage');
    const backs = el('div', 'cn-shelf-backs');
    const film = el('div', 'cn-shelf-film');
    // The collection name stays as the page heading for screen readers only
    stage.append(backs, el('div', 'cn-dh-shade'), el('h1', 'cn-shelf-name', item.Name), film);

    // Collection facts and buttons ride beside the chosen film's Play and Details
    const setFacts = buildFacts(item, kids);
    setFacts.classList.add('cn-shelf-setfacts');
    const total = runtime(kids.reduce((sum, kid) => sum + (kid.RunTimeTicks || 0), 0));
    if (total) setFacts.insertBefore(el('span', '', total), setFacts.querySelector('.cn-cert'));

    const shelf = el('div', 'cn-shelf-spines');
    shelf.setAttribute('role', 'group');
    shelf.setAttribute('aria-label', 'Films in ' + item.Name);
    shelf.style.setProperty('--cn-spines', String(kids.length));
    let current = -1;

    const spines = kids.map((kid, index) => {
      const spine = el('button', 'cn-spine');
      spine.type = 'button';
      spine.setAttribute('aria-label', kid.Name + (kid.ProductionYear ? ' (' + kid.ProductionYear + ')' : ''));
      const src = shelfPoster(client, kid);
      if (src) {
        const art = el('img', 'cn-spine-art');
        art.alt = '';
        art.loading = 'lazy';
        art.src = src;
        spine.append(art);
        jeTagTarget(spine, kid.Id);
      }
      spine.append(el('span', 'cn-spine-year', kid.ProductionYear ? String(kid.ProductionYear) : ''), el('span', 'cn-spine-title', kid.Name || ''));
      const foot = el('span', 'cn-spine-foot');
      if (kid.CommunityRating) {
        const rating = el('span', 'cn-spine-rating');
        rating.innerHTML = SHELF_STAR;
        rating.append(Number(kid.CommunityRating).toFixed(1));
        foot.append(rating);
      }
      if (runtime(kid.RunTimeTicks)) foot.append(el('span', '', runtime(kid.RunTimeTicks)));
      const data = kid.UserData || {};
      if (data.Played) {
        const tick = el('span', 'cn-spine-tick');
        tick.innerHTML = SHELF_TICK;
        tick.title = 'Watched';
        foot.append(tick);
      }
      spine.append(foot);
      const percent = Number(data.PlayedPercentage || 0);
      if (percent > 0 && percent < 100) {
        const bar = el('span', 'cn-spine-prog');
        const fill = el('i');
        fill.style.width = percent + '%';
        bar.append(fill);
        spine.append(bar);
      }
      spine.addEventListener('click', () => show(index));
      return spine;
    });
    shelf.append(...spines);
    hero.append(stage, shelf);

    // Long sets scroll sideways: the mouse wheel and arrow keys move along the shelf
    shelf.addEventListener('wheel', (event) => {
      if (shelf.scrollWidth <= shelf.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      shelf.scrollLeft += event.deltaY;
    }, { passive: false });
    shelf.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = Math.max(0, Math.min(kids.length - 1, current + step));
      show(next);
      spines[next].focus();
    });

    function show(index) {
      if (index === current) return;
      current = index;
      const kid = kids[index];
      spines.forEach((spine, i) => spine.setAttribute('aria-pressed', String(i === index)));
      if (shelf.scrollWidth > shelf.clientWidth) {
        const spine = spines[index];
        shelf.scrollTo({ left: Math.max(0, spine.offsetLeft - (shelf.clientWidth - spine.offsetWidth) / 2), behavior: 'smooth' });
      }

      const backUrl = artwork(client, kid, 'Backdrop');
      if (backUrl) {
        const back = el('img', 'cn-dh-back');
        back.alt = '';
        back.addEventListener('load', () => {
          if (backs.lastElementChild !== back) { back.remove(); return; }
          back.dataset.loaded = 'true';
          Array.from(backs.children).forEach((node) => { if (node !== back) setTimeout(() => node.remove(), 600); });
        });
        back.src = backUrl;
        backs.append(back);
      }

      const title = el('h2', 'cn-shelf-title', kid.Name || '');
      const logoUrl = artwork(client, kid, 'Logo');
      if (logoUrl) {
        const logo = el('img');
        logo.alt = kid.Name || '';
        logo.addEventListener('error', () => { title.textContent = kid.Name || ''; });
        logo.src = logoUrl;
        title.replaceChildren(logo);
      }
      const parts = [title];
      const tagline = (kid.Taglines || [])[0];
      if (tagline) parts.push(el('p', 'cn-shelf-tag', tagline));
      parts.push(buildFacts(kid, []));
      if (kid.Overview) parts.push(el('p', 'cn-dh-overview', kid.Overview));

      const holder = el('div');
      holder.innerHTML = '<div is="emby-itemscontainer" class="cn-shelf-acts itemsContainer" data-contextmenu="false" data-multiselect="false"></div>';
      const row = holder.firstElementChild;
      if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(row);
      const data = kid.UserData || {};
      const position = data.PlaybackPositionTicks || 0;
      const play = el('button', 'cn-shelf-play itemAction');
      play.type = 'button';
      play.dataset.action = position > 0 ? 'resume' : 'play';
      play.dataset.id = kid.Id;
      play.dataset.serverid = kid.ServerId || client.serverId();
      play.dataset.type = kid.Type;
      play.dataset.mediatype = kid.MediaType || 'Video';
      play.dataset.isfolder = 'false';
      if (position > 0) play.dataset.positionticks = String(position);
      play.innerHTML = icon('play');
      play.append(position > 0 ? 'Resume' : 'Play');
      const more = el('a', 'cn-shelf-more');
      more.href = '#/details?id=' + encodeURIComponent(kid.Id) + '&serverId=' + encodeURIComponent(kid.ServerId || client.serverId());
      more.innerHTML = icon('info');
      more.append('Details');
      row.append(play, more);
      const bar = el('div', 'cn-shelf-bar');
      bar.append(row, actions, setFacts);
      parts.push(bar);
      film.replaceChildren(...parts);
    }

    const next = kids.findIndex((kid) => !(kid.UserData && kid.UserData.Played));
    show(next < 0 ? 0 : next);
    return hero;
  }

  // Collections: one panel of art per title (2-4 panels), behind a centred title
  function setPanels(client, kids) {
    const withArt = (kids || []).filter((kid) => (kid.BackdropImageTags || []).length).slice(0, 4);
    if (withArt.length < 2) return null;
    const strip = el('div', 'cn-dh-panels');
    strip.style.setProperty('--cn-panels', String(withArt.length));
    const width = Math.min(1920, Math.round((window.innerWidth * (window.devicePixelRatio || 1)) / withArt.length * 1.6));
    withArt.forEach((kid) => {
      const image = el('img', 'cn-dh-panel');
      image.alt = '';
      image.addEventListener('load', () => { image.dataset.loaded = 'true'; });
      image.src = client.getImageUrl(kid.Id, { type: 'Backdrop', index: 0, tag: kid.BackdropImageTags[0], maxWidth: width, quality: 90 });
      strip.append(image);
    });
    return strip;
  }

  function buildHero(client, item, seasons, actions) {
    if (item.Type === 'BoxSet' && (seasons || []).length > 1) return buildShelf(client, item, seasons, actions);
    const hero = el('section', 'cn-dh');
    const backUrl = artwork(client, item, 'Backdrop');
    const panels = item.Type === 'BoxSet' ? setPanels(client, seasons) : null;
    if (item.Type === 'BoxSet') hero.classList.add('cn-dh-set');
    if (panels) {
      hero.append(panels);
    } else if (backUrl) {
      const back = el('img', 'cn-dh-back');
      back.alt = '';
      back.addEventListener('load', () => { back.dataset.loaded = 'true'; });
      back.src = backUrl;
      hero.append(back);
    }
    hero.append(el('div', 'cn-dh-shade'));

    const child = item.Type === 'Season' || item.Type === 'Episode';
    const titleText = child ? (item.SeriesName || item.Name) : item.Name;
    const title = el('h1', 'cn-dh-title', titleText);
    const logoUrl = artwork(client, item, 'Logo');
    if (logoUrl) {
      const logo = el('img');
      logo.alt = titleText;
      logo.addEventListener('error', () => { logo.replaceWith(document.createTextNode(titleText)); });
      logo.src = logoUrl;
      title.replaceChildren(logo);
    }
    // Episodes and seasons: the show's logo/title links back to the show's own page
    if (child && item.SeriesId) {
      const seriesLink = el('a', 'cn-dh-series-link');
      seriesLink.href = '#/details?id=' + encodeURIComponent(item.SeriesId) + '&context=tvshows&serverId=' + encodeURIComponent(item.ServerId || client.serverId());
      seriesLink.title = 'Go to ' + titleText;
      seriesLink.setAttribute('aria-label', 'Go to ' + titleText);
      seriesLink.append(...title.childNodes);
      title.replaceChildren(seriesLink);
    }

    const stack = el('div', 'cn-dh-stack');
    stack.append(title);
    if (child) {
      const prefix = item.Type === 'Episode' && item.IndexNumber != null ? 'S' + (item.ParentIndexNumber || 0) + ':E' + item.IndexNumber + ' · ' : '';
      const sub = el('div', 'cn-dh-sub');
      sub.append(el('span', 'cn-dh-sub-text', prefix + item.Name));
      stack.append(sub);
      if (item.Type === 'Episode') episodeSteps(client, item, sub);
    }
    stack.append(buildFacts(item, seasons));
    if ((item.Genres || []).length) {
      const genres = el('div', 'cn-dh-genres');
      item.Genres.slice(0, 4).forEach((genre) => genres.append(el('span', '', genre)));
      stack.append(genres);
    }
    const ends = buildEndsAt(client, item);
    if (ends) stack.append(ends);
    const credit = buildCredit(client, item);
    if (credit) stack.append(credit);
    if (item.Overview) stack.append(el('p', 'cn-dh-overview', item.Overview));
    const details = buildMoreDetails(client, item);
    stack.append(actions);
    // "More details" sits under the Play / action buttons, just above the panel it opens
    if (details) {
      stack.append(details.toggle);
      hero.cnMoreDetails = details.panel;
    }
    hero.append(stack);
    // Server setting: start with "More details" open (the toggle needs to be inside the hero first)
    if (details && CONFIG.moreDetailsOpen) details.setOpen(true);
    return hero;
  }

  // Episode pages: ‹ › either side of "S1:E2 · Title" step to the previous / next episode (across seasons).
  function episodeSteps(client, item, sub) {
    if (!item.SeriesId) return;
    const serverId = item.ServerId || client.serverId();
    const code = (ep) => (ep.IndexNumber != null ? 'S' + (ep.ParentIndexNumber || 0) + ':E' + ep.IndexNumber + ' ' : '') + (ep.Name || '');
    const step = (ep, dir) => {
      const a = el('a', 'cn-dh-step cn-dh-step-' + dir);
      a.href = '#/details?id=' + encodeURIComponent(ep.Id) + '&serverId=' + encodeURIComponent(serverId);
      const words = (dir === 'prev' ? 'Previous episode: ' : 'Next episode: ') + code(ep);
      a.title = words;
      a.setAttribute('aria-label', words);
      a.innerHTML = icon(dir === 'prev' ? 'prev' : 'next');
      return a;
    };
    client.getEpisodes(item.SeriesId, { userId: client.getCurrentUserId(), adjacentTo: item.Id, Fields: 'ParentIndexNumber' }).then((result) => {
      const list = result.Items || [];
      const at = list.findIndex((ep) => ep.Id === item.Id);
      if (at < 0 || !sub.isConnected && !sub.parentNode) return;
      const prev = list[at - 1];
      const next = list[at + 1];
      if (prev) sub.prepend(step(prev, 'prev'));
      if (next) sub.append(step(next, 'next'));
      if (prev || next) sub.classList.add('has-steps');
    }).catch(() => {});
  }

  function buildEpisodes(client, series, seasons, opts) {
    // Season row in the style of a home-screen row: wide stills, title underneath, actions on hover.
    const regular = seasons.filter((season) => Number(season.IndexNumber) > 0);
    const list = regular.length ? regular : seasons;
    const userId = client.getCurrentUserId();
    const serverId = series.ServerId || client.serverId();
    const SX = {
      chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.05-4.95M19 5v4h-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" fill="currentColor"/></svg>',
      more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="18.5" r="1.8" fill="currentColor"/></svg>'
    };
    let current = list[0];
    let requestId = 0;
    let focusId = null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const section = el('section', 'cn-sx');
    const head = el('div', 'cn-sx-head');
    const title = el('a', 'cn-sx-title');
    const titleText = el('span');
    title.append(titleText);
    title.insertAdjacentHTML('beforeend', SX.chevron);
    head.append(title);

    let select = null;
    if (list.length > 1) {
      const pick = el('label', 'cn-sx-pick');
      pick.append(el('span', '', 'Select Season'));
      select = el('select');
      select.setAttribute('aria-label', 'Select season');
      list.forEach((season) => {
        const option = el('option', '', season.Name);
        option.value = season.Id;
        select.append(option);
      });
      select.addEventListener('change', () => {
        const next = list.find((season) => season.Id === select.value);
        if (next) { focusId = null; load(next); }
      });
      pick.append(select);
      head.append(pick);
    }

    function tool(svg, label, onClick) {
      const button = el('button', 'cn-sx-tool');
      button.type = 'button';
      button.innerHTML = svg;
      button.title = label;
      button.setAttribute('aria-label', label);
      button.addEventListener('click', onClick);
      return button;
    }
    const refresh = tool(SX.refresh, 'Refresh', () => load(current));
    const gridToggle = tool(SX.grid, 'Grid layout', () => {
      const on = track.dataset.layout !== 'grid';
      track.dataset.layout = on ? 'grid' : 'row';
      gridToggle.setAttribute('aria-pressed', String(on));
      section.classList.toggle('is-grid', on);
      sync();
    });
    gridToggle.setAttribute('aria-pressed', 'false');
    head.append(refresh, gridToggle);

    const arrows = el('div', 'cn-sx-arrows');
    const prev = tool(SX.chevron, 'Previous', () => track.scrollBy({ left: -track.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' }));
    prev.classList.add('is-prev');
    const next = tool(SX.chevron, 'Next', () => track.scrollBy({ left: track.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' }));
    arrows.append(prev, next);
    head.append(arrows);

    const parser = el('div');
    parser.innerHTML = '<div is="emby-itemscontainer" class="cn-sx-track itemsContainer" data-contextmenu="false" data-multiselect="false" data-layout="row"></div>';
    const track = parser.firstElementChild;
    if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(track);
    function sync() {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    track.addEventListener('scroll', sync, { passive: true });
    section.append(head, track);

    function detailsHref(episode) {
      return '#/details?id=' + encodeURIComponent(episode.Id) + '&serverId=' + encodeURIComponent(serverId);
    }

    function card(episode) {
      const data = episode.UserData || (episode.UserData = {});
      const article = el('article', 'cn-sx-card');
      article.dataset.id = episode.Id;
      const art = el('div', 'cn-sx-art');
      jeTagTarget(art, episode.Id);
      const tag = (episode.ImageTags || {}).Primary;
      if (tag) {
        const image = el('img');
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.src = client.getImageUrl(episode.Id, { type: 'Primary', tag, maxWidth: 720, quality: 88 });
        art.append(image);
      }
      art.append(el('span', 'cn-sx-shade'));
      art.addEventListener('click', (event) => { if (!event.target.closest('button')) location.hash = detailsHref(episode); });

      const position = data.PlaybackPositionTicks || 0;
      const play = el('button', 'cn-sx-play itemAction');
      play.type = 'button';
      play.dataset.action = position > 0 ? 'resume' : 'play';
      play.dataset.id = episode.Id;
      play.dataset.serverid = serverId;
      play.dataset.type = 'Episode';
      play.dataset.mediatype = 'Video';
      play.dataset.isfolder = 'false';
      if (position > 0) play.dataset.positionticks = String(position);
      play.innerHTML = icon('play');
      play.setAttribute('aria-label', (position > 0 ? 'Resume ' : 'Play ') + (episode.Name || 'episode'));
      art.append(play);

      const acts = el('div', 'cn-sx-acts');
      function toggle(svg, labelOn, labelOff, isOn, run, kind) {
        const button = el('button', 'cn-sx-act is-' + kind);
        button.type = 'button';
        const paint = () => {
          const on = isOn();
          button.innerHTML = typeof svg === 'function' ? svg(on) : svg;
          button.setAttribute('aria-pressed', String(on));
          button.title = on ? labelOn : labelOff;
          button.setAttribute('aria-label', (on ? labelOn : labelOff) + ': ' + (episode.Name || ''));
        };
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          button.disabled = true;
          run(!isOn()).then((result) => {
            if (result && typeof result === 'object') Object.assign(data, result);
            paint();
            article.classList.toggle('is-played', Boolean(data.Played));
          }).catch((error) => console.warn('[Crimson Noir] Episode update failed:', error)).then(() => { button.disabled = false; });
        });
        paint();
        return button;
      }
      acts.append(
        toggle(() => icon('bookmarked'), 'In watchlist', 'Add to watchlist', () => Boolean(data.Likes), (on) => {
          const query = { userId };
          if (on) query.likes = true;
          return client.ajax({ type: on ? 'POST' : 'DELETE', url: client.getUrl('UserItems/' + episode.Id + '/Rating', query) }).then(() => { data.Likes = on ? true : null; });
        }, 'watch'),
        toggle(SX.tick, 'Watched', 'Mark watched', () => Boolean(data.Played), (on) => (on ? client.markPlayed(userId, episode.Id, new Date()) : client.markUnplayed(userId, episode.Id)).then((result) => result || { Played: on }), 'played'),
        toggle(SX.heart, 'Favourite', 'Add to favourites', () => Boolean(data.IsFavorite), (on) => client.updateFavoriteStatus(userId, episode.Id, on).then((result) => result || { IsFavorite: on }), 'fav')
      );
      const more = el('button', 'cn-sx-act is-more itemAction');
      more.type = 'button';
      more.dataset.action = 'menu';
      more.dataset.id = episode.Id;
      more.dataset.serverid = serverId;
      more.dataset.type = 'Episode';
      more.dataset.mediatype = 'Video';
      more.dataset.isfolder = 'false';
      more.innerHTML = SX.more;
      more.title = 'More';
      more.setAttribute('aria-label', 'More options: ' + (episode.Name || ''));
      acts.append(more);
      art.append(acts);

      const done = el('span', 'cn-sx-done');
      done.innerHTML = SX.tick;
      art.append(done);
      article.classList.toggle('is-played', Boolean(data.Played));

      const percent = Number(data.PlayedPercentage || 0);
      if (percent > 0 && percent < 100) {
        const bar = el('span', 'cn-sx-prog');
        const fill = el('i');
        fill.style.width = percent + '%';
        bar.append(fill);
        art.append(bar);
      }

      const cap = el('a', 'cn-sx-cap');
      cap.href = detailsHref(episode);
      cap.append(el('b', '', series.Name || ''));
      const number = episode.IndexNumber != null ? 'S' + (episode.ParentIndexNumber != null ? episode.ParentIndexNumber : (current.IndexNumber || 0)) + ':E' + episode.IndexNumber + ' - ' : '';
      cap.append(el('span', '', number + (episode.Name || '')));
      article.append(art, cap);
      return article;
    }

    function load(season) {
      current = season;
      if (select) select.value = season.Id;
      titleText.textContent = season.Name || 'Episodes';
      title.href = '#/details?id=' + encodeURIComponent(season.Id) + '&serverId=' + encodeURIComponent(serverId);
      const id = ++requestId;
      refresh.disabled = true;
      client.getEpisodes(series.Id, { seasonId: season.Id, userId, Fields: 'Overview' }).then((result) => {
        if (id !== requestId) return;
        const episodes = result.Items || [];
        track.replaceChildren(...(episodes.length ? episodes.map(card) : [el('p', 'cn-sx-msg', 'No episodes in this season yet.')]));
        const target = (focusId && track.querySelector('[data-id="' + focusId + '"]')) || track.querySelector('.cn-sx-card:not(.is-played)');
        requestAnimationFrame(() => {
          if (target && track.dataset.layout !== 'grid') track.scrollLeft = Math.max(0, target.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0));
          sync();
        });
      }).catch((error) => {
        if (id !== requestId) return;
        console.warn('[Crimson Noir] Episodes failed:', error);
        track.replaceChildren(el('p', 'cn-sx-msg', 'Couldn’t load episodes. Use refresh to try again.'));
      }).then(() => { if (id === requestId) refresh.disabled = false; });
    }

    // Open on the season you are up to, scrolled to your next episode.
    titleText.textContent = current.Name || 'Episodes';
    client.getJSON(client.getUrl('Shows/NextUp', { SeriesId: series.Id, UserId: userId, Limit: 1, EnableResumable: true, EnableRewatching: false }))
      .then((result) => {
        const upNext = (result.Items || [])[0];
        const season = upNext && list.find((s) => s.Id === upNext.SeasonId);
        if (upNext) focusId = upNext.Id;
        load(season || list[0]);
      })
      .catch(() => load(list[0]));
    if (opts && opts.grid) gridToggle.click();
    return section;
  }

  function destroyDetail() {
    if (!detail) return;
    const { page, teardown } = detail;
    if (teardown) teardown();
    delete page.dataset.cn;
    delete page.dataset.cnEps;
    delete page.dataset.cnSeason;
    delete page.dataset.cnPerson;
    delete page.dataset.cnSet;
    delete page.dataset.cnMore;
    detail = null;
    root.classList.remove('cn-details-on');
  }

  function mountDetail(client, state, item, seasons) {
    const { page } = state;
    const actions = page.querySelector('.mainDetailButtons');
    const wrapper = page.querySelector('.detailPageWrapperContainer');
    if (!actions || !wrapper || !wrapper.parentNode) { conceal(false); return; }

    const origin = { parent: actions.parentNode, next: actions.nextSibling };
    actions.classList.add('cn-dactions');
    const watch = buildWatchButton(client, item);
    actions.append(watch);

    const hero = buildHero(client, item, seasons, actions);
    wrapper.parentNode.insertBefore(hero, wrapper);
    const moreDetails = hero.cnMoreDetails || null;
    let stopTrackPickers = null;
    if (moreDetails) {
      wrapper.parentNode.insertBefore(moreDetails, wrapper);
      page.dataset.cnMore = 'true';
      stopTrackPickers = wireTrackPickers(moreDetails, page);
    }

    let episodes = null;
    const secondary = wrapper.querySelector('.detailPageSecondaryContainer');
    // KefinTweaks' "Flatten single season shows" (its episode row with a season picker) does the same job as
    // the theme's row; when it is on, leave the series page to it rather than showing two episode rows.
    if (item.Type === 'Series' && seasons.length && secondary && !kefinOn('flattenSingleSeasonShows')) {
      episodes = buildEpisodes(client, item, seasons);
      // Sits above the Seasons row, where KefinTweaks used to put its episode row.
      const seasonsRow = page.querySelector('#listChildrenCollapsible');
      if (seasonsRow && seasonsRow.parentNode && wrapper.contains(seasonsRow)) seasonsRow.parentNode.insertBefore(episodes, seasonsRow);
      else secondary.parentNode.insertBefore(episodes, secondary);
      page.dataset.cnEps = 'true';
    } else if (item.Type === 'Season' && item.SeriesId && secondary) {
      // A season's own page: all its episodes as the theme's cards, in a grid, instead of Jellyfin's list
      episodes = buildSeasonList(client, item);
      const episodeList = page.querySelector('#listChildrenCollapsible');
      if (episodeList && episodeList.parentNode && wrapper.contains(episodeList)) episodeList.parentNode.insertBefore(episodes, episodeList);
      else secondary.parentNode.insertBefore(episodes, secondary);
      page.dataset.cnSeason = 'true';
    }

    if (item.Type === 'BoxSet') page.dataset.cnSet = 'true';
    page.dataset.cn = 'true';
    root.classList.add('cn-details-on');
    state.hero = hero;
    state.teardown = () => {
      watch.remove();
      actions.classList.remove('cn-dactions');
      if (origin.parent.isConnected) origin.parent.insertBefore(actions, origin.next && origin.next.parentNode === origin.parent ? origin.next : null);
      hero.remove();
      if (moreDetails) moreDetails.remove();
      if (stopTrackPickers) stopTrackPickers();
      if (episodes) episodes.remove();
    };
    heroReady(hero);
    conceal(false);
  }

  function reconcileDetails(client) {
    const id = detailRoute();
    if (!id) {
      destroyDetail();
      conceal(false);
      return;
    }
    const page = findDetailPage();
    if (!page || !page.querySelector('.mainDetailButtons')) {
      if (!detail || detail.id !== id) conceal(true);
      return;
    }
    if (detail && detail.id === id && detail.page === page && (!detail.teardown || detail.hero.isConnected)) return;

    destroyDetail();
    conceal(true);
    const state = { id, page, hero: null, teardown: null };
    detail = state;
    const userId = client.getCurrentUserId();

    client.getItem(userId, id).then((item) => {
      if (item.Type === 'Person') return personWorks(client, item).then((works) => [item, works]);
      if (!['Movie', 'Series', 'Season', 'Episode', 'BoxSet'].includes(item.Type)) return [item, null];
      if (item.Type === 'BoxSet') {
        return client.getItems(userId, { ParentId: item.Id, SortBy: 'PremiereDate,ProductionYear,SortName', SortOrder: 'Ascending', Fields: 'Overview,Taglines,Genres' })
          .then((result) => [item, result.Items || []]).catch(() => [item, []]);
      }
      return (item.Type === 'Series' ? client.getSeasons(item.Id, { userId }).then((result) => result.Items || []).catch(() => []) : Promise.resolve([]))
        .then((seasons) => [item, seasons]);
    }).then(([item, seasons]) => {
      if (detail !== state) return;
      if (seasons && item.Type === 'Person') mountPerson(client, state, item, seasons);
      else if (seasons) mountDetail(client, state, item, seasons); else conceal(false);
    }).catch((error) => {
      console.warn('[Crimson Noir] Details page left as standard:', error);
      if (detail === state) conceal(false);
    });
  }

  // Jellyfin's own box set cards (Collections library, Home rows, lists): a thin "3 of 5 watched" line along
  // the bottom of the poster for part-watched sets. Counts come from one batched request per pass and are
  // kept for a minute (and dropped on navigation), so marking titles watched shows up on the next visit.
  const setCounts = new Map();
  let setCardsTimer = 0;
  let setCardsBusy = false;
  window.addEventListener('hashchange', () => setCounts.clear());
  function scheduleSetCards() {
    if (!setCardsTimer) setCardsTimer = window.setTimeout(decorateSetCards, 250);
  }
  function decorateSetCards() {
    setCardsTimer = 0;
    const client = window.ApiClient;
    if (setCardsBusy || !client || !client.getCurrentUserId || !client.getCurrentUserId()) return;
    const cards = Array.from(document.querySelectorAll('.card[data-type="BoxSet"][data-id]'))
      .filter((card) => card.dataset.cnSetp !== card.dataset.id);
    if (!cards.length) return;
    const fresh = (id) => setCounts.has(id) && Date.now() - setCounts.get(id).at < 60000;
    const paint = () => cards.forEach((card) => {
      const id = card.dataset.id;
      if (!setCounts.has(id) || !card.isConnected) return;
      card.dataset.cnSetp = id;
      const holder = card.querySelector('.cardScalable');
      if (!holder) return;
      const old = holder.querySelector(':scope > .cn-setp');
      if (old) old.remove();
      const line = setProgress(setCounts.get(id).done, false);
      if (line) holder.append(line);
    });
    const need = [...new Set(cards.map((card) => card.dataset.id))].filter((id) => !fresh(id)).slice(0, 100);
    if (!need.length) { paint(); return; }
    setCardsBusy = true;
    client.getItems(client.getCurrentUserId(), { Ids: need.join(','), Fields: 'ChildCount', EnableImages: false, EnableTotalRecordCount: false })
      .then((result) => {
        (result.Items || []).forEach((item) => setCounts.set(item.Id, { done: setWatched(item), at: Date.now() }));
        need.forEach((id) => { if (!setCounts.has(id)) setCounts.set(id, { done: null, at: Date.now() }); });
        paint();
      })
      .catch(() => {})
      .then(() => { setCardsBusy = false; });
  }

  /* ---- Discover (#/discover): Seerr's trending, popular and upcoming titles, networks, studios and genres ----
     A page of the theme's own (like Jellyfin Enhanced's pages): a filter rail and a poster grid under a featured
     banner. Data comes from Jellyfin Enhanced's Seerr proxy, requests open its
     Seerr window, and titles already on the server open their own page. */
  const DISCOVER_ROUTE = /^#!?\/discover(?:[?&/]|$)/;
  // TMDB ids and logos, the same lists Jellyfin Enhanced and Seerr use for their own tiles
  const DISCOVER_NETWORKS = [
    ['Netflix', 213, '/wwemzKWzjKYJFfCeiB57q3r4Bcm.png'], ['HBO', 49, '/tuomPhY2UtuPTqqFnKMVHvSb724.png'],
    ['Disney+', 2739, '/1edZOYAfoyZyZ3rklNSiUpXX30Q.png'], ['Apple TV+', 2552, '/bngHRFi794mnMq34gfVcm9nDxN1.png'],
    ['Prime Video', 1024, '/w7HfLNm9CWwRmAMU58udl2L7We7.png'], ['BBC', 4, '/uJjcCg3O4DMEjM0xtno9OWFciRP.png'],
    ['FX', 88, '/aexGjtcs42DgRtZh7zOxayiry4J.png'], ['Paramount+', 4330, '/fi83B1oztoS47xxcemFdPMhIzK.png'],
    ['Hulu', 453, '/pqUTCleNUiTLAVlelGxUgWn1ELh.png'], ['AMC', 174, '/pmvRmATOCaDykE6JrVoeYxlFHw3.png'],
    ['Showtime', 67, '/Allse9kbjiP6ExaQrnSpIhkurEi.png'], ['Crunchyroll', 1112, '/qqyXcZlJQKlRmAD1TCKV7mGLQlt.png'],
  ];
  const DISCOVER_STUDIOS = [
    ['Marvel Studios', 420, '/hUzeosd33nzE5MCNsZxCGEKTXaQ.png'], ['Pixar', 3, '/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png'],
    ['Warner Bros. Pictures', 174, '/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png'], ['Universal Pictures', 33, '/8lvHyhjr8oUKOOy2dKXoALWKdp0.png'],
    ['Paramount Pictures', 4, '/jay6WcMgagAklUt7i9Euwj1pzTF.png'], ['Lucasfilm', 1, '/tlVSws0RvvtPBwViUyOFAO0vcQS.png'],
    ['A24', 41077, '/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png'], ['Sony Pictures', 34, '/xAb1o9HrSvKBo9mnXC8fJKDNu00.png'],
    ['Illumination', 6704, '/fOG2oY4m1YuYTQh4bMqqZkmgOAI.png'], ['Legendary Pictures', 923, '/5UQsZrfbfG2dYJbx8DxfoTr2Bvu.png'],
    ['Blumhouse Productions', 3172, '/rzKluDcRkIwHZK2pHsiT667A2Kw.png'], ['20th Century Studios', 127928, '/h0rjX5vjW5r8yEnUBStFarjcLT4.png'],
  ];
  let discover = null; // { page, body, stop: () => void }
  let discoverKey = '';

  function discoverAvailable() {
    const JE = window.JellyfinEnhanced;
    return Boolean(JE && JE.pluginConfig && JE.pluginConfig.JellyseerrEnabled && JE.jellyseerrMoreInfo && JE.jellyseerrMoreInfo.open);
  }

  function seerrGet(path, params) {
    const client = window.ApiClient;
    return fetch(client.getUrl('JellyfinEnhanced/jellyseerr/' + path, params || {}), {
      headers: {
        Accept: 'application/json',
        Authorization: 'MediaBrowser Token="' + client.accessToken() + '"',
        'X-Jellyfin-User-Id': client.getCurrentUserId(),
      },
    }).then((r) => r.json()).then((data) => {
      if (data && data.error) throw new Error(data.message || 'Seerr error');
      return data;
    });
  }

  // What the server already has of a Seerr result: { label, cls, jellyfinId }
  function seerrStatus(result) {
    const info = result.mediaInfo || {};
    const jellyfinId = info.jellyfinMediaId || info.jellyfinMediaId4k || '';
    if (info.status === 5) return { label: 'In library', cls: 'is-lib', jellyfinId };
    if (info.status === 4) return { label: 'Partly here', cls: 'is-part', jellyfinId };
    if (info.status === 3) return { label: 'Processing', cls: 'is-proc', jellyfinId: '' };
    if (info.status === 2) return { label: 'Requested', cls: 'is-req', jellyfinId: '' };
    return { label: '', cls: '', jellyfinId: '' };
  }

  function openSeerrResult(result) {
    const status = seerrStatus(result);
    if (status.jellyfinId) {
      location.hash = '#/details?id=' + encodeURIComponent(status.jellyfinId) + '&serverId=' + encodeURIComponent(window.ApiClient.serverId());
      return;
    }
    window.JellyfinEnhanced.jellyseerrMoreInfo.open(result.id, result.mediaType);
  }

  function seerrTitle(result) { return result.title || result.name || ''; }
  function seerrYear(result) { return (result.releaseDate || result.firstAirDate || '').slice(0, 4); }

  function discoverCard(result) {
    const card = el('button', 'cn-dc');
    card.type = 'button';
    const status = seerrStatus(result);
    const year = seerrYear(result);
    card.setAttribute('aria-label', seerrTitle(result) + (year ? ' (' + year + ')' : '') + (status.label ? ', ' + status.label : ''));
    const art = el('span', 'cn-dc-art');
    if (result.posterPath) {
      const img = el('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = TMDB_IMG + 'w342' + result.posterPath;
      art.append(img);
    } else {
      art.append(el('span', 'cn-dc-noart', seerrTitle(result)));
    }
    if (status.label) art.append(el('span', 'cn-dc-badge ' + status.cls, status.label));
    card.append(art, el('b', 'cn-dc-name', seerrTitle(result)), el('span', 'cn-dc-meta', [year, result.mediaType === 'tv' ? 'Show' : 'Film'].filter(Boolean).join(' · ')));
    card.addEventListener('click', () => openSeerrResult(result));
    return card;
  }

  /* Browse: a filter rail on the left (search, All / Films / Shows, lists, networks, studios, genres) and one
     big poster grid on the right under a featured banner. The view lives in the address
     (#/discover?list=…&type=…&sort=…, or network= / studio= / genre=), so Back and a reload land on the same
     view; changing a filter rewrites the address in place and redraws only the right-hand side. */
  const DISCOVER_LISTS = [['trending', 'Trending'], ['popular', 'Popular'], ['upcoming', 'Coming soon']];
  const DISCOVER_TYPES = [['all', 'All'], ['movie', 'Films'], ['tv', 'Shows']];
  const discoverGenres = { movie: null, tv: null };

  function discoverView(params) {
    const type = /^(movie|tv)$/.test(params.get('type') || '') ? params.get('type') : 'all';
    const v = { type, list: '', network: '', studio: '', genre: '', name: params.get('name') || '', sort: params.get('sort') || '' };
    const feed = params.get('feed'); // addresses from the earlier shelves version
    if (feed) {
      v.list = /upcoming/.test(feed) ? 'upcoming' : feed === 'trending' ? 'trending' : 'popular';
      if (/^movies/.test(feed)) v.type = 'movie';
      if (/^tv/.test(feed)) v.type = 'tv';
    } else if (/^\d+$/.test(params.get('network') || '')) v.network = params.get('network');
    else if (/^\d+$/.test(params.get('studio') || '')) v.studio = params.get('studio');
    else if (/^(movie|tv)-\d+$/.test(params.get('genre') || '')) v.genre = params.get('genre');
    else v.list = DISCOVER_LISTS.some(([key]) => key === params.get('list')) ? params.get('list') : 'trending';
    return v;
  }

  function discoverHash(v) {
    const p = new URLSearchParams();
    if (v.network) p.set('network', v.network);
    else if (v.studio) p.set('studio', v.studio);
    else if (v.genre) { p.set('genre', v.genre); if (v.name) p.set('name', v.name); }
    else if (v.list !== 'trending') p.set('list', v.list);
    if (v.type !== 'all') p.set('type', v.type);
    if (v.sort) p.set('sort', v.sort);
    const query = p.toString();
    return '#/discover' + (query ? '?' + query : '');
  }

  function discoverSorts(v) {
    return v.list === 'upcoming' ? [['soon', 'Soonest'], ['pop', 'Popularity']] : [['pop', 'Popularity'], ['new', 'Newest'], ['rating', 'Rating']];
  }

  // What to fetch for a view: feeds paged together (?page=N) and merged
  function discoverFeeds(v) {
    const both = (movie, tv) => (v.type === 'movie' ? [movie] : v.type === 'tv' ? [tv] : [movie, tv]);
    if (v.network) {
      const net = DISCOVER_NETWORKS.find((n) => String(n[1]) === v.network);
      return { title: net ? net[0] : 'Network', feeds: [{ path: 'discover/tv/network/' + v.network, mediaType: 'tv' }] };
    }
    if (v.studio) {
      const studio = DISCOVER_STUDIOS.find((s) => String(s[1]) === v.studio);
      return { title: studio ? studio[0] : 'Studio', feeds: [{ path: 'discover/movies/studio/' + v.studio, mediaType: 'movie' }] };
    }
    if (v.genre) {
      const [kind, id] = v.genre.split('-');
      return { title: v.name || 'Genre', feeds: [{ path: 'discover/' + (kind === 'movie' ? 'movies' : 'tv') + '/genre/' + id, mediaType: kind }] };
    }
    if (v.list === 'popular') return { title: 'Popular', feeds: both({ path: 'discover/movies', mediaType: 'movie' }, { path: 'discover/tv', mediaType: 'tv' }) };
    if (v.list === 'upcoming') return { title: 'Coming soon', feeds: both({ path: 'discover/movies/upcoming', mediaType: 'movie' }, { path: 'discover/tv/upcoming', mediaType: 'tv' }) };
    return { title: 'Trending', feeds: [{ path: 'discover/trending' }] };
  }

  function seerrDate(result) { return result.releaseDate || result.firstAirDate || ''; }
  function discoverSorted(list, sort) {
    const copy = list.slice();
    if (sort === 'new') copy.sort((a, b) => (seerrDate(b) > seerrDate(a) ? 1 : -1));
    else if (sort === 'rating') copy.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
    else if (sort === 'soon') copy.sort((a, b) => (seerrDate(a) || '9') < (seerrDate(b) || '9') ? -1 : 1);
    return copy;
  }

  function discoverBanner(result, label) {
    const banner = el('section', 'cn-dban');
    const img = el('img');
    img.alt = '';
    img.decoding = 'async';
    img.addEventListener('load', () => { img.dataset.loaded = 'true'; });
    img.src = TMDB_IMG + 'w1280' + result.backdropPath;
    const copy = el('div', 'cn-dban-copy');
    const meta = el('div', 'cn-meta');
    if (label) meta.append(el('span', 'cn-dsp-rank', label));
    if (result.voteAverage) { const score = el('span'); score.append(el('b', '', '★ ' + Number(result.voteAverage).toFixed(1))); meta.append(score); }
    if (seerrYear(result)) meta.append(el('span', '', seerrYear(result)));
    meta.append(el('span', '', result.mediaType === 'tv' ? 'Show' : 'Film'));
    const status = seerrStatus(result);
    if (status.label) meta.append(el('span', 'cn-dc-badge ' + status.cls, status.label));
    const acts = el('div', 'cn-actions');
    const primary = el('button', 'cn-btn cn-btn-primary');
    primary.type = 'button';
    if (status.jellyfinId) { primary.innerHTML = icon('play'); primary.append('Open'); }
    else if (status.cls === 'is-req' || status.cls === 'is-proc') { primary.innerHTML = icon('info'); primary.append(status.label); primary.classList.add('is-pending'); }
    else { primary.innerHTML = icon('download'); primary.append('Request'); }
    primary.addEventListener('click', () => openSeerrResult(result));
    const more = el('button', 'cn-btn cn-btn-ghost');
    more.type = 'button';
    more.innerHTML = icon('info');
    more.append('More info');
    more.addEventListener('click', () => window.JellyfinEnhanced.jellyseerrMoreInfo.open(result.id, result.mediaType));
    acts.append(primary, more);
    copy.append(el('h2', 'cn-dban-title', seerrTitle(result)), meta, acts);
    banner.append(img, copy);
    return banner;
  }

  function renderDiscoverBrowse(body, params) {
    let v = discoverView(params);
    let token = 0;
    const layout = el('div', 'cn-dbrowse');
    const rail = el('aside', 'cn-drail');
    rail.setAttribute('aria-label', 'Discover filters');
    const main = el('div', 'cn-dmain');
    layout.append(rail, main);
    body.replaceChildren(layout);

    function go(next) {
      v = Object.assign({}, v, next);
      try { history.replaceState(history.state, '', discoverHash(v)); } catch (error) { /* ignore */ }
      discoverKey = location.hash;
      drawRail();
      drawMain();
      const top = layout.getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' });
    }

    function group(label, items) {
      const box = el('section', 'cn-drail-group');
      if (label) box.append(el('h3', 'cn-drail-label', label));
      box.append(items);
      return box;
    }
    function choice(cls, text, on, pick) {
      const b = el('button', cls, text);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(Boolean(on)));
      b.addEventListener('click', pick);
      return b;
    }

    function drawRail() {
      const search = el('form', 'cn-dsearch');
      search.setAttribute('role', 'search');
      const input = el('input');
      input.type = 'search';
      input.placeholder = 'Search films and shows';
      input.setAttribute('aria-label', 'Search films and shows');
      search.innerHTML = icon('search');
      search.append(input);
      search.addEventListener('submit', (event) => {
        event.preventDefault();
        if (input.value.trim()) location.hash = '#/search?query=' + encodeURIComponent(input.value.trim());
      });

      const types = el('div', 'cn-dseg');
      types.setAttribute('role', 'group');
      types.setAttribute('aria-label', 'Show');
      DISCOVER_TYPES.forEach(([key, label]) => types.append(choice('cn-dseg-btn', label, v.type === key, () => {
        const next = { type: key };
        // a network only has shows, a studio only films: leave them when switching away
        if ((key === 'movie' && v.network) || (key === 'tv' && v.studio)) Object.assign(next, { network: '', studio: '', list: 'trending' });
        if (v.genre && key !== 'all' && !v.genre.startsWith(key + '-')) Object.assign(next, { genre: '', name: '', list: 'trending' });
        go(next);
      })));

      const lists = el('div', 'cn-dlists');
      DISCOVER_LISTS.forEach(([key, label]) => lists.append(choice('cn-dlist', label, v.list === key && !v.network && !v.studio && !v.genre, () => go({ list: key, network: '', studio: '', genre: '', name: '', sort: '' }))));

      const groups = [group('', search), group('', types), group('Lists', lists)];
      if (v.type !== 'movie') {
        const nets = el('div', 'cn-dchips');
        DISCOVER_NETWORKS.forEach(([name, id]) => nets.append(choice('cn-dchip', name, v.network === String(id), () => go({ network: String(id), studio: '', genre: '', name: '', list: '', sort: '', type: v.type === 'movie' ? 'all' : v.type }))));
        groups.push(group('Networks', nets));
      }
      if (v.type !== 'tv') {
        const studios = el('div', 'cn-dchips');
        DISCOVER_STUDIOS.forEach(([name, id]) => studios.append(choice('cn-dchip', name, v.studio === String(id), () => go({ studio: String(id), network: '', genre: '', name: '', list: '', sort: '' }))));
        groups.push(group('Studios', studios));
      }
      const kind = v.type === 'tv' ? 'tv' : 'movie';
      const genreBox = el('div', 'cn-dchips');
      const genreGroup = group(v.type === 'all' ? 'Film genres' : 'Genres', genreBox);
      const fillGenres = (list) => {
        genreBox.replaceChildren(...list.map((g) => choice('cn-dchip', g.name, v.genre === kind + '-' + g.id, () => go({ genre: kind + '-' + g.id, name: g.name, network: '', studio: '', list: '', sort: '' }))));
        if (!list.length) genreGroup.remove();
      };
      if (discoverGenres[kind]) fillGenres(discoverGenres[kind]);
      else seerrGet('discover/genreslider/' + kind).then((list) => { discoverGenres[kind] = Array.isArray(list) ? list : []; if (genreGroup.isConnected) fillGenres(discoverGenres[kind]); }).catch(() => genreGroup.remove());
      groups.push(genreGroup);
      rail.replaceChildren(...groups);
    }

    function drawMain() {
      const mine = ++token;
      const { title, feeds } = discoverFeeds(v);
      const sorts = discoverSorts(v);
      const sort = sorts.some(([key]) => key === v.sort) ? v.sort : sorts[0][0];
      const bannerSlot = el('div', 'cn-dban-slot');
      bannerSlot.append(el('div', 'cn-dban is-loading'));
      const head = el('div', 'cn-dhead');
      head.append(el('h1', 'cn-dhead-title', title));
      const sortBox = el('div', 'cn-dseg cn-dsort');
      sortBox.setAttribute('role', 'group');
      sortBox.setAttribute('aria-label', 'Sort by');
      sorts.forEach(([key, label]) => sortBox.append(choice('cn-dseg-btn', label, sort === key, () => go({ sort: key === sorts[0][0] ? '' : key }))));
      head.append(sortBox);
      const grid = el('div', 'cn-dgrid');
      for (let i = 0; i < 18; i += 1) grid.append(el('span', 'cn-ds-ph'));
      const note = el('p', 'cn-ds-empty');
      note.hidden = true;
      const more = el('button', 'cn-btn cn-btn-ghost cn-dmore', 'Show more');
      more.type = 'button';
      more.hidden = true;
      main.replaceChildren(bannerSlot, head, grid, note, more);

      const items = [];
      const seen = new Set();
      let page = 0;
      let total = 0;
      const typeOk = (r) => r.mediaType === 'movie' || r.mediaType === 'tv';
      const draw = () => {
        const list = discoverSorted(items, sort);
        const lead = list.find((r) => r.backdropPath);
        if (lead) {
          const rank = v.list === 'trending' && !v.network && !v.studio && !v.genre ? '#' + (items.indexOf(lead) + 1) + ' trending' : '';
          const date = seerrDate(lead);
          const out = v.list === 'upcoming' && date ? 'Out ' + new Date(date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '';
          bannerSlot.replaceChildren(discoverBanner(lead, rank || out));
        } else bannerSlot.replaceChildren();
        grid.replaceChildren(...list.filter((r) => r !== lead).map(discoverCard));
      };
      function load() {
        page += 1;
        more.disabled = true;
        more.textContent = 'Loading…';
        Promise.all(feeds.map((feed) => seerrGet(feed.path, { page }).then((d) => ({ d, feed })).catch((error) => ({ d: null, feed, error }))))
          .then((answers) => {
            if (mine !== token) return;
            if (answers.every(({ d }) => !d)) {
              page -= 1;
              const unlinked = answers.some(({ error }) => error && /linked/i.test(error.message));
              if (!items.length) {
                grid.replaceChildren();
                bannerSlot.replaceChildren();
                note.textContent = unlinked
                  ? 'Discover needs your Jellyfin account linked to Seerr. Ask the server owner to import or link your user in Seerr.'
                  : 'Seerr didn’t answer just now. Try again in a moment.';
                note.hidden = false;
              }
              more.hidden = unlinked;
              more.disabled = false;
              more.textContent = 'Try again';
              return;
            }
            note.hidden = true;
            // Several feeds (films + shows) are interleaved so neither crowds out the other
            const lists = answers.map(({ d, feed }) => {
              if (!d) return [];
              total = Math.max(total, d.totalPages || 1);
              return (d.results || []).map((r) => { if (!r.mediaType && feed.mediaType) r.mediaType = feed.mediaType; return r; })
                .filter((r) => typeOk(r) && (v.type === 'all' || r.mediaType === v.type));
            });
            for (let i = 0; i < Math.max(0, ...lists.map((l) => l.length)); i += 1) {
              lists.forEach((l) => {
                const r = l[i];
                if (!r) return;
                const key = r.mediaType + r.id;
                if (seen.has(key)) return;
                seen.add(key);
                items.push(r);
              });
            }
            if (!items.length) { grid.replaceChildren(); bannerSlot.replaceChildren(); note.textContent = 'Seerr has nothing to show here yet.'; note.hidden = false; }
            else draw();
            more.hidden = page >= total;
            more.disabled = false;
            more.textContent = 'Show more';
            // Films or Shows on a mixed list (Trending) can leave only a handful: fetch a few more pages to fill the grid
            if (items.length < 18 && page < total && page < 5) load();
          });
      }
      more.addEventListener('click', load);
      load();
    }

    drawRail();
    drawMain();
    return () => { token += 1; };
  }

  // Seerr's windows (Jellyfin Enhanced) are fixed over the page. Scrolling inside their scroll area stays there
  // (CSS overscroll-behavior), but a wheel or swipe over the parts that don't scroll (the dim surround, the
  // artwork header) used to scroll the page behind instead. Send it to the window's own scroll area.
  // Topmost first: the season picker opens over the More info window
  const SEERR_WINDOWS = [
    ['.jellyseerr-season-modal.show', '.jellyseerr-modal-body'],
    ['.je-more-info-modal.active', '.modal-content'],
  ];
  function seerrWindowScroller(target) {
    for (const [win, scroller] of SEERR_WINDOWS) {
      const open = document.querySelector(win);
      if (open) return { open, scroller: open.querySelector(scroller), inside: target instanceof Node && open.contains(target) };
    }
    return null;
  }
  function inOwnScroller(target, open) {
    // Inside something in the window that scrolls up and down (the content, a dropdown): leave it to the
    // browser; at its ends, CSS overscroll-behavior keeps the page from moving
    for (let node = target; node && node !== open; node = node.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 1) return true;
    }
    return false;
  }
  document.addEventListener('wheel', (event) => {
    const hit = seerrWindowScroller(event.target);
    if (!hit || event.ctrlKey) return;
    if (hit.inside && inOwnScroller(event.target, hit.open)) return;
    event.preventDefault();
    if (hit.scroller && !event.deltaX) hit.scroller.scrollBy({ top: event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY });
  }, { capture: true, passive: false });
  let seerrTouchY = null;
  document.addEventListener('touchstart', (event) => { seerrTouchY = event.touches.length === 1 ? event.touches[0].clientY : null; }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => {
    const hit = seerrWindowScroller(event.target);
    if (!hit || seerrTouchY === null || event.touches.length !== 1) return;
    const y = event.touches[0].clientY;
    const dy = seerrTouchY - y;
    seerrTouchY = y;
    if (hit.inside && inOwnScroller(event.target, hit.open)) return;
    event.preventDefault();
    if (hit.scroller) hit.scroller.scrollBy({ top: dy });
  }, { capture: true, passive: false });

  function syncDiscover() {
    const on = DISCOVER_ROUTE.test(location.hash);
    root.classList.toggle('cn-discover-on', on && discoverAvailable());
    if (!on) {
      if (discover && !discover.page.classList.contains('hide')) {
        discover.page.classList.add('hide');
        if (discover.stop) discover.stop();
        discover.stop = null;
        discoverKey = '';
      }
      return;
    }
    if (!discoverAvailable() || !document.body) return;
    if (!discover) {
      const page = el('div', 'page type-interior mainAnimatedPage hide');
      page.id = 'cn-discover-page';
      page.setAttribute('data-title', 'Discover');
      page.setAttribute('data-url', '#/discover');
      const body = el('div', 'cn-dpage');
      page.append(body);
      (document.querySelector('.mainAnimatedPages') || document.body).append(page);
      discover = { page, body, stop: null };
    }
    // Jellyfin 12 rebuilds its page container when it changes page and drops anything it didn't make, so
    // the Discover page can vanish between visits (which left a black screen): put it back and redraw.
    if (!discover.page.isConnected) {
      (document.querySelector('.mainAnimatedPages') || document.body).append(discover.page);
      discoverKey = '';
    }
    document.querySelectorAll('.mainAnimatedPage:not(.hide)').forEach((p) => { if (p !== discover.page) p.classList.add('hide'); });
    if (discover.page.classList.contains('hide')) discover.page.classList.remove('hide');
    const key = location.hash;
    if (key === discoverKey) return;
    discoverKey = key;
    if (discover.stop) discover.stop();
    window.scrollTo(0, 0);
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    discover.stop = renderDiscoverBrowse(discover.body, params);
  }
  ['hashchange', 'popstate'].forEach((name) => window.addEventListener(name, () => setTimeout(syncDiscover, 0)));

  function reconcile() {
    reconcileTimer = 0;
    syncDiscover();
    scheduleSetCards();
    root.classList.toggle('cn-ui', !isDashboard());
    root.classList.toggle('cn-hover-cards', canHover || isTv());

    const client = window.ApiClient;
    if (!client || !client.getCurrentUserId || !client.getCurrentUserId()) {
      showNav(false);
      // Jellyfin may finish signing in without changing the page, so check again shortly.
      if (!retryTimer) retryTimer = window.setTimeout(() => { retryTimer = 0; schedule(); }, 500);
      return;
    }

    syncNav(client);
    reconcileDetails(client);

    const host = findHost();
    if (!host) {
      // Keep the slideshow (paused) while another page is open, even though Jellyfin throws Home away,
      // so it can go straight back when Home is rebuilt (below) instead of loading again.
      // After 30 minutes it is rebuilt so the picks stay fresh.
      if (hero && Date.now() - (hero.mountedAt || 0) < 30 * 60 * 1000) {
        hero.pause(true);
        root.classList.remove('cn-hero-on');
        return;
      }
      failedHost = null;
      unmount();
      return;
    }

    if (hero && hero.node.isConnected && hero.node.nextElementSibling === host) {
      hero.pause(false);
      root.classList.add('cn-hero-on');
      return;
    }
    // Jellyfin rebuilt Home from scratch: put the kept slideshow back (pictures already loaded) instead of
    // building a new one, which showed black and faded every picture in again
    if (hero && !hero.node.isConnected && hero.userId === client.getCurrentUserId() && Date.now() - (hero.mountedAt || 0) < 30 * 60 * 1000) {
      host.parentNode.insertBefore(hero.node, host);
      hero.pause(false);
      root.classList.add('cn-hero-on');
      return;
    }
    if (failedHost === host) return;
    if (pending && pending.isConnected && pending.nextElementSibling === host) return;

    unmount();
    mount(host);
  }

  function schedule() {
    if (!reconcileTimer) reconcileTimer = window.setTimeout(reconcile, 120);
  }

  function onScroll() {
    root.classList.toggle('cn-scrolled', (window.scrollY || document.documentElement.scrollTop) > 40);
  }

  const style = el('style', '', CSS);
  style.id = 'crimson-noir-css';
  (document.head || root).append(style);
  root.classList.toggle('cn-ui', !isDashboard());

  // Going to a film/show page: hide Jellyfin's own version of it straight away. Waiting for the next
  // (debounced) reconcile let the stock page show for a moment before the theme's hero replaced it,
  // which looked like the screen flickering on every navigation.
  function concealIncomingDetail() {
    const id = detailRoute();
    if (id && (!detail || detail.id !== id)) {
      conceal(true);
      crossfadeToDetail(id);
    }
  }

  // Where the browser supports view transitions, keep the page you're leaving on screen while the new
  // film/show page is built, then crossfade into it, instead of a moment of black in between.
  // The browser holds the old picture until heroReady() is called (or 1.5s pass, as a safety net).
  // (pageFade / pageFadeDone are declared with the other state near the top.)
  function crossfadeToDetail(id) {
    if (typeof document.startViewTransition !== 'function' || reducedMotion || isTv()) return;
    // popstate and hashchange both arrive for one navigation, ~100ms apart. Restarting on the second
    // would capture the screen after Jellyfin has already hidden the old page, i.e. a black frame.
    if (pageFade && pageFadeFor === id) return;
    if (pageFade) pageFade.skipTransition();
    pageFadeFor = id;
    let finish;
    const ready = new Promise((resolve) => { finish = resolve; });
    const timer = window.setTimeout(finish, 1500);
    pageFadeDone = () => { window.clearTimeout(timer); finish(); };
    try {
      const fade = document.startViewTransition(() => ready);
      pageFade = fade;
      fade.finished.catch(() => {}).then(() => { if (pageFade === fade) { pageFade = null; pageFadeDone = null; } });
      fade.ready.catch(() => {});
      fade.updateCallbackDone.catch(() => {});
    } catch (error) {
      pageFade = null;
      pageFadeDone = null;
    }
  }
  // The new page is ready to be shown: wait briefly for its backdrop so the fade lands on the picture.
  function heroReady(hero) {
    if (!pageFadeDone) return;
    const done = pageFadeDone;
    pageFadeDone = null;
    const back = hero && hero.querySelector('.cn-dh-back, .cn-dh-panel, .cn-shelf-back img, img');
    if (!back || back.complete) { done(); return; }
    const timer = window.setTimeout(done, 450);
    back.addEventListener('load', () => { window.clearTimeout(timer); done(); }, { once: true });
    back.addEventListener('error', () => { window.clearTimeout(timer); done(); }, { once: true });
  }
  ['hashchange', 'popstate'].forEach((name) => window.addEventListener(name, concealIncomingDetail));
  concealIncomingDetail();
  ['hashchange', 'popstate', 'pageshow'].forEach((name) => window.addEventListener(name, schedule));
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Player: show / episode title and logo ---- */

  let playerTitleKey = '';
  let playerTitleTimer = null;

  // Elapsed time and play/pause ride along under the playhead (Apple TV style)
  function setupPlayhead(page) {
    if (page.dataset.cnPlayhead) return;
    const start = page.querySelector('.startTimeText');
    const pause = page.querySelector('.btnPause');
    const slider = page.querySelector('.osdPositionSlider');
    if (!start || !pause || !slider) return;
    page.dataset.cnPlayhead = 'true';
    const head = el('div', 'cn-osd-playhead');
    start.parentNode.insertBefore(head, start);
    head.append(start, pause);
    // Jellyfin only redraws Playback Info on timeupdate, which stops while paused
    let statsTick = 0;
    const timer = setInterval(() => {
      if (!page.isConnected) {
        clearInterval(timer);
        document.documentElement.classList.remove('cn-paused');
        return;
      }
      const video = document.querySelector('video');
      document.documentElement.classList.toggle('cn-paused', !!video && video.paused && !video.ended && video.readyState > 0);
      const stats = document.querySelector('.playerStats');
      if (video && video.paused && stats && !stats.classList.contains('hide')) {
        statsTick = (statsTick + 1) % 8;
        if (statsTick === 1) video.dispatchEvent(new Event('timeupdate'));
      } else {
        statsTick = 0;
      }
      const value = parseFloat(slider.value) / (parseFloat(slider.max) || 100);
      page.style.setProperty('--cn-p', isFinite(value) ? Math.min(1, Math.max(0, value)).toFixed(4) : '0');
    }, 250);
  }

  async function renderPlayerTitle(attempt) {
    const page = cnLive('#videoOsdPage');
    const host = page && page.querySelector('.osdMainTextContainer');
    const client = window.ApiClient;
    if (!host || !client || !location.hash.startsWith('#/video')) return;
    setupPlayhead(page);
    let item = null;
    try {
      const sessions = await client.getSessions({ deviceId: client.deviceId() });
      item = sessions && sessions[0] && sessions[0].NowPlayingItem;
    } catch (error) {
      item = null;
    }
    if (!item) {
      if (attempt < 8) playerTitleTimer = setTimeout(() => renderPlayerTitle(attempt + 1), 750);
      return;
    }
    if (item.Id === playerTitleKey && host.querySelector('.cn-osd-title')) return;
    playerTitleKey = item.Id;
    host.querySelectorAll('.cn-osd-title').forEach((node) => node.remove());
    page.querySelectorAll('.cn-osd-logo').forEach((node) => node.remove());
    const episode = item.Type === 'Episode';
    // Episodes: small line "S5 · E3 - Episode title", big line the show name. Films: year, then title.
    let epLabel = '';
    if (episode && item.IndexNumber != null) {
      const epNo = 'E' + item.IndexNumber + (item.IndexNumberEnd && item.IndexNumberEnd !== item.IndexNumber ? '–' + item.IndexNumberEnd : '');
      epLabel = item.ParentIndexNumber === 0 ? 'Special · ' + epNo : (item.ParentIndexNumber != null ? 'S' + item.ParentIndexNumber + ' · ' : '') + epNo;
    }
    const kicker = episode ? [epLabel, item.Name || ''].filter(Boolean).join(' - ') : (item.ProductionYear ? String(item.ProductionYear) : '');
    const box = el('div', 'cn-osd-title');
    if (kicker) box.append(el('div', 'cn-osd-kicker', kicker));
    box.append(el('div', 'cn-osd-name', episode ? (item.SeriesName || item.Name || '') : (item.Name || '')));
    host.prepend(box);
    const logoItem = item.ParentLogoItemId || ((item.ImageTags || {}).Logo ? item.Id : null);
    const logoTag = item.ParentLogoImageTag || (item.ImageTags || {}).Logo;
    if (logoItem && logoTag) {
      const logo = el('img', 'cn-osd-logo');
      logo.alt = '';
      logo.src = client.getImageUrl(logoItem, { type: 'Logo', tag: logoTag, maxWidth: 700 });
      page.append(logo);
    } else {
      page.append(el('div', 'cn-osd-logo cn-osd-logo-text', episode ? (item.SeriesName || item.Name || '') : (item.Name || '')));
    }
  }

  function schedulePlayerTitle() {
    clearTimeout(playerTitleTimer);
    if (!location.hash.startsWith('#/video')) {
      playerTitleKey = '';
      return;
    }
    playerTitleTimer = setTimeout(() => renderPlayerTitle(0), 400);
  }

  window.addEventListener('hashchange', schedulePlayerTitle);
  new MutationObserver(schedulePlayerTitle).observe(document.querySelector('title') || document.head, { childList: true, subtree: true, characterData: true });
  schedulePlayerTitle();

  /* ---- Calendar: Jellyfin Enhanced's page can lose a race with the router ---- */
  // The router shows "Page not found" for #/calendar a moment after the plugin shows its page,
  // and the plugin then hides itself. Re-sending hashchange once the router has settled fixes it.
  function rescueCalendar(tries) {
    if (!location.hash.startsWith('#/calendar')) return;
    const calendar = document.getElementById('je-calendar-page');
    const fallback = document.getElementById('fallbackPage');
    if (!calendar) {
      if (tries < 20) setTimeout(() => rescueCalendar(tries + 1), 250);
      return;
    }
    if (calendar.classList.contains('hide') && fallback && !fallback.classList.contains('hide')) {
      window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL: location.href, newURL: location.href }));
    }
    if (tries < 6) setTimeout(() => rescueCalendar(tries + 1), 250);
  }

  window.addEventListener('hashchange', (event) => {
    if (event.isTrusted) setTimeout(() => rescueCalendar(0), 120);
  });
  setTimeout(() => rescueCalendar(0), 600);

  /* ---- Jellyfin Enhanced pages: never left on screen after you navigate away ---- */
  // Calendar and Requests are plugin pages that hide themselves, so a missed hashchange (seen in Zen)
  // can leave one stuck over Home. Hide any that are showing while the route belongs to another page.
  const JE_PAGES = [
    { id: 'je-calendar-page', route: /^#!?\/calendar(?:[?&/]|$)/ },
    { id: 'je-downloads-page', route: /^#!?\/downloads(?:[?&/]|$)/ },
  ];
  function hideStrayPluginPages() {
    JE_PAGES.forEach((entry) => {
      if (entry.route.test(location.hash)) return;
      document.querySelectorAll('#' + entry.id).forEach((page) => {
        if (!page.classList.contains('hide')) page.classList.add('hide');
      });
    });
  }
  window.addEventListener('hashchange', () => { hideStrayPluginPages(); setTimeout(hideStrayPluginPages, 150); setTimeout(hideStrayPluginPages, 600); });
  window.addEventListener('popstate', () => setTimeout(hideStrayPluginPages, 0));
  document.addEventListener('viewshow', () => setTimeout(hideStrayPluginPages, 0), true);
  new MutationObserver(() => hideStrayPluginPages()).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'], childList: false });

  /* ---- Home rows: poster expands into a landscape thumbnail on hover ---- */

  const XP_DELAY = 350;
  const XP_SCALE = 1; // expanded thumbnail height relative to the poster (1 = same height as the poster)
  const xpCache = new Map();
  let xpTimer = null;
  let xpCard = null;

  function xpItem(id) {
    if (!xpCache.has(id)) {
      const client = window.ApiClient;
      xpCache.set(id, client.getItem(client.getCurrentUserId(), id).catch(() => null));
    }
    return xpCache.get(id);
  }

  function xpRuntime(ticks) {
    if (!ticks) return '';
    const minutes = Math.round(ticks / 600000000);
    const hours = Math.floor(minutes / 60);
    return hours ? hours + 'h ' + (minutes % 60) + 'm' : minutes + 'm';
  }

  function xpArt(client, item) {
    const tags = item.ImageTags || {};
    const url = (id, type, tag) => client.getImageUrl(id, { type, tag, maxWidth: 960 });
    if (item.Type === 'Episode') {
      if (item.ParentThumbItemId && item.ParentThumbImageTag) return { src: url(item.ParentThumbItemId, 'Thumb', item.ParentThumbImageTag), titled: true };
      if (tags.Primary) return { src: url(item.Id, 'Primary', tags.Primary), titled: false };
      if (item.ParentBackdropItemId && (item.ParentBackdropImageTags || []).length) return { src: url(item.ParentBackdropItemId, 'Backdrop', item.ParentBackdropImageTags[0]), titled: false };
      return null;
    }
    if (tags.Thumb) return { src: url(item.Id, 'Thumb', tags.Thumb), titled: true };
    if ((item.BackdropImageTags || []).length) return { src: url(item.Id, 'Backdrop', item.BackdropImageTags[0]), titled: false };
    // Seasons (and anything else without its own wide art) borrow the show's thumbnail or backdrop
    if (item.ParentThumbItemId && item.ParentThumbImageTag) return { src: url(item.ParentThumbItemId, 'Thumb', item.ParentThumbImageTag), titled: true };
    if (item.ParentBackdropItemId && (item.ParentBackdropImageTags || []).length) return { src: url(item.ParentBackdropItemId, 'Backdrop', item.ParentBackdropImageTags[0]), titled: false };
    return null;
  }

  function xpLogo(client, item) {
    if ((item.ImageTags || {}).Logo) return client.getImageUrl(item.Id, { type: 'Logo', tag: item.ImageTags.Logo, maxWidth: 500 });
    if (item.ParentLogoItemId && item.ParentLogoImageTag) return client.getImageUrl(item.ParentLogoItemId, { type: 'Logo', tag: item.ParentLogoImageTag, maxWidth: 500 });
    return '';
  }

  async function xpExpand(card) {
    const scalable = card.querySelector('.cardScalable');
    if (!card.dataset.id || !scalable) return;
    let item = await xpItem(card.dataset.id);
    // Seasons have no rating, genres or synopsis of their own: borrow the show's
    if (item && item.Type === 'Season' && item.SeriesId) {
      const series = await xpItem(item.SeriesId);
      if (series) item = Object.assign({}, item, { Overview: item.Overview || series.Overview, Genres: (item.Genres || []).length ? item.Genres : series.Genres, CommunityRating: item.CommunityRating || series.CommunityRating, CriticRating: item.CriticRating || series.CriticRating, OfficialRating: item.OfficialRating || series.OfficialRating });
    }
    if (!item || xpCard !== card || card.classList.contains('cn-xp')) return;
    const client = window.ApiClient;
    const art = xpArt(client, item);
    if (!art) return;
    const startWidth = card.offsetWidth;
    const fullHeight = scalable.offsetHeight;
    const height = Math.round(fullHeight * XP_SCALE);
    const gutter = startWidth - scalable.offsetWidth;
    card.cnXpWidth = startWidth;
    card.cnXpHeight = fullHeight;
    card.style.width = startWidth + 'px';
    card.style.setProperty('--cn-xp-h', fullHeight + 'px');
    card.style.setProperty('--cn-xp-off', '0px');
    card.classList.add('cn-xp-hold');
    void card.offsetWidth;
    card.classList.add('cn-xp');
    card.style.setProperty('--cn-xp-h', height + 'px');
    card.style.setProperty('--cn-xp-off', Math.round((fullHeight - height) / 2) + 'px');
    card.style.width = Math.round(height * 16 / 9) + gutter + 'px';
    // Collection grids can't push neighbours aside, so float over them (cn-xp-set) and stay on screen
    const grid = card.closest('.collectionItemsContainer, #moviesPage .itemsContainer, #tvshowsPage .itemsContainer');
    if (grid) {
      const wide = Math.round(height * 16 / 9) + gutter;
      const extra = wide - startWidth;
      card.classList.add('cn-xp-set');
      const box = grid.getBoundingClientRect();
      // Measure the card's resting position, ignoring any slide still animating from a previous hover
      const left = card.getBoundingClientRect().left - (parseFloat(getComputedStyle(card).translate) || 0);
      const spill = left + wide - box.right;
      if (getComputedStyle(grid).display !== 'grid') {
        // Library rows wrap: keep the card's layout width (negative margin) and slide the rest of its row aside, like Home rows
        card.style.marginRight = (parseFloat(getComputedStyle(card).marginRight) || 0) - extra + 'px';
        const toLeft = spill > 0;
        card.cnXpPushed = Array.from(grid.children).filter((sib) => sib !== card && sib.classList.contains('card') && sib.offsetTop === card.offsetTop
          && (toLeft ? sib.offsetLeft < card.offsetLeft : sib.offsetLeft > card.offsetLeft));
        card.cnXpPushed.forEach((sib) => { sib.style.translate = (toLeft ? -extra : extra) + 'px 0'; });
        if (toLeft) card.style.translate = -extra + 'px 0';
      } else if (spill > 0) {
        card.style.translate = -Math.round(Math.min(spill, left - box.left)) + 'px 0';
      }
    }

    const layer = el('div', 'cn-xp-layer');
    const image = el('img', 'cn-xp-img');
    image.alt = '';
    image.src = art.src;
    layer.append(image, el('div', 'cn-xp-shade'));
    if (!art.titled) {
      const logoSrc = xpLogo(client, item);
      if (logoSrc) {
        const logo = el('img', 'cn-xp-logo');
        logo.alt = '';
        logo.src = logoSrc;
        layer.append(logo);
      }
    }
    const info = el('div', 'cn-xp-info');
    const episode = item.Type === 'Episode';
    const meta = episode
      ? ['S' + item.ParentIndexNumber + ':E' + item.IndexNumber, item.Name, xpRuntime(item.RunTimeTicks)]
      : item.Type === 'Season'
        ? [item.Name, item.ProductionYear, item.ChildCount ? item.ChildCount + (item.ChildCount === 1 ? ' episode' : ' episodes') : '']
        : [item.ProductionYear, (item.Genres || []).slice(0, 2).join(' \u00b7 '), item.Type === 'Movie' ? xpRuntime(item.RunTimeTicks) : (item.ChildCount ? item.ChildCount + (item.ChildCount === 1 ? ' Season' : ' Seasons') : '')];
    info.append(el('div', 'cn-xp-meta', meta.filter(Boolean).join(' \u00b7 ')));
    const ratings = el('div', 'cn-xp-ratings');
    if (item.CommunityRating) {
      const chip = el('span', 'cn-xp-chip');
      chip.append(el('span', 'cn-xp-chip-star', '\u2605'), String(Math.round(item.CommunityRating * 10) / 10));
      ratings.append(chip);
    }
    if (item.CriticRating) ratings.append(el('span', 'cn-xp-chip', (item.CriticRating >= 60 ? '\ud83c\udf45 ' : '\ud83e\udd22 ') + item.CriticRating + '%'));
    if (item.OfficialRating) ratings.append(el('span', 'cn-xp-chip', item.OfficialRating));
    if (ratings.childElementCount) info.append(ratings);
    if (item.Overview) info.append(el('div', 'cn-xp-overview', item.Overview));
    layer.append(info);
    scalable.append(layer);
    requestAnimationFrame(() => layer.classList.add('is-in'));
  }

  function xpCollapse(card) {
    if (!card) return;
    card.classList.remove('cn-xp');
    card.querySelectorAll('.cn-xp-layer').forEach((node) => node.remove());
    if (card.cnXpWidth) card.style.width = card.cnXpWidth + 'px';
    card.style.translate = '';
    card.style.marginRight = '';
    if (card.cnXpPushed) {
      card.cnXpPushed.forEach((sib) => { sib.style.translate = ''; });
      card.cnXpPushed = null;
    }
    if (card.cnXpHeight) {
      card.style.setProperty('--cn-xp-h', card.cnXpHeight + 'px');
      card.style.setProperty('--cn-xp-off', '0px');
    }
    setTimeout(() => {
      if (card.classList.contains('cn-xp')) return;
      card.classList.remove('cn-xp-hold', 'cn-xp-set');
      card.style.width = '';
      card.style.removeProperty('--cn-xp-h');
      card.style.removeProperty('--cn-xp-off');
    }, 340);
  }

  // Jellyfin gives season cards no Play button; add the same one shows and episodes get (it plays the next unwatched episode)
  function xpSeasonPlay(card) {
    if (!card || card.dataset.type !== 'Season') return;
    const overlay = card.querySelector('.cardOverlayContainer');
    if (!overlay || overlay.querySelector('.cardOverlayFab-primary')) return;
    const fab = document.createElement('button');
    fab.className = 'cardOverlayButton cardOverlayButton-hover itemAction paper-icon-button-light cardOverlayFab-primary';
    fab.dataset.action = 'play';
    fab.title = 'Play';
    fab.setAttribute('aria-label', 'Play');
    fab.innerHTML = '<span class="material-icons cardOverlayButtonIcon cardOverlayButtonIcon-hover play_arrow" aria-hidden="true"></span>';
    overlay.prepend(fab);
  }
  document.addEventListener('mouseover', (event) => {
    const card = event.target && event.target.closest ? event.target.closest('.card[data-type="Season"]') : null;
    if (card) xpSeasonPlay(card);
  }, true);

  function xpTarget(node) {
    const card = node && node.closest ? node.closest('#indexPage .tabContent:not(#favoritesTab) .card.overflowPortraitCard') : null;
    return card && document.documentElement.classList.contains('cn-hover-cards') ? card : null;
  }

  document.addEventListener('mouseover', (event) => {
    const card = xpTarget(event.target);
    if (card === xpCard) return;
    clearTimeout(xpTimer);
    if (xpCard) xpCollapse(xpCard);
    xpCard = card;
    if (card) xpTimer = setTimeout(() => xpExpand(card), XP_DELAY);
  });
  document.addEventListener('mouseout', (event) => {
    if (!xpCard || (event.relatedTarget && xpCard.contains(event.relatedTarget))) return;
    if (!xpCard.contains(event.target)) return;
    clearTimeout(xpTimer);
    xpCollapse(xpCard);
    xpCard = null;
  });

  /* ---- Player: Up Next card shows the next episode's screenshot ---- */

  const upNextArt = new Map();

  function upNextImage(client, seriesName, season, episode) {
    const key = seriesName + '|' + season + '|' + episode;
    if (!upNextArt.has(key)) {
      const userId = client.getCurrentUserId();
      upNextArt.set(key, client.getItems(userId, { IncludeItemTypes: 'Series', Recursive: true, SearchTerm: seriesName, Limit: 10 })
        .then((result) => {
          const items = result.Items || [];
          const series = items.find((item) => item.Name === seriesName) || items[0];
          if (!series) return '';
          return client.getItems(userId, { ParentId: series.Id, Recursive: true, IncludeItemTypes: 'Episode', ParentIndexNumber: season })
            .then((episodes) => {
              const next = (episodes.Items || []).find((item) => item.IndexNumber === episode);
              const tag = next && (next.ImageTags || {}).Primary;
              if (tag) return client.getImageUrl(next.Id, { type: 'Primary', tag, maxWidth: 800, quality: 90 });
              const back = (series.BackdropImageTags || [])[0];
              return back ? client.getImageUrl(series.Id, { type: 'Backdrop', tag: back, maxWidth: 800, quality: 90 }) : '';
            });
        })
        .catch(() => ''));
    }
    return upNextArt.get(key);
  }

  function decorateUpNext() {
    const dialog = cnLive('.upNextDialog');
    const title = dialog && dialog.querySelector('.upNextDialog-title');
    const client = window.ApiClient;
    if (!title || !client) return;
    const text = title.textContent.trim();
    if (!text || dialog.dataset.cnFor === text) return;
    dialog.dataset.cnFor = text;

    let art = dialog.querySelector('.cn-upnext-art');
    if (!art) {
      art = el('div', 'cn-upnext-art');
      art.append(el('img'));
      dialog.prepend(art);
    }
    const image = art.querySelector('img');
    image.alt = '';
    art.dataset.loaded = 'false';
    image.onload = () => { art.dataset.loaded = 'true'; };

    dialog.querySelectorAll('.cn-upnext-series, .cn-upnext-ep').forEach((node) => node.remove());
    const match = text.match(/^(.*) - S(\d+):E(\d+) - (.*)$/);
    if (!match) {
      title.classList.remove('cn-split');
      art.hidden = true;
      return;
    }
    title.classList.add('cn-split');
    title.after(el('div', 'cn-upnext-series', match[1]), el('div', 'cn-upnext-ep', 'S' + match[2] + ':E' + match[3] + ' \u00b7 ' + match[4]));
    art.hidden = false;
    upNextImage(client, match[1], Number(match[2]), Number(match[3])).then((src) => {
      if (dialog.dataset.cnFor !== text) return;
      if (src) image.src = src; else art.hidden = true;
    });
  }

  setInterval(() => { if (/^#!?\/video/.test(location.hash)) { decorateUpNext(); watchSkipButton(); } }, 1000);

  /* ---- Player: Skip Intro countdown runs on playback time ---- */
  // Jellyfin hides the skip button after 8 s of clock time. The theme times it by playback instead:
  // the CSS drain/fade holds while the video is paused, and the button only hides when that countdown
  // has really run out (or the viewer presses Skip).
  let skipWatch = null;

  function syncSkipPause() {
    if (!skipWatch || !skipWatch.button.isConnected) return;
    const video = document.querySelector('video');
    skipWatch.button.classList.toggle('cn-skip-paused', Boolean(video && video.paused));
  }

  function watchSkipButton() {
    const button = cnLive('.skip-button');
    if (!button || (skipWatch && skipWatch.button === button)) return;
    if (skipWatch) skipWatch.observer.disconnect();
    const state = { button, running: false, release: false, observer: null };
    const visible = () => !button.classList.contains('hide') && !button.classList.contains('skip-button-hidden');
    state.observer = new MutationObserver(() => {
      if (visible()) {
        if (!state.running) { state.running = true; state.release = false; }
        syncSkipPause();
        return;
      }
      if (state.running && !state.release) {
        // Jellyfin's clock-time hide arrived while the countdown still has playback time left: keep it up
        button.classList.remove('skip-button-hidden', 'hide');
        return;
      }
      state.running = false;
    });
    state.observer.observe(button, { attributes: true, attributeFilter: ['class'] });
    button.addEventListener('click', () => { state.release = true; });
    button.addEventListener('animationend', (event) => {
      if (event.animationName !== 'cn-skip-drain' || !state.running) return;
      state.release = true;
      button.classList.add('skip-button-hidden');
      setTimeout(() => { if (button.classList.contains('skip-button-hidden')) button.classList.add('hide'); }, 650);
    });
    skipWatch = state;
    syncSkipPause();
  }

  document.addEventListener('play', syncSkipPause, true);
  document.addEventListener('pause', syncSkipPause, true);

  /* ---- Library pages: feature tiles break up the poster grid ---- */
  // Movies, Shows and Collections get a display title and, every few rows, a wide tile for one title from the
  // genres you watch most that you have not finished. Favourites gets the title and opens each row with a tile.
  // Tiles sit inside Jellyfin's own lists, so they re-place themselves whenever those re-render.
  const FEATURE_EVERY = 3; // rows between tiles
  const FEATURE_SPAN = 4; // poster slots a tile covers
  const FEATURE_MIN = 40; // fewer items than this (a narrow filter): tiles step aside
  const FEATURE_PAGES = [
    { route: /^#!?\/movies(?:[?/]|$)/, page: '#moviesPage', type: 'Movie', title: 'Movies', noun: ['film', 'films'], open: 'unwatched' },
    { route: /^#!?\/tv(?:[?/]|$)/, page: '#tvshowsPage', type: 'Series', title: 'Shows', noun: ['show', 'shows'], open: 'not finished' },
    { route: /^#!?\/boxsets(?:[?/]|$)/, page: '#boxsetsPage', type: 'BoxSet', title: 'Collections', noun: ['collection', 'collections'], open: 'not finished' }
  ];
  let featureState = null;
  let favState = null;

  function featureTarget() {
    if (/[?&]tab=[1-9]/.test(location.hash)) return null;
    const cfg = FEATURE_PAGES.find((entry) => entry.route.test(location.hash));
    if (!cfg) return null;
    const page = document.querySelector(cfg.page + ':not(.hide)');
    const grid = page && page.querySelector('.itemsContainer.vertical-wrap');
    return grid && grid.querySelector(':scope > .card') ? { grid, cfg } : null;
  }

  function dayHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
    return hash;
  }

  function dailyOrder(items) {
    const day = new Date().toDateString();
    return items.slice().sort((a, b) => dayHash(day + a.Id) - dayHash(day + b.Id));
  }

  // Remembered for 10 minutes per library, so coming back to Movies/Shows places the tiles straight away
  const featureCache = new Map();
  function loadFeatures(client, parentId, cfg) {
    const key = parentId + "|" + cfg.type;
    const hit = featureCache.get(key);
    if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.promise;
    const promise = loadFeaturesFresh(client, parentId, cfg);
    featureCache.set(key, { at: Date.now(), promise });
    promise.catch(() => featureCache.delete(key));
    return promise;
  }
  function loadFeaturesFresh(client, parentId, cfg) {
    const userId = client.getCurrentUserId();
    const base = { ParentId: parentId, IncludeItemTypes: cfg.type, Recursive: true };
    return Promise.all([
      client.getItems(userId, { ...base, IsPlayed: true, Fields: 'Genres', Limit: 300 }),
      client.getItems(userId, { ...base, IsPlayed: false, Fields: 'Genres,Taglines', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 80 }),
      client.getItems(userId, { ...base, Limit: 0 })
    ]).then(([played, unplayed, all]) => {
      const score = {};
      (played.Items || []).forEach((item) => (item.Genres || []).forEach((genre) => { score[genre] = (score[genre] || 0) + 1; }));
      const top = Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 4);
      const withArt = (unplayed.Items || []).filter((item) => (item.BackdropImageTags || []).length);
      const matched = withArt.filter((item) => (item.Genres || []).some((genre) => top.includes(genre)));
      const picks = dailyOrder(matched.length >= 3 ? matched : withArt).slice(0, 12);
      return { picks, top, total: all.TotalRecordCount || 0, open: unplayed.TotalRecordCount || 0 };
    });
  }

  function featureLead(item, fallback) {
    const left = (item.UserData || {}).UnplayedItemCount;
    if (item.Type === 'Series' && left) return left + (left === 1 ? ' episode left' : ' episodes left');
    if (item.Type === 'BoxSet' && left) return left + (left === 1 ? ' film to watch' : ' films to watch');
    return fallback;
  }

  function buildFeatureTile(client, item, genres, fallbackLead) {
    const tile = el('article', 'cn-feat');
    const frame = el('div', 'cn-feat-frame');
    const back = el('img', 'cn-feat-back');
    back.alt = '';
    back.loading = 'lazy';
    back.src = client.getImageUrl(item.Id, { type: 'Backdrop', tag: item.BackdropImageTags[0], maxWidth: 1400, quality: 85 });
    frame.append(back, el('div', 'cn-feat-shade'));
    jeTagTarget(frame, item.Id);
    const matched = (item.Genres || []).filter((genre) => genres.includes(genre)).slice(0, 2);
    frame.append(el('span', 'cn-feat-why', featureLead(item, fallbackLead) + (matched.length ? ' · ' + matched.join(', ') : '')));

    const body = el('div', 'cn-feat-body');
    const title = el('h3', 'cn-feat-title', item.Name || '');
    const logoUrl = artwork(client, item, 'Logo');
    if (logoUrl) {
      const logo = el('img');
      logo.alt = item.Name || '';
      logo.loading = 'lazy';
      logo.addEventListener('error', () => { title.textContent = item.Name || ''; });
      logo.src = logoUrl;
      title.replaceChildren(logo);
    }
    body.append(title);
    const tagline = (item.Taglines || [])[0];
    if (tagline) body.append(el('p', 'cn-feat-tag', tagline));
    body.append(buildFacts(item, []));

    const holder = el('div');
    holder.innerHTML = '<div is="emby-itemscontainer" class="cn-feat-acts itemsContainer" data-contextmenu="false" data-multiselect="false"></div>';
    const row = holder.firstElementChild;
    if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(row);
    const href = '#/details?id=' + encodeURIComponent(item.Id) + '&serverId=' + encodeURIComponent(item.ServerId || client.serverId());
    if (item.Type === 'Movie') {
      const play = el('button', 'cn-shelf-play itemAction');
      play.type = 'button';
      play.dataset.action = 'play';
      play.dataset.id = item.Id;
      play.dataset.serverid = item.ServerId || client.serverId();
      play.dataset.type = item.Type;
      play.dataset.mediatype = item.MediaType || 'Video';
      play.dataset.isfolder = 'false';
      play.innerHTML = icon('play');
      play.append('Play');
      const more = el('a', 'cn-shelf-more');
      more.href = href;
      more.innerHTML = icon('info');
      more.append('Details');
      row.append(play, more);
    } else {
      // Series and collections open their page rather than starting playback from the very first item
      const open = el('a', 'cn-shelf-play');
      open.href = href;
      open.innerHTML = icon('info');
      open.append('Open');
      row.append(open);
    }
    body.append(row);
    frame.append(body);
    tile.append(frame);
    return tile;
  }

  function sizeFeatureTile(tile, card) {
    const box = card.querySelector('.cardBox');
    const style = box ? getComputedStyle(box) : null;
    // Cards have fractional widths, so measure exactly or the row overflows by a pixel or two
    tile.style.width = Math.floor(card.getBoundingClientRect().width * FEATURE_SPAN * 100) / 100 + 'px';
    tile.style.height = card.offsetHeight + 'px';
    if (style) tile.style.padding = style.marginTop + ' ' + style.marginRight + ' ' + style.marginBottom + ' ' + style.marginLeft;
  }

  function placeFeatures() {
    const state = featureState;
    if (!state || !state.grid.isConnected) return;
    const grid = state.grid;
    state.tiles.forEach((tile) => tile.remove());
    const cards = Array.from(grid.children).filter((node) => node.classList.contains('card'));
    if (cards.length < FEATURE_MIN) return;
    let cols = 0;
    while (cols < cards.length && cards[cols].offsetTop === cards[0].offsetTop) cols++;
    if (cols < FEATURE_SPAN + 2) return;
    state.tiles.forEach((tile, index) => {
      const rowStart = (1 + index * FEATURE_EVERY) * cols - index * FEATURE_SPAN;
      const at = rowStart + (index % 2 ? cols - FEATURE_SPAN : 0);
      if (at >= cards.length) return;
      sizeFeatureTile(tile, cards[0]);
      grid.insertBefore(tile, cards[at]);
    });
  }

  function libraryHead(title, strong, rest) {
    const head = el('div', 'cn-lib-head padded-left padded-right');
    head.append(el('h1', 'cn-lib-title', title));
    const sub = el('p', 'cn-lib-sub');
    sub.append(el('b', '', strong));
    if (rest) sub.append(' · ' + rest);
    head.append(sub);
    return head;
  }

  function teardownFeatures() {
    if (!featureState) return;
    const state = featureState;
    featureState = null;
    clearTimeout(state.timer);
    if (state.observer) state.observer.disconnect();
    state.tiles.forEach((tile) => tile.remove());
    if (state.head) state.head.remove();
  }

  function mountFeatures(client) {
    const target = featureTarget();
    if (!target) { teardownFeatures(); return; }
    const { grid, cfg } = target;
    const parentId = new URLSearchParams(location.hash.split('?')[1] || '').get('topParentId');
    if (featureState && featureState.grid === grid && featureState.parentId === parentId) return;
    teardownFeatures();
    // With several libraries of one type, title the page with the library's own name.
    const views = (nav && nav.views) || [];
    const library = views.find((view) => view.Id === parentId);
    const title = library && views.filter((view) => view.CollectionType === library.CollectionType).length > 1 ? library.Name : cfg.title;
    const state = { grid, parentId, tiles: [], head: null, observer: null, timer: 0, schedule: null };
    featureState = state;
    // The title goes in straight away (counts follow), so the posters don't jump down when the data arrives
    state.head = libraryHead(title, ' ', '');
    grid.parentNode.insertBefore(state.head, grid);
    loadFeatures(client, parentId, cfg).then(({ picks, top, total, open }) => {
      if (featureState !== state) return;
      const head = libraryHead(title, total + ' ' + cfg.noun[total === 1 ? 0 : 1], open + ' ' + cfg.open);
      state.head.replaceWith(head);
      state.head = head;
      state.tiles = picks.map((item) => buildFeatureTile(client, item, top, 'Unwatched'));
      state.schedule = () => {
        clearTimeout(state.timer);
        state.timer = setTimeout(() => {
          if (featureState !== state) return;
          state.observer.disconnect();
          placeFeatures();
          state.observer.observe(grid, { childList: true });
        }, 120);
      };
      state.observer = new MutationObserver((records) => {
        const ours = records.every((record) => Array.from(record.addedNodes).concat(Array.from(record.removedNodes)).every((node) => node.classList && node.classList.contains('cn-feat')));
        if (!ours) state.schedule();
      });
      state.observer.observe(grid, { childList: true });
      state.schedule();
    }).catch((error) => console.warn('[Crimson Noir] Feature tiles unavailable:', error));
  }

  function teardownFavourites() {
    if (!favState) return;
    favState.tiles.forEach((tile) => tile.remove());
    if (favState.head) favState.head.remove();
    favState = null;
  }

  // Favourites (Home, second tab): the same title, and each row of favourites opens with a feature tile
  function mountFavouriteTiles(client) {
    const tab = /^#!?\/home/.test(location.hash) && /[?&]tab=1(?:&|$)/.test(location.hash) ? document.querySelector('#indexPage:not(.hide) #favoritesTab.is-active') : null;
    const rows = tab ? Array.from(tab.querySelectorAll('.itemsContainer')).filter((row) => row.querySelector(':scope > .card[data-type="Movie"], :scope > .card[data-type="Series"], :scope > .card[data-type="BoxSet"]')) : [];
    if (!rows.length) { teardownFavourites(); return; }
    if (favState && favState.tab === tab && favState.ready && (favState.head && favState.head.isConnected) && favState.tiles.every((tile) => tile.isConnected)) return;
    if (favState && favState.tab === tab && !favState.ready) return;
    teardownFavourites();
    const state = { tab, tiles: [], head: null, ready: false };
    favState = state;
    const userId = client.getCurrentUserId();
    Promise.all(rows.map((row) => {
      const ids = Array.from(row.querySelectorAll(':scope > .card')).map((card) => card.dataset.id).filter(Boolean);
      if (!ids.length) return Promise.resolve(null);
      return client.getItems(userId, { Ids: ids.join(','), Fields: 'Genres,Taglines' })
        .then((result) => dailyOrder((result.Items || []).filter((item) => (item.BackdropImageTags || []).length))[0] || null)
        .catch(() => null);
    })).then((picks) => {
      if (favState !== state) return;
      const total = rows.reduce((count, row) => count + row.querySelectorAll(':scope > .card').length, 0);
      state.head = libraryHead('Favourites', total + (total === 1 ? ' favourite' : ' favourites'), '');
      tab.prepend(state.head);
      picks.forEach((item, index) => {
        const row = rows[index];
        const card = row.querySelector(':scope > .card');
        if (!item || !card) return;
        const tile = buildFeatureTile(client, item, (item.Genres || []).slice(0, 2), 'Favourite');
        sizeFeatureTile(tile, card);
        row.prepend(tile);
        state.tiles.push(tile);
      });
      state.ready = true;
    });
  }

  /* ---- Generic list pages (#/list, e.g. Favourites > Movies): the libraries' header, icon toolbar and captions ---- */
  let listState = null;
  const LIST_NOUNS = { Movie: ['film', 'films'], Series: ['show', 'shows'], Episode: ['episode', 'episodes'], BoxSet: ['collection', 'collections'], MusicAlbum: ['album', 'albums'], Audio: ['song', 'songs'], Person: ['person', 'people'] };

  function teardownList() {
    if (!listState) return;
    if (listState.head) listState.head.remove();
    if (listState.page) delete listState.page.dataset.cnList;
    listState = null;
  }

  function listCaptions(client, page) {
    const bare = Array.from(page.querySelectorAll('.itemsContainer > .card[data-id]:not([data-cn-cap])'));
    if (!bare.length) return;
    bare.forEach((card) => { card.dataset.cnCap = card.querySelector('.cardText') ? 'native' : 'pending'; });
    const todo = bare.filter((card) => card.dataset.cnCap === 'pending');
    if (!todo.length) return;
    const serverId = client.serverId();
    for (let i = 0; i < todo.length; i += 100) {
      const chunk = todo.slice(i, i + 100);
      client.getItems(client.getCurrentUserId(), { Ids: chunk.map((card) => card.dataset.id).join(','), EnableImages: false })
        .then((result) => {
          const byId = new Map((result.Items || []).map((item) => [item.Id, item]));
          chunk.forEach((card) => {
            const item = byId.get(card.dataset.id);
            const box = card.querySelector('.cardBox');
            if (!item || !box || box.querySelector('.cardText')) return;
            const first = el('div', 'cardText cardTextCentered cardText-first');
            const link = el('a', 'textActionButton cn-list-cap', item.Name || '');
            link.href = '#/details?id=' + encodeURIComponent(item.Id) + '&serverId=' + encodeURIComponent(item.ServerId || serverId);
            const bdi = el('bdi');
            bdi.append(link);
            first.append(bdi);
            const second = el('div', 'cardText cardTextCentered cardText-secondary');
            let meta = item.ProductionYear ? String(item.ProductionYear) : '';
            if (item.Type === 'Episode') meta = [item.SeriesName, item.IndexNumber != null ? 'S' + (item.ParentIndexNumber || 0) + ':E' + item.IndexNumber : ''].filter(Boolean).join(' · ');
            second.append(el('bdi', '', meta || ' '));
            box.append(first, second);
            card.dataset.cnCap = 'done';
          });
        })
        .catch(() => chunk.forEach((card) => { delete card.dataset.cnCap; }));
    }
  }

  function mountListPage(client) {
    const page = /^#!?\/list(?:[?/]|$)/.test(location.hash)
      ? Array.from(document.querySelectorAll('.libraryPage:not(.hide)')).find((node) => node.getClientRects().length && node.querySelector('.itemsViewSettingsContainer'))
      : null;
    if (!page) { teardownList(); return; }
    page.dataset.cnList = 'true';
    listCaptions(client, page);
    const key = location.hash;
    if (listState && listState.page === page && listState.key === key && (listState.pending || (listState.head && listState.head.isConnected))) return;
    teardownList();
    page.dataset.cnList = 'true';
    const state = { page, key, head: null, pending: true };
    listState = state;
    // Jellyfin focuses the first poster for TV remotes; on a desktop that just leaves its overlay showing
    if (!isTv()) [300, 1200].forEach((ms) => setTimeout(() => {
      const active = document.activeElement;
      if (listState === state && active && page.contains(active) && active.closest('.card') && !active.matches(':hover')) active.blur();
    }, ms));
    const bar = page.querySelector('.itemsViewSettingsContainer');
    [['.btnFilter', 'Filter'], ['.btnSort', 'Sort'], ['.btnViewSettings', 'View settings']].forEach(([sel, label]) => {
      const b = bar.querySelector(sel);
      if (b) { b.title = label; b.setAttribute('aria-label', label); }
    });
    const params = new URLSearchParams(key.split('?')[1] || '');
    const type = params.get('type') || '';
    const noun = LIST_NOUNS[type] || ['title', 'titles'];
    const plural = noun[1].charAt(0).toUpperCase() + noun[1].slice(1);
    const favourite = /^true$/i.test(params.get('IsFavorite') || '');
    const userId = client.getCurrentUserId();
    const ref = params.get('genreId') || params.get('studioId') || params.get('tagId') || params.get('musicGenreId') || params.get('parentId');
    const titleCall = favourite ? Promise.resolve('Favourite ' + noun[1])
      : ref ? client.getItem(userId, ref).then((item) => (item && item.Name) || plural).catch(() => plural) : Promise.resolve(plural);
    const countFrom = () => {
      const text = (bar.querySelector('.listPaging') || {}).textContent || '';
      const m = text.match(/of\s+([\d,]+)/i);
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : page.querySelectorAll('.itemsContainer > .card').length;
    };
    const openCall = favourite && (type === 'Movie' || type === 'Series')
      ? client.getItems(userId, { IncludeItemTypes: type, Recursive: true, IsFavorite: true, IsPlayed: false, Limit: 0 }).then((r) => r.TotalRecordCount || 0).catch(() => null)
      : Promise.resolve(null);
    Promise.all([titleCall, openCall]).then(([title, open]) => {
      if (listState !== state) return;
      const total = countFrom();
      const rest = open == null ? '' : open === 0 ? (type === 'Series' ? 'all finished' : 'all watched') : open + ' ' + (type === 'Series' ? 'not finished' : 'unwatched');
      const head = libraryHead(title, total + ' ' + noun[total === 1 ? 0 : 1], rest);
      head.classList.remove('padded-left', 'padded-right');
      head.classList.add('cn-list-head');
      bar.after(head);
      state.head = head;
      state.pending = false;
    });
  }

  window.addEventListener('resize', () => { if (featureState && featureState.schedule) featureState.schedule(); });
  setInterval(() => {
    const client = window.ApiClient;
    if (!client || !client.getCurrentUserId || !client.getCurrentUserId()) return;
    mountFeatures(client);
    mountFavouriteTiles(client);
    mountListPage(client);
  }, 800);

  /* ---- Quick settings: the profile button opens a control-centre panel ---- */
  // Everyday settings change in place and save straight to the account; everything else is one link away.
  const TITLES_KEY = 'cn-titles';
  try { root.classList.toggle('cn-titles-hover', localStorage.getItem(TITLES_KEY) === 'hover'); } catch (error) { /* private mode */ }

  const QS_ICONS = {
    subs: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 12h3M12 12h5M7 15h6" stroke="currentColor" stroke-width="2"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14l9-7zM17 5h2v14h-2z" fill="currentColor"/></svg>',
    memory: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 0 8 8M12 8v4l3 2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    latest: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    lang: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    audio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  };
  let qsPanel = null;

  // Active streams pops out under its row in the profile panel instead of at the screen edge
  let streamsPopout = null;
  function closeStreamsPopout() {
    if (!streamsPopout) return;
    const { panel, row, cleanup } = streamsPopout;
    streamsPopout = null;
    cleanup();
    row.setAttribute('aria-expanded', 'false');
    row.classList.remove('is-open');
    if (panel.classList.contains('je-as-panel-open')) {
      const close = panel.querySelector('.je-as-panel-close');
      if (close) close.click();
    }
    ['top', 'left', 'right', 'width', 'max-height', 'z-index'].forEach((prop) => panel.style.removeProperty(prop));
    panel.classList.remove('cn-streams-pop');
  }
  function openStreamsPopout(qs, row) {
    const button = document.getElementById('je-active-streams');
    if (!button || !qs.isConnected) return;
    button.click();
    const panel = document.getElementById('je-active-streams-panel');
    if (!panel) return;
    panel.classList.add('cn-streams-pop');
    const place = () => {
      if (!row.isConnected) return;
      const r = row.getBoundingClientRect();
      const q = qs.getBoundingClientRect();
      const height = panel.offsetHeight || 160;
      let top = r.bottom + 8;
      if (top + height > window.innerHeight - 12) top = Math.max(12, window.innerHeight - 12 - height);
      panel.style.setProperty('top', Math.round(top) + 'px', 'important');
      panel.style.setProperty('left', Math.round(q.left) + 'px', 'important');
      panel.style.setProperty('right', 'auto', 'important');
      panel.style.setProperty('width', Math.round(q.width) + 'px', 'important');
      panel.style.setProperty('max-height', Math.round(window.innerHeight - 24) + 'px', 'important');
      panel.style.setProperty('z-index', String((parseInt(getComputedStyle(qs).zIndex, 10) || 1000) + 1), 'important');
    };
    place();
    requestAnimationFrame(place);
    const watch = new MutationObserver(() => {
      if (!panel.classList.contains('je-as-panel-open')) { closeStreamsPopout(); return; }
      place();
    });
    watch.observe(panel, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    window.addEventListener('resize', place);
    row.setAttribute('aria-expanded', 'true');
    row.classList.add('is-open');
    streamsPopout = { panel, row, cleanup: () => { watch.disconnect(); window.removeEventListener('resize', place); } };
  }

  function closeQuickSettings(restoreFocus) {
    if (!qsPanel) return;
    const { node, trigger, cleanup } = qsPanel;
    qsPanel = null;
    cleanup();
    node.remove();
    closeStreamsPopout();
    if (restoreFocus && trigger && trigger.isConnected) trigger.focus();
  }

  function openQuickSettings(trigger) {
    const client = window.ApiClient;
    if (!client || !client.getCurrentUserId()) { location.hash = '#/mypreferencesmenu'; return; }
    const userId = client.getCurrentUserId();
    const node = el('section', 'cn-qs');
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-label', 'Quick settings');
    node.tabIndex = -1;
    document.body.append(node);
    const place = () => {
      const box = trigger.getBoundingClientRect();
      node.style.top = Math.round(box.bottom + 12) + 'px';
      node.style.right = Math.max(16, Math.round(window.innerWidth - box.right - 8)) + 'px';
    };
    place();

    const onDoc = (event) => { if (!node.contains(event.target) && !trigger.contains(event.target) && !(event.target.closest && event.target.closest('#je-active-streams-panel'))) closeQuickSettings(false); };
    const onKey = (event) => { if (event.key === 'Escape') closeQuickSettings(true); };
    const onHash = () => closeQuickSettings(false);
    setTimeout(() => document.addEventListener('pointerdown', onDoc, true), 0);
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('resize', place);
    qsPanel = { node, trigger, cleanup: () => {
      document.removeEventListener('pointerdown', onDoc, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('resize', place);
    } };
    node.append(el('p', 'cn-qs-loading', 'Loading your settings…'));

    client.getUser(userId).then((user) => {
      if (!qsPanel || qsPanel.node !== node) return;
      const config = user.Configuration || {};
      const status = el('p', 'cn-qs-status');
      status.setAttribute('role', 'status');
      let statusTimer = 0;

      function save(label, apply) {
        const next = Object.assign({}, config);
        apply(next);
        return client.updateUserConfiguration(userId, next).then(() => {
          Object.assign(config, next);
          clearTimeout(statusTimer);
          status.className = 'cn-qs-status is-saved';
          status.innerHTML = QS_ICONS.tick;
          status.append('Saved: ' + label);
          statusTimer = setTimeout(() => { status.className = 'cn-qs-status'; status.textContent = ''; }, 4000);
          return true;
        }).catch(() => {
          status.className = 'cn-qs-status is-error';
          status.textContent = 'Could not save that change. Check your connection and try again.';
          return false;
        });
      }

      // Profile
      const who = el('div', 'cn-qs-who');
      const avatar = el('span', 'cn-qs-avatar');
      if (user.PrimaryImageTag) {
        const img = el('img');
        img.alt = '';
        img.src = client.getUserImageUrl(user.Id, { tag: user.PrimaryImageTag, type: 'Primary', height: 120 });
        avatar.append(img);
      } else {
        avatar.textContent = (user.Name || '?').charAt(0).toUpperCase();
      }
      const id = el('div', 'cn-qs-id');
      id.append(el('b', '', user.Name || ''), el('span', '', user.Policy && user.Policy.IsAdministrator ? 'Administrator' : 'Member'));
      const edit = el('a', 'cn-qs-edit', 'Edit profile');
      edit.href = '#/userprofile?userId=' + encodeURIComponent(user.Id);
      who.append(avatar, id, edit);

      // Switch tiles
      function tile(iconName, label, isOn, describe, toggle) {
        const button = el('button', 'cn-qs-tile');
        button.type = 'button';
        button.setAttribute('role', 'switch');
        const ic = el('span', 'cn-qs-ic');
        ic.innerHTML = QS_ICONS[iconName];
        const knob = el('span', 'cn-qs-knob');
        const top = el('span', 'cn-qs-tile-top');
        top.append(ic, knob);
        const name = el('b', '', label);
        const state = el('span', 'cn-qs-state');
        button.append(top, name, state);
        const paint = () => {
          const on = isOn();
          button.setAttribute('aria-checked', String(on));
          button.classList.toggle('is-on', on);
          state.textContent = describe(on);
        };
        button.addEventListener('click', () => {
          const on = !isOn();
          button.disabled = true;
          save(label + ' ' + describe(on).toLowerCase(), (next) => toggle(next, on)).then(() => { button.disabled = false; paint(); });
        });
        paint();
        return button;
      }

      // Metadata: titles, ticks, counts, progress and badges on cards, shown all the time or only while you hover (saved on this device)
      function titlesTile() {
        const isOn = () => !root.classList.contains('cn-titles-hover');
        const button = el('button', 'cn-qs-tile');
        button.type = 'button';
        button.setAttribute('role', 'switch');
        const ic = el('span', 'cn-qs-ic');
        ic.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 19h12M8 22h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        const top = el('span', 'cn-qs-tile-top');
        top.append(ic, el('span', 'cn-qs-knob'));
        const state = el('span', 'cn-qs-state');
        button.append(top, el('b', '', 'Metadata'), state);
        const paint = () => {
          const on = isOn();
          button.setAttribute('aria-checked', String(on));
          button.classList.toggle('is-on', on);
          state.textContent = on ? 'Always shown' : 'On hover';
        };
        button.addEventListener('click', () => {
          const on = !isOn();
          try { localStorage.setItem(TITLES_KEY, on ? 'shown' : 'hover'); } catch (error) { /* private mode */ }
          root.classList.toggle('cn-titles-hover', !on);
          paint();
          clearTimeout(statusTimer);
          status.className = 'cn-qs-status is-saved';
          status.innerHTML = QS_ICONS.tick;
          status.append(on ? 'Metadata always shown' : 'Metadata appears when you hover');
          statusTimer = setTimeout(() => { status.className = 'cn-qs-status'; status.textContent = ''; }, 4000);
        });
        paint();
        return button;
      }

      // Backdrops are a per-device Jellyfin setting (stored in this browser), so this tile saves locally, not to the account
      function backdropTile() {
        const key = userId + '-enableBackdrops';
        const isOn = () => { try { return localStorage.getItem(key) === 'true'; } catch (error) { return false; } };
        const button = el('button', 'cn-qs-tile');
        button.type = 'button';
        button.setAttribute('role', 'switch');
        const ic = el('span', 'cn-qs-ic');
        ic.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 16l5-5 4 4 3-3 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="9" r="1.6" fill="currentColor"/></svg>';
        const top = el('span', 'cn-qs-tile-top');
        top.append(ic, el('span', 'cn-qs-knob'));
        const state = el('span', 'cn-qs-state');
        button.append(top, el('b', '', 'Backdrops'), state);
        const paint = () => {
          const on = isOn();
          button.setAttribute('aria-checked', String(on));
          button.classList.toggle('is-on', on);
          state.textContent = on ? 'On this device' : 'Off';
        };
        button.addEventListener('click', () => {
          const on = !isOn();
          try { localStorage.setItem(key, String(on)); } catch (error) { /* private mode */ }
          root.classList.toggle('cn-no-backdrops', !on);
          paint();
          clearTimeout(statusTimer);
          status.className = 'cn-qs-status is-saved';
          status.innerHTML = QS_ICONS.tick;
          status.append(on ? 'Backdrops on: they appear as you browse' : 'Backdrops off');
          statusTimer = setTimeout(() => { status.className = 'cn-qs-status'; status.textContent = ''; }, 4000);
        });
        paint();
        return button;
      }

      const subsOn = () => ['Always', 'Smart', 'Default'].includes(config.SubtitleMode || 'Default');
      const board = el('div', 'cn-qs-board');
      board.append(
        titlesTile(),
        tile('next', 'Autoplay next', () => config.EnableNextEpisodeAutoPlay !== false, (on) => (on ? 'On' : 'Off'), (next, on) => { next.EnableNextEpisodeAutoPlay = on; }),
        tile('memory', 'Remember tracks', () => Boolean(config.RememberAudioSelections && config.RememberSubtitleSelections), (on) => (on ? 'Audio and subtitles' : 'Off'), (next, on) => { next.RememberAudioSelections = on; next.RememberSubtitleSelections = on; }),
        backdropTile()
      );

      // Segmented pickers
      function picker(iconName, label, hint, options, current, onPick) {
        const row = el('div', 'cn-qs-pick');
        const ic = el('span', 'cn-qs-ic');
        ic.innerHTML = QS_ICONS[iconName];
        const text = el('div', 'cn-qs-pick-text');
        text.append(el('b', '', label), el('span', '', hint));
        const seg = el('div', 'cn-qs-seg');
        seg.setAttribute('role', 'radiogroup');
        seg.setAttribute('aria-label', label);
        const buttons = options.map((option) => {
          const button = el(option.href ? 'a' : 'button', '', option.label);
          if (option.href) {
            button.href = option.href;
          } else {
            button.type = 'button';
            button.setAttribute('role', 'radio');
            button.addEventListener('click', () => {
              if (current() === option.value) return;
              onPick(option).then(() => buttons.forEach((b, i) => { if (!options[i].href) b.setAttribute('aria-checked', String(options[i].value === current())); }));
            });
          }
          return button;
        });
        buttons.forEach((b, i) => { if (!options[i].href) b.setAttribute('aria-checked', String(options[i].value === current())); });
        seg.append(...buttons);
        row.append(ic, text, seg);
        return row;
      }

      const langNow = () => (config.SubtitleLanguagePreference === 'eng' && config.AudioLanguagePreference === 'eng' ? 'eng' : (!config.SubtitleLanguagePreference && !config.AudioLanguagePreference ? '' : 'other'));
      const languages = picker('lang', 'Languages', 'Subtitles and audio', [
        { label: 'English', value: 'eng' },
        { label: 'Any', value: '' },
        { label: 'More…', href: '#/mypreferencessubtitles?userId=' + encodeURIComponent(user.Id) }
      ], langNow, (option) => save('languages ' + option.label, (next) => { next.SubtitleLanguagePreference = option.value; next.AudioLanguagePreference = option.value; }));
      const audio = picker('audio', 'Audio track', 'Which track plays first', [
        { label: 'Film’s default', value: true },
        { label: 'Your language', value: false }
      ], () => config.PlayDefaultAudioTrack !== false, (option) => save('audio track ' + option.label.toLowerCase(), (next) => { next.PlayDefaultAudioTrack = option.value; }));

      // Active streams: opens Jellyfin Enhanced's sessions panel (its own header button is hidden by the theme)
      let streams = null;
      const jeStreams = document.getElementById('je-active-streams');
      if (jeStreams) {
        streams = el('button', 'cn-qs-all cn-qs-streams');
        streams.type = 'button';
        const label = el('span', 'cn-qs-streams-label', 'Active streams');
        const live = el('span', 'cn-qs-live');
        const paintLive = () => {
          const text = jeStreams.title || '';
          const m = text.match(/(\d+)/);
          const n = /^no\b/i.test(text) || !m ? 0 : parseInt(m[1], 10);
          const paused = n > 0 && /paused/i.test(text);
          const word = n ? n + (paused ? ' paused' : ' playing') : 'None';
          live.textContent = word;
          live.classList.toggle('is-on', n > 0 && !paused);
          live.classList.toggle('is-paused', paused);
          streams.setAttribute('aria-label', 'Active streams: ' + word.toLowerCase());
        };
        paintLive();
        const liveObserver = new MutationObserver(paintLive);
        liveObserver.observe(jeStreams, { attributes: true, attributeFilter: ['title'] });
        const chevS = el('span', 'cn-qs-chev');
        chevS.innerHTML = QS_ICONS.chevron;
        streams.append(label, live, chevS);
        streams.setAttribute('aria-expanded', 'false');
        streams.addEventListener('click', () => {
          if (streamsPopout) { closeStreamsPopout(); return; }
          setTimeout(() => openStreamsPopout(node, streams), 0);
        });
      }

      const all = el('a', 'cn-qs-all', 'All settings');
      all.href = '#/mypreferencesmenu';
      const chev = el('span', 'cn-qs-chev');
      chev.innerHTML = QS_ICONS.chevron;
      all.append(chev);

      const foot = el('div', 'cn-qs-foot');
      if (user.Policy && user.Policy.IsAdministrator) {
        const admin = el('a', 'cn-qs-admin', 'Administration');
        admin.href = '#/dashboard';
        foot.append(admin);
      } else {
        foot.append(el('span'));
      }
      const out = el('button', 'cn-qs-out', 'Sign out');
      out.type = 'button';
      out.addEventListener('click', () => {
        closeQuickSettings(false);
        if (window.Dashboard && window.Dashboard.logout) window.Dashboard.logout(); else location.hash = '#/mypreferencesmenu';
      });
      foot.append(out);

      // Accent colour: moved here from the header to save space
      const accentRow = el('div', 'cn-qs-pick cn-qs-accent');
      const accentIc = el('span', 'cn-qs-ic');
      accentIc.innerHTML = PALETTE_ICON;
      const accentText = el('div', 'cn-qs-pick-text');
      const accentName = el('span', '', savedAccent());
      accentText.append(el('b', '', 'Accent colour'), accentName);
      const swatches = el('div', 'cn-qs-swatches');
      swatches.setAttribute('role', 'radiogroup');
      swatches.setAttribute('aria-label', 'Accent colour');
      const customWrap = el('label', 'cn-qs-sw is-custom');
      const customInput = el('input');
      customInput.type = 'color';
      customInput.value = savedCustom();
      customInput.setAttribute('aria-label', 'Custom accent colour');
      customWrap.style.setProperty('--sw', savedCustom());
      customWrap.title = 'Custom colour';
      customWrap.append(customInput);
      const markAccent = (name) => {
        swatches.querySelectorAll('button.cn-qs-sw').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.name === name)));
        customWrap.classList.toggle('is-active', name === 'Custom');
        accentName.textContent = name === 'Custom' ? 'Custom ' + savedCustom().toUpperCase() : name;
      };
      ACCENTS.forEach((accent) => {
        const sw = el('button', 'cn-qs-sw');
        sw.type = 'button';
        sw.dataset.name = accent.name;
        sw.style.setProperty('--sw', accent.hex);
        sw.setAttribute('role', 'radio');
        sw.setAttribute('aria-label', accent.name);
        sw.title = accent.name;
        sw.addEventListener('click', () => { storeAccent(accent.name); applyAccent(accent.name); markAccent(accent.name); });
        swatches.append(sw);
      });
      customInput.addEventListener('input', () => {
        storeAccent('Custom', customInput.value);
        applyAccent('Custom');
        customWrap.style.setProperty('--sw', customInput.value);
        markAccent('Custom');
      });
      swatches.append(customWrap);
      markAccent(savedAccent());
      accentRow.append(accentIc, accentText, swatches);

      node.replaceChildren(...[who, board, accentRow, languages, audio, status, streams, all, foot].filter(Boolean));
      const first = node.querySelector('.cn-qs-tile');
      if (first) first.focus({ preventScroll: true });
    }).catch(() => {
      if (!qsPanel || qsPanel.node !== node) return;
      node.replaceChildren(el('p', 'cn-qs-loading', 'Could not load your settings.'));
      const all = el('a', 'cn-qs-all', 'Open all settings');
      all.href = '#/mypreferencesmenu';
      node.append(all);
    });
  }

  // The header's profile button opens the panel instead of going straight to the settings page
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest && event.target.closest('.cn-nav-tools button[aria-label="Profile and settings"]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (qsPanel) closeQuickSettings(true); else openQuickSettings(trigger);
  }, true);

  /* ---- Login page: opening credits over your library's artwork ---- */
  // Accounts read like a film's opening credits; picking yours opens Jellyfin's own password form under your
  // name. Sign-in itself stays Jellyfin's. Backdrops are remembered on this device while someone is signed in,
  // because the library cannot be listed before sign-in.
  const LOGIN_ART_KEY = 'cn-login-art';
  const LOGIN_ROTATE_MS = 9000;
  let loginArtSaved = false;
  let loginState = null;

  function saveLoginArt(client) {
    if (loginArtSaved) return;
    loginArtSaved = true;
    client.getItems(client.getCurrentUserId(), { IncludeItemTypes: 'Movie,Series', Recursive: true, SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 60 })
      .then((result) => {
        const art = dailyOrder((result.Items || []).filter((item) => (item.BackdropImageTags || []).length)).slice(0, 12)
          .map((item) => ({ u: client.getImageUrl(item.Id, { type: 'Backdrop', tag: item.BackdropImageTags[0], maxWidth: 1920, quality: 80 }), n: item.Name || '', y: item.ProductionYear || '' }));
        if (art.length) { try { localStorage.setItem(LOGIN_ART_KEY, JSON.stringify(art)); } catch (error) { /* storage unavailable */ } }
      })
      .catch(() => { loginArtSaved = false; });
  }

  function readLoginArt() {
    try {
      const list = JSON.parse(localStorage.getItem(LOGIN_ART_KEY) || '[]');
      if (Array.isArray(list) && list.length) return list;
    } catch (error) { /* storage unavailable */ }
    const client = window.ApiClient;
    return client ? [{ u: client.getUrl('Branding/Splashscreen'), n: '', y: '' }] : [];
  }

  function teardownLogin() {
    if (!loginState) return;
    const state = loginState;
    loginState = null;
    clearInterval(state.timer);
    if (state.observer) state.observer.disconnect();
    state.added.forEach((node) => node.remove());
    if (state.form && state.home && state.home.parentNode) state.home.parentNode.insertBefore(state.form, state.home);
    if (state.form) state.form.classList.remove('cn-inline');
    delete state.page.dataset.cnLogin;
    document.documentElement.classList.remove('cn-login');
  }

  function mountLogin() {
    const page = document.querySelector('#loginPage:not(.hide)');
    if (!page) { teardownLogin(); return; }
    if (loginState && loginState.page === page) return;
    teardownLogin();
    const visual = page.querySelector('.visualLoginForm');
    const form = page.querySelector('.manualLoginForm');
    if (!visual || !form) return;
    page.dataset.cnLogin = 'true';
    document.documentElement.classList.add('cn-login');
    const state = { page, form, home: visual, added: [], timer: 0, observer: null, picked: null };
    loginState = state;

    // Rotating library artwork, slow crossfade, with the film's name in the corner
    const art = el('div', 'cn-login-art');
    art.setAttribute('aria-hidden', 'true');
    const credit = el('p', 'cn-login-credit');
    page.prepend(art);
    page.append(credit);
    state.added.push(art, credit);
    const frames = readLoginArt();
    let index = 0;
    const show = () => {
      const frame = frames[index % frames.length];
      if (!frame) return;
      const img = el('img');
      img.alt = '';
      img.addEventListener('load', () => {
        img.classList.add('is-in');
        Array.from(art.children).forEach((node) => { if (node !== img) setTimeout(() => node.remove(), 1700); });
      });
      img.addEventListener('error', () => img.remove());
      img.src = frame.u;
      art.append(img);
      credit.replaceChildren();
      if (frame.n) {
        credit.append(el('b', '', frame.n));
        if (frame.y) credit.append(String(frame.y) + ' · in the library');
      }
      index++;
    };
    show();
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (frames.length > 1 && !still) state.timer = setInterval(show, LOGIN_ROTATE_MS);

    // Server name as the wordmark
    const brand = el('div', 'cn-login-brand', 'Jellyfin');
    page.append(brand);
    state.added.push(brand);
    const client = window.ApiClient;
    if (client) fetch(client.getUrl('System/Info/Public')).then((r) => r.json()).then((info) => { if (info && info.ServerName) brand.textContent = info.ServerName; }).catch(() => {});

    const heading = visual.querySelector('h1');
    if (heading) heading.textContent = 'Who’s watching?';

    // Quick Connect gets an icon and a plain-language hint
    const quick = page.querySelector('.btnQuick');
    if (quick && !quick.querySelector('svg')) {
      quick.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="4" width="6" height="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="14" width="6" height="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 14h2v2h-2zM18 18h2v2h-2z" fill="currentColor"/></svg>');
      const hint = el('span', 'cn-login-hint', 'Approve from a device that’s already signed in');
      quick.after(hint);
      state.added.push(hint);
    }
    const password = form.querySelector('#txtManualPassword');
    if (password && !password.placeholder) password.placeholder = 'Password';

    // Picking a name keeps the credits on screen and opens the password form right under that name
    const users = page.querySelector('#divUsers');
    if (users) {
      users.addEventListener('click', (event) => {
        const card = event.target.closest && event.target.closest('.card');
        if (!card || !users.contains(card)) return;
        users.querySelectorAll('.card.cn-picked').forEach((node) => node.classList.remove('cn-picked'));
        card.classList.add('cn-picked');
        state.picked = card;
      }, true);
    }
    // Clicks inside the inline form must not reach the user list's own handler
    form.addEventListener('click', (event) => { if (form.classList.contains('cn-inline')) event.stopPropagation(); });

    const sync = () => {
      const shown = !form.classList.contains('hide');
      if (shown && state.picked && state.picked.isConnected) {
        // Only touch classes that need changing: re-setting a class still counts as a mutation and would loop
        if (form.previousElementSibling !== state.picked) {
          state.picked.after(form);
          // Moving the form drops Jellyfin's focus, so put the cursor back in the password box
          const box = form.querySelector('#txtManualPassword');
          if (box) setTimeout(() => box.focus(), 0);
        }
        if (!form.classList.contains('cn-inline')) form.classList.add('cn-inline');
        if (visual.classList.contains('hide')) visual.classList.remove('hide');
      } else if (!shown && form.classList.contains('cn-inline')) {
        form.classList.remove('cn-inline');
        visual.parentNode.insertBefore(form, visual);
        if (state.picked) state.picked.classList.remove('cn-picked');
        state.picked = null;
      }
    };
    state.observer = new MutationObserver(sync);
    state.observer.observe(form, { attributes: true, attributeFilter: ['class'] });
    state.observer.observe(visual, { attributes: true, attributeFilter: ['class'] });
  }

  setInterval(() => {
    const client = window.ApiClient;
    if (client && client.getCurrentUserId && client.getCurrentUserId()) saveLoginArt(client);
    mountLogin();
  }, 700);

  /* ---- Search: one list (library first, then Jellyseerr) with a big preview of the highlighted result ---- */
  // Library results come from Jellyfin; Jellyseerr results and the request flow come from Jellyfin Enhanced,
  // so requesting still uses its own panel (seasons, 4K, quotas). The stock search page stays underneath.
  const SEARCH_RECENT_KEY = 'cn-recent-searches';
  const TMDB_IMG = 'https://image.tmdb.org/t/p/';
  let searchState = null;

  function recentSearches() {
    try { const list = JSON.parse(localStorage.getItem(SEARCH_RECENT_KEY) || '[]'); return Array.isArray(list) ? list : []; } catch (error) { return []; }
  }
  function rememberSearch(term) {
    const value = (term || '').trim();
    if (value.length < 2) return;
    const list = [value].concat(recentSearches().filter((item) => item.toLowerCase() !== value.toLowerCase())).slice(0, 8);
    try { localStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(list)); } catch (error) { /* storage unavailable */ }
  }

  function searchQueryFromHash() {
    const query = location.hash.split('?')[1] || '';
    return new URLSearchParams(query).get('query') || '';
  }

  function teardownSearch() {
    if (!searchState) return;
    const state = searchState;
    searchState = null;
    clearTimeout(state.timer);
    state.node.remove();
    delete state.page.dataset.cnSearch;
  }

  function mountSearch() {
    const page = document.querySelector('#searchPage:not(.hide)');
    if (!page || !/^#!?\/search/.test(location.hash)) { teardownSearch(); return; }
    if (searchState && searchState.page === page && searchState.node.isConnected) return;
    teardownSearch();
    const client = window.ApiClient;
    if (!client || !client.getCurrentUserId()) return;
    const userId = client.getCurrentUserId();
    const JE = window.JellyfinEnhanced;
    const seerr = JE && JE.jellyseerrAPI && JE.jellyseerrAPI.search && JE.jellyseerrMoreInfo && JE.jellyseerrMoreInfo.open ? JE : null;

    const node = el('section', 'cn-search');
    const field = el('div', 'cn-search-field');
    field.innerHTML = icon('search');
    const input = el('input', 'cn-search-input');
    input.type = 'search';
    input.placeholder = 'Search films, shows, collections and people';
    input.setAttribute('aria-label', 'Search');
    input.autocomplete = 'off';
    const clear = el('button', 'cn-search-clear', 'Clear');
    clear.type = 'button';
    field.append(input, clear);
    const body = el('div', 'cn-search-body');
    node.append(field, body);
    page.prepend(node);
    page.dataset.cnSearch = 'true';
    const state = { page, node, timer: 0, seq: 0, rows: [], items: [], index: -1, preview: null };
    searchState = state;

    // ---------- empty state: recent searches and picks ----------
    function showEmpty() {
      state.rows = []; state.items = []; state.index = -1;
      const wrap = el('div', 'cn-search-empty');
      const recents = recentSearches();
      if (recents.length) {
        const block = el('div', 'cn-search-block');
        block.append(el('h2', 'cn-search-h', 'Recent searches'));
        const chips = el('div', 'cn-search-chips');
        recents.forEach((term) => {
          const chip = el('button', 'cn-search-chip', term);
          chip.type = 'button';
          chip.addEventListener('click', () => { input.value = term; runSearch(); });
          chips.append(chip);
        });
        block.append(chips);
        wrap.append(block);
      }
      const picksBlock = el('div', 'cn-search-block');
      picksBlock.append(el('h2', 'cn-search-h', 'Picks for you'));
      const picks = el('div', 'cn-search-picks');
      picksBlock.append(picks);
      wrap.append(picksBlock);
      body.replaceChildren(wrap);
      client.getItems(userId, { IncludeItemTypes: 'Movie,Series', Recursive: true, IsPlayed: false, SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 40 }).then((result) => {
        const list = dailyOrder((result.Items || []).filter((item) => (item.BackdropImageTags || []).length)).slice(0, 8);
        picks.replaceChildren(...list.map((item) => {
          const card = el('a', 'cn-search-pick');
          card.href = '#/details?id=' + encodeURIComponent(item.Id) + '&serverId=' + encodeURIComponent(item.ServerId || client.serverId());
          const img = el('img');
          img.alt = '';
          img.loading = 'lazy';
          img.src = client.getImageUrl(item.Id, { type: 'Backdrop', tag: item.BackdropImageTags[0], maxWidth: 640 });
          card.append(img, el('span', 'cn-search-pick-name', item.Name || ''));
          jeTagTarget(card, item.Id);
          return card;
        }));
      }).catch(() => picksBlock.remove());
    }

    // ---------- results ----------
    function libraryEntry(item) {
      const isPerson = item.Type === 'Person';
      const tag = (item.ImageTags || {}).Primary;
      return {
        kind: 'library', item,
        title: item.Name || '',
        meta: [isPerson ? 'Person' : ({ Movie: 'Film', Series: 'Show', BoxSet: 'Collection' })[item.Type] || item.Type, item.ProductionYear].filter(Boolean).join(' · '),
        rating: item.CommunityRating,
        thumb: (item.BackdropImageTags || []).length ? client.getImageUrl(item.Id, { type: 'Backdrop', tag: item.BackdropImageTags[0], maxWidth: 240 }) : (tag ? client.getImageUrl(item.Id, { type: 'Primary', tag, maxWidth: 160 }) : ''),
        badge: item.UserData && item.UserData.Played ? 'Watched' : '',
        href: '#/details?id=' + encodeURIComponent(item.Id) + '&serverId=' + encodeURIComponent(item.ServerId || client.serverId())
      };
    }
    function seerrEntry(result) {
      const year = (result.releaseDate || result.firstAirDate || '').slice(0, 4);
      const status = result.mediaInfo && result.mediaInfo.status;
      return {
        kind: 'seerr', result,
        title: result.title || result.name || '',
        meta: [result.mediaType === 'tv' ? 'Show' : 'Film', year].filter(Boolean).join(' · '),
        rating: result.voteAverage,
        thumb: result.backdropPath ? TMDB_IMG + 'w300' + result.backdropPath : (result.posterPath ? TMDB_IMG + 'w154' + result.posterPath : ''),
        badge: status === 2 || status === 3 ? 'Requested' : status === 4 ? 'Partly here' : 'Request'
      };
    }

    function renderResults(term, library, requests) {
      state.items = [];
      const list = el('div', 'cn-search-list');
      list.setAttribute('role', 'listbox');
      list.setAttribute('aria-label', 'Search results');
      const group = (label, entries) => {
        if (!entries.length) return;
        const head = el('h2', 'cn-search-h');
        head.append(label, el('span', '', String(entries.length)));
        list.append(head);
        entries.forEach((entry) => {
          const index = state.items.length;
          state.items.push(entry);
          const row = el('button', 'cn-search-row');
          row.type = 'button';
          row.setAttribute('role', 'option');
          const th = el('span', 'cn-search-th');
          if (entry.thumb) { const img = el('img'); img.alt = ''; img.loading = 'lazy'; img.src = entry.thumb; th.append(img); }
          const text = el('span', 'cn-search-text');
          text.append(el('b', '', entry.title));
          const meta = el('span', 'cn-search-meta', entry.meta);
          if (entry.rating) { const star = el('span', 'cn-search-star'); star.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.3 5.9 20.7l1.5-6.7L2.3 9.4l6.8-.7z"/></svg>'; star.append(Number(entry.rating).toFixed(1)); meta.append(star); }
          text.append(meta);
          row.append(th, text);
          if (entry.badge) row.append(el('span', 'cn-search-badge' + (entry.kind === 'seerr' ? ' is-request' : ' is-own'), entry.badge));
          row.addEventListener('mouseenter', () => focusRow(index, false));
          row.addEventListener('focus', () => focusRow(index, false));
          row.addEventListener('click', () => activate(index));
          list.append(row);
          state.rows[index] = row;
        });
      };
      state.rows = [];
      group('In your library', library);
      group('Request on Jellyseerr', requests);
      const pane = el('div', 'cn-search-pane');
      state.preview = pane;
      if (!state.items.length) {
        body.replaceChildren(el('p', 'cn-search-none', 'Nothing found for “' + term + '”. Check the spelling, or try a shorter search.'));
        return;
      }
      body.replaceChildren(list, pane);
      focusRow(0, false);
    }

    function focusRow(index, scroll) {
      if (index < 0 || index >= state.items.length) return;
      state.index = index;
      state.rows.forEach((row, i) => row.setAttribute('aria-selected', String(i === index)));
      if (scroll) state.rows[index].scrollIntoView({ block: 'nearest' });
      paintPreview(state.items[index]);
    }

    function paintPreview(entry) {
      const pane = state.preview;
      if (!pane) return;
      const backImg = el('img', 'cn-search-back');
      backImg.alt = '';
      const shade = el('span', 'cn-search-shade');
      const info = el('div', 'cn-search-info');
      const acts = el('div', 'cn-search-acts');
      if (entry.kind === 'library') {
        const item = entry.item;
        const backUrl = artwork(client, item, 'Backdrop') || ((item.ImageTags || {}).Primary ? client.getImageUrl(item.Id, { type: 'Primary', tag: item.ImageTags.Primary, maxWidth: 900 }) : '');
        if (backUrl) backImg.src = backUrl;
        const title = el('h3', 'cn-search-title', entry.title);
        const logoUrl = item.Type !== 'Person' ? artwork(client, item, 'Logo') : '';
        if (logoUrl) { const logo = el('img'); logo.alt = entry.title; logo.addEventListener('error', () => { title.textContent = entry.title; }); logo.src = logoUrl; title.replaceChildren(logo); }
        info.append(title);
        if (item.Type !== 'Person') {
          client.getItem(userId, item.Id).then((full) => {
            if (state.preview !== pane || state.items[state.index] !== entry) return;
            const tagline = (full.Taglines || [])[0];
            const facts = buildFacts(full, []);
            const parts = [];
            if (tagline) parts.push(el('p', 'cn-search-tag', tagline));
            parts.push(facts);
            if (full.Overview) parts.push(el('p', 'cn-search-over', full.Overview));
            title.after(...parts);
          }).catch(() => {});
        }
        const playable = item.Type === 'Movie' || item.Type === 'Episode';
        const holder = el('div');
        holder.innerHTML = '<div is="emby-itemscontainer" class="cn-search-actrow itemsContainer" data-contextmenu="false" data-multiselect="false"></div>';
        const row = holder.firstElementChild;
        if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(row);
        if (playable) {
          const play = el('button', 'cn-shelf-play itemAction');
          play.type = 'button';
          play.dataset.action = 'play'; play.dataset.id = item.Id; play.dataset.serverid = item.ServerId || client.serverId();
          play.dataset.type = item.Type; play.dataset.mediatype = item.MediaType || 'Video'; play.dataset.isfolder = 'false';
          play.innerHTML = icon('play'); play.append('Play');
          const more = el('a', 'cn-shelf-more'); more.href = entry.href; more.innerHTML = icon('info'); more.append('Details');
          row.append(play, more);
        } else {
          const open = el('a', 'cn-shelf-play'); open.href = entry.href; open.innerHTML = icon('info'); open.append('Open');
          row.append(open);
        }
        acts.append(row);
      } else {
        const result = entry.result;
        if (result.backdropPath) backImg.src = TMDB_IMG + 'w1280' + result.backdropPath;
        info.append(el('h3', 'cn-search-title', entry.title));
        const facts = el('div', 'cn-dh-facts');
        if (result.voteAverage) { const score = el('span'); score.append(el('span', 'cn-star', '★ '), Number(result.voteAverage).toFixed(1)); facts.append(score); }
        entry.meta.split(' · ').forEach((part) => facts.append(el('span', '', part)));
        info.append(facts);
        if (result.overview) info.append(el('p', 'cn-search-over', result.overview));
        const req = el('button', 'cn-shelf-play', entry.badge === 'Request' ? 'Request' : 'View request');
        req.type = 'button';
        req.addEventListener('click', () => seerr.jellyseerrMoreInfo.open(result.id, result.mediaType));
        acts.append(req);
        info.append(el('p', 'cn-search-note', 'Not in your library yet · via Jellyseerr'));
      }
      backImg.addEventListener('load', () => { backImg.dataset.loaded = 'true'; });
      info.append(acts);
      pane.replaceChildren(backImg, shade, info);
    }

    function activate(index) {
      const entry = state.items[index];
      if (!entry) return;
      rememberSearch(input.value);
      if (entry.kind === 'library') {
        const play = state.preview && state.preview.querySelector('button.cn-shelf-play.itemAction');
        if (play && state.index === index && document.activeElement === input) play.click(); else location.hash = entry.href;
      } else {
        seerr.jellyseerrMoreInfo.open(entry.result.id, entry.result.mediaType);
      }
    }

    function runSearch() {
      const term = input.value.trim();
      clearTimeout(state.timer);
      try { history.replaceState(history.state, '', '#/search' + (term ? '?query=' + encodeURIComponent(term) : '')); } catch (error) { /* ignore */ }
      if (term.length < 2) { showEmpty(); return; }
      const seq = ++state.seq;
      body.classList.add('is-loading');
      const libraryCall = client.getItems(userId, { SearchTerm: term, Recursive: true, IncludeItemTypes: 'Movie,Series,BoxSet', Limit: 14, Fields: 'PrimaryImageAspectRatio' })
        .then((result) => result.Items || []).catch(() => []);
      const peopleCall = client.getJSON(client.getUrl('Persons', { searchTerm: term, limit: 4, userId })).then((result) => (result.Items || [])).catch(() => []);
      const seerrCall = seerr ? seerr.jellyseerrAPI.search(term).then((result) => ((result && result.results) || []).filter((r) => (r.mediaType === 'movie' || r.mediaType === 'tv') && !(r.mediaInfo && r.mediaInfo.status === 5)).slice(0, 10)).catch(() => []) : Promise.resolve([]);
      Promise.all([libraryCall, peopleCall, seerrCall]).then(([library, people, requests]) => {
        if (seq !== state.seq || searchState !== state) return;
        body.classList.remove('is-loading');
        renderResults(term, library.concat(people).map(libraryEntry), requests.map(seerrEntry));
        clearTimeout(state.saveTimer);
        state.saveTimer = setTimeout(() => { if (input.value.trim() === term) rememberSearch(term); }, 1500);
      });
    }

    input.addEventListener('input', () => { clearTimeout(state.timer); state.timer = setTimeout(runSearch, 260); });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); focusRow(Math.min(state.items.length - 1, state.index + 1), true); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); focusRow(Math.max(0, state.index - 1), true); }
      else if (event.key === 'Enter') { event.preventDefault(); if (state.index >= 0) activate(state.index); else runSearch(); }
      else if (event.key === 'Escape') { input.value = ''; runSearch(); }
    });
    clear.addEventListener('click', () => { input.value = ''; runSearch(); input.focus(); });

    input.value = searchQueryFromHash();
    runSearch();
    setTimeout(() => input.focus({ preventScroll: true }), 0);
  }

  setInterval(mountSearch, 700);

  /* ---- Settings page: everything on one page ---- */
  // The full settings page shows the everyday settings as live controls that save as you change them;
  // rarer options link to Jellyfin's own pages. Stock page children are hidden, not removed.
  let prefsState = null;

  function teardownPrefs() {
    if (!prefsState) return;
    const s = prefsState;
    prefsState = null;
    s.cleanup();
    s.node.remove();
    delete s.page.dataset.cnPrefs;
  }

  function mountPrefs() {
    const page = document.querySelector('#myPreferencesMenuPage:not(.hide)');
    if (!page || !/^#!?\/mypreferencesmenu/.test(location.hash)) { teardownPrefs(); return; }
    if (prefsState && prefsState.page === page && prefsState.node.isConnected) return;
    teardownPrefs();
    const client = window.ApiClient;
    if (!client || !client.getCurrentUserId()) return;
    const userId = client.getCurrentUserId();
    const node = el('div', 'cn-prefs');
    node.append(el('p', 'cn-prefs-loading', 'Loading your settings…'));
    page.prepend(node);
    page.dataset.cnPrefs = 'true';
    const state = { page, node, cleanup: () => {} };
    prefsState = state;

    client.getUser(userId).then((user) => {
      if (prefsState !== state) return;
      const config = Object.assign({}, user.Configuration || {});
      const isAdmin = Boolean(user.Policy && user.Policy.IsAdministrator);
      const uid = encodeURIComponent(user.Id);
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const status = el('p', 'cn-prefs-status');
      const statusText = el('span');
      statusText.setAttribute('role', 'status');
      status.append(statusText);
      let statusTimer = 0;
      function save(apply) {
        const next = Object.assign({}, config);
        apply(next);
        return client.updateUserConfiguration(userId, next).then(() => {
          Object.assign(config, next);
          clearTimeout(statusTimer);
          status.className = 'cn-prefs-status is-saved';
          statusText.innerHTML = QS_ICONS.tick;
          statusText.append('Saved');
          statusTimer = setTimeout(() => { status.className = 'cn-prefs-status'; }, 3000);
        }).catch(() => {
          clearTimeout(statusTimer);
          status.className = 'cn-prefs-status is-error';
          statusText.textContent = 'Could not save. Check your connection and try again.';
          statusTimer = setTimeout(() => { status.className = 'cn-prefs-status'; }, 6000);
        });
      }

      function text(label, hint) {
        const box = el('div', 'cn-prefs-text');
        box.append(el('b', '', label));
        if (hint) box.append(el('span', '', hint));
        return box;
      }

      function switchRow(label, hint, get, set) {
        const row = el('div', 'cn-prefs-row');
        const sw = el('button', 'cn-prefs-sw');
        sw.type = 'button';
        sw.setAttribute('role', 'switch');
        sw.setAttribute('aria-label', label);
        const paint = () => sw.setAttribute('aria-checked', String(get()));
        sw.addEventListener('click', () => {
          const on = !get();
          sw.disabled = true;
          sw.setAttribute('aria-checked', String(on));
          save((next) => set(next, on)).then(() => { sw.disabled = false; paint(); });
        });
        paint();
        row.append(text(label, hint), sw);
        return row;
      }

      function segRow(label, hint, options, get, set) {
        const current = get();
        if (!options.some((o) => o.value === current)) options = [{ label: current ? String(current).toUpperCase() : 'Default', value: current }].concat(options);
        const row = el('div', 'cn-prefs-row');
        const seg = el('div', 'cn-prefs-seg');
        seg.setAttribute('role', 'radiogroup');
        seg.setAttribute('aria-label', label);
        const buttons = options.map((option) => {
          const b = el('button', '', option.label);
          b.type = 'button';
          b.setAttribute('role', 'radio');
          b.addEventListener('click', () => {
            if (get() === option.value) return;
            buttons.forEach((x, i) => x.setAttribute('aria-checked', String(i === buttons.indexOf(b))));
            seg.setAttribute('aria-busy', 'true');
            save((next) => set(next, option.value)).then(() => { seg.removeAttribute('aria-busy'); paint(); });
          });
          return b;
        });
        const paint = () => buttons.forEach((b, i) => b.setAttribute('aria-checked', String(options[i].value === get())));
        paint();
        seg.append(...buttons);
        row.append(text(label, hint), seg);
        return row;
      }

      function linkRow(label, hint, target) {
        const row = el(typeof target === 'string' ? 'a' : 'button', 'cn-prefs-row is-link');
        if (typeof target === 'string') row.href = target; else { row.type = 'button'; row.addEventListener('click', target); }
        const chev = el('span', 'cn-prefs-chev');
        chev.innerHTML = QS_ICONS.chevron;
        row.append(text(label, hint), chev);
        return row;
      }

      const sections = [];
      function section(id, title, rows) {
        const sec = el('section', 'cn-prefs-sec');
        sec.id = 'cn-prefs-' + id;
        const h = el('h2', '', title);
        h.id = 'cn-prefs-h-' + id;
        sec.setAttribute('aria-labelledby', h.id);
        const card = el('div', 'cn-prefs-card');
        card.append(...rows.filter(Boolean));
        sec.append(h, card);
        sections.push({ id, title, sec });
        return sec;
      }

      // Profile
      const me = el('div', 'cn-prefs-row cn-prefs-me');
      const avatar = el('span', 'cn-prefs-avatar');
      if (user.PrimaryImageTag) {
        const img = el('img');
        img.alt = '';
        img.src = client.getUserImageUrl(user.Id, { tag: user.PrimaryImageTag, type: 'Primary', height: 160 });
        avatar.append(img);
      } else {
        avatar.textContent = (user.Name || '?').charAt(0).toUpperCase();
      }
      const edit = el('a', 'cn-prefs-pill', 'Change picture or password');
      edit.href = '#/userprofile?userId=' + uid;
      me.append(avatar, text(user.Name || '', isAdmin ? 'Administrator' : 'Member'), edit);
      const qc = page.querySelector('.lnkQuickConnectPreferences:not(.hide)');
      const lang = [{ label: 'English', value: 'eng' }, { label: 'Any', value: '' }];

      const main = el('div', 'cn-prefs-main');
      main.append(
        section('profile', 'Profile', [me, qc ? linkRow('Quick Connect', 'Sign in on a TV with a code', qc.getAttribute('href') || '#/quickconnect') : null]),
        section('playback', 'Playback', [
          segRow('Audio language', 'Used when a film has more than one track', lang.slice(), () => config.AudioLanguagePreference || '', (next, v) => { next.AudioLanguagePreference = v; }),
          switchRow('Play the default audio track', 'Even if it isn’t in your language', () => config.PlayDefaultAudioTrack !== false, (next, on) => { next.PlayDefaultAudioTrack = on; }),
          switchRow('Autoplay next episode', '', () => config.EnableNextEpisodeAutoPlay !== false, (next, on) => { next.EnableNextEpisodeAutoPlay = on; }),
          switchRow('Remember audio choices', 'Keep the track you picked for the rest of a series', () => Boolean(config.RememberAudioSelections), (next, on) => { next.RememberAudioSelections = on; }),
          linkRow('Quality, cinema mode and more', '', '#/mypreferencesplayback?userId=' + uid)
        ]),
        section('subtitles', 'Subtitles', [
          segRow('When to show subtitles', 'Smart shows them when the audio isn’t in your language', [
            { label: 'Off', value: 'None' }, { label: 'Forced only', value: 'OnlyForced' }, { label: 'Smart', value: 'Smart' }, { label: 'Always', value: 'Always' }
          ], () => config.SubtitleMode || 'Default', (next, v) => { next.SubtitleMode = v; }),
          segRow('Subtitle language', '', lang.slice(), () => config.SubtitleLanguagePreference || '', (next, v) => { next.SubtitleLanguagePreference = v; }),
          switchRow('Remember subtitle choices', '', () => Boolean(config.RememberSubtitleSelections), (next, on) => { next.RememberSubtitleSelections = on; }),
          linkRow('Subtitle size and style', '', '#/mypreferencessubtitles?userId=' + uid)
        ]),
        section('home', 'Home', [
          switchRow('Hide watched in Latest', '', () => Boolean(config.HidePlayedInLatest), (next, on) => { next.HidePlayedInLatest = on; }),
          switchRow('Show missing episodes', 'List episodes you don’t have inside seasons', () => Boolean(config.DisplayMissingEpisodes), (next, on) => { next.DisplayMissingEpisodes = on; }),
          linkRow('Home sections and library order', '', '#/mypreferenceshome?userId=' + uid)
        ])
      );
      const enhanced = [...page.querySelectorAll('a.listItem-border')].find((a) => /Jellyfin Enhanced/i.test(a.textContent));
      main.append(section('more', 'Display and more', [
        linkRow('Display', 'Language, theme, backdrops and screensaver on this device', '#/mypreferencesdisplay?userId=' + uid),
        linkRow('Controls', 'Keyboard and remote shortcuts', '#/mypreferencescontrols?userId=' + uid),
        enhanced ? linkRow('Jellyfin Enhanced', 'Reviews, watchlist, requests and shortcuts', () => enhanced.click()) : null
      ]));

      // Side index
      const side = el('aside', 'cn-prefs-side');
      const who = el('div', 'cn-prefs-who');
      const small = avatar.cloneNode(true);
      small.className = 'cn-prefs-avatar is-small';
      const id = el('div');
      id.append(el('b', '', user.Name || ''), el('span', '', isAdmin ? 'Administrator' : 'Member'));
      who.append(small, id);
      const index = el('nav', 'cn-prefs-index');
      index.setAttribute('aria-label', 'Settings sections');
      const links = sections.map((s) => {
        const a = el('a', '', s.title);
        a.href = '#' + s.sec.id;
        a.addEventListener('click', (event) => {
          event.preventDefault();
          s.sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          const first = s.sec.querySelector('button, a');
          if (first) setTimeout(() => first.focus({ preventScroll: true }), reduce ? 0 : 400);
        });
        return a;
      });
      index.append(...links);
      if (isAdmin) {
        index.append(el('hr'));
        [['Dashboard', '#/dashboard'], ['Metadata Manager', '#/metadata']].forEach(([label, href]) => { const a = el('a', '', label); a.href = href; index.append(a); });
      }
      index.append(el('hr'));
      const out = el('button', 'cn-prefs-out', 'Sign out');
      out.type = 'button';
      out.addEventListener('click', () => {
        const stock = page.querySelector('.btnLogout');
        if (stock) stock.click(); else if (window.Dashboard && window.Dashboard.logout) window.Dashboard.logout();
      });
      index.append(out);
      side.append(who, index, status);
      node.replaceChildren(side, main);

      // Highlight the section in view
      const mark = (sid) => links.forEach((a, i) => { if (sections[i].id === sid) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      mark(sections[0].id);
      let spyFrame = 0;
      const spy = () => {
        cancelAnimationFrame(spyFrame);
        spyFrame = requestAnimationFrame(() => {
          const doc = document.scrollingElement || document.documentElement;
          if (doc.scrollTop + window.innerHeight >= doc.scrollHeight - 4) { mark(sections[sections.length - 1].id); return; }
          let current = sections[0].id;
          sections.forEach((s) => { if (s.sec.getBoundingClientRect().top <= 140) current = s.id; });
          mark(current);
        });
      };
      window.addEventListener('scroll', spy, { passive: true });
      spy();
      state.cleanup = () => { clearTimeout(statusTimer); cancelAnimationFrame(spyFrame); window.removeEventListener('scroll', spy); };
    }).catch(() => {
      if (prefsState !== state) return;
      teardownPrefs();
    });
  }

  setInterval(mountPrefs, 700);

  /* ---- Watchlist tab: ready to watch ---- */
  // Restyles the watchlist plugin's tab. Its own Watchlist panel is hidden (not removed) and replaced by
  // three rows: shows with episodes waiting, films, then shows you are up to date on. The other plugin
  // panels (Series progress, Movie history, Statistics) are untouched apart from the tab switcher.
  let wlState = null;
  const WL_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function wlPanel(sec) {
    return [...sec.children].find((child) => child.querySelector(':scope > .watchlist-header'));
  }

  function wlRemoveButton(client, item, onRemoved) {
    const button = el('button', 'cn-wlp-mark');
    button.type = 'button';
    button.innerHTML = icon('bookmarked');
    button.title = 'Remove from watchlist';
    button.setAttribute('aria-label', 'Remove ' + (item.Name || '') + ' from watchlist');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.disabled = true;
      client.ajax({ type: 'DELETE', url: client.getUrl('UserItems/' + item.Id + '/Rating', { userId: client.getCurrentUserId() }) })
        .then(() => onRemoved())
        .catch((error) => { console.warn('[Crimson Noir] Watchlist update failed:', error); button.disabled = false; });
    });
    return button;
  }

  function wlPlayButton(client, item) {
    const holder = el('div');
    holder.innerHTML = '<div is="emby-itemscontainer" class="cn-wlp-acts itemsContainer" data-contextmenu="false" data-multiselect="false"></div>';
    const acts = holder.firstElementChild;
    if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(acts);
    const position = (item.UserData && item.UserData.PlaybackPositionTicks) || 0;
    const play = el('button', 'cn-wlp-play itemAction');
    play.type = 'button';
    play.dataset.action = position > 0 ? 'resume' : 'play';
    play.dataset.id = item.Id;
    play.dataset.serverid = item.ServerId || client.serverId();
    play.dataset.type = item.Type;
    if (item.IsFolder) play.dataset.isfolder = 'true';
    else { play.dataset.mediatype = item.MediaType || 'Video'; play.dataset.isfolder = 'false'; }
    if (position > 0) play.dataset.positionticks = String(position);
    play.innerHTML = icon('play');
    play.setAttribute('aria-label', (position > 0 ? 'Resume ' : 'Play ') + (item.Name || ''));
    play.title = position > 0 ? 'Resume' : 'Play';
    acts.append(play);
    return acts;
  }

  function wlCard(client, item, wide, onRemoved) {
    const card = el('div', wide ? 'cn-wlp-card is-wide' : 'cn-wlp-card');
    const link = el('a', 'cn-wlp-link');
    link.href = '#/details?id=' + encodeURIComponent(item.Id) + '&serverId=' + encodeURIComponent(item.ServerId || client.serverId());
    link.setAttribute('aria-label', item.Name || '');
    const art = el('div', 'cn-wlp-art');
    jeTagTarget(art, item.Id);
    const tags = item.ImageTags || {};
    let src = '';
    if (wide) {
      const back = (item.BackdropImageTags || [])[0];
      if (back) src = client.getImageUrl(item.Id, { type: 'Backdrop', index: 0, tag: back, maxWidth: 720, quality: 85 });
      else if (tags.Thumb) src = client.getImageUrl(item.Id, { type: 'Thumb', tag: tags.Thumb, maxWidth: 720, quality: 85 });
    } else if (tags.Primary) {
      src = client.getImageUrl(item.Id, { type: 'Primary', tag: tags.Primary, maxHeight: 480, quality: 90 });
    }
    if (src) {
      const img = el('img', 'cn-wlp-img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = src;
      art.append(img);
    } else {
      art.append(el('span', 'cn-wlp-fallback', item.Name || ''));
    }
    if (wide) {
      const name = el('div', 'cn-wlp-name');
      if (tags.Logo) {
        const logo = el('img');
        logo.alt = item.Name || '';
        logo.loading = 'lazy';
        logo.addEventListener('error', () => { name.textContent = item.Name || ''; });
        logo.src = client.getImageUrl(item.Id, { type: 'Logo', tag: tags.Logo, maxWidth: 360 });
        name.append(logo);
      } else {
        name.textContent = item.Name || '';
      }
      art.append(name);
      const left = (item.UserData && item.UserData.UnplayedItemCount) || 0;
      if (left) art.append(el('span', 'cn-wlp-count', left + (left === 1 ? ' episode' : ' episodes')));
    }
    const setDone = setWatched(item);
    const pct = setDone ? (setDone.watched / setDone.total) * 100 : (item.UserData && item.UserData.PlayedPercentage) || 0;
    if (pct > 0 && pct < 100) {
      const bar = el('span', 'cn-wlp-progress');
      const fill = el('i');
      fill.style.width = Math.round(pct) + '%';
      bar.append(fill);
      art.append(bar);
    }
    link.append(art);
    const caption = el('div', 'cn-wlp-cap');
    if (!wide) caption.append(el('b', '', item.Name || ''));
    const meta = el('span', 'cn-wlp-meta');
    if (item.CommunityRating && !wide) {
      const star = el('span', 'cn-wlp-star');
      star.innerHTML = SHELF_STAR;
      meta.append(star, Number(item.CommunityRating).toFixed(1));
    }
    const bits = [];
    if (wide && (item.Genres || []).length) bits.push(item.Genres.slice(0, 2).join(', '));
    if (item.ProductionYear) bits.push(String(item.ProductionYear));
    if (item.Type === 'Movie' && runtime(item.RunTimeTicks)) bits.push(runtime(item.RunTimeTicks));
    if (item.Type === 'BoxSet' && item.ChildCount) {
      bits.push(setDone && setDone.watched > 0 && setDone.watched < setDone.total
        ? setDone.watched + ' of ' + setDone.total + ' watched'
        : item.ChildCount + (item.ChildCount === 1 ? ' title' : ' titles'));
    }
    if (bits.length) meta.append((meta.childNodes.length ? ' · ' : '') + bits.join(' · '));
    caption.append(meta);
    link.append(caption);
    card.append(link);
    const tools = el('div', 'cn-wlp-tools');
    if (item.Type === 'Movie' || item.Type === 'BoxSet' || (item.Type === 'Series' && wide)) {
      // Play sits in the middle of the art, like the Movies page. Box sets play their films in order;
      // shows play your next episode (Next Up, else the first unwatched one).
      const stage = el('div', 'cn-wlp-stage');
      const acts = wlPlayButton(client, item);
      stage.append(acts);
      card.append(stage);
      if (item.Type === 'Series') {
        const play = acts.querySelector('.cn-wlp-play');
        play.hidden = true;
        const userId = client.getCurrentUserId();
        client.getJSON(client.getUrl('Shows/NextUp', { SeriesId: item.Id, UserId: userId, Limit: 1, EnableResumable: true, EnableRewatching: false, Fields: 'UserData' }))
          .then((result) => (result.Items || [])[0] || client.getItems(userId, { ParentId: item.Id, Recursive: true, IncludeItemTypes: 'Episode', IsPlayed: false, IsMissing: false, SortBy: 'ParentIndexNumber,IndexNumber', SortOrder: 'Ascending', Limit: 1, Fields: 'UserData' }).then((r) => (r.Items || [])[0]))
          .then((ep) => {
            if (!ep) return;
            const position = (ep.UserData && ep.UserData.PlaybackPositionTicks) || 0;
            play.dataset.id = ep.Id;
            play.dataset.type = 'Episode';
            play.dataset.mediatype = ep.MediaType || 'Video';
            play.dataset.isfolder = 'false';
            play.dataset.action = position > 0 ? 'resume' : 'play';
            if (position > 0) play.dataset.positionticks = String(position); else delete play.dataset.positionticks;
            const label = (position > 0 ? 'Resume ' : 'Play ') + (ep.IndexNumber != null ? 'S' + (ep.ParentIndexNumber || 0) + ':E' + ep.IndexNumber + ' ' : '') + (ep.Name || '');
            play.setAttribute('aria-label', label);
            play.title = label;
            play.hidden = false;
          })
          .catch(() => {});
      }
    }
    tools.append(wlRemoveButton(client, item, () => onRemoved(card, item)));
    card.append(tools);
    return card;
  }

  function wlRow(title, hint, cards) {
    const section = el('section', 'cn-wlp-row');
    const head = el('div', 'cn-wlp-row-head');
    const h = el('h2', '', title);
    if (hint) h.append(el('span', '', hint));
    const nav = el('div', 'cn-wlp-arrows');
    const prev = el('button', 'cn-wlp-arrow is-prev');
    prev.type = 'button';
    prev.innerHTML = WL_ARROW;
    prev.setAttribute('aria-label', 'Scroll ' + title + ' back');
    const next = el('button', 'cn-wlp-arrow');
    next.type = 'button';
    next.innerHTML = WL_ARROW;
    next.setAttribute('aria-label', 'Scroll ' + title + ' forward');
    nav.append(prev, next);
    head.append(h, nav);
    const track = el('div', 'cn-wlp-track');
    track.append(...cards);
    const sync = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.85, behavior: smooth ? 'smooth' : 'auto' }));
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.85, behavior: smooth ? 'smooth' : 'auto' }));
    track.addEventListener('scroll', sync, { passive: true });
    requestAnimationFrame(sync);
    section.append(head, track);
    section.syncArrows = sync;
    return section;
  }

  function renderWatchlist(state) {
    const client = window.ApiClient;
    const seq = ++state.seq;
    if (!state.loaded) state.body.replaceChildren(el('p', 'cn-wlp-note', 'Loading your watchlist…'));
    const userId = client.getCurrentUserId();
    const base = { Filters: 'Likes', Recursive: true, Fields: 'Genres,UserData,ChildCount', EnableImageTypes: 'Primary,Backdrop,Thumb,Logo', ImageTypeLimit: 1 };
    Promise.all([
      client.getItems(userId, Object.assign({}, base, { IncludeItemTypes: 'Series', SortBy: 'DateLastContentAdded,SortName', SortOrder: 'Descending' })),
      client.getItems(userId, Object.assign({}, base, { IncludeItemTypes: 'Movie', SortBy: 'PremiereDate,SortName', SortOrder: 'Descending' })),
      client.getItems(userId, Object.assign({}, base, { IncludeItemTypes: 'BoxSet', SortBy: 'SortName', SortOrder: 'Ascending' })).catch(() => ({ Items: [] }))
    ]).then(([showsResult, filmsResult, setsResult]) => {
      if (seq !== state.seq || wlState !== state) return;
      state.loaded = true;
      const shows = showsResult.Items || [];
      const films = filmsResult.Items || [];
      const sets = setsResult.Items || [];
      const waiting = shows.filter((s) => (s.UserData && s.UserData.UnplayedItemCount) > 0);
      const done = shows.filter((s) => !((s.UserData && s.UserData.UnplayedItemCount) > 0));
      const counts = { films: films.length, shows: shows.length, sets: sets.length };
      const paintCount = () => {
        const parts = [];
        if (counts.films) parts.push(counts.films + (counts.films === 1 ? ' film' : ' films'));
        if (counts.shows) parts.push(counts.shows + (counts.shows === 1 ? ' show' : ' shows'));
        if (counts.sets) parts.push(counts.sets + (counts.sets === 1 ? ' box set' : ' box sets'));
        state.count.textContent = parts.join(' · ');
      };
      paintCount();
      const removed = (card, item) => {
        if (item.Type === 'Movie') counts.films -= 1; else if (item.Type === 'BoxSet') counts.sets -= 1; else counts.shows -= 1;
        paintCount();
        const row = card.closest('.cn-wlp-row');
        card.classList.add('is-leaving');
        setTimeout(() => {
          card.remove();
          if (row && !row.querySelector('.cn-wlp-card')) row.remove();
          else if (row && row.syncArrows) row.syncArrows();
          if (!state.body.querySelector('.cn-wlp-card')) showEmpty();
        }, 220);
      };
      const showEmpty = () => {
        const empty = el('div', 'cn-wlp-empty');
        empty.append(el('b', '', 'Your watchlist is empty'), el('span', '', 'Use the bookmark button on any film, show or box set to save it here.'));
        state.body.replaceChildren(empty);
      };
      const rows = [];
      if (waiting.length) rows.push(wlRow('Episodes to watch', 'Shows with episodes you haven’t seen', waiting.map((s) => wlCard(client, s, true, removed))));
      if (films.length) rows.push(wlRow('Films', 'Newest releases first', films.map((f) => wlCard(client, f, false, removed))));
      if (sets.length) rows.push(wlRow('Box sets', 'Collections you’ve saved', sets.map((b) => wlCard(client, b, false, removed))));
      if (done.length) rows.push(wlRow('Up to date', 'Shows you’ve watched everything in', done.map((s) => wlCard(client, s, false, removed))));
      if (rows.length) state.body.replaceChildren(...rows); else showEmpty();
    }).catch((error) => {
      if (seq !== state.seq || wlState !== state) return;
      console.warn('[Crimson Noir] Watchlist failed:', error);
      const note = el('div', 'cn-wlp-empty');
      const retry = el('button', 'cn-wlp-retry', 'Try again');
      retry.type = 'button';
      retry.addEventListener('click', () => renderWatchlist(state));
      note.append(el('b', '', 'Couldn’t load your watchlist'), el('span', '', 'Check your connection, then try again.'), retry);
      state.body.replaceChildren(note);
    });
  }

  function mountWatchlist() {
    const sec = document.querySelector('.sections.watchlist');
    const client = window.ApiClient;
    if (!sec || !sec.offsetParent || !client || !client.getCurrentUserId()) {
      if (wlState && wlState.sec && !document.contains(wlState.sec)) wlState = null;
      if (wlState) wlState.visible = false;
      return;
    }
    const panel = wlPanel(sec);
    if (!panel) {
      // After a full page reload the watchlist plugin sometimes leaves its tab empty; one hashchange makes it render.
      if (!sec.children.length && sec.dataset.cnWlNudged !== 'true') {
        if (!sec.dataset.cnWlEmptySince) sec.dataset.cnWlEmptySince = String(Date.now());
        else if (Date.now() - Number(sec.dataset.cnWlEmptySince) > 2000) {
          sec.dataset.cnWlNudged = 'true';
          window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL: location.href, newURL: location.href }));
        }
      }
      return;
    }
    if (!wlState || wlState.sec !== sec || !wlState.node.isConnected || !wlState.head.isConnected) {
      if (wlState) { wlState.node.remove(); wlState.head.remove(); }
      const head = el('div', 'cn-wlp-head');
      const h1 = el('h1', '', 'Watchlist');
      const count = el('p', 'cn-wlp-count-all');
      head.append(h1, count);
      sec.prepend(head);
      sec.dataset.cnWl = 'true';
      const node = el('div', 'cn-wlp');
      const body = el('div', 'cn-wlp-body');
      node.append(body);
      panel.prepend(node);
      panel.dataset.cnWlPanel = 'true';
      wlState = { sec, panel, head, node, body, count, seq: 0, loaded: false, visible: false };
    }
    const showing = getComputedStyle(panel).display !== 'none';
    if (showing && !wlState.visible) renderWatchlist(wlState);
    wlState.visible = showing;
  }

  setInterval(mountWatchlist, 600);

  /* ---- Finish time: "Ends at" on detail pages and in the player ---- */
  const CLOCK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function clockTime(date) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  // Movies and episodes use their own length (minus anything already watched); shows and seasons use the next episode.
  function buildEndsAt(client, item) {
    const kinds = ['Movie', 'Episode', 'Series', 'Season'];
    if (!kinds.includes(item.Type)) return null;
    const line = el('p', 'cn-dh-ends');
    line.hidden = true;
    let target = null;
    let timer = 0;
    const paint = () => {
      if (timer && !line.isConnected) { clearInterval(timer); return; }
      if (!target) return;
      const data = target.UserData || {};
      const left = Math.max(0, (target.RunTimeTicks || 0) - (data.PlaybackPositionTicks || 0));
      if (!left) { line.hidden = true; return; }
      const finish = new Date(Date.now() + left / 10000);
      const label = item.Type === 'Series' || item.Type === 'Season'
        ? 'S' + (target.ParentIndexNumber || 0) + ':E' + (target.IndexNumber || 0) + ' ends at ' + clockTime(finish)
        : 'Ends at ' + clockTime(finish);
      const mins = Math.round(left / 600000000);
      const resumed = (data.PlaybackPositionTicks || 0) > 0;
      line.innerHTML = CLOCK_ICON;
      line.append(label);
      if (resumed && mins) line.append(el('span', '', (mins >= 60 ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm' : mins + 'm') + ' left'));
      line.hidden = false;
    };
    const start = (found) => {
      if (!found || !found.RunTimeTicks) return;
      target = found;
      paint();
      timer = setInterval(paint, 30000);
    };
    if (item.Type === 'Movie' || item.Type === 'Episode') {
      start(item);
    } else {
      const userId = client.getCurrentUserId();
      const seriesId = item.Type === 'Series' ? item.Id : item.SeriesId;
      const fromSeason = () => client.getItems(userId, { ParentId: item.Id, Recursive: true, IncludeItemTypes: 'Episode', IsPlayed: false, SortBy: 'ParentIndexNumber,IndexNumber', SortOrder: 'Ascending', Limit: 1, Fields: 'UserData' })
        .then((result) => (result.Items || [])[0]);
      const nextUp = item.Type === 'Series'
        ? client.getJSON(client.getUrl('Shows/NextUp', { SeriesId: seriesId, UserId: userId, Limit: 1, Fields: 'UserData', EnableResumable: true, EnableRewatching: false }))
            .then((result) => (result.Items || [])[0] || fromSeason())
        : fromSeason();
      nextUp.then(start).catch(() => {});
    }
    return line;
  }

  // Player: Jellyfin already works out the finish time (it lives in the hidden .osdTimeText); show it under the title.
  function syncOsdEnds() {
    const page = document.querySelector('#videoOsdPage:not(.hide)');
    if (!page) return;
    const source = page.querySelector('.endsAtText');
    const host = page.querySelector('.cn-osd-title');
    if (!host) return;
    let line = host.querySelector('.cn-osd-ends');
    const text = source ? source.textContent.replace(/^[\s -]+/, '').trim() : '';
    if (!text) { if (line) line.hidden = true; return; }
    if (!line) {
      line = el('span', 'cn-osd-ends');
      host.append(line);
    }
    if (line.dataset.text !== text) {
      line.dataset.text = text;
      line.innerHTML = CLOCK_ICON;
      line.append(text);
    }
    line.hidden = false;
  }

  setInterval(syncOsdEnds, 1000);

  /* ---- Requests page: list and detail ---- */
  // Replaces the look of Jellyfin Enhanced's Requests page (#je-downloads-page). Its own content is hidden, not
  // removed; data and actions go through the same plugin endpoints it uses (/arr/requests, /arr/queue).
  let rqState = null;
  const RQ_PAGE = 40;
  const RQ_FILTERS = [['', 'All'], ['pending', 'Waiting'], ['processing', 'On the way'], ['comingsoon', 'Coming soon'], ['available', 'Available']];

  function rqDay(value) {
    const date = new Date(value);
    if (isNaN(date)) return '';
    const start = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = Math.round((start(date) - start(new Date())) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    const opts = { day: 'numeric', month: 'long' };
    if (date.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
    return date.toLocaleDateString(undefined, opts);
  }

  function rqAgo(value) {
    const then = new Date(value).getTime();
    if (!then) return '';
    const days = Math.floor((Date.now() - then) / 86400000);
    if (days < 1) { const hours = Math.floor((Date.now() - then) / 3600000); return hours < 1 ? 'just now' : hours + (hours === 1 ? ' hour ago' : ' hours ago'); }
    if (days < 45) return days + (days === 1 ? ' day ago' : ' days ago');
    return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function rqStatus(r) {
    if (r.requestStatus === 1) return { key: 'pend', label: 'Waiting for approval', short: 'Waiting' };
    if (r.requestStatus === 3) return { key: 'no', label: 'Declined', short: 'Declined' };
    if (r.mediaStatus === 'Deleted') return { key: 'gone', label: 'Removed from the library', short: 'Removed' };
    if (r.isComingSoon) {
      const when = rqDay(r.nextAirDate || r.digitalReleaseDate || r.theatricalReleaseDate || r.initialAirDate);
      return { key: 'soon', label: when ? 'Out ' + when : 'Coming soon', short: when ? 'Out ' + when : 'Coming soon' };
    }
    if (r.mediaStatus === 'Available') return { key: 'ok', label: 'Ready to watch', short: 'Ready to watch' };
    if (r.mediaStatus === 'Partially Available') return { key: 'part', label: 'Partly in your library', short: 'Partly here' };
    return { key: 'way', label: 'Approved, on the way', short: 'On the way' };
  }

  function rqPoster(url, size) {
    return url ? String(url).replace(/\/t\/p\/w\d+\//, '/t/p/' + size + '/') : '';
  }

  function teardownRequests() {
    if (!rqState) return;
    const s = rqState;
    rqState = null;
    s.alive = false;
    if (s.io) s.io.disconnect();
    clearInterval(s.queueTimer);
    document.removeEventListener('keydown', s.onKey);
    s.node.remove();
    delete s.page.dataset.cnRq;
  }

  function mountRequests() {
    const page = document.querySelector('#je-downloads-page:not(.hide)');
    if (!page || !/^#!?\/downloads/.test(location.hash)) { teardownRequests(); return; }
    if (rqState && rqState.page === page && rqState.node.isConnected) return;
    teardownRequests();
    const JE = window.JellyfinEnhanced;
    const client = window.ApiClient;
    const host = page.querySelector('[data-role="content"]') || page;
    if (!JE || !JE.core || !JE.core.api || !JE.core.api.plugin || !client) return;
    const api = (path, options) => JE.core.api.plugin(path, options);

    const node = el('div', 'cn-rq');
    const head = el('header', 'cn-rq-head');
    const h1 = el('h1', '', 'Requests');
    const sub = el('p', 'cn-rq-sub');
    const dl = el('p', 'cn-rq-dl');
    head.append(h1, sub, dl);
    const chips = el('div', 'cn-rq-chips');
    chips.setAttribute('role', 'tablist');
    chips.setAttribute('aria-label', 'Filter requests');
    const listWrap = el('div', 'cn-rq-listwrap');
    const downloads = el('div', 'cn-rq-downloads');
    const list = el('div', 'cn-rq-list');
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Requests');
    const more = el('div', 'cn-rq-more');
    listWrap.append(downloads, list, more);
    const pane = el('section', 'cn-rq-pane');
    pane.setAttribute('aria-live', 'polite');
    const body = el('div', 'cn-rq-body');
    body.append(chips, listWrap, pane);
    node.append(head, body);
    host.prepend(node);
    page.dataset.cnRq = 'true';

    const state = { page, node, alive: true, filter: '', items: [], skip: 0, total: 0, loading: false, done: false, selected: null, canApprove: false, details: {}, seq: 0, io: null, queueTimer: 0, onKey: null };
    rqState = state;

    // Filter chips with counts
    const chipEls = RQ_FILTERS.map(([value, label]) => {
      const chip = el('button', 'cn-rq-chip');
      chip.type = 'button';
      chip.setAttribute('role', 'tab');
      chip.append(el('span', '', label));
      const count = el('b');
      chip.append(count);
      chip.addEventListener('click', () => { if (state.filter !== value) setFilter(value); });
      chips.append(chip);
      return { value, chip, count };
    });
    const paintChips = () => chipEls.forEach((c) => c.chip.setAttribute('aria-selected', String(c.value === state.filter)));
    function loadCounts() {
      chipEls.forEach((c) => {
        api('/arr/requests?take=1&skip=0&filter=' + encodeURIComponent(c.value)).then((d) => {
          if (!state.alive) return;
          const n = (d && (d.totalResults != null ? d.totalResults : (d.requests || []).length)) || 0;
          c.count.textContent = n.toLocaleString();
          if (c.value === 'pending') {
            state.pending = n;
            paintSub();
          }
          if (d && d.canApproveRequests != null) { state.canApprove = d.canApproveRequests === true; paintSub(); }
        }).catch(() => {});
      });
    }
    function paintSub() {
      sub.textContent = state.canApprove && state.pending ? state.pending.toLocaleString() + (state.pending === 1 ? ' waiting for you' : ' waiting for you') : '';
    }

    // Downloads: a status line, plus a Downloading group above the list when something is in the queue
    function loadQueue() {
      api('/arr/queue').then((d) => {
        if (!state.alive) return;
        const items = (d && d.items) || [];
        dl.replaceChildren(el('i'), items.length ? items.length + (items.length === 1 ? ' downloading' : ' downloading') : 'No active downloads');
        dl.classList.toggle('is-active', items.length > 0);
        if (!items.length) { downloads.replaceChildren(); return; }
        const rows = items.map((item) => {
          const row = el('div', 'cn-rq-dlrow');
          const th = el('span', 'cn-rq-th');
          const src = rqPoster(item.posterUrl, 'w154');
          if (src) { const img = el('img'); img.alt = ''; img.loading = 'lazy'; img.src = src; th.append(img); }
          const text = el('div', 'cn-rq-t');
          text.append(el('b', '', item.title || ''), el('span', '', [item.subtitle, item.timeRemaining ? item.timeRemaining + ' left' : '', item.status].filter(Boolean).join(' · ')));
          const bar = el('span', 'cn-rq-bar');
          const fill = el('i');
          fill.style.width = Math.max(0, Math.min(100, Number(item.progress) || 0)) + '%';
          bar.append(fill);
          text.append(bar);
          row.append(th, text);
          return row;
        });
        downloads.replaceChildren(el('h2', 'cn-rq-group', 'Downloading'), ...rows);
      }).catch(() => { if (state.alive) dl.replaceChildren(el('i'), 'Downloads unavailable'); });
    }

    function row(r) {
      const st = rqStatus(r);
      const item = el('button', 'cn-rq-row');
      item.type = 'button';
      item.setAttribute('role', 'option');
      item.dataset.id = String(r.id);
      const th = el('span', 'cn-rq-th');
      const src = rqPoster(r.posterUrl, 'w154');
      if (src) { const img = el('img'); img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.src = src; th.append(img); }
      const text = el('span', 'cn-rq-t');
      text.append(el('b', '', r.title || 'Untitled'), el('span', '', [r.year, r.requestedBy, rqAgo(r.createdAt)].filter(Boolean).join(' · ')));
      const status = el('span', 'cn-rq-st is-' + st.key);
      status.append(el('i'), st.short);
      item.append(th, text, status);
      item.addEventListener('click', () => select(r, item, true));
      return item;
    }

    function setFilter(value) {
      state.filter = value;
      state.items = [];
      state.skip = 0;
      state.done = false;
      state.selected = null;
      list.replaceChildren();
      paintChips();
      loadMore(true);
    }

    function loadMore(first) {
      if (state.loading || state.done) return;
      state.loading = true;
      const seq = ++state.seq;
      more.textContent = 'Loading…';
      api('/arr/requests?take=' + RQ_PAGE + '&skip=' + state.skip + '&filter=' + encodeURIComponent(state.filter)).then((d) => {
        if (!state.alive || seq !== state.seq) return;
        const got = (d && d.requests) || [];
        if (d && d.canApproveRequests != null) { state.canApprove = d.canApproveRequests === true; paintSub(); }
        state.skip += got.length;
        state.total = d && d.totalResults != null ? d.totalResults : state.skip;
        state.done = got.length < RQ_PAGE || state.skip >= state.total;
        state.items.push(...got);
        list.append(...got.map(row));
        more.textContent = state.done ? (state.items.length ? '' : 'Nothing here.') : '';
        if (first) {
          const firstRow = list.querySelector('.cn-rq-row');
          if (firstRow) select(state.items[0], firstRow, false); else showEmptyPane();
        }
      }).catch(() => {
        if (!state.alive || seq !== state.seq) return;
        more.replaceChildren();
        const retry = el('button', 'cn-rq-btn is-ghost', 'Try again');
        retry.type = 'button';
        retry.addEventListener('click', () => loadMore(first));
        more.append(el('span', '', 'Couldn’t load requests. '), retry);
      }).then(() => { if (seq === state.seq) state.loading = false; });
    }

    function showEmptyPane() {
      pane.replaceChildren(el('p', 'cn-rq-empty', 'No requests here yet.'));
    }

    // Detail pane
    function details(r) {
      const key = r.type + ':' + r.tmdbId;
      if (state.details[key]) return state.details[key];
      const seerr = JE.jellyseerrAPI || {};
      const fetcher = r.type === 'tv' ? seerr.fetchTvShowDetails : seerr.fetchMovieDetails;
      state.details[key] = (r.tmdbId && fetcher ? fetcher.call(seerr, r.tmdbId).catch(() => null) : Promise.resolve(null));
      return state.details[key];
    }

    function select(r, item, focusPane) {
      if (!r) return;
      state.selected = r;
      list.querySelectorAll('.cn-rq-row[aria-selected="true"]').forEach((x) => x.setAttribute('aria-selected', 'false'));
      if (item) item.setAttribute('aria-selected', 'true');
      paintPane(r);
      if (focusPane) node.classList.add('is-detail-open');
    }

    function paintPane(r) {
      const st = rqStatus(r);
      const art = el('div', 'cn-rq-art');
      const content = el('div', 'cn-rq-content');
      const close = el('button', 'cn-rq-close', 'Back to list');
      close.type = 'button';
      close.addEventListener('click', () => node.classList.remove('is-detail-open'));
      const title = el('h2', 'cn-rq-title', r.title || 'Untitled');
      const facts = el('div', 'cn-rq-facts');
      const factBits = [r.year ? String(r.year) : '', r.type === 'tv' ? 'Show' : 'Film'];
      const paintFacts = (extra) => facts.replaceChildren(...factBits.concat(extra || []).filter(Boolean).map((t) => el('span', '', t)));
      paintFacts();
      const status = el('p', 'cn-rq-status is-' + st.key);
      status.append(el('i'), st.label);
      const who = el('p', 'cn-rq-who');
      const av = el('span', 'cn-rq-av', (r.requestedBy || '?').charAt(0).toUpperCase());
      const whoText = el('span');
      whoText.append('Requested by ', el('b', '', r.requestedBy || 'someone'), ' ' + rqAgo(r.createdAt));
      who.append(av, whoText);
      const syn = el('p', 'cn-rq-syn');
      const acts = el('div', 'cn-rq-acts');
      const msg = el('p', 'cn-rq-msg');
      msg.setAttribute('role', 'status');

      if (r.requestStatus === 1 && state.canApprove) {
        const approve = el('button', 'cn-rq-btn is-primary', 'Approve');
        approve.type = 'button';
        const decline = el('button', 'cn-rq-btn', 'Decline');
        decline.type = 'button';
        const act = (action) => {
          approve.disabled = true;
          decline.disabled = true;
          msg.textContent = action === 'approve' ? 'Approving…' : 'Declining…';
          api('/arr/requests/' + r.id + '/' + action, { method: 'POST', skipRetry: true }).then(() => {
            r.requestStatus = action === 'approve' ? 2 : 3;
            if (action === 'approve' && r.mediaStatus === 'Pending') r.mediaStatus = 'Approved';
            const old = list.querySelector('.cn-rq-row[data-id="' + r.id + '"]');
            if (old) {
              const fresh = row(r);
              fresh.setAttribute('aria-selected', 'true');
              old.replaceWith(fresh);
            }
            loadCounts();
            if (state.selected === r) paintPane(r);
          }).catch(() => {
            approve.disabled = false;
            decline.disabled = false;
            msg.textContent = 'That didn’t go through. Check Jellyseerr is reachable and try again.';
          });
        };
        approve.addEventListener('click', () => act('approve'));
        decline.addEventListener('click', () => act('decline'));
        acts.append(approve, decline);
      }
      if (r.jellyfinMediaId && (st.key === 'ok' || st.key === 'part' || st.key === 'soon')) {
        const open = el('a', 'cn-rq-btn is-primary', 'Open');
        open.href = '#/details?id=' + encodeURIComponent(r.jellyfinMediaId) + '&serverId=' + encodeURIComponent(client.serverId());
        acts.append(open);
        client.getItem(client.getCurrentUserId(), r.jellyfinMediaId).then((item) => {
          if (state.selected !== r || !item) return;
          const holder = el('div');
          holder.innerHTML = '<div is="emby-itemscontainer" class="cn-rq-playwrap itemsContainer" data-contextmenu="false" data-multiselect="false"></div>';
          const wrap = holder.firstElementChild;
          if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(wrap);
          const play = el('button', 'cn-rq-btn is-primary itemAction');
          play.type = 'button';
          play.dataset.action = 'play';
          play.dataset.id = item.Id;
          play.dataset.serverid = item.ServerId || client.serverId();
          play.dataset.type = item.Type;
          play.dataset.mediatype = item.MediaType || 'Video';
          play.dataset.isfolder = String(Boolean(item.IsFolder));
          play.innerHTML = icon('play');
          play.append('Play');
          wrap.append(play);
          open.classList.remove('is-primary');
          acts.prepend(wrap);
          const back = (item.BackdropImageTags || [])[0];
          if (back) art.style.backgroundImage = 'url("' + client.getImageUrl(item.Id, { type: 'Backdrop', tag: back, maxWidth: 1280, quality: 85 }) + '")';
          if (!syn.textContent && item.Overview) syn.textContent = item.Overview;
        }).catch(() => {});
      }
      if (r.tmdbId && JE.jellyseerrMoreInfo && JE.jellyseerrMoreInfo.open) {
        const info = el('button', 'cn-rq-btn is-ghost', 'More info');
        info.type = 'button';
        info.addEventListener('click', () => JE.jellyseerrMoreInfo.open(r.tmdbId, r.type === 'tv' ? 'tv' : 'movie'));
        acts.append(info);
      }

      content.append(close, title, facts, status, who, syn, acts, msg);
      pane.replaceChildren(art, content);
      details(r).then((d) => {
        if (state.selected !== r || !d) return;
        if (d.backdropPath && !art.style.backgroundImage) art.style.backgroundImage = 'url("https://image.tmdb.org/t/p/w1280' + d.backdropPath + '")';
        const genres = (d.genres || []).slice(0, 3).map((g) => g.name).join(', ');
        const mins = d.runtime || ((d.episodeRunTime || [])[0]);
        const extra = [genres];
        if (r.type === 'tv' && d.numberOfSeasons) extra.push(d.numberOfSeasons + (d.numberOfSeasons === 1 ? ' season' : ' seasons'));
        else if (mins) extra.push(runtime(mins * 600000000));
        paintFacts(extra);
        if (d.overview) syn.textContent = d.overview;
      });
    }

    // Keyboard: up and down move through the list
    state.onKey = (event) => {
      if (!state.alive || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      if (event.target.closest && event.target.closest('input, textarea, select, .dialogContainer')) return;
      const rows = [...list.querySelectorAll('.cn-rq-row')];
      if (!rows.length) return;
      const at = rows.findIndex((x) => x.getAttribute('aria-selected') === 'true');
      const next = rows[Math.max(0, Math.min(rows.length - 1, at + (event.key === 'ArrowDown' ? 1 : -1)))];
      if (!next) return;
      event.preventDefault();
      next.click();
      next.focus({ preventScroll: true });
      next.scrollIntoView({ block: 'nearest' });
    };
    document.addEventListener('keydown', state.onKey);

    if ('IntersectionObserver' in window) {
      state.io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) loadMore(false); }, { rootMargin: '600px 0px' });
      state.io.observe(more);
    }

    paintChips();
    loadCounts();
    loadQueue();
    state.queueTimer = setInterval(loadQueue, 15000);
    loadMore(true);
  }

  setInterval(mountRequests, 700);

  /* ---- Calendar page: next up and the week ---- */
  // Replaces the look of Jellyfin Enhanced's calendar (#je-calendar-page). Its own content is hidden, not removed;
  // events come from the same plugin endpoint (/arr/calendar).
  let calState = null;
  const CAL_RELEASE = { CinemaRelease: 'In cinemas', DigitalRelease: 'Digital release', PhysicalRelease: 'Blu-ray and DVD' };

  function calDayStart(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  function calMonday(date) { const d = calDayStart(date); const shift = (d.getDay() + 6) % 7; d.setDate(d.getDate() - shift); return d; }
  function calIsDateOnly(ev) { return ev.type !== 'Series' || /T00:00:00/.test(ev.releaseDate || ''); }
  function calTime(ev) { return calIsDateOnly(ev) ? '' : new Date(ev.releaseDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  function calLocalDate(ev) {
    // Date-only releases are stored as midnight UTC; read them as that calendar day, not the local time.
    if (calIsDateOnly(ev)) { const [y, m, d] = String(ev.releaseDate).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); }
    return new Date(ev.releaseDate);
  }
  function calDayLabel(date) {
    const diff = Math.round((calDayStart(date) - calDayStart(new Date())) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1 && diff < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
    return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function calEpisode(ev) {
    if (ev.type !== 'Series') return ['CinemaRelease', 'DigitalRelease', 'PhysicalRelease'].filter((r) => (ev.releases || [ev.releaseType]).includes(r)).map((r) => CAL_RELEASE[r]).join(' \u00b7 ') || 'Release';
    return ev.seasonNumber != null && ev.episodeNumber != null ? 'S' + ev.seasonNumber + ':E' + ev.episodeNumber : (ev.subtitle || '');
  }
  function calDedupe(events) {
    const seen = new Map();
    events.forEach((ev) => {
      const key = (ev.title || '') + '|' + String(ev.releaseDate).slice(0, 10) + '|' + (ev.type === 'Series' ? ev.seasonNumber + 'x' + ev.episodeNumber : '');
      const prev = seen.get(key);
      if (!prev) { seen.set(key, Object.assign({}, ev, { releases: [ev.releaseType] })); return; }
      if (!prev.releases.includes(ev.releaseType)) prev.releases.push(ev.releaseType);
      prev.hasFile = prev.hasFile || ev.hasFile;
    });
    return [...seen.values()].sort((a, b) => calLocalDate(a) - calLocalDate(b));
  }
  function calTarget(ev) {
    const sid = encodeURIComponent(window.ApiClient.serverId());
    if (ev.itemEpisodeId) return '#/details?id=' + encodeURIComponent(ev.itemEpisodeId) + '&serverId=' + sid;
    if (ev.itemId) return '#/details?id=' + encodeURIComponent(ev.itemId) + '&serverId=' + sid;
    return null;
  }
  function calOpen(ev) {
    const href = calTarget(ev);
    if (href) { location.hash = href; return; }
    const JE = window.JellyfinEnhanced;
    if (ev.tmdbId && JE && JE.jellyseerrMoreInfo && JE.jellyseerrMoreInfo.open) JE.jellyseerrMoreInfo.open(ev.tmdbId, ev.type === 'Series' ? 'tv' : 'movie');
  }

  function teardownCalendar() {
    if (!calState) return;
    const s = calState;
    calState = null;
    s.alive = false;
    s.node.remove();
    delete s.page.dataset.cnCal;
  }

  function mountCalendar() {
    const page = document.querySelector('#je-calendar-page:not(.hide)');
    if (!page || !/^#!?\/calendar/.test(location.hash)) { teardownCalendar(); return; }
    if (calState && calState.page === page && calState.node.isConnected) return;
    teardownCalendar();
    const JE = window.JellyfinEnhanced;
    const client = window.ApiClient;
    if (!JE || !JE.core || !JE.core.api || !JE.core.api.plugin || !client) return;
    const api = (start, end) => JE.core.api.plugin('/arr/calendar?start=' + encodeURIComponent(start.toISOString()) + '&end=' + encodeURIComponent(end.toISOString()))
      .then((d) => calDedupe((d && d.events) || []));
    const host = page.querySelector('[data-role="content"]') || page;
    const userId = client.getCurrentUserId();

    const node = el('div', 'cn-cal');
    const hero = el('section', 'cn-cal-hero');
    const week = el('section', 'cn-cal-week');
    node.append(hero, week);
    host.prepend(node);
    page.dataset.cnCal = 'true';
    const state = { page, node, alive: true, monday: calMonday(new Date()), filter: 'all', seq: 0 };
    calState = state;

    function thumb(ev, size) {
      if (ev.itemId) return client.getImageUrl(ev.itemId, { type: 'Primary', maxHeight: size, quality: 85 });
      return ev.posterUrl || '';
    }

    // ---------- Hero: the next thing to air ----------
    function paintHero(ev) {
      if (!ev) {
        hero.className = 'cn-cal-hero is-empty';
        const box = el('div', 'cn-cal-hc');
        box.append(el('h1', 'cn-cal-title', 'Calendar'), el('p', 'cn-cal-ep', 'Nothing scheduled in the next few months.'));
        hero.replaceChildren(box);
        return;
      }
      hero.className = 'cn-cal-hero';
      const art = el('div', 'cn-cal-art');
      if (ev.backdropUrl) art.style.backgroundImage = 'url("' + ev.backdropUrl + '")';
      const shade = el('div', 'cn-cal-shade');
      const box = el('div', 'cn-cal-hc');
      const date = calLocalDate(ev);
      const when = el('span', 'cn-cal-when');
      const time = calTime(ev);
      when.append(el('i'), (ev.type === 'Series' ? 'Next to air' : 'Next release') + ' · ' + calDayLabel(date) + (time ? ' ' + time : ''));
      const title = el('h1', 'cn-cal-title', ev.title || '');
      const epText = ev.type === 'Series'
        ? calEpisode(ev) + (ev.episodeTitle && ev.episodeTitle !== 'TBA' ? ' · ' + ev.episodeTitle : '')
        : calEpisode(ev);
      const ep = el('p', 'cn-cal-ep', epText);
      const syn = el('p', 'cn-cal-syn', ev.overview || ((time ? 'Airs ' + calDayLabel(date).replace(/^(Today|Tomorrow)$/, (m) => m.toLowerCase()) + ' at ' + time : 'Out ' + calDayLabel(date).replace(/^(Today|Tomorrow)$/, (m) => m.toLowerCase())) + (ev.monitored ? ' and lands in your library automatically.' : '.')));
      const acts = el('div', 'cn-cal-acts');
      const href = calTarget(Object.assign({}, ev, { itemEpisodeId: null }));
      if (href) {
        const open = el('a', 'cn-cal-btn is-primary', ev.type === 'Series' ? 'Open show' : 'Open film');
        open.href = href;
        acts.append(open);
        client.getItem(userId, ev.itemId).then((item) => {
          if (!state.alive || !item) return;
          const back = (item.BackdropImageTags || [])[0];
          if (back) art.style.backgroundImage = 'url("' + client.getImageUrl(item.Id, { type: 'Backdrop', tag: back, maxWidth: 1920, quality: 85 }) + '")';
          const logo = (item.ImageTags || {}).Logo;
          if (logo) {
            const img = el('img');
            img.alt = ev.title || '';
            img.addEventListener('error', () => { title.textContent = ev.title || ''; });
            img.src = client.getImageUrl(item.Id, { type: 'Logo', tag: logo, maxWidth: 700 });
            title.replaceChildren(img);
            title.classList.add('has-logo');
          }
          const watch = el('button', 'cn-cal-btn');
          watch.type = 'button';
          let saved = Boolean(item.UserData && item.UserData.Likes);
          const paint = () => { watch.replaceChildren(document.createRange().createContextualFragment(icon('bookmarked')), saved ? 'In watchlist' : 'Add to watchlist'); watch.setAttribute('aria-pressed', String(saved)); };
          watch.addEventListener('click', () => {
            const next = !saved;
            const query = { userId };
            if (next) query.likes = true;
            watch.disabled = true;
            client.ajax({ type: next ? 'POST' : 'DELETE', url: client.getUrl('UserItems/' + item.Id + '/Rating', query) })
              .then(() => { saved = next; paint(); })
              .catch((error) => console.warn('[Crimson Noir] Watchlist update failed:', error))
              .then(() => { watch.disabled = false; });
          });
          paint();
          acts.append(watch);
        }).catch(() => {});
      } else if (ev.tmdbId && JE.jellyseerrMoreInfo && JE.jellyseerrMoreInfo.open) {
        const info = el('button', 'cn-cal-btn is-primary', 'More info');
        info.type = 'button';
        info.addEventListener('click', () => calOpen(ev));
        acts.append(info);
      }
      box.append(when, title, ep, syn, acts);
      hero.replaceChildren(art, shade, box);
    }

    // ---------- Week ----------
    const head = el('div', 'cn-cal-whead');
    const wTitle = el('h2', '', 'This week');
    const wRange = el('span', 'cn-cal-range');
    const nav = el('div', 'cn-cal-nav');
    const mkBtn = (cls, label, html) => { const b = el('button', cls); b.type = 'button'; b.setAttribute('aria-label', label); if (html) b.innerHTML = html; else b.textContent = label; return b; };
    const chev = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const prev = mkBtn('cn-cal-arrow is-prev', 'Previous week', chev);
    const next = mkBtn('cn-cal-arrow', 'Next week', chev);
    const thisWeek = mkBtn('cn-cal-pill', 'This week');
    const filters = el('div', 'cn-cal-filters');
    const filterBtns = [['all', 'Everything'], ['ep', 'Episodes'], ['film', 'Films']].map(([value, label]) => {
      const b = mkBtn('cn-cal-pill', label);
      b.addEventListener('click', () => { state.filter = value; paintFilters(); paintWeek(); });
      filters.append(b);
      return [value, b];
    });
    const paintFilters = () => filterBtns.forEach(([v, b]) => b.setAttribute('aria-pressed', String(v === state.filter)));
    nav.append(prev, thisWeek, next);
    head.append(wTitle, wRange, filters, nav);
    const days = el('div', 'cn-cal-days');
    week.append(head, days);
    prev.addEventListener('click', () => { state.monday.setDate(state.monday.getDate() - 7); loadWeek(); });
    next.addEventListener('click', () => { state.monday.setDate(state.monday.getDate() + 7); loadWeek(); });
    thisWeek.addEventListener('click', () => { state.monday = calMonday(new Date()); loadWeek(); });

    function item(ev) {
      const row = el('button', 'cn-cal-it');
      row.type = 'button';
      const th = el('span', 'cn-cal-th');
      const src = thumb(ev, 160);
      if (src) { const img = el('img'); img.alt = ''; img.loading = 'lazy'; img.src = src; img.addEventListener('error', () => { if (ev.posterUrl && img.src !== ev.posterUrl) img.src = ev.posterUrl; else img.remove(); }); th.append(img); }
      if (ev.hasFile) { const tick = el('span', 'cn-cal-tick'); tick.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; th.append(tick); }
      const text = el('span', 'cn-cal-tx');
      const time = calTime(ev);
      text.append(el('b', '', ev.title || ''), el('span', '', [time, calEpisode(ev)].filter(Boolean).join(' · ')));
      row.append(th, text);
      row.title = (ev.title || '') + (ev.type === 'Series' && ev.episodeTitle ? ' — ' + ev.episodeTitle : '') + (ev.hasFile ? ' (in your library)' : '');
      row.addEventListener('click', () => calOpen(ev));
      return row;
    }

    function paintWeek() {
      const events = (state.events || []).filter((ev) => state.filter === 'all' || (state.filter === 'ep' ? ev.type === 'Series' : ev.type !== 'Series'));
      const today = calDayStart(new Date()).getTime();
      const panels = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(state.monday);
        day.setDate(day.getDate() + i);
        const panel = el('div', 'cn-cal-d');
        if (day.getTime() === today) panel.classList.add('is-today');
        if (day.getTime() < today) panel.classList.add('is-past');
        const dn = el('div', 'cn-cal-dn');
        dn.append(el('b', '', String(day.getDate())), el('span', '', day.getTime() === today ? 'Today' : day.toLocaleDateString(undefined, { weekday: 'short' })));
        panel.append(dn);
        const todays = events.filter((ev) => calDayStart(calLocalDate(ev)).getTime() === day.getTime());
        if (todays.length) todays.forEach((ev) => panel.append(item(ev)));
        else panel.append(el('p', 'cn-cal-quiet', 'Nothing'));
        panels.push(panel);
      }
      days.replaceChildren(...panels);
    }

    function loadWeek() {
      const seq = ++state.seq;
      const start = new Date(state.monday);
      const end = new Date(state.monday);
      end.setDate(end.getDate() + 7);
      const thisMonday = calMonday(new Date()).getTime();
      const offset = Math.round((state.monday.getTime() - thisMonday) / (7 * 86400000));
      wTitle.textContent = offset === 0 ? 'This week' : offset === 1 ? 'Next week' : offset === -1 ? 'Last week' : 'Week of ' + state.monday.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
      const last = new Date(end);
      last.setDate(last.getDate() - 1);
      wRange.textContent = state.monday.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' – ' + last.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      thisWeek.hidden = offset === 0;
      days.classList.add('is-loading');
      api(new Date(start.getTime() - 86400000), new Date(end.getTime() + 86400000)).then((events) => {
        if (!state.alive || seq !== state.seq) return;
        state.events = events;
        days.classList.remove('is-loading');
        paintWeek();
      }).catch(() => {
        if (!state.alive || seq !== state.seq) return;
        days.classList.remove('is-loading');
        days.replaceChildren(el('p', 'cn-cal-quiet', 'Couldn’t load the calendar. Check Sonarr and Radarr are reachable, then reload.'));
      });
    }

    paintFilters();
    loadWeek();
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + 120);
    api(new Date(now.getTime() - 86400000), horizon).then((events) => {
      if (!state.alive) return;
      const upcoming = events.filter((ev) => (calIsDateOnly(ev) ? calLocalDate(ev) >= calDayStart(now) && !ev.hasFile : new Date(ev.releaseDate) > now));
      paintHero(upcoming[0] || null);
    }).catch(() => paintHero(null));
  }

  setInterval(mountCalendar, 700);

  /* ---- Home: hide weak rows ---- */
  // Rows with fewer than 4 titles look empty, and Recently Aired Episodes repeats Continue Watching.
  const HOME_KEEP = /^(Continue Watching|Next Up|Watchlist)/i;
  const HOME_DROP = /^Recently Aired Episodes/i;
  function tidyHomeRows() {
    const page = document.querySelector('#indexPage:not(.hide)');
    if (!page) return;
    page.querySelectorAll('.tabContent:not(#favoritesTab) .verticalSection').forEach((section) => {
      const heading = section.querySelector('.sectionTitle, h2');
      const title = heading ? heading.textContent.trim() : '';
      const real = section.querySelectorAll('.card:not(.skeleton-card)').length;
      // The studio row's plugin hides its heading; every row should say what it is
      if (heading && /^Browse by Studio/i.test(title) && heading.style.getPropertyValue('display') !== 'block') heading.style.setProperty('display', 'block', 'important');
      const hide = HOME_DROP.test(title) || (title && !HOME_KEEP.test(title) && real > 0 && real < 4);
      if (hide && section.dataset.cnHide !== 'true') section.dataset.cnHide = 'true';
      else if (!hide && section.dataset.cnHide) delete section.dataset.cnHide;
    });
  }
  setInterval(tidyHomeRows, 900);

  /* ---- Home: backdrop behind the rows (Jellyfin sets none on Home) ---- */
  // Follows whichever title the banner is showing; respects the per-device Backdrops setting.
  let homeBd = null;
  function syncHomeBackdrop() {
    const client = window.ApiClient;
    const userId = client && client.getCurrentUserId && client.getCurrentUserId();
    let enabled = false;
    try { enabled = Boolean(userId) && localStorage.getItem(userId + '-enableBackdrops') === 'true'; } catch (error) { enabled = false; }
    const onHome = Boolean(document.querySelector('#indexPage:not(.hide) #homeTab.is-active, #indexPage:not(.hide) .tabContent.is-active#homeTab'))
      || (Boolean(document.querySelector('#indexPage:not(.hide)')) && root.classList.contains('cn-hero-on'));
    const show = enabled && onHome && !root.classList.contains('cn-no-backdrops');
    root.classList.toggle('cn-home-bd-on', show);
    if (!show) { if (homeBd && homeBd.classList.contains('is-on')) homeBd.classList.remove('is-on'); return; }
    if (!homeBd || !homeBd.isConnected) {
      homeBd = el('div', 'cn-home-bd');
      homeBd.setAttribute('aria-hidden', 'true');
      document.body.prepend(homeBd);
    }
    const active = document.querySelector('.cn-hero .cn-slide[data-active="true"] .cn-backdrop');
    const src = active && (active.currentSrc || active.src);
    if (!src) return;
    if (homeBd.dataset.src !== src) {
      homeBd.dataset.src = src;
      homeBd.classList.remove('is-on');
      setTimeout(() => {
        if (homeBd.dataset.src !== src) return;
        homeBd.style.backgroundImage = 'url("' + src + '")';
        homeBd.classList.add('is-on');
      }, homeBd.style.backgroundImage ? 450 : 0);
    } else if (!homeBd.classList.contains('is-on')) {
      homeBd.classList.add('is-on');
    }
  }
  setInterval(syncHomeBackdrop, 1000);

  /* ---- Player: Previous / Up Next for episodes even when Jellyfin built no play queue ---- */
  // Jellyfin only shows its previous/next track buttons when it queued more episodes, which depends on how
  // playback was started. When they are hidden, add the same two links for the neighbouring episodes.
  const epNavCache = new Map();
  let epNavKey = '';
  function syncEpisodeNav() {
    const page = document.querySelector('#videoOsdPage:not(.hide)');
    if (!page || !location.hash.startsWith('#/video')) { epNavKey = ''; return; }
    const group = page.querySelector('.buttons > div:first-child');
    const ownPrev = page.querySelector('.btnPreviousTrack');
    const ownNext = page.querySelector('.btnNextTrack');
    if (!group) return;
    const visible = (b) => b && !b.classList.contains('hide') && getComputedStyle(b).display !== 'none';
    const existing = group.querySelector('.cn-epnav');
    if (visible(ownPrev) || visible(ownNext)) { if (existing) existing.remove(); epNavKey = ''; return; }
    const id = playerTitleKey;
    if (!id) return;
    if (existing && epNavKey === id) return;
    epNavKey = id;
    const client = window.ApiClient;
    const userId = client.getCurrentUserId();
    if (!epNavCache.has(id)) {
      epNavCache.set(id, client.getItem(userId, id).then((item) => {
        if (!item || item.Type !== 'Episode' || !item.SeriesId) return null;
        return client.getEpisodes(item.SeriesId, { userId, adjacentTo: item.Id, Fields: 'UserData' }).then((result) => {
          const list = (result && result.Items) || [];
          const at = list.findIndex((ep) => ep.Id === item.Id);
          return { prev: at > 0 ? list[at - 1] : null, next: at >= 0 && at < list.length - 1 ? list[at + 1] : null };
        });
      }).catch(() => null));
    }
    epNavCache.get(id).then((nav) => {
      if (epNavKey !== id || !nav || (!nav.prev && !nav.next)) return;
      group.querySelectorAll('.cn-epnav').forEach((node) => node.remove());
      const holder = el('div');
      holder.innerHTML = '<div is="emby-itemscontainer" class="cn-epnav itemsContainer" data-contextmenu="false" data-multiselect="false"></div>';
      const wrap = holder.firstElementChild;
      if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(wrap);
      const link = (ep, label) => {
        const position = (ep.UserData && ep.UserData.PlaybackPositionTicks) || 0;
        const b = el('button', 'cn-epnav-btn itemAction', label);
        b.type = 'button';
        b.dataset.action = position > 0 ? 'resume' : 'play';
        b.dataset.id = ep.Id;
        b.dataset.serverid = ep.ServerId || client.serverId();
        b.dataset.type = 'Episode';
        b.dataset.mediatype = 'Video';
        b.dataset.isfolder = 'false';
        if (position > 0) b.dataset.positionticks = String(position);
        b.title = label + ': ' + (ep.IndexNumber != null ? 'S' + (ep.ParentIndexNumber || 0) + ':E' + ep.IndexNumber + ' ' : '') + (ep.Name || '');
        return b;
      };
      if (nav.prev) wrap.append(link(nav.prev, 'Previous'));
      if (nav.next) wrap.append(link(nav.next, 'Up Next'));
      // Sit exactly where Jellyfin's own Previous / Up Next would be
      if (ownPrev && ownPrev.parentNode === group) ownPrev.after(wrap); else group.prepend(wrap);
    });
  }
  setInterval(syncEpisodeNav, 1500);

  /* ---- Stay current without hard refreshes ---- */
  // Jellyfin keeps its copy of the custom CSS in a browser cache (IndexedDB) and can show an old version for a
  // while after the theme changes. Fetch the live CSS, swap it in if the page has an older copy, and clear the cache.
  let cssCheckedAt = 0;
  function freshenBrandingCss() {
    if (Date.now() - cssCheckedAt < 60000) return;
    cssCheckedAt = Date.now();
    fetch('/Branding/Css?_=' + Date.now(), { cache: 'no-store' }).then((r) => (r.ok ? r.text() : '')).then((fresh) => {
      if (!fresh || fresh.indexOf('Crimson Noir') < 0) return;
      const holder = [...document.querySelectorAll('style')].find((s) => s.id !== 'crimson-noir-css' && s.textContent.length > 20000 && s.textContent.indexOf('Crimson Noir') >= 0);
      if (!holder || holder.textContent === fresh) return;
      holder.textContent = fresh;
      try {
        const open = indexedDB.open('keyval-store');
        open.onsuccess = () => {
          try {
            const tx = open.result.transaction('keyval', 'readwrite');
            tx.objectStore('keyval').delete('jellyfin-query-cache');
          } catch (error) { /* store not present */ }
        };
      } catch (error) { /* IndexedDB unavailable */ }
    }).catch(() => {});
  }
  setTimeout(freshenBrandingCss, 2500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) freshenBrandingCss(); });
  window.addEventListener('hashchange', freshenBrandingCss);

  /* ---- Player watchdog ---- */
  // Jellyfin can be slow to report what is playing, and redraws the bottom bar between items. Keep re-applying the
  // theme's title, playhead (which also drives the paused state) until they are in place, for as long as the player is open.
  let playerKickAt = 0;
  setInterval(() => {
    if (!location.hash.startsWith('#/video')) return;
    const page = cnLive('#videoOsdPage');
    if (!page) return;
    setupPlayhead(page);
    // Plugins (Jellysleep, Jellyfin Enhanced) add their player buttons only once, to the first player page; from the
    // second video on they sit in a hidden old page. Move them onto the live one, in their usual places.
    const liveButtons = page.querySelector('.buttons');
    if (liveButtons && !page.classList.contains('hide')) {
      const plugins = [
        { sel: '.btnJellysleep', place: (n) => { const t = liveButtons.querySelector('.osdTimeText'); if (t) t.after(n); else liveButtons.prepend(n); } },
        { sel: 'button[title="Episode Preview"]', place: (n) => { const s2 = liveButtons.querySelector('.btnSubtitles'); if (s2) s2.before(n); else liveButtons.append(n); } },
        { sel: 'button[title="Jellyfin Enhanced"]', place: (n) => { const s2 = liveButtons.querySelector('.btnVideoOsdSettings'); if (s2) s2.before(n); else liveButtons.append(n); } },
        { sel: 'button[title="Bookmark Current Time"]', place: (n) => { const s2 = liveButtons.querySelector('.btnVideoOsdSettings'); if (s2) s2.before(n); else liveButtons.append(n); } }
      ];
      plugins.forEach(({ sel, place }) => {
        if (liveButtons.querySelector(sel)) return;
        const stray = [...document.querySelectorAll('#videoOsdPage.hide ' + sel)][0];
        if (stray) place(stray);
      });
    }
    const host = page.querySelector('.osdMainTextContainer');
    if (host && !host.querySelector('.cn-osd-title') && Date.now() - playerKickAt > 2500) {
      playerKickAt = Date.now();
      playerTitleKey = '';
      renderPlayerTitle(0);
    }
  }, 1000);

  /* ---- Player pages: Jellyfin keeps old player pages around (hidden) after you back out ---- */
  // A second video gets a new #videoOsdPage while the old one stays in the DOM, so plain lookups can grab the stale
  // copy. Always prefer the element that is not inside a hidden player page.
  function cnLive(selector) {
    const list = [...document.querySelectorAll(selector)];
    return list.find((node) => !node.closest('#videoOsdPage.hide') && !(node.matches('#videoOsdPage') && node.classList.contains('hide'))) || null;
  }

  /* ---- Season page: numbered episode list with synopses ---- */
  function buildSeasonList(client, season) {
    const userId = client.getCurrentUserId();
    const serverId = season.ServerId || client.serverId();
    const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const MORE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="18.5" r="1.8" fill="currentColor"/></svg>';
    const section = el('section', 'cn-sl');
    const head = el('div', 'cn-sl-head');
    head.append(el('h2', '', 'Episodes'));
    const pickWrap = el('label', 'cn-sl-pick');
    const pickText = el('span', '', season.Name || 'Season');
    pickWrap.append(pickText);
    const summary = el('span', 'cn-sl-sum');
    head.append(pickWrap, summary);
    const list = el('div', 'cn-sl-list');
    const holder = el('div');
    holder.innerHTML = '<div is="emby-itemscontainer" class="cn-sl-items itemsContainer" data-contextmenu="false" data-multiselect="false"></div>';
    const items = holder.firstElementChild;
    if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(items);
    list.append(items);
    section.append(head, list);

    // Other seasons: the picker jumps to that season's own page
    if (season.SeriesId) {
      client.getSeasons(season.SeriesId, { userId }).then((result) => {
        const seasons = (result.Items || []).filter((s) => s.Id);
        if (seasons.length < 2) return;
        const select = el('select');
        select.setAttribute('aria-label', 'Choose season');
        seasons.forEach((s) => {
          const option = el('option', '', s.Name);
          option.value = s.Id;
          if (s.Id === season.Id) option.selected = true;
          select.append(option);
        });
        select.addEventListener('change', () => { location.hash = '#/details?id=' + encodeURIComponent(select.value) + '&serverId=' + encodeURIComponent(serverId); });
        pickWrap.append(select);
        pickWrap.classList.add('has-select');
        pickWrap.insertAdjacentHTML('beforeend', '<svg class="cn-sl-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      }).catch(() => {});
    }

    function row(ep) {
      const data = ep.UserData || (ep.UserData = {});
      const r = el('article', 'cn-sl-row');
      const href = '#/details?id=' + encodeURIComponent(ep.Id) + '&serverId=' + encodeURIComponent(serverId);
      r.addEventListener('click', (event) => { if (!event.target.closest('button, a, select')) location.hash = href; });
      r.append(el('span', 'cn-sl-num', ep.IndexNumber != null ? String(ep.IndexNumber) : ''));
      const th = el('div', 'cn-sl-thumb');
      jeTagTarget(th, ep.Id);
      const tag = (ep.ImageTags || {}).Primary;
      if (tag) {
        const img = el('img');
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = client.getImageUrl(ep.Id, { type: 'Primary', tag, maxWidth: 520, quality: 88 });
        th.append(img);
      }
      const position = data.PlaybackPositionTicks || 0;
      const play = el('button', 'cn-sl-play itemAction');
      play.type = 'button';
      play.dataset.action = position > 0 ? 'resume' : 'play';
      play.dataset.id = ep.Id;
      play.dataset.serverid = serverId;
      play.dataset.type = 'Episode';
      play.dataset.mediatype = 'Video';
      play.dataset.isfolder = 'false';
      if (position > 0) play.dataset.positionticks = String(position);
      play.innerHTML = icon('play');
      play.setAttribute('aria-label', (position > 0 ? 'Resume ' : 'Play ') + (ep.Name || 'episode'));
      th.append(play);
      const pct = Number(data.PlayedPercentage || 0);
      if (pct > 0 && pct < 100) {
        const bar = el('span', 'cn-sl-prog');
        const fill = el('i');
        fill.style.width = pct + '%';
        bar.append(fill);
        th.append(bar);
      }
      r.append(th);
      const text = el('div', 'cn-sl-text');
      const title = el('a', 'cn-sl-title', ep.Name || 'Episode ' + (ep.IndexNumber || ''));
      title.href = href;
      const meta = el('div', 'cn-sl-meta');
      if (runtime(ep.RunTimeTicks)) meta.append(el('span', '', runtime(ep.RunTimeTicks)));
      if (ep.CommunityRating) {
        const star = el('span', 'cn-sl-star');
        star.innerHTML = SHELF_STAR;
        star.append(Number(ep.CommunityRating).toFixed(1));
        meta.append(star);
      }
      if (ep.PremiereDate) meta.append(el('span', '', new Date(ep.PremiereDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })));
      text.append(title, meta);
      if (ep.Overview) text.append(el('p', 'cn-sl-syn', ep.Overview));
      r.append(text);
      const side = el('div', 'cn-sl-side');
      const watched = el('button', 'cn-sl-watched');
      watched.type = 'button';
      const paintWatched = () => {
        const on = Boolean(data.Played);
        watched.classList.toggle('is-on', on);
        watched.setAttribute('aria-pressed', String(on));
        watched.innerHTML = '<i>' + TICK + '</i>';
        watched.append(on ? 'Watched' : 'Mark watched');
        watched.title = on ? 'Mark as not watched' : 'Mark as watched';
        r.classList.toggle('is-played', on);
      };
      watched.addEventListener('click', () => {
        const on = !data.Played;
        watched.disabled = true;
        (on ? client.markPlayed(userId, ep.Id, new Date()) : client.markUnplayed(userId, ep.Id))
          .then((result) => { Object.assign(data, result || { Played: on }); data.Played = on; paintWatched(); })
          .catch((error) => console.warn('[Crimson Noir] Watched update failed:', error))
          .then(() => { watched.disabled = false; });
      });
      paintWatched();
      const more = el('button', 'cn-sl-more itemAction');
      more.type = 'button';
      more.dataset.action = 'menu';
      more.dataset.id = ep.Id;
      more.dataset.serverid = serverId;
      more.dataset.type = 'Episode';
      more.dataset.mediatype = 'Video';
      more.dataset.isfolder = 'false';
      more.innerHTML = MORE;
      more.title = 'More';
      more.setAttribute('aria-label', 'More options: ' + (ep.Name || ''));
      side.append(watched, more);
      r.append(side);
      return r;
    }

    items.replaceChildren(el('p', 'cn-sl-msg', 'Loading episodes…'));
    client.getEpisodes(season.SeriesId, { seasonId: season.Id, userId, Fields: 'Overview,PremiereDate' }).then((result) => {
      const eps = result.Items || [];
      const minutes = Math.round(eps.reduce((sum, ep) => sum + (ep.RunTimeTicks || 0), 0) / 600000000);
      const hours = minutes / 60;
      const length = runtime(minutes * 600000000);
      summary.textContent = eps.length + (eps.length === 1 ? ' episode' : ' episodes') + (minutes ? ' · ' + length : '');
      items.replaceChildren(...(eps.length ? eps.map(row) : [el('p', 'cn-sl-msg', 'No episodes in this season yet.')]));
    }).catch(() => {
      items.replaceChildren(el('p', 'cn-sl-msg', 'Couldn’t load the episodes. Reload the page to try again.'));
    });
    return section;
  }

  /* ---- Detail hero: "Directed by" / "Created by", linking to the person's page ---- */
  // Uses Jellyfin's own people first. Much of this library has no crew stored, so fall back to TMDb's credits via
  // Jellyseerr and link the name when Jellyfin has that person; otherwise show it unlinked.
  function buildCredit(client, item) {
    if (!['Movie', 'Series', 'Episode'].includes(item.Type)) return null;
    const line = el('p', 'cn-dh-credit');
    line.hidden = true;
    const label = item.Type === 'Series' ? 'Created by' : 'Directed by';
    const serverId = item.ServerId || client.serverId();
    const paint = (people) => {
      const list = people.filter((p) => p && p.name).slice(0, 3);
      if (!list.length) return;
      line.replaceChildren(el('span', 'cn-dh-credit-label', label + ' '));
      list.forEach((p, i) => {
        if (i) line.append(i === list.length - 1 ? ' & ' : ', ');
        if (p.id) {
          const a = el('a', 'cn-dh-credit-name', p.name);
          a.href = '#/details?id=' + encodeURIComponent(p.id) + '&serverId=' + encodeURIComponent(serverId);
          a.title = 'More from ' + p.name;
          line.append(a);
        } else {
          line.append(el('span', 'cn-dh-credit-name is-plain', p.name));
        }
      });
      line.hidden = false;
    };
    const wanted = item.Type === 'Series' ? ['Creator'] : ['Director'];
    const own = (item.People || []).filter((p) => wanted.includes(p.Type)).map((p) => ({ name: p.Name, id: p.Id }));
    if (own.length) { paint(own); return line; }
    const JE = window.JellyfinEnhanced;
    const api = JE && JE.jellyseerrAPI;
    const tmdbId = item.ProviderIds && (item.ProviderIds.Tmdb || item.ProviderIds.TMDB);
    if (!api || !tmdbId || item.Type === 'Episode') return line;
    const fetcher = item.Type === 'Series' ? api.fetchTvShowDetails : api.fetchMovieDetails;
    if (!fetcher) return line;
    fetcher.call(api, tmdbId).then((d) => {
      if (!d) return;
      const names = item.Type === 'Series'
        ? (d.createdBy || []).map((c) => c.name)
        : ((d.credits && d.credits.crew) || []).filter((c) => c.job === 'Director').map((c) => c.name);
      const unique = [...new Set(names.filter(Boolean))].slice(0, 3);
      if (!unique.length) return;
      Promise.all(unique.map((name) => client.getJSON(client.getUrl('Persons', { searchTerm: name, limit: 5, userId: client.getCurrentUserId() }))
        .then((r) => { const hit = (r.Items || []).find((p) => (p.Name || '').toLowerCase() === name.toLowerCase()); return { name, id: hit ? hit.Id : null }; })
        .catch(() => ({ name, id: null })))).then((people) => { if (line.isConnected || !line.parentNode) paint(people); });
    }).catch(() => {});
    return line;
  }

  /* ---- Film and episode pages: "More details" panel ----
     The hero stays short; everything else Jellyfin knows about the title (tagline, release, credits,
     studios, video/audio/subtitle tracks, file) sits in a panel under the hero, closed by default. */
  function buildMoreDetails(client, item) {
    if (!['Movie', 'Episode'].includes(item.Type)) return null;
    const serverId = item.ServerId || client.serverId();
    const people = item.People || [];
    const source = (item.MediaSources || [])[0] || {};
    const streams = source.MediaStreams || [];
    const groups = [];

    const row = (label, value) => {
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) return null;
      const wrap = el('div', 'cn-md-row');
      const dd = el('dd');
      if (Array.isArray(value)) value.forEach((part, i) => { if (i) dd.append(', '); dd.append(part); });
      else dd.append(value);
      wrap.append(el('dt', '', label), dd);
      return wrap;
    };
    const group = (heading, rows) => {
      const live = rows.filter(Boolean);
      if (!live.length) return;
      const box = el('section', 'cn-md-group');
      const list = el('dl');
      list.append(...live);
      box.append(el('h3', 'cn-md-head', heading), list);
      groups.push(box);
    };
    const personLink = (p) => {
      if (!p.Id) return el('span', '', p.Name);
      const a = el('a', 'cn-md-link', p.Name);
      a.href = '#/details?id=' + encodeURIComponent(p.Id) + '&serverId=' + encodeURIComponent(serverId);
      return a;
    };
    const named = (type, max) => {
      const seen = new Set();
      return people.filter((p) => p.Type === type && p.Name && !seen.has(p.Name) && seen.add(p.Name)).slice(0, max).map(personLink);
    };
    const plural = (list, one, many) => (list.length > 1 ? many : one);
    // PremiereDate is stored as midnight UTC-ish; show it in local time like the rest of the theme.
    const when = item.PremiereDate ? new Date(item.PremiereDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : null;

    const tagline = (item.Taglines || [])[0];
    group(item.Type === 'Episode' ? 'The episode' : 'The film', [
      tagline ? row('Tagline', el('q', 'cn-md-tagline', tagline)) : null,
      row(item.Type === 'Episode' ? 'Aired' : 'Released', when),
      row('Runtime', runtime(item.RunTimeTicks) || null),
      row('Rated', item.OfficialRating || null),
      row(plural(item.Genres || [], 'Genre', 'Genres'), (item.Genres || []).slice(0, 6)),
      row(plural(item.ProductionLocations || [], 'Country', 'Countries'), (item.ProductionLocations || []).slice(0, 3)),
      item.OriginalTitle && item.OriginalTitle !== item.Name ? row('Original title', item.OriginalTitle) : null,
    ]);

    const directors = named('Director', 3);
    const writers = named('Writer', 4);
    const cast = named(item.Type === 'Episode' ? 'GuestStar' : 'Actor', 4);
    const studios = (item.Studios || []).slice(0, 4).map((s) => s.Name).filter(Boolean);
    group('Credits', [
      row(plural(directors, 'Director', 'Directors'), directors),
      row(plural(writers, 'Writer', 'Writers'), writers),
      row(item.Type === 'Episode' ? 'Guest stars' : 'Starring', cast),
      row(plural(studios, 'Studio', 'Studios'), studios),
    ]);

    // Track names: Jellyfin's DisplayTitle minus the trailing " - Default" / " - External" noise.
    const tidy = (s) => (s.DisplayTitle || s.Codec || '').split(' - ').filter((part) => !/^(Default|External|Forced)$/i.test(part)).join(' · ');
    const video = streams.find((s) => s.Type === 'Video');
    const audio = streams.filter((s) => s.Type === 'Audio').map(tidy).filter(Boolean);
    const subs = [...new Set(streams.filter((s) => s.Type === 'Subtitle').map((s) => {
      const lang = (s.DisplayTitle || '').split(' - ')[0] || s.Language || 'Unknown';
      return lang + (s.IsForced ? ' (forced)' : s.IsHearingImpaired ? ' (SDH)' : '');
    }))];
    const more = (list, max) => (list.length > max ? list.slice(0, max).concat(['+' + (list.length - max) + ' more']) : list);
    const file = [
      source.Container ? source.Container.split(',')[0].toUpperCase() : null,
      source.Size ? (source.Size / 1e9 >= 1 ? (source.Size / 1e9).toFixed(1) + ' GB' : Math.round(source.Size / 1e6) + ' MB') : null,
      source.Bitrate ? (source.Bitrate / 1e6).toFixed(1) + ' Mbps' : null,
    ].filter(Boolean).join(' · ');
    const track = (node, kind) => { if (node) node.dataset.track = kind; return node; };
    group('Picture & sound', [
      row('Video', video ? tidy(video) : null),
      track(row('Audio', more(audio, 3)), 'audio'),
      track(row('Subtitles', more(subs, 5)), 'subtitles'),
      row('File', file || null),
      (item.MediaSources || []).length > 1 ? row('Versions', String(item.MediaSources.length)) : null,
    ]);

    if (!groups.length) return null;

    const id = 'cn-md-' + item.Id;
    const toggle = el('button', 'cn-md-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', id);
    toggle.innerHTML = '<span>More details</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const panel = el('section', 'cn-md');
    panel.id = id;
    panel.setAttribute('aria-label', 'More details');
    panel.dataset.open = 'false';
    panel.inert = true;
    const inner = el('div', 'cn-md-inner');
    inner.append(...groups);
    panel.append(inner);

    const setOpen = (open) => {
      panel.dataset.open = String(open);
      panel.inert = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.firstElementChild.textContent = open ? 'Fewer details' : 'More details';
      const heroNode = toggle.closest('.cn-dh');
      if (heroNode) heroNode.classList.toggle('cn-md-on', open);
    };
    toggle.addEventListener('click', () => {
      const open = panel.dataset.open !== 'true';
      setOpen(open);
      if (open && !reducedMotion) {
        // Bring the panel's top into view if it opened below the fold.
        setTimeout(() => {
          const box = panel.getBoundingClientRect();
          if (box.top > window.innerHeight - 160) window.scrollBy({ top: box.top - window.innerHeight * 0.35, behavior: 'smooth' });
        }, 60);
      }
    });
    return { toggle, panel, setOpen };
  }

  // "More details" > Picture & sound: when there's a real choice, the Audio and Subtitles rows become
  // dropdowns that drive Jellyfin's own (hidden) track pickers, which Jellyfin reads when Play is pressed.
  // Returns a function that stops watching the pickers.
  function wireTrackPickers(panel, page) {
    const kinds = [['audio', 'select.selectAudio', 'Audio track'], ['subtitles', 'select.selectSubtitles', 'Subtitles']];
    const label = (text) => String(text || '').split(' - ').filter((part) => !/^(Default|External)$/i.test(part)).join(' · ');
    const sync = () => {
      kinds.forEach(([kind, selector, name]) => {
        const row = panel.querySelector('.cn-md-row[data-track="' + kind + '"]');
        if (!row) return;
        const dd = row.querySelector('dd');
        const native = page.querySelector(selector);
        let pick = dd.querySelector('select.cn-md-select');
        const choice = native && native.options.length > 1;
        dd.classList.toggle('has-select', Boolean(choice));
        if (!choice) { if (pick) pick.remove(); return; }
        if (!pick) {
          pick = el('select', 'cn-md-select');
          pick.setAttribute('aria-label', name);
          pick.addEventListener('change', () => {
            const current = page.querySelector(selector);
            if (!current) return;
            current.value = pick.value;
            current.dispatchEvent(new Event('change', { bubbles: true }));
          });
          dd.append(pick);
        }
        const signature = Array.from(native.options).map((o) => o.value + '\u0001' + o.text).join('\u0002');
        if (pick.dataset.sig !== signature) {
          pick.replaceChildren(...Array.from(native.options).map((o) => new Option(label(o.text), o.value)));
          pick.dataset.sig = signature;
        }
        if (pick.value !== native.value) pick.value = native.value;
      });
    };
    sync();
    // Jellyfin fills the pickers after the page renders, and refills them when the version changes.
    // (Only the pickers' own container: the panel is inside the page, so watching the page would loop.)
    const holder = page.querySelector('.trackSelections');
    if (!holder) return () => {};
    const observer = new MutationObserver(sync);
    observer.observe(holder, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    holder.addEventListener('change', sync);
    return () => { observer.disconnect(); holder.removeEventListener('change', sync); };
  }

  /* ---- Person page: profile and career timeline ---- */
  function personWorks(client, person) {
    const userId = client.getCurrentUserId();
    return client.getItems(userId, {
      PersonIds: person.Id, Recursive: true, IncludeItemTypes: 'Movie,Series',
      SortBy: 'PremiereDate,ProductionYear,SortName', SortOrder: 'Ascending',
      Fields: 'People,ProductionYear,PremiereDate,EndDate', EnableImageTypes: 'Primary', ImageTypeLimit: 1,
    }).then((result) => result.Items || []).catch(() => []);
  }

  function mountPerson(client, state, person, works) {
    const { page } = state;
    const wrapper = page.querySelector('.detailPageWrapperContainer');
    if (!wrapper || !wrapper.parentNode) { conceal(false); return; }
    const serverId = person.ServerId || client.serverId();
    const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const CHEV = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const href = (id) => '#/details?id=' + encodeURIComponent(id) + '&serverId=' + encodeURIComponent(serverId);
    const watched = (w) => !!(w.UserData && (w.UserData.Played || (w.Type === 'Series' && w.UserData.UnplayedItemCount === 0)));

    const section = el('section', 'cn-pp');
    const top = el('div', 'cn-pp-top');
    const photo = el('div', 'cn-pp-photo');
    const tag = (person.ImageTags || {}).Primary;
    if (tag) {
      const img = el('img');
      img.alt = '';
      img.decoding = 'async';
      img.src = client.getImageUrl(person.Id, { type: 'Primary', tag, maxHeight: 720, quality: 90 });
      photo.append(img);
    } else {
      photo.classList.add('is-empty');
      photo.textContent = (person.Name || '?').split(/\s+/).map((part) => part[0]).slice(0, 2).join('');
    }

    const copy = el('div', 'cn-pp-copy');
    const nameBar = el('div', 'cn-pp-namebar');
    nameBar.append(el('h1', 'cn-pp-name', person.Name || ''));
    // Favourite heart, same round button as the film pages
    const fav = el('button', 'cn-pp-fav');
    fav.type = 'button';
    fav.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" fill="currentColor"/></svg>';
    const paintFav = (on) => {
      fav.setAttribute('aria-pressed', on ? 'true' : 'false');
      fav.title = on ? 'Remove from favourites' : 'Add to favourites';
      fav.setAttribute('aria-label', fav.title);
    };
    paintFav(!!(person.UserData && person.UserData.IsFavorite));
    fav.addEventListener('click', () => {
      const on = fav.getAttribute('aria-pressed') !== 'true';
      paintFav(on);
      fav.disabled = true;
      client.updateFavoriteStatus(client.getCurrentUserId(), person.Id, on)
        .then((data) => { if (data && typeof data.IsFavorite === 'boolean') paintFav(data.IsFavorite); if (person.UserData) person.UserData.IsFavorite = fav.getAttribute('aria-pressed') === 'true'; })
        .catch(() => paintFav(!on))
        .then(() => { fav.disabled = false; });
    });
    nameBar.append(fav);
    copy.append(nameBar);

    // Born, age (or died), birthplace
    const facts = el('div', 'cn-dh-facts cn-pp-facts');
    const dateText = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    const ageAt = (from, to) => {
      const a = new Date(from), b = to ? new Date(to) : new Date();
      let years = b.getFullYear() - a.getFullYear();
      if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) years -= 1;
      return years;
    };
    if (person.PremiereDate) {
      facts.append(el('span', '', 'Born ' + dateText(person.PremiereDate)));
      if (!person.EndDate) facts.append(el('span', '', 'Age ' + ageAt(person.PremiereDate)));
    }
    if (person.EndDate) facts.append(el('span', '', 'Died ' + dateText(person.EndDate) + (person.PremiereDate ? ' (aged ' + ageAt(person.PremiereDate, person.EndDate) + ')' : '')));
    const place = (person.ProductionLocations || [])[0];
    if (place) facts.append(el('span', '', place.replace(/,\s*(U\.S\.A?\.?|USA|United States( of America)?)$/i, '')));
    if (facts.childElementCount) copy.append(facts);

    if (person.Overview) {
      const bio = el('p', 'cn-pp-bio', person.Overview);
      copy.append(bio);
      const more = el('button', 'cn-pp-more', 'Read more');
      more.type = 'button';
      more.hidden = true;
      more.addEventListener('click', () => {
        const open = bio.classList.toggle('is-open');
        more.textContent = open ? 'Show less' : 'Read more';
      });
      copy.append(more);
      requestAnimationFrame(() => { more.hidden = bio.scrollHeight <= bio.clientHeight + 2; });
    }

    // Quick numbers; award tiles fill in once Jellyfin Enhanced has drawn its awards bar
    const stats = el('div', 'cn-pp-stats');
    const stat = (value, label) => {
      const box = el('div', 'cn-pp-stat');
      box.append(el('b', '', String(value)), el('span', '', label));
      stats.append(box);
      return box;
    };
    const seen = works.filter(watched).length;
    stat(works.length, 'in your library');
    if (works.length) stat(seen === works.length ? 'All' : seen, 'watched');
    copy.append(stats);
    top.append(photo, copy);

    // Timeline: one column per year, oldest first
    const line = el('div', 'cn-pp-tl');
    const head = el('div', 'cn-pp-tl-head');
    head.append(el('h2', '', 'In your library, by year'));
    const nav = el('div', 'cn-pp-nav');
    const prev = el('button', 'cn-pp-arrow');
    const next = el('button', 'cn-pp-arrow');
    prev.type = next.type = 'button';
    prev.innerHTML = CHEV(-1);
    next.innerHTML = CHEV(1);
    prev.setAttribute('aria-label', 'Earlier');
    next.setAttribute('aria-label', 'Later');
    nav.append(prev, next);
    head.append(nav);
    line.append(head);

    const rail = el('div', 'cn-pp-rail');
    const track = el('div', 'cn-pp-track');
    rail.append(track);
    const years = new Map();
    works.forEach((w) => {
      const year = w.ProductionYear || (w.PremiereDate ? new Date(w.PremiereDate).getUTCFullYear() : 0);
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(w);
    });
    const order = Array.from(years.keys()).sort((a, b) => (a || 99999) - (b || 99999));
    order.forEach((year) => {
      const col = el('div', 'cn-pp-yr');
      const label = el('span', 'cn-pp-y');
      label.append(el('i'), document.createTextNode(year ? String(year) : 'Undated'));
      col.append(label);
      years.get(year).forEach((w) => {
        const card = el('a', 'cn-pp-card');
        card.href = href(w.Id);
        const poster = el('span', 'cn-pp-po');
        jeTagTarget(poster, w.Id);
        const ptag = (w.ImageTags || {}).Primary;
        if (ptag) {
          const img = el('img');
          img.alt = '';
          img.loading = 'lazy';
          img.decoding = 'async';
          img.src = client.getImageUrl(w.Id, { type: 'Primary', tag: ptag, maxHeight: 300, quality: 88 });
          poster.append(img);
        }
        if (watched(w)) { const tk = el('span', 'cn-pp-tk'); tk.innerHTML = TICK; tk.setAttribute('aria-label', 'Watched'); poster.append(tk); }
        const text = el('span', 'cn-pp-text');
        text.append(el('b', '', w.Name || ''));
        let kind = w.Type === 'Series' ? 'Show' : 'Film';
        if (w.Type === 'Series' && w.ProductionYear) {
          const end = w.EndDate ? new Date(w.EndDate).getUTCFullYear() : 0;
          kind += w.Status === 'Continuing' ? ' · ' + w.ProductionYear + '–now' : (end && end !== w.ProductionYear ? ' · ' + w.ProductionYear + '–' + end : '');
        }
        text.append(el('span', '', kind));
        const credits = (w.People || []).filter((p) => p.Id === person.Id);
        const roles = [];
        credits.forEach((p) => {
          if (p.Role && p.Type !== 'Director' && p.Type !== 'Writer') roles.push('as ' + p.Role.split(/\s*\/\s*/)[0]);
          else if (p.Type && p.Type !== 'Actor' && p.Type !== 'GuestStar') roles.push(p.Type);
        });
        const roleText = Array.from(new Set(roles)).join(' · ');
        if (roleText) text.append(el('em', '', roleText));
        card.append(poster, text);
        col.append(card);
      });
      track.append(col);
    });
    if (!works.length) rail.append(el('p', 'cn-pp-empty', 'Nothing with ' + (person.Name || 'them') + ' is in your library yet.'));
    line.append(rail);

    const syncArrows = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      nav.hidden = max < 4;
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft > max - 4;
    };
    const step = (dir) => rail.scrollBy({ left: dir * Math.max(280, rail.clientWidth * 0.8), behavior: reducedMotion ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    rail.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    requestAnimationFrame(syncArrows);

    const extra = el('div', 'cn-pp-extra');
    section.append(top, line, extra);
    wrapper.parentNode.insertBefore(section, wrapper);

    // Borrow Jellyfin Enhanced's awards bar: its totals become stat tiles, the bar itself sits under the timeline.
    let awards = null, awardsHome = null, tries = 0, counted = false;
    const findAwards = () => {
      const bar = page.querySelector('.detailPageWrapperContainer .je-awards-section');
      if (bar && bar !== awards) {
        awards = bar;
        awardsHome = { parent: bar.parentNode, next: bar.nextSibling };
        extra.append(bar);
      }
      if (awards && !counted) {
        const text = (awards.querySelector('.je-awards-stats') || {}).textContent || '';
        const wins = text.match(/(\d+)\s*Wins?/i), noms = text.match(/(\d+)\s*Nominations?/i);
        if (wins || noms) {
          counted = true;
          if (wins) stat(wins[1], wins[1] === '1' ? 'award win' : 'award wins');
          if (noms) stat(noms[1], noms[1] === '1' ? 'nomination' : 'nominations');
        }
      }
      if ((!awards || !counted) && ++tries < 40 && section.isConnected) state.awardsTimer = window.setTimeout(findAwards, 300);
    };
    findAwards();

    page.dataset.cn = 'true';
    page.dataset.cnPerson = 'true';
    root.classList.add('cn-details-on');
    state.hero = section;
    state.teardown = () => {
      window.clearTimeout(state.awardsTimer);
      window.removeEventListener('resize', syncArrows);
      if (awards && awardsHome && awardsHome.parent.isConnected) awardsHome.parent.insertBefore(awards, awardsHome.next && awardsHome.next.parentNode === awardsHome.parent ? awardsHome.next : null);
      section.remove();
    };
    heroReady(section);
    conceal(false);
  }

  /* ---- Cast & crew: rounded squares, crew jobs as a pill ---- */
  (function castCards() {
    let timer = 0;
    const tag = () => {
      timer = 0;
      document.querySelectorAll('#itemDetailPage .personCard:not([data-cn-role])').forEach((card) => {
        const line = card.querySelector('.cardText-secondary');
        if (!line) return;
        const text = (line.textContent || '').trim();
        card.dataset.cnRole = !text ? 'none' : /^as\s/i.test(text) ? 'cast' : 'crew';
      });
    };
    new MutationObserver(() => { if (!timer) timer = window.setTimeout(tag, 150); })
      .observe(document.body, { childList: true, subtree: true });
    tag();
  })();

  /* ---- Random sort: keep the shuffle while you stay on the page ---- */
  // Library grids sorted by Random reload after favourite / watched / watchlist, and the server reshuffles.
  // Remember the first order per request and lay later reloads out in that order (fresh UserData wins).
  (function stableRandom() {
    if (window.__cnStableRandom) return;
    window.__cnStableRandom = true;
    const orders = new Map();
    let route = location.hash;
    window.addEventListener('hashchange', () => { if (location.hash !== route) { route = location.hash; orders.clear(); } });
    const keyFor = (raw) => {
      let url;
      try { url = new URL(raw, location.href); } catch (e) { return ''; }
      if (!/\/Items$/i.test(url.pathname)) return '';
      const sort = url.searchParams.get('sortBy') || url.searchParams.get('SortBy') || '';
      if (!/(^|,)Random(,|$)/i.test(sort)) return '';
      const parts = [];
      url.searchParams.forEach((value, name) => parts.push(name.toLowerCase() + '=' + value));
      return url.pathname.toLowerCase() + '?' + parts.sort().join('&');
    };
    const reorder = (key, data) => {
      if (!data || !Array.isArray(data.Items)) return data;
      const known = orders.get(key);
      if (!known) { orders.set(key, data.Items.map((item) => item.Id)); return data; }
      const fresh = new Map(data.Items.map((item) => [item.Id, item]));
      const items = [];
      known.forEach((id) => { if (fresh.has(id)) { items.push(fresh.get(id)); fresh.delete(id); } });
      fresh.forEach((item) => items.push(item));
      orders.set(key, items.map((item) => item.Id));
      return Object.assign({}, data, { Items: items });
    };
    const proto = XMLHttpRequest.prototype;
    const open = proto.open;
    const responseDesc = Object.getOwnPropertyDescriptor(proto, 'response');
    const textDesc = Object.getOwnPropertyDescriptor(proto, 'responseText');
    proto.open = function (method, url) {
      this.__cnKey = String(method).toUpperCase() === 'GET' ? keyFor(url) : '';
      this.__cnDone = undefined;
      return open.apply(this, arguments);
    };
    const settle = (xhr) => {
      if (xhr.__cnDone !== undefined) return xhr.__cnDone;
      xhr.__cnDone = null;
      if (xhr.readyState !== 4 || xhr.status < 200 || xhr.status >= 300) return null;
      try {
        const type = xhr.responseType;
        const raw = responseDesc.get.call(xhr);
        const data = type === 'json' ? raw : JSON.parse(type === '' || type === 'text' ? raw : '');
        const out = reorder(xhr.__cnKey, data);
        xhr.__cnDone = { json: out, text: JSON.stringify(out) };
      } catch (e) { xhr.__cnDone = null; }
      return xhr.__cnDone;
    };
    Object.defineProperty(proto, 'response', {
      configurable: true,
      get() {
        if (this.__cnKey && this.readyState === 4) {
          const done = settle(this);
          if (done) return this.responseType === 'json' ? done.json : done.text;
        }
        return responseDesc.get.call(this);
      },
    });
    Object.defineProperty(proto, 'responseText', {
      configurable: true,
      get() {
        if (this.__cnKey && this.readyState === 4) {
          const done = settle(this);
          if (done) return done.text;
        }
        return textDesc.get.call(this);
      },
    });
  })();

  /* ---- Accent colour picker (header palette button) ---- */

  const ACCENTS = [
    { name: 'Crimson', hex: '#db0000' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Ember', hex: '#ea580c' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Teal', hex: '#0d9488' },
    { name: 'Azure', hex: '#2563eb' },
    { name: 'Violet', hex: '#7c3aed' },
  ];
  const ACCENT_KEY = 'cn-accent';
  const ACCENT_CUSTOM_KEY = 'cn-accent-custom';
  const PALETTE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18c.8 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>';
  let accentPicker = null;

  function mixWithWhite(hex, amount) {
    const value = parseInt(hex.slice(1), 16);
    const channels = [value >> 16, (value >> 8) & 255, value & 255].map((c) => Math.round(c + (255 - c) * amount));
    return '#' + channels.map((c) => c.toString(16).padStart(2, '0')).join('');
  }

  // The server's default accent: one of ACCENTS by name, or any colour as #rrggbb (shown as "Custom")
  const SERVER_HEX = /^#[0-9a-f]{6}$/i.test(CONFIG.defaultAccent) ? CONFIG.defaultAccent : '';
  function serverAccent() {
    if (SERVER_HEX) return 'Custom';
    return ACCENTS.some((entry) => entry.name === CONFIG.defaultAccent) ? CONFIG.defaultAccent : 'Crimson';
  }

  function savedAccent() {
    try {
      return localStorage.getItem(ACCENT_KEY) || serverAccent();
    } catch (error) {
      return serverAccent();
    }
  }

  function savedCustom() {
    try {
      const value = localStorage.getItem(ACCENT_CUSTOM_KEY) || '';
      return /^#[0-9a-f]{6}$/i.test(value) ? value : SERVER_HEX || '#db0000';
    } catch (error) {
      return SERVER_HEX || '#db0000';
    }
  }

  function storeAccent(name, customHex) {
    try {
      localStorage.setItem(ACCENT_KEY, name);
      if (customHex) localStorage.setItem(ACCENT_CUSTOM_KEY, customHex);
    } catch (error) {
      /* private mode: the colour still applies for this visit */
    }
  }

  function applyAccent(name) {
    const accent = name === 'Custom' ? { name: 'Custom', hex: savedCustom() } : (ACCENTS.find((entry) => entry.name === name) || ACCENTS[0]);
    const value = parseInt(accent.hex.slice(1), 16);
    const rgb = [value >> 16, (value >> 8) & 255, value & 255].join(', ');
    root.style.setProperty('--cn-accent', accent.hex);
    root.style.setProperty('--cn-accent-hover', mixWithWhite(accent.hex, 0.14));
    root.style.setProperty('--cn-accent-text', mixWithWhite(accent.hex, 0.38));
    root.style.setProperty('--cn-accent-wash', 'rgba(' + rgb + ', 0.16)');
    return accent;
  }

  function closeAccentPicker() {
    if (accentPicker) accentPicker.remove();
    accentPicker = null;
  }

  function toggleAccentPicker(button) {
    if (accentPicker) {
      closeAccentPicker();
      return;
    }
    const current = savedAccent();
    const pop = el('div', 'cn-accent-pop');
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Accent colour');
    const label = el('div', 'cn-accent-name', current);
    const grid = el('div', 'cn-accent-grid');
    const custom = el('label', 'cn-accent-custom');
    const customDot = el('span', 'cn-accent-custom-dot');
    const customHex = el('span', 'cn-accent-custom-hex', savedCustom().toUpperCase());
    const customInput = el('input');
    customInput.type = 'color';
    customInput.value = savedCustom();
    customInput.setAttribute('aria-label', 'Custom accent colour');
    customDot.style.setProperty('--sw', customInput.value);
    custom.append(customDot, el('span', 'cn-accent-custom-text', 'Custom colour'), customHex, customInput);
    if (current === 'Custom') custom.classList.add('is-active');
    customInput.addEventListener('input', () => {
      const hex = customInput.value;
      storeAccent('Custom', hex);
      applyAccent('Custom');
      customDot.style.setProperty('--sw', hex);
      customHex.textContent = hex.toUpperCase();
      custom.classList.add('is-active');
      grid.querySelectorAll('.cn-accent-swatch').forEach((node) => node.setAttribute('aria-pressed', 'false'));
      label.textContent = 'Custom';
    });
    ACCENTS.forEach((accent) => {
      const swatch = el('button', 'cn-accent-swatch');
      swatch.type = 'button';
      swatch.style.setProperty('--sw', accent.hex);
      swatch.setAttribute('aria-label', accent.name);
      swatch.setAttribute('aria-pressed', String(accent.name === current));
      swatch.addEventListener('mouseenter', () => { label.textContent = accent.name; });
      swatch.addEventListener('mouseleave', () => { label.textContent = savedAccent(); });
      swatch.addEventListener('click', () => {
        storeAccent(accent.name);
        applyAccent(accent.name);
        grid.querySelectorAll('.cn-accent-swatch').forEach((node) => node.setAttribute('aria-pressed', String(node === swatch)));
        custom.classList.remove('is-active');
        label.textContent = accent.name;
      });
      grid.append(swatch);
    });
    pop.append(el('div', 'cn-accent-title', 'Accent colour'), grid, custom, label);
    document.body.append(pop);
    const rect = button.getBoundingClientRect();
    pop.style.top = Math.round(rect.bottom + 10) + 'px';
    pop.style.left = Math.round(Math.min(window.innerWidth - pop.offsetWidth - 12, Math.max(12, rect.left + rect.width / 2 - pop.offsetWidth / 2))) + 'px';
    accentPicker = pop;
    const first = grid.querySelector('[aria-pressed="true"]') || grid.firstChild;
    if (first) first.focus();
  }

  document.addEventListener('click', (event) => {
    if (accentPicker && !accentPicker.contains(event.target) && !event.target.closest('.cn-accent-btn')) closeAccentPicker();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAccentPicker();
  });
  window.addEventListener('hashchange', closeAccentPicker);
  applyAccent(savedAccent());

  window.addEventListener('hashchange', closeWatchlist);
  document.addEventListener('viewshow', (event) => {
    if (event.target.closest) activeDetailPage = event.target.closest('#itemDetailPage');
  }, true);
  // classList.add()/remove() record a class "change" even when the class was already there (or already gone).
  // The theme does that itself on every pass (e.g. removing cn-hero-on off Home), so reacting to those
  // records made it re-run ~8 times a second forever, which showed up as flicker. Only react to real changes.
  new MutationObserver((records) => {
    if (records.some((r) => r.type !== 'attributes' || r.oldValue !== r.target.getAttribute(r.attributeName))) schedule();
  }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  schedule();
})();
