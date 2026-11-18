---
name: Crimson Noir
description: A black Jellyfin 12 theme that lets every title's artwork fill the screen; this system governs the GitHub README and its authored hero raster.
colors:
  crimson-signal: "#e50914"
  oxblood-glow: "#6b0b13"
  ember-dark: "#2a0609"
  char: "#0a0405"
  void-red: "#050304"
  wordmark-white: "#ffffff"
  frame-line: "rgba(255,255,255,0.1)"
  badge-graphite: "#555555"
typography:
  wordmark:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "54px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.005em"
rounded:
  wall: "12px"
  frame: "7px"
spacing:
  wordmark-top: "28px"
  flank-inset: "20px"
components:
  hero-wall:
    backgroundColor: "{colors.void-red}"
    rounded: "{rounded.wall}"
    width: "1000px"
    height: "470px"
  wordmark:
    textColor: "{colors.wordmark-white}"
    typography: "{typography.wordmark}"
  wordmark-accent:
    textColor: "{colors.crimson-signal}"
    typography: "{typography.wordmark}"
  screenshot-frame:
    rounded: "{rounded.frame}"
  badge-release:
    backgroundColor: "{colors.crimson-signal}"
  badge-quiet:
    backgroundColor: "{colors.badge-graphite}"
---

# Design System: Crimson Noir

## Overview

**Creative North Star: "The Poster Wall"**

The README is the theme's landing page, and it borrows the theme's own world rather than inventing a marketing one: a near-black ground warming to oxblood, the wordmark split crimson and white, and real screenshots of the theme as the only material. One authored raster (assets/hero.png, source assets/src/hero.html) carries all of the visual identity, because GitHub strips CSS and fonts; everything below it is plain GitHub Markdown and HTML tables.

Density is low at the top and practical below: the wall, a one-line pitch, four badges, three pillars and the install URL fit in the first desktop viewport, then a lead-and-pairs gallery and reference sections. Words carry what the image does not. No emoji, no section numbers, no decorative glyphs.

**Key Characteristics:**
- One authored hero raster; every other surface is native GitHub rendering.
- Screenshots are the material: framed, softly shadowed, never decorated.
- Crimson appears once in the wordmark and once in the release badge; everything else is black, white or graphite.
- Tables are the only layout device: three across for pillars, two across for the gallery.

## Colors

A near-black-to-oxblood ground with a single crimson signal; the theme's surfaces, not a new palette.

### Primary
- **Crimson Signal** (crimson-signal): the CRIMSON half of the wordmark and the release badge colour. It is the README's brand red; the theme's runtime default accent (`--cn-accent`) is the slightly deeper #db0000, and the theme uses this same red for rating and favourite icons.

### Neutral
- **Void Red, Char, Ember Dark, Oxblood Glow** (void-red, char, ember-dark, oxblood-glow): the stops of the hero ground, a radial gradient rising from the bottom centre (`radial-gradient(110% 95% at 50% 105%, oxblood-glow 0%, ember-dark 48%, char 78%, void-red 100%)`). Never used flat.
- **Wordmark White** (wordmark-white): the NOIR half of the wordmark.
- **Frame Line** (frame-line): the 1px hairline around every screenshot; the same value as the theme's `--cn-line`.
- **Badge Graphite** (badge-graphite): every badge except release.

### Named Rules
**The One Red Rule.** Crimson appears in exactly two places above the fold: the wordmark's first word and the release badge. Downloads, Jellyfin and licence badges stay graphite.

**The Borrowed Ground Rule.** The hero ground is the theme's own black-to-oxblood light, not a brand gradient; it only ever sits behind screenshots and the wordmark.

## Typography

**Display Font:** Open Sans 800 (rendered into the hero raster only)
**Body Font:** GitHub's system stack (not controllable)

**Character:** A heavy, wide, uppercase wordmark is the only authored type; everything else defers to GitHub so the page reads as a native repo, not a skin.

### Hierarchy
- **Wordmark** (800, 54px at 1000px canvas, line-height 1, 0.005em): "CRIMSON NOIR" centred 28px from the wall's top; first word crimson, second white.
- **Pillar and gallery titles**: GitHub bold (`<b>`), followed by a `<br>` and one plain sentence; dependency notes in italics.

### Named Rules
**The Type In Pixels Rule.** Custom type exists only inside rasters. Never ask Markdown to carry a font, size or colour it cannot render.

## Layout

The hero raster is 1000 × 470 CSS px rendered at 2x (2000 × 940) and placed at `width="100%"`. Inside it: Home centre stage (640 × 313, top 112px), the film page and collection shelf flanking at 380px wide, 20px from the edges, top 160px, angled 16° toward the centre with `perspective(1100px)`. Below the hero, the pitch and badges are centred in a `<div align="center">`; pillars use one `<table>` row of three `<td width="33%" valign="top">` cells. The gallery gives each group (Watching, Browsing, Yours) at most one full-width lead screenshot with a bold caption line under it, then `<table>` rows of two `<td width="50%" valign="top">` cells (about 410px per shot on desktop, up from about 280px at three across). Pairs keep the screens' 1920:953 shape so their captions line up. The manifest URL sits in a fenced block so GitHub adds a copy button.

## Elevation & Depth

Depth lives only inside the hero raster: screenshots float on the ground with soft, layered drop shadows and a slight perspective tilt on the flanks. The Markdown below is flat.

### Shadow Vocabulary
- **Frame lift** (`box-shadow: 0 22px 48px -8px rgba(0,0,0,.85), 0 6px 14px rgba(0,0,0,.5)`): every screenshot in the hero; a long ambient fall plus a tight contact shadow.

### Named Rules
**The Soft Fall Rule.** Shadows are blurred and fall downward; never hard offsets.

## Shapes

Two radii: the wall's outer corners (12px), cut to transparency so the raster sits cleanly on both GitHub themes, and the screenshot frames (7px) with a 1px Frame Line border and clipped contents. Nothing else is shaped.

## Components

### Hero Wall
The single authored image: ground gradient, wordmark, three framed screenshots (Home front, z-index 3; flanks behind, z-index 2; the left flank dimmed to brightness .88). Rendered from assets/src/hero.html with headless Chrome at 2x and a transparent default background; re-render steps in assets/src/README.md.

### Screenshot Frame
- **Corner Style:** rounded.frame, contents clipped.
- **Border:** 1px Frame Line.
- **Shadow Strategy:** Frame lift (see Elevation & Depth).

### Badges
Four shields.io badges in one centred row: release (Crimson Signal), downloads, Jellyfin 12 and licence (Badge Graphite). Flat default style, no logos.

### Pillar Row
One three-cell table: bold title, line break, one sentence. Exactly three pillars.

### Gallery Cell
A linked screenshot at `width="100%"` with descriptive alt text, then the bold page name and a one-line note; plugin dependencies as an italic trailing sentence. Grouped under Watching, Browsing and Yours: one full-width lead (Film page, Collections), the rest two per row. Screens that are mostly empty at README size (Seasons, People, Requests) show a close-up crop from `docs/screenshots/close/`, cut at the same 1920:953 shape from the full shot, and still link to the full screenshot.

## Do's and Don'ts

### Do:
- **Do** put any new visual identity into a raster rendered from an HTML source under assets/src/, and document how to re-render it.
- **Do** use real screenshots from docs/screenshots/ that follow the privacy rules (no viewing history, avatars, active streams or personal names).
- **Do** frame screenshots with the 7px radius, 1px rgba(255,255,255,.1) line and the Frame lift shadow.
- **Do** keep transparent outer corners on rasters so they sit on GitHub's light and dark themes.
- **Do** lay out the gallery as one full-width lead per group, then two-column tables with a bold title and one line.

### Don't:
- **Don't** add emoji, section numbers or decorative glyphs; words carry the page.
- **Don't** colour more than the release badge crimson.
- **Don't** stack full-width screenshots down the page or shrink them to three across; one lead per group, the rest in pairs.
- **Don't** use hard offset shadows on screenshots.
