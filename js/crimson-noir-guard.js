/* Crimson Noir: browser check. Loaded straight after the theme stylesheet (not deferred), so a
   browser engine that is too old never paints the half-broken theme. Needs :has() (Chrome 105,
   Safari 15.4, Firefox 121), color-mix() (Chrome 111, Safari 16.2, Firefox 113) and
   replaceChildren(). Jellyfin Media Player 1.x (Chromium 83) fails this and gets stock Jellyfin. */
(function () {
  var ok = !!(window.CSS && CSS.supports && CSS.supports('selector(:has(*))')
    && CSS.supports('color', 'color-mix(in srgb, red, blue)') && Element.prototype.replaceChildren);
  if (ok) return;
  window.__crimsonNoirUnsupported = true;
  var links = document.querySelectorAll('link[data-crimson-noir="css"]');
  for (var i = 0; i < links.length; i++) links[i].media = 'not all';
})();
