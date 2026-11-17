# Asset sources

`hero.html` is the source of `assets/hero.png`, the poster wall at the top of the README. It places three screenshots from `docs/screenshots/` (Home, a film page, a collection) on the theme's dark red ground, with rounded transparent corners. After re-rendering, re-embed its provenance note (`impeccable embed-prompt assets/hero.png --prompt-file ...`).

To re-render it after retaking those screenshots (Windows, from the repo root):

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --force-device-scale-factor=2 --window-size=1000,470 --virtual-time-budget=5000 --screenshot="%CD%\assets\hero.png" "file:///%CD:\=/%/assets/src/hero.html"
```

It renders at 2x (2000 × 940). Screenshots must follow the privacy rules: no viewing history, avatars, active streams or personal names.
