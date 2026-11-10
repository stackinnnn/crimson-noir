/* Crimson Noir for Jellyfin 12: loads the theme and adds a random-media slideshow to Home.
   Install: Dashboard > JavaScript Injector, paste this whole file, save, then hard-refresh.
   Jellyfin 12 page hooks were informed by SleekFin (MIT, varunaditya-plus). */
(function () {
  'use strict';

  /* ---- Settings you can change ---- */
  const CONFIG = {
    slides: 8, // how many titles to feature
    seconds: 9, // how long each stays on screen
    types: 'Movie,Series', // or just 'Movie' or 'Series'
    unwatchedOnly: false, // true hides anything already watched
    watchlistUrl: '', // leave empty to use the built-in Watchlist panel, or set a page address
    watchlistRows: 1, // rows of titles shown per Watchlist section before "Show all" (fits screen width)
  };

  if (window.__crimsonNoir) return;
  window.__crimsonNoir = true;

  // Crimson Noir is already dark: stop Dark Reader from recolouring it
  if (!document.querySelector('meta[name="darkreader-lock"]')) {
    const lock = document.createElement('meta');
    lock.name = 'darkreader-lock';
    document.head.append(lock);
  }

  const CSS = "html.cn-ui:root {\n    --cn-black: #000;\n    --cn-surface: #0b0a0b;\n    --cn-raised: #171416;\n    --cn-line: rgba(255, 255, 255, 0.1);\n    --cn-line-strong: rgba(255, 255, 255, 0.22);\n    --cn-text: #f3efef;\n    --cn-muted: #aaa4a5;\n    --cn-accent: #db0000;\n    --cn-accent-hover: #f01a1a;\n    --cn-accent-text: #ff5a5a;\n    --cn-accent-wash: rgba(219, 0, 0, 0.16);\n    --cn-radius: 8px;\n    --cn-gutter: clamp(20px, 5vw, 88px);\n    --cn-ease: cubic-bezier(0.22, 0.8, 0.26, 1);\n    --jf-palette-background-default: var(--cn-black);\n    --jf-palette-background-defaultImage: none;\n    --jf-palette-background-paper: var(--cn-surface);\n    --jf-palette-background-paperChannel: 11 10 11;\n    --jf-palette-common-backgroundChannel: 0 0 0;\n    --jf-palette-common-onBackground: var(--cn-text);\n    --jf-palette-common-onBackgroundChannel: 243 239 239;\n    --jf-palette-text-primary: var(--cn-text);\n    --jf-palette-text-primaryChannel: 243 239 239;\n    --jf-palette-text-secondary: var(--cn-muted);\n    --jf-palette-text-secondaryChannel: 170 164 165;\n    --jf-palette-text-disabled: rgba(170, 164, 165, 0.6);\n    --jf-palette-text-icon: var(--cn-muted);\n    --jf-palette-divider: var(--cn-line);\n    --jf-palette-dividerChannel: 38 36 37;\n    --jf-palette-primary-main: var(--cn-accent);\n    --jf-palette-primary-mainChannel: 219 0 0;\n    --jf-palette-primary-dark: #a80000;\n    --jf-palette-primary-darkChannel: 168 0 0;\n    --jf-palette-primary-light: var(--cn-accent-text);\n    --jf-palette-primary-lightChannel: 255 90 90;\n    --jf-palette-primary-contrastText: #fff;\n    --jf-palette-primary-contrastTextChannel: 255 255 255;\n    --jf-palette-secondary-main: var(--cn-accent);\n    --jf-palette-secondary-mainChannel: 219 0 0;\n    --jf-palette-secondary-dark: #a80000;\n    --jf-palette-secondary-darkChannel: 168 0 0;\n    --jf-palette-secondary-light: var(--cn-accent-text);\n    --jf-palette-secondary-lightChannel: 255 90 90;\n    --jf-palette-secondary-contrastText: #fff;\n    --jf-palette-secondary-contrastTextChannel: 255 255 255;\n    --jf-palette-action-active: var(--cn-text);\n    --jf-palette-action-activeChannel: 243 239 239;\n    --jf-palette-action-hover: rgba(255, 255, 255, 0.07);\n    --jf-palette-action-focus: rgba(255, 255, 255, 0.12);\n    --jf-palette-action-selected: var(--cn-accent-wash);\n    --jf-palette-action-selectedChannel: 219 0 0;\n    --jf-palette-AppBar-defaultBg: var(--cn-black);\n    --jf-palette-AppBar-darkBg: var(--cn-black);\n    --jf-palette-AppBar-darkColor: var(--cn-text);\n    --jf-palette-AppBar-transparentBg: rgba(0, 0, 0, 0.6);\n    --jf-palette-AppBar-gradient: none;\n    --jf-palette-Avatar-defaultBg: var(--cn-raised);\n    --jf-palette-Chip-defaultBorder: var(--cn-line);\n    --jf-palette-FilledInput-bg: var(--cn-surface);\n    --jf-palette-FilledInput-borderColor: var(--cn-line);\n    --jf-palette-FilledInput-hoverBg: var(--cn-raised);\n    --jf-palette-LinearProgress-primaryBg: #470000;\n    --jf-palette-LinearProgress-secondaryBg: #470000;\n    --jf-palette-Skeleton-bg: rgba(255, 255, 255, 0.08);\n    --jf-palette-Slider-primaryTrack: #470000;\n    --jf-palette-SnackbarContent-bg: var(--cn-raised);\n    --jf-palette-SnackbarContent-color: var(--cn-text);\n    --jf-palette-Tooltip-bg: rgba(23, 20, 22, 0.96);\n    --jf-palette-starIcon-main: var(--cn-accent);\n    --jf-palette-starIcon-mainChannel: 219 0 0;\n}\nhtml.cn-ui:not(.transparentDocument),\nhtml.cn-ui:not(.transparentDocument) body,\nhtml.cn-ui .backgroundContainer:not(.withBackdrop):not(.backgroundContainer-transparent),\nhtml.cn-ui .dialog,\nhtml.cn-ui .nowPlayingPlaylist {\n    background-color: var(--cn-black) !important;\n    background-image: none !important;\n}\nhtml.cn-ui body { color: var(--cn-text); }\nhtml.cn-ui ::selection { background: var(--cn-accent); color: #fff; }\nhtml.cn-ui { scrollbar-color: #3a3436 transparent; }\nhtml.cn-ui ::-webkit-scrollbar { height: 8px; width: 8px; }\nhtml.cn-ui ::-webkit-scrollbar-track { background: transparent; }\nhtml.cn-ui ::-webkit-scrollbar-thumb { background: #3a3436; border-radius: 8px; }\nhtml.cn-ui ::-webkit-scrollbar-thumb:hover { background: var(--cn-accent); }\nhtml.cn-ui a:not(.emby-button):not(.card):not(.navMenuOption):not(.textActionButton):not([class*=\"cn-\"]),\nhtml.cn-ui .button-link { color: var(--cn-accent-text); }\nhtml.cn-ui :is(button, a, input, select, textarea):focus-visible {\n    outline: 2px solid var(--cn-accent-text);\n    outline-offset: 2px;\n}\nhtml.cn-ui.layout-tv :is(button, a, input, select, textarea, .focusable):not(.card):focus {\n    outline: 3px solid var(--cn-accent);\n    outline-offset: 2px;\n}\nhtml.cn-ui :is(.mdl-spinner__circle, .progressring-spiner) { border-color: var(--cn-accent) !important; }\nhtml.cn-nav-on .skinHeader,\nhtml.cn-nav-on header.MuiAppBar-root {\n    background: transparent !important;\n    background-image: none !important;\n    box-shadow: none !important;\n    pointer-events: none;\n}\nhtml.cn-nav-on header.MuiAppBar-root > .MuiToolbar-root:first-child,\nhtml.cn-nav-on .skinHeader .headerTop {\n    min-height: 72px !important;\n    visibility: hidden;\n}\nhtml.cn-nav-on header.MuiAppBar-root > .MuiToolbar-root + .MuiToolbar-root,\nhtml.cn-nav-on .skinHeader .headerTabs {\n    background: var(--cn-black);\n    pointer-events: auto;\n}\nhtml.cn-nav-on.cn-hero-on .skinHeader .headerTabs { display: none; }\nhtml.cn-ui:is(.cn-hero-on, .cn-details-on) header.MuiAppBar-root + div[aria-hidden=\"true\"] { height: 0 !important; }\nhtml.cn-ui .emby-tab-button { color: var(--cn-muted); transition: color 160ms ease; }\nhtml.cn-ui .emby-tab-button:hover { color: var(--cn-text); }\nhtml.cn-ui .emby-tab-button-active,\nhtml.cn-ui .emby-tab-button-active.emby-button-focusable { color: #fff !important; }\nhtml.cn-ui .emby-tab-button-active { box-shadow: inset 0 -2px 0 var(--cn-accent); }\nhtml.cn-ui :is(.mainDrawer, .MuiDrawer-paper) {\n    background: var(--cn-surface) !important;\n    border-right: 1px solid var(--cn-line);\n}\nhtml.cn-ui .navMenuOption { border-radius: var(--cn-radius); color: var(--cn-text); }\nhtml.cn-ui .navMenuOption:hover { background: rgba(255, 255, 255, 0.06) !important; }\nhtml.cn-ui .navMenuOption-selected,\nhtml.cn-ui .MuiListItemButton-root.Mui-selected {\n    background: var(--cn-accent-wash) !important;\n    box-shadow: inset 2px 0 0 var(--cn-accent);\n    color: #fff !important;\n}\nhtml.cn-ui .navMenuSectionHeader,\nhtml.cn-ui .sidebarHeader { color: var(--cn-muted); }\nhtml.cn-ui .sectionTitle { color: var(--cn-text); font-weight: 650; letter-spacing: -0.01em; }\nhtml.cn-ui #indexPage .sectionTitle.sectionTitle-cards::before {\n    background: var(--cn-accent);\n    border-radius: 2px;\n    content: \"\";\n    display: inline-block;\n    height: 0.82em;\n    margin-right: 0.55em;\n    vertical-align: -0.06em;\n    width: 3px;\n}\nhtml.cn-ui .sectionTitleTextButton { color: var(--cn-text) !important; }\nhtml.cn-ui .sectionTitleTextButton:hover .sectionTitle,\nhtml.cn-ui .sectionTitleTextButton:hover .material-icons { color: var(--cn-accent-text); }\nhtml.cn-ui .homeLibraryButton {\n    background: var(--cn-raised) !important;\n    border: 1px solid var(--cn-line);\n    border-radius: var(--cn-radius);\n}\nhtml.cn-ui .homeLibraryButton:hover { border-color: var(--cn-accent); }\nhtml.cn-ui .cardScalable,\nhtml.cn-ui .visualCardBox {\n    background: var(--cn-surface);\n    border-radius: var(--cn-radius);\n    transition: box-shadow 180ms var(--cn-ease), transform 180ms var(--cn-ease);\n}\nhtml.cn-ui .visualCardBox { border: 1px solid var(--cn-line); overflow: hidden; }\nhtml.cn-ui .cardBox:not(.visualCardBox) :is(.cardContent, .cardImageContainer, .cardOverlayContainer, .blurhash-canvas) { border-radius: var(--cn-radius); }\nhtml.cn-ui .cardPadder .cardImageIcon { color: var(--cn-raised) !important; }\nhtml.cn-ui .cardBox:not(.visualCardBox) .cardPadder { background-color: var(--cn-surface) !important; }\nhtml.cn-ui .cardScalable,\nhtml.cn-ui .visualCardBox { position: relative; }\nhtml.cn-ui .cardBox:not(.visualCardBox) .cardScalable::after,\nhtml.cn-ui .visualCardBox::after {\n    border: 2px solid var(--cn-accent);\n    border-radius: inherit;\n    box-sizing: border-box;\n    content: \"\";\n    inset: 0;\n    opacity: 0;\n    pointer-events: none;\n    position: absolute;\n    transition: opacity 160ms ease;\n    z-index: 4;\n}\nhtml.cn-ui .card:hover .cardBox:not(.visualCardBox) .cardScalable::after,\nhtml.cn-ui .card:hover .visualCardBox::after,\nhtml.cn-ui .card:focus .cardBox:not(.visualCardBox) .cardScalable::after,\nhtml.cn-ui .card:focus .visualCardBox::after { opacity: 1; }\nhtml.cn-hover-cards #indexPage .card:where(:not([data-type=\"CollectionFolder\"], [data-type=\"UserView\"])) .cardBox { margin-bottom: 0; padding-bottom: 0; position: relative; }\nhtml.cn-hover-cards #indexPage .card:where(:not([data-type=\"CollectionFolder\"], [data-type=\"UserView\"])) .cardFooter {\n    background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.62) 55%, transparent 100%);\n    border-radius: 0 0 var(--cn-radius) var(--cn-radius);\n    bottom: 0;\n    box-sizing: border-box;\n    left: 0;\n    margin: 0;\n    opacity: 0;\n    padding: 34px 11px 11px;\n    pointer-events: none;\n    position: absolute;\n    right: 0;\n    transform: translateY(8px);\n    transition: opacity 240ms ease, transform 240ms var(--cn-ease);\n    z-index: 3;\n}\nhtml.cn-hover-cards #indexPage .card:hover .cardFooter,\nhtml.cn-hover-cards #indexPage .card:focus .cardFooter,\nhtml.cn-hover-cards #indexPage .card:focus-within .cardFooter { opacity: 1; transform: none; }\nhtml.cn-hover-cards #indexPage .card .cardFooter .cardText { font-size: 0.86rem; line-height: 1.3; overflow: hidden; padding: 0; text-align: left; text-overflow: ellipsis; white-space: nowrap; }\nhtml.cn-hover-cards #indexPage .card .cardFooter .cardText-first { font-weight: 700; }\nhtml.cn-hover-cards #indexPage .card:where(:not([data-type=\"CollectionFolder\"], [data-type=\"UserView\"])) .cardOverlayButton-br:not(button) { bottom: auto; right: 6px; top: 6px; }\nhtml.cn-hover-cards #indexPage .card:hover .cardIndicators { opacity: 0; }\nhtml.cn-ui .cardIndicators { transition: opacity 160ms ease; }\nhtml.cn-ui .card:focus { outline: none; }\nhtml.cn-ui .cardOverlayContainer { background: linear-gradient(0deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.12)); }\nhtml.cn-ui :is(.cardText, .cardText-secondary, .cardText a, .cardText .textActionButton) { color: #fff !important; }\nhtml.cn-ui .cardText a { text-decoration: none; }\nhtml.cn-ui button.cardOverlayFab-primary,\nhtml.cn-ui button.cardOverlayButton-centered {\n    background: var(--cn-accent) !important;\n    color: #fff !important;\n}\nhtml.cn-ui button.cardOverlayFab-primary:hover,\nhtml.cn-ui button.cardOverlayButton-centered:hover { background: var(--cn-accent-hover) !important; }\nhtml.cn-ui button.cardOverlayButton:hover { color: var(--cn-accent-text); }\nhtml.cn-ui :is(.playedIndicator, .countIndicator, .fullSyncIndicator, .mediaSourceIndicator) {\n    background: var(--cn-accent) !important;\n    color: #fff !important;\n}\nhtml.cn-ui .itemProgressBar { background: rgba(255, 255, 255, 0.22) !important; }\nhtml.cn-ui .itemProgressBarForeground,\nhtml.cn-ui .itemLinearProgress .MuiLinearProgress-bar { background: var(--cn-accent) !important; }\nhtml.cn-ui .itemBackdrop::after {\n    background: linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.55) 72%, var(--cn-black) 100%);\n    content: \"\";\n    display: block;\n    height: 100%;\n}\nhtml.cn-ui :is(.detailPagePrimaryContainer, .detailPageSecondaryContainer, .detailPageContent) { background: transparent !important; }\nhtml.cn-ui .itemName { font-weight: 720; letter-spacing: -0.02em; }\nhtml.cn-ui :is(.itemMiscInfo, .itemGenres, .itemDetailsGroup, .detailsGroupItem .label) { color: var(--cn-muted); }\nhtml.cn-ui .overview { color: var(--cn-text); line-height: 1.6; }\nhtml.cn-ui .detailButton:hover .detailButton-content { color: var(--cn-accent-text); }\nhtml.cn-ui .mainDetailButtons .btnPlay .detailButton-icon,\nhtml.cn-ui .mainDetailButtons .btnPlay .detailButton-content { color: var(--cn-accent-text); }\nhtml.cn-ui :is(.ratingbutton-icon-withrating, .playstatebutton-icon-played, .starIcon) { color: var(--cn-accent) !important; }\nhtml.cn-ui .detailImageContainer .cardScalable { box-shadow: 0 18px 48px -14px rgba(0, 0, 0, 0.9); }\nhtml.cn-ui .raised,\nhtml.cn-ui .MuiButton-outlined {\n    background: var(--cn-raised);\n    border-radius: var(--cn-radius);\n    color: var(--cn-text);\n}\nhtml.cn-ui .raised:hover { background: #241f22; }\nhtml.cn-ui .button-submit,\nhtml.cn-ui .emby-button.button-submit,\nhtml.cn-ui .MuiButton-containedPrimary {\n    background: var(--cn-accent) !important;\n    border-radius: var(--cn-radius);\n    color: #fff !important;\n}\nhtml.cn-ui .button-submit:hover,\nhtml.cn-ui .MuiButton-containedPrimary:hover { background: var(--cn-accent-hover) !important; }\nhtml.cn-ui .paper-icon-button-light:hover:not(:disabled) { background: rgba(255, 255, 255, 0.08); color: var(--cn-accent-text); }\nhtml.cn-ui .listItem-border { border-bottom: 1px solid var(--cn-line); }\nhtml.cn-ui :is(.paperList, .collapseContent, .visualCardBox) { background-color: var(--cn-surface) !important; }\nhtml.cn-ui .emby-collapsible-button { border-color: var(--cn-line); }\nhtml.cn-ui :is(.emby-input, .emby-select-withcolor, .emby-textarea) {\n    background: var(--cn-surface) !important;\n    border: 1px solid var(--cn-line-strong) !important;\n    border-radius: var(--cn-radius);\n    color: var(--cn-text) !important;\n}\nhtml.cn-ui :is(.emby-input, .emby-select-withcolor, .emby-textarea):focus { border-color: var(--cn-accent) !important; }\nhtml.cn-ui :is(.inputLabelFocused, .selectLabelFocused, .textareaLabelFocused) { color: var(--cn-accent-text) !important; }\nhtml.cn-ui .emby-select-withcolor option { background: var(--cn-surface); color: var(--cn-text); }\nhtml.cn-ui .emby-checkbox:checked + span + .checkboxOutline {\n    background: var(--cn-accent) !important;\n    border-color: var(--cn-accent) !important;\n}\nhtml.cn-ui .emby-checkbox:checked + span + .checkboxOutline > .checkboxIcon-checked { color: #fff !important; }\nhtml.cn-ui .emby-checkbox:focus + span + .checkboxOutline { border-color: var(--cn-accent-text) !important; }\nhtml.cn-ui .dialog { border: 1px solid var(--cn-line); border-radius: 12px; }\nhtml.cn-ui :is(.formDialogHeader:not(.formDialogHeader-clear), .formDialogFooter:not(.formDialogFooter-clear)) { background: var(--cn-surface) !important; border-color: var(--cn-line); }\nhtml.cn-ui .actionSheet { background: var(--cn-raised) !important; }\nhtml.cn-ui .actionSheetMenuItem:hover { background: var(--cn-accent-wash) !important; }\nhtml.cn-ui .dialogBackdrop { background: rgba(0, 0, 0, 0.72) !important; }\nhtml.cn-ui .nowPlayingBar { background: var(--cn-surface) !important; border-top: 1px solid var(--cn-line); }\nhtml.cn-ui .sliderBubble { background: var(--cn-raised) !important; }\nhtml.cn-ui .mdl-slider-background-lower { background: var(--cn-accent) !important; }\nhtml.cn-ui .mdl-slider::-webkit-slider-thumb { background: var(--cn-accent) !important; }\nhtml.cn-ui .mdl-slider::-moz-range-thumb { background: var(--cn-accent) !important; }\nhtml.cn-ui .emby-slider-background-lower { background: var(--cn-accent) !important; }\n#indexPage.homePage.libraryPage:has(.cn-hero) { padding-top: 0 !important; }\n.cn-hero {\n    background: #000;\n    color: var(--cn-text);\n    display: block;\n    height: clamp(460px, 80vh, 960px);\n    overflow: hidden;\n    position: relative;\n    touch-action: pan-y;\n    width: 100%;\n}\n.cn-hero[data-state=\"loading\"]::after {\n    animation: cn-sweep 1.6s linear infinite;\n    background: linear-gradient(105deg, transparent 35%, rgba(219, 0, 0, 0.12) 50%, transparent 65%);\n    content: \"\";\n    inset: 0;\n    position: absolute;\n}\n@keyframes cn-sweep {\n    from { transform: translateX(-100%); }\n    to { transform: translateX(100%); }\n}\n.cn-slide {\n    background: radial-gradient(90% 90% at 78% 30%, rgba(219, 0, 0, 0.22), transparent 70%);\n    inset: 0;\n    opacity: 0;\n    position: absolute;\n    transition: opacity 1.1s ease, visibility 0s linear 1.1s;\n    visibility: hidden;\n}\n.cn-slide[data-active=\"true\"] {\n    opacity: 1;\n    transition: opacity 1.1s ease;\n    visibility: visible;\n    z-index: 1;\n}\n.cn-backdrop {\n    height: 100%;\n    inset: 0;\n    object-fit: cover;\n    object-position: center 22%;\n    opacity: 0;\n    position: absolute;\n    transform: scale(1.02);\n    transition: opacity 700ms ease, transform 0s linear 1.1s;\n    width: 100%;\n}\n.cn-backdrop[data-loaded=\"true\"] { opacity: 1; }\n.cn-slide[data-active=\"true\"] .cn-backdrop {\n    transform: scale(1.1) translate3d(-1.2%, -0.8%, 0);\n    transition: opacity 700ms ease, transform calc(var(--cn-seconds, 9s) + 2s) linear;\n}\n.cn-shade {\n    background:\n        linear-gradient(0deg, #000 0%, rgba(0, 0, 0, 0.66) 20%, transparent 56%),\n        linear-gradient(90deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.6) 34%, transparent 68%);\n    inset: 0;\n    position: absolute;\n}\n.cn-content {\n    bottom: clamp(30px, 6vh, 72px);\n    box-sizing: border-box;\n    left: 0;\n    max-width: min(660px, 100%);\n    padding: 0 var(--cn-gutter);\n    position: absolute;\n}\n.cn-slide:not([data-active=\"true\"]) .cn-content { opacity: 0; transition: opacity 180ms ease; }\n.cn-slide[data-active=\"true\"] .cn-content > * { animation: cn-rise 640ms var(--cn-ease) both; }\n.cn-slide[data-active=\"true\"] .cn-content > :nth-child(2) { animation-delay: 70ms; }\n.cn-slide[data-active=\"true\"] .cn-content > :nth-child(3) { animation-delay: 130ms; }\n.cn-slide[data-active=\"true\"] .cn-content > :nth-child(4) { animation-delay: 190ms; }\n@keyframes cn-rise {\n    from { opacity: 0; transform: translateY(14px); }\n    to { opacity: 1; transform: none; }\n}\n.cn-title {\n    color: #fff;\n    font-size: clamp(2.1rem, 4.6vw, 4.2rem);\n    font-weight: 800;\n    letter-spacing: -0.03em;\n    line-height: 1.02;\n    margin: 0 0 14px;\n    text-wrap: balance;\n}\n.cn-title img {\n    display: block;\n    max-height: clamp(84px, 17vh, 170px);\n    max-width: min(460px, 78vw);\n    object-fit: contain;\n    object-position: left bottom;\n}\n.cn-meta {\n    align-items: center;\n    color: #dcd6d7;\n    display: flex;\n    flex-wrap: wrap;\n    font-size: 0.95rem;\n    gap: 4px 14px;\n    margin-bottom: 12px;\n}\n.cn-meta b { color: var(--cn-accent-text); font-weight: 700; }\n.cn-meta .cn-cert { border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 3px; font-size: 0.78rem; padding: 0 5px; }\n.cn-overview {\n    -webkit-box-orient: vertical;\n    -webkit-line-clamp: 3;\n    color: #e4dfdf;\n    display: -webkit-box;\n    font-size: 1.02rem;\n    line-height: 1.55;\n    margin: 0 0 22px;\n    overflow: hidden;\n}\n.cn-actions { display: flex; flex-wrap: wrap; gap: 12px; }\n.cn-btn {\n    align-items: center;\n    border: 0;\n    border-radius: var(--cn-radius);\n    box-sizing: border-box;\n    cursor: pointer;\n    display: inline-flex;\n    font: inherit;\n    font-weight: 700;\n    gap: 8px;\n    min-height: 46px;\n    padding: 0 24px 0 18px;\n    text-decoration: none;\n    transition: background-color 160ms ease, transform 160ms var(--cn-ease);\n}\n.cn-btn:active { transform: scale(0.97); }\n.cn-btn svg { fill: currentColor; height: 22px; width: 22px; }\n.cn-btn-primary { background: var(--cn-accent); color: #fff; }\n.cn-btn-primary:hover { background: var(--cn-accent-hover); }\n.cn-btn-ghost { background: rgba(255, 255, 255, 0.14); color: #fff; }\n.cn-btn-ghost:hover { background: rgba(255, 255, 255, 0.24); }\n.cn-arrow {\n    align-items: center;\n    background: rgba(0, 0, 0, 0.5);\n    border: 1px solid var(--cn-line-strong);\n    border-radius: 50%;\n    color: #fff;\n    cursor: pointer;\n    display: flex;\n    height: 48px;\n    justify-content: center;\n    opacity: 0;\n    padding: 0;\n    position: absolute;\n    top: 46%;\n    transition: background-color 160ms ease, opacity 200ms ease;\n    width: 48px;\n    z-index: 3;\n}\n.cn-arrow svg { fill: currentColor; height: 26px; width: 26px; }\n.cn-arrow:hover { background: var(--cn-accent); }\n.cn-prev { left: 16px; }\n.cn-next { right: 16px; }\n.cn-hero:hover .cn-arrow,\n.cn-arrow:focus-visible,\nhtml.layout-tv .cn-arrow { opacity: 1; }\nhtml.layout-tv .cn-hero :is(.cn-btn, .cn-arrow):focus { outline: 3px solid #fff; outline-offset: 2px; }\n@media (max-width: 767px), (pointer: coarse) {\n    .cn-arrow { display: none; }\n    html.layout-tv .cn-arrow { display: flex; }\n}\n@media (max-width: 600px) {\n    .cn-hero { height: clamp(460px, 74svh, 720px); }\n    .cn-shade { background: linear-gradient(0deg, #000 8%, rgba(0, 0, 0, 0.74) 44%, rgba(0, 0, 0, 0.1) 78%); }\n    .cn-overview { -webkit-line-clamp: 2; font-size: 0.95rem; margin-bottom: 16px; }\n}\n@media (prefers-reduced-motion: reduce) {\n    .cn-slide, .cn-slide[data-active=\"true\"], .cn-backdrop, .cn-slide[data-active=\"true\"] .cn-backdrop { transition: none; }\n    .cn-backdrop, .cn-slide[data-active=\"true\"] .cn-backdrop { transform: none; }\n    .cn-slide[data-active=\"true\"] .cn-content > * { animation: none; }\n    .cn-hero[data-state=\"loading\"]::after { animation: none; }\n}\n.cn-nav {\n    -webkit-backdrop-filter: blur(16px) saturate(140%);\n    align-items: center;\n    backdrop-filter: blur(16px) saturate(140%);\n    background: rgba(0, 0, 0, 0.3);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 999px;\n    box-sizing: border-box;\n    display: flex;\n    gap: 6px;\n    left: 50%;\n    max-width: calc(100vw - 24px);\n    padding: 5px;\n    position: fixed;\n    top: 14px;\n    transform: translateX(-50%);\n    transition: background-color 240ms ease;\n    z-index: 1200;\n}\n.cn-nav[hidden] { display: none; }\nhtml.cn-scrolled .cn-nav { background: rgba(0, 0, 0, 0.62); }\n.cn-nav-links {\n    display: flex;\n    gap: 2px;\n    min-width: 0;\n    overflow-x: auto;\n    scrollbar-width: none;\n}\n.cn-nav-links::-webkit-scrollbar { display: none; }\n.cn-nav-tools {\n    border-left: 1px solid rgba(255, 255, 255, 0.16);\n    display: flex;\n    flex: none;\n    gap: 2px;\n    padding-left: 6px;\n}\n.cn-nav-link,\n.cn-nav-icon {\n    align-items: center;\n    background: none;\n    border: 0;\n    border-radius: 999px;\n    color: #f3efef;\n    cursor: pointer;\n    display: inline-flex;\n    flex: none;\n    font: inherit;\n    font-size: 0.93rem;\n    font-weight: 600;\n    height: 38px;\n    justify-content: center;\n    position: relative;\n    text-decoration: none;\n    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);\n    transition: background-color 160ms ease, color 160ms ease;\n    white-space: nowrap;\n}\n.cn-nav-link { padding: 0 15px; }\n.cn-nav-link[hidden] { display: none; }\n.cn-nav-icon { width: 38px; }\n.cn-nav-icon svg { fill: currentColor; height: 21px; width: 21px; }\n.cn-nav-link:hover,\n.cn-nav-icon:hover { background: rgba(255, 255, 255, 0.14); }\n.cn-nav-link[aria-current=\"page\"] { background: var(--cn-accent); color: #fff; text-shadow: none; }\n@media (max-width: 860px) {\n    .cn-nav { left: 12px; right: 12px; transform: none; }\n    .cn-nav-links { flex: 1; }\n    .cn-nav-link { font-size: 0.88rem; padding: 0 12px; }\n}\nhtml.cn-details-loading #itemDetailPage:not([data-cn]) { opacity: 0; }\nhtml.cn-ui #itemDetailPage[data-cn] { background: #000; padding-top: 0 !important; }\n#itemDetailPage[data-cn] > #itemBackdrop,\n#itemDetailPage[data-cn] .detailPagePrimaryContainer > :is(.detailImageContainer, .detailRibbon),\n#itemDetailPage[data-cn] :is(.detailLogo, .nameContainer, .overview, .overview-controls, .itemMiscInfo-primary, .trackSelections, .itemTags),\n#itemDetailPage[data-cn-eps] #childrenCollapsible { display: none !important; }\n#itemDetailPage[data-cn] .detailPageWrapperContainer { background: transparent; margin-top: 0; padding-top: 0; }\n#itemDetailPage[data-cn] .detailPagePrimaryContainer { display: block; margin: 0; padding: 0 var(--cn-gutter); }\n#itemDetailPage[data-cn] .detailPagePrimaryContent { margin: 0; max-width: none; padding: 0; width: 100%; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer { box-sizing: border-box; margin: 0; max-width: none; padding: 0 var(--cn-gutter) 56px !important; width: 100%; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer :is(.padded-left, .padded-right) { padding-left: 0 !important; padding-right: 0 !important; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer .emby-scroller { margin-left: 0; margin-right: 0; }\n#itemDetailPage[data-cn] .detailPageSecondaryContainer .verticalSection { padding-left: 0; padding-right: 0; }\n#itemDetailPage[data-cn] .streaming-lookup-container { box-sizing: border-box; margin-left: 0 !important; max-width: none; width: 100%; }\n.cn-dh {\n    background: #000;\n    box-sizing: border-box;\n    display: flex;\n    flex-direction: column;\n    justify-content: flex-end;\n    min-height: clamp(520px, 70vh, 860px);\n    overflow: hidden;\n    padding: 110px var(--cn-gutter) 36px;\n    position: relative;\n}\n.cn-dh-back {\n    height: 100%;\n    inset: 0;\n    object-fit: cover;\n    object-position: center 18%;\n    opacity: 0;\n    position: absolute;\n    transition: opacity 500ms ease;\n    width: 100%;\n}\n.cn-dh-back[data-loaded=\"true\"] { opacity: 1; }\n.cn-dh-shade {\n    background:\n        linear-gradient(0deg, #000 0%, rgba(0, 0, 0, 0.72) 22%, transparent 58%),\n        linear-gradient(90deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.42) 30%, transparent 62%);\n    inset: 0;\n    position: absolute;\n}\n.cn-dh-stack { max-width: 620px; position: relative; }\n.cn-dh-title { color: #fff; font-size: clamp(2.2rem, 4.2vw, 3.8rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; margin: 0 0 16px; }\n.cn-dh-title img { display: block; max-height: clamp(84px, 15vh, 150px); max-width: min(420px, 78vw); object-fit: contain; object-position: left bottom; }\n.cn-dh-sub { color: #fff; font-size: 1.3rem; font-weight: 650; margin: -4px 0 12px; }\n.cn-dh-facts,\n.cn-dh-genres { align-items: center; color: #efeaea; display: flex; flex-wrap: wrap; font-size: 0.95rem; }\n.cn-dh-facts { margin-bottom: 8px; }\n.cn-dh-genres { color: #d9d3d4; font-size: 0.9rem; margin-bottom: 20px; }\n.cn-dh-facts > * + *::before,\n.cn-dh-genres > * + *::before { color: rgba(255, 255, 255, 0.5); content: \"·\"; margin: 0 9px; }\n.cn-dh-facts > .cn-cert::before { display: none; }\n.cn-dh-facts .cn-cert { border: 1px solid rgba(255, 255, 255, 0.42); border-radius: 4px; font-size: 0.76rem; margin-left: 12px; padding: 0 6px; }\n.cn-star { color: var(--cn-accent); }\n.cn-dh-overview {\n    -webkit-box-orient: vertical;\n    -webkit-line-clamp: 4;\n    color: #e6e1e2;\n    display: -webkit-box;\n    line-height: 1.55;\n    margin: 0 0 24px;\n    overflow: hidden;\n}\nhtml.cn-ui #itemDetailPage .cn-dactions { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; margin: 0; padding: 0; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .detailButton {\n    -webkit-backdrop-filter: blur(12px);\n    align-items: center;\n    backdrop-filter: blur(12px);\n    background: rgba(20, 18, 19, 0.62);\n    border: 1px solid rgba(255, 255, 255, 0.14);\n    border-radius: 999px;\n    color: #fff;\n    display: inline-flex;\n    height: 46px;\n    justify-content: center;\n    margin: 0;\n    min-width: 0;\n    padding: 0;\n    width: 46px;\n}\nhtml.cn-ui #itemDetailPage .cn-dactions > .detailButton.hide { display: none; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .detailButton:hover { background: rgba(60, 54, 56, 0.8); }\nhtml.cn-ui #itemDetailPage .cn-dactions .detailButton-content { align-items: center; color: inherit; display: flex; }\nhtml.cn-ui #itemDetailPage .cn-dactions .detailButton-icon { color: inherit; font-size: 22px; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay {\n    -webkit-backdrop-filter: none;\n    backdrop-filter: none;\n    background: #fff;\n    border-color: #fff;\n    color: #000;\n    flex: none !important;\n    flex-direction: row !important;\n    font-size: 1.06rem;\n    font-weight: 700;\n    gap: 10px;\n    height: 52px !important;\n    min-width: 152px !important;\n    order: -2;\n    padding: 0 34px 0 26px !important;\n    white-space: nowrap;\n    width: auto !important;\n}\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay .detailButton-icon { font-size: 28px; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay:hover { background: #e4dfe0; }\nhtml.cn-ui #itemDetailPage .cn-dactions > .btnPlay::after { content: attr(title); }\nhtml.cn-ui #itemDetailPage .cn-dactions > .cn-watch { cursor: pointer; order: -1; }\n.cn-watch svg { fill: currentColor; height: 22px; width: 22px; }\n.cn-watch[aria-pressed=\"true\"] svg { color: var(--cn-accent-text); }\n.cn-eps { box-sizing: border-box; padding: 26px var(--cn-gutter) 12px; }\n.cn-eps-head { align-items: center; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; margin-bottom: 16px; }\n.cn-eps-title { border-left: 3px solid var(--cn-accent); padding-left: 11px; }\n.cn-eps-count { color: var(--cn-muted); font-size: 0.9rem; margin-top: 2px; }\nhtml.cn-ui .cn-season,\n.cn-season-text {\n    -webkit-appearance: none;\n    appearance: none;\n    background: transparent;\n    background-image: linear-gradient(45deg, transparent 50%, #aaa4a5 50%), linear-gradient(135deg, #aaa4a5 50%, transparent 50%);\n    background-position: right 7px top 58%, right 2px top 58%;\n    background-repeat: no-repeat;\n    background-size: 5px 5px;\n    border: 0;\n    color: #fff;\n    cursor: pointer;\n    font: inherit;\n    font-size: 1.45rem;\n    font-weight: 650;\n    padding: 0 22px 0 0;\n}\n.cn-season-text { background: none; cursor: default; display: block; padding: 0; }\nhtml.cn-ui .cn-season option { background: #0b0a0b; color: #f3efef; font-size: 1rem; }\n.cn-eps-tools { align-items: center; display: flex; gap: 8px; }\n.cn-tool-group { background: var(--cn-raised); border-radius: 10px; display: flex; }\n.cn-tool {\n    align-items: center;\n    background: var(--cn-raised);\n    border: 0;\n    border-radius: 10px;\n    color: var(--cn-muted);\n    cursor: pointer;\n    display: flex;\n    height: 38px;\n    justify-content: center;\n    width: 38px;\n}\n.cn-tool svg { fill: currentColor; height: 19px; width: 19px; }\n.cn-tool:hover { color: #fff; }\n.cn-tool[aria-pressed=\"true\"] { background: #342e31; color: #fff; }\n.cn-eps-search {\n    background: var(--cn-surface);\n    border: 1px solid var(--cn-line-strong);\n    border-radius: 10px;\n    box-sizing: border-box;\n    color: var(--cn-text);\n    font: inherit;\n    height: 38px;\n    padding: 0 12px;\n    width: min(220px, 46vw);\n}\n.cn-eps-search[hidden] { display: none; }\n.cn-eplist { display: flex; gap: 12px; overflow-x: auto; padding: 4px 2px 14px; scroll-snap-type: x proximity; }\n.cn-eplist[data-view=\"list\"] { flex-direction: column; overflow-x: visible; }\n.cn-ep { aspect-ratio: 16 / 9; border-radius: 12px; flex: 0 0 clamp(270px, 24vw, 370px); overflow: hidden; position: relative; scroll-snap-align: start; }\n.cn-eplist[data-view=\"list\"] .cn-ep { aspect-ratio: auto; flex: none; min-height: 150px; }\n.cn-ep-main { background: var(--cn-raised); border: 0; color: #fff; cursor: pointer; display: block; font: inherit; height: 100%; inset: 0; padding: 0; position: absolute; text-align: left; width: 100%; }\n.cn-eplist[data-view=\"list\"] .cn-ep-main { position: relative; }\n.cn-ep-main img { height: 100%; inset: 0; object-fit: cover; position: absolute; transition: transform 360ms var(--cn-ease); width: 100%; }\n.cn-ep-main:hover img { transform: scale(1.04); }\n.cn-ep::after { border: 2px solid var(--cn-accent); border-radius: inherit; box-sizing: border-box; content: \"\"; inset: 0; opacity: 0; pointer-events: none; position: absolute; transition: opacity 160ms ease; z-index: 3; }\n.cn-ep:hover::after,\n.cn-ep:focus-within::after { opacity: 1; }\n.cn-ep-shade { background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 8%, rgba(0, 0, 0, 0.5) 52%, rgba(0, 0, 0, 0.05) 86%); inset: 0; position: absolute; }\n.cn-ep-copy { bottom: 0; box-sizing: border-box; display: block; left: 0; padding: 12px 14px; position: absolute; right: 0; }\n.cn-eplist[data-view=\"list\"] .cn-ep-copy { max-width: 760px; }\n.cn-ep-eyebrow { color: #cfc9ca; display: block; font-size: 0.66rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }\n.cn-ep-name { display: block; font-size: 1.04rem; font-weight: 700; margin: 2px 0 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cn-ep-over { -webkit-box-orient: vertical; -webkit-line-clamp: 2; color: #d7d1d2; display: -webkit-box; font-size: 0.8rem; line-height: 1.35; overflow: hidden; }\n.cn-ep-foot { align-items: center; color: #d7d1d2; display: flex; font-size: 0.76rem; justify-content: space-between; margin-top: 6px; }\n.cn-ep-prog { background: rgba(255, 255, 255, 0.24); bottom: 0; height: 3px; left: 0; position: absolute; right: 0; }\n.cn-ep-prog i { background: var(--cn-accent); display: block; height: 100%; }\n.cn-ep-dl { align-items: center; background: rgba(20, 18, 19, 0.7); border-radius: 8px; color: #fff; display: flex; height: 32px; justify-content: center; position: absolute; right: 9px; top: 9px; width: 32px; }\n.cn-ep-dl svg { fill: currentColor; height: 18px; width: 18px; }\n.cn-ep-dl:hover { background: var(--cn-accent); }\n.cn-eps-msg { color: var(--cn-muted); padding: 20px 0; }\n.cn-wl { background: #000; box-sizing: border-box; inset: 0; overflow-y: auto; padding: 88px var(--cn-gutter) 40px; position: fixed; z-index: 1150; }\n.cn-wl-head { align-items: center; display: flex; justify-content: space-between; margin-bottom: 20px; }\n.cn-wl-head h2 { border-left: 3px solid var(--cn-accent); font-size: 1.6rem; margin: 0; padding-left: 11px; }\n.cn-wl-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }\n.cn-wl-card { color: var(--cn-text); display: block; font-size: 0.9rem; text-decoration: none; }\n.cn-wl-poster { aspect-ratio: 2 / 3; background: var(--cn-raised); border-radius: var(--cn-radius); display: block; margin-bottom: 7px; overflow: hidden; }\n.cn-wl-poster img { display: block; height: 100%; object-fit: cover; width: 100%; }\n.cn-wl-card:hover .cn-wl-poster,\n.cn-wl-card:focus-visible .cn-wl-poster { outline: 2px solid var(--cn-accent); outline-offset: -2px; }\n.cn-wl-group + .cn-wl-group { margin-top: 34px; }\n.cn-wl-group h3 { font-size: 1.15rem; font-weight: 650; margin: 0 0 12px; }\n@media (max-width: 600px) {\n    .cn-dh { min-height: 76svh; padding-top: 90px; }\n    .cn-dh-shade { background: linear-gradient(0deg, #000 8%, rgba(0, 0, 0, 0.76) 46%, rgba(0, 0, 0, 0.12) 80%); }\n    .cn-wl-grid { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); }\n}";

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
    if (!isHome()) return null;
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

  function buildSlide(client, item, index, total) {
    const slide = el('section', 'cn-slide');
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', (index + 1) + ' of ' + total + ': ' + item.Name);

    const backdrop = el('img', 'cn-backdrop');
    backdrop.alt = '';
    backdrop.decoding = 'async';
    backdrop.dataset.src = imageUrl(client, item, 'Backdrop');
    backdrop.addEventListener('load', () => { backdrop.dataset.loaded = 'true'; });

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
      const next = (index + slides.length) % slides.length;
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

    if (slides.length > 1) {
      node.append(
        button('cn-arrow cn-prev', 'prev', 'Previous', () => go(current - 1)),
        button('cn-arrow cn-next', 'next', 'Next', () => go(current + 1))
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
          if (event.key === 'ArrowLeft') go(current - 1);
          if (event.key === 'ArrowRight') go(current + 1);
        });
      }

      node.addEventListener('pointerdown', (event) => {
        touchStart = event.pointerType === 'touch' ? event.clientX : null;
      });
      node.addEventListener('pointerup', (event) => {
        if (touchStart === null) return;
        const distance = event.clientX - touchStart;
        touchStart = null;
        if (Math.abs(distance) > 50) go(current + (distance < 0 ? 1 : -1));
      });
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
    root.classList.remove('cn-hero-on');
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
    const inLibrary = (entry) => () => Boolean(entry.id) && location.hash.includes(entry.id);

    link('Home', '#/home', isHome);
    link('Favourites', '#/home?tab=1', () => /^\/(home)?$/.test(routePath()) && tabIs('1'));
    [
      ['Movies', 'movies', (id) => '#/movies?topParentId=' + id + '&collectionType=movies'],
      ['Shows', 'tvshows', (id) => '#/tv?topParentId=' + id + '&collectionType=tvshows'],
      ['Collections', 'boxsets', (id) => '#/list?parentId=' + id + '&serverId=' + serverId()],
    ].forEach(([label, type, fallback]) => {
      const entry = link(label, '', null, { type, fallback });
      entry.isActive = inLibrary(entry);
    });

    if (CONFIG.watchlistUrl) {
      link('Watchlist', CONFIG.watchlistUrl, () => false);
    } else {
      const watch = el('button', 'cn-nav-link', 'Watchlist');
      watch.type = 'button';
      watch.addEventListener('click', () => openWatchlist(client));
      links.append(watch);
    }

    link('Requests', '#/downloads', () => routePath() === '/downloads');
    link('Calendar', '#/calendar', () => routePath() === '/calendar');

    const search = el('a', 'cn-nav-icon');
    search.href = '#/search';
    search.innerHTML = icon('search');
    search.setAttribute('aria-label', 'Search');

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

    tools.append(search, palette, profile);
    node.append(links, tools);
    document.body.append(node);

    const state = { node, entries, views: null };
    client.getUserViews({}, client.getCurrentUserId()).then((result) => {
      state.views = result.Items || [];
      schedule();
    }).catch((error) => console.warn('[Crimson Noir] Could not load libraries:', error));
    return state;
  }

  function syncNav(client) {
    if (!document.body) return;
    if (!nav) nav = createNav(client);
    const visible = navAllowed();
    showNav(visible);
    if (!visible) return;

    nav.entries.forEach((entry) => {
      if (entry.view && nav.views) {
        const view = nav.views.find((candidate) => candidate.CollectionType === entry.view.type);
        entry.id = view ? view.Id : '';
        entry.anchor.hidden = !view;
        if (view) {
          const href = libraryHref(view, entry.view.fallback(view.Id));
          if (entry.anchor.getAttribute('href') !== href) entry.anchor.setAttribute('href', href);
        }
      }
      const active = Boolean(entry.isActive && entry.isActive());
      if (active && !entry.anchor.hasAttribute('aria-current')) {
        // On narrow screens the link row scrolls, so bring the current page into view.
        const row = entry.anchor.parentNode;
        row.scrollLeft = entry.anchor.offsetLeft - row.offsetLeft - (row.clientWidth - entry.anchor.offsetWidth) / 2;
      }
      if (active) entry.anchor.setAttribute('aria-current', 'page');
      else entry.anchor.removeAttribute('aria-current');
    });
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
      button.innerHTML = '<div class="detailButton-content">' + icon(saved ? 'bookmarked' : 'bookmark') + '</div>';
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
      logo.addEventListener('error', () => { title.textContent = titleText; });
      logo.src = logoUrl;
      title.replaceChildren(logo);
    }

    const stack = el('div', 'cn-dh-stack');
    stack.append(title);
    if (child) {
      const prefix = item.Type === 'Episode' && item.IndexNumber != null ? 'S' + (item.ParentIndexNumber || 0) + ':E' + item.IndexNumber + ' · ' : '';
      stack.append(el('div', 'cn-dh-sub', prefix + item.Name));
    }
    stack.append(buildFacts(item, seasons));
    if ((item.Genres || []).length) {
      const genres = el('div', 'cn-dh-genres');
      item.Genres.slice(0, 4).forEach((genre) => genres.append(el('span', '', genre)));
      stack.append(genres);
    }
    if (item.Overview) stack.append(el('p', 'cn-dh-overview', item.Overview));
    stack.append(actions);
    hero.append(stack);
    return hero;
  }

  function buildEpisodes(client, series, seasons) {
    const regular = seasons.filter((season) => Number(season.IndexNumber) > 0);
    const list = regular.length ? regular : seasons;
    const userId = client.getCurrentUserId();
    let episodes = [];
    let query = '';
    let descending = false;
    let requestId = 0;

    const section = el('section', 'cn-eps');
    const head = el('div', 'cn-eps-head');
    const heading = el('div', 'cn-eps-title');
    const count = el('div', 'cn-eps-count');
    let select = null;
    if (list.length > 1) {
      select = el('select', 'cn-season');
      select.setAttribute('aria-label', 'Season');
      list.forEach((season) => {
        const option = el('option', '', season.Name);
        option.value = season.Id;
        select.append(option);
      });
      heading.append(select);
    } else {
      heading.append(el('span', 'cn-season-text', list[0].Name));
    }
    heading.append(count);

    const parser = el('div');
    parser.innerHTML = '<div is="emby-itemscontainer" class="cn-eplist itemsContainer" data-contextmenu="false" data-multiselect="false" data-view="grid"></div>';
    const grid = parser.firstElementChild;
    if (window.CustomElements && window.CustomElements.upgradeSubtree) window.CustomElements.upgradeSubtree(grid);

    function tool(name, label, onClick) {
      const button = el('button', 'cn-tool');
      button.type = 'button';
      button.innerHTML = icon(name);
      button.setAttribute('aria-label', label);
      button.addEventListener('click', onClick);
      return button;
    }

    function card(episode) {
      const position = (episode.UserData && episode.UserData.PlaybackPositionTicks) || 0;
      const article = el('article', 'cn-ep');
      const play = el('button', 'cn-ep-main itemAction');
      play.type = 'button';
      play.dataset.action = position > 0 ? 'resume' : 'play';
      play.dataset.id = episode.Id;
      play.dataset.serverid = episode.ServerId || client.serverId();
      play.dataset.type = 'Episode';
      play.dataset.mediatype = 'Video';
      play.dataset.isfolder = 'false';
      if (position > 0) play.dataset.positionticks = String(position);

      const tag = (episode.ImageTags || {}).Primary;
      if (tag) {
        const image = el('img');
        image.alt = '';
        image.loading = 'lazy';
        image.src = client.getImageUrl(episode.Id, { type: 'Primary', tag, maxWidth: 840, quality: 90 });
        play.append(image);
      }
      play.append(el('span', 'cn-ep-shade'));

      const copy = el('span', 'cn-ep-copy');
      if (episode.IndexNumber != null) copy.append(el('span', 'cn-ep-eyebrow', 'Episode ' + episode.IndexNumber));
      copy.append(el('span', 'cn-ep-name', episode.Name || ''));
      if (episode.Overview) copy.append(el('span', 'cn-ep-over', episode.Overview));
      const foot = el('span', 'cn-ep-foot');
      foot.append(el('span', '', '▶ ' + runtime(episode.RunTimeTicks)));
      if (episode.CommunityRating) foot.append(el('span', '', '★ ' + Number(episode.CommunityRating).toFixed(1)));
      copy.append(foot);
      play.append(copy);

      const percent = Number((episode.UserData && episode.UserData.PlayedPercentage) || 0);
      if (percent > 0 && percent < 100) {
        const bar = el('span', 'cn-ep-prog');
        const fill = el('i');
        fill.style.width = percent + '%';
        bar.append(fill);
        play.append(bar);
      }

      article.append(play);
      if (episode.CanDownload && client.getItemDownloadUrl) {
        const download = el('a', 'cn-ep-dl');
        download.href = client.getItemDownloadUrl(episode.Id);
        download.setAttribute('download', '');
        download.setAttribute('aria-label', 'Download ' + (episode.Name || 'episode'));
        download.innerHTML = icon('download');
        article.append(download);
      }
      return article;
    }

    function paint() {
      const needle = query.trim().toLowerCase();
      const shown = episodes
        .filter((episode) => !needle || ((episode.Name || '') + ' ' + (episode.Overview || '')).toLowerCase().includes(needle))
        .sort((a, b) => ((a.IndexNumber || 0) - (b.IndexNumber || 0)) * (descending ? -1 : 1));
      grid.replaceChildren(...(shown.length ? shown.map(card) : [el('div', 'cn-eps-msg', 'No matching episodes.')]));
    }

    function load(seasonId) {
      const id = ++requestId;
      count.textContent = '';
      client.getEpisodes(series.Id, { seasonId, userId, Fields: 'Overview,CanDownload' }).then((result) => {
        if (id !== requestId) return;
        episodes = result.Items || [];
        count.textContent = episodes.length + (episodes.length === 1 ? ' episode' : ' episodes');
        paint();
      }).catch((error) => {
        if (id !== requestId) return;
        console.warn('[Crimson Noir] Episodes failed:', error);
        grid.replaceChildren(el('div', 'cn-eps-msg', 'Couldn\'t load episodes.'));
      });
    }

    const search = el('input', 'cn-eps-search');
    search.type = 'search';
    search.placeholder = 'Search episodes';
    search.setAttribute('aria-label', 'Search episodes');
    search.hidden = true;
    search.addEventListener('input', () => { query = search.value; paint(); });

    const searchButton = tool('search', 'Search episodes', () => {
      search.hidden = !search.hidden;
      if (search.hidden) { search.value = ''; query = ''; paint(); } else { search.focus(); }
    });
    const sortButton = tool('sort', 'Reverse episode order', () => { descending = !descending; paint(); });

    const group = el('div', 'cn-tool-group');
    const views = { grid: null, list: null };
    function setView(view) {
      grid.dataset.view = view;
      Object.keys(views).forEach((key) => views[key].setAttribute('aria-pressed', String(key === view)));
    }
    views.grid = tool('grid', 'Row view', () => setView('grid'));
    views.list = tool('list', 'List view', () => setView('list'));
    group.append(views.grid, views.list);
    setView('grid');

    const tools = el('div', 'cn-eps-tools');
    tools.append(search, searchButton, sortButton, group);
    head.append(heading, tools);
    section.append(head, grid);

    if (select) select.addEventListener('change', () => load(select.value));
    load(list[0].Id);
    return section;
  }

  function destroyDetail() {
    if (!detail) return;
    const { page, teardown } = detail;
    if (teardown) teardown();
    delete page.dataset.cn;
    delete page.dataset.cnEps;
    delete page.dataset.cnSet;
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

    let episodes = null;
    const secondary = wrapper.querySelector('.detailPageSecondaryContainer');
    if (item.Type === 'Series' && seasons.length && secondary) {
      episodes = buildEpisodes(client, item, seasons);
      secondary.parentNode.insertBefore(episodes, secondary);
      page.dataset.cnEps = 'true';
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
      if (episodes) episodes.remove();
    };
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
      if (!['Movie', 'Series', 'Season', 'Episode', 'BoxSet'].includes(item.Type)) return [item, null];
      if (item.Type === 'BoxSet') {
        return client.getItems(userId, { ParentId: item.Id, SortBy: 'PremiereDate,ProductionYear,SortName', SortOrder: 'Ascending', Fields: 'Overview,Taglines,Genres' })
          .then((result) => [item, result.Items || []]).catch(() => [item, []]);
      }
      return (item.Type === 'Series' ? client.getSeasons(item.Id, { userId }).then((result) => result.Items || []).catch(() => []) : Promise.resolve([]))
        .then((seasons) => [item, seasons]);
    }).then(([item, seasons]) => {
      if (detail !== state) return;
      if (seasons) mountDetail(client, state, item, seasons); else conceal(false);
    }).catch((error) => {
      console.warn('[Crimson Noir] Details page left as standard:', error);
      if (detail === state) conceal(false);
    });
  }

  function reconcile() {
    reconcileTimer = 0;
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
      // TV mode restores the exact focused node from its cached Home page, so keep it alive.
      if (hero && isTv() && hero.node.isConnected && /^#\/details(?:[?&]|$)/.test(location.hash)) {
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
    const page = document.getElementById('videoOsdPage');
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
    const kicker = episode ? (item.SeriesName || '') : (item.ProductionYear ? String(item.ProductionYear) : '');
    const box = el('div', 'cn-osd-title');
    if (kicker) box.append(el('div', 'cn-osd-kicker', kicker));
    box.append(el('div', 'cn-osd-name', item.Name || ''));
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
    const item = await xpItem(card.dataset.id);
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
    const dialog = document.querySelector('.upNextDialog');
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
    const button = document.querySelector('.skip-button');
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

  function loadFeatures(client, parentId, cfg) {
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
    if (featureState && featureState.grid === grid) return;
    teardownFeatures();
    const parentId = new URLSearchParams(location.hash.split('?')[1] || '').get('topParentId');
    const state = { grid, tiles: [], head: null, observer: null, timer: 0, schedule: null };
    featureState = state;
    loadFeatures(client, parentId, cfg).then(({ picks, top, total, open }) => {
      if (featureState !== state) return;
      state.head = libraryHead(cfg.title, total + ' ' + cfg.noun[total === 1 ? 0 : 1], open + ' ' + cfg.open);
      grid.parentNode.insertBefore(state.head, grid);
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

  window.addEventListener('resize', () => { if (featureState && featureState.schedule) featureState.schedule(); });
  setInterval(() => {
    const client = window.ApiClient;
    if (!client || !client.getCurrentUserId || !client.getCurrentUserId()) return;
    mountFeatures(client);
    mountFavouriteTiles(client);
  }, 800);

  /* ---- Quick settings: the profile button opens a control-centre panel ---- */
  // Everyday settings change in place and save straight to the account; everything else is one link away.
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

  function closeQuickSettings(restoreFocus) {
    if (!qsPanel) return;
    const { node, trigger, cleanup } = qsPanel;
    qsPanel = null;
    cleanup();
    node.remove();
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

    const onDoc = (event) => { if (!node.contains(event.target) && !trigger.contains(event.target)) closeQuickSettings(false); };
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

      const subsOn = () => ['Always', 'Smart', 'Default'].includes(config.SubtitleMode || 'Default');
      const board = el('div', 'cn-qs-board');
      board.append(
        tile('subs', 'Subtitles', subsOn, (on) => (on ? (config.SubtitleMode === 'Smart' ? 'Smart' : 'Always on') : 'Forced only'), (next, on) => { next.SubtitleMode = on ? 'Always' : 'OnlyForced'; }),
        tile('next', 'Autoplay next', () => config.EnableNextEpisodeAutoPlay !== false, (on) => (on ? 'On' : 'Off'), (next, on) => { next.EnableNextEpisodeAutoPlay = on; }),
        tile('memory', 'Remember tracks', () => Boolean(config.RememberAudioSelections && config.RememberSubtitleSelections), (on) => (on ? 'Audio and subtitles' : 'Off'), (next, on) => { next.RememberAudioSelections = on; next.RememberSubtitleSelections = on; }),
        tile('latest', 'Hide watched in Latest', () => Boolean(config.HidePlayedInLatest), (on) => (on ? 'On' : 'Off'), (next, on) => { next.HidePlayedInLatest = on; })
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

      node.replaceChildren(who, board, languages, audio, status, all, foot);
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

  function savedAccent() {
    try {
      return localStorage.getItem(ACCENT_KEY) || 'Crimson';
    } catch (error) {
      return 'Crimson';
    }
  }

  function savedCustom() {
    try {
      const value = localStorage.getItem(ACCENT_CUSTOM_KEY) || '';
      return /^#[0-9a-f]{6}$/i.test(value) ? value : '#db0000';
    } catch (error) {
      return '#db0000';
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
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  schedule();
})();
