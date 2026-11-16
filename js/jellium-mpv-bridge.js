// Jellium mpv bridge (Crimson Noir)
// Jellium Desktop plays video in native mpv and never creates a <video> element, so anything
// that watches `.videoPlayerContainer video` (Jellyfin Enhanced pause screen, Crimson Noir's
// paused-state player bar) never sees a pause. This keeps a hidden stand-in <video> inside the
// player container that mirrors the mpv player's state and fires the matching media events.
// Does nothing in a normal browser.
(function () {
  'use strict';
  if (window.__cnJelliumBridge) return;
  window.__cnJelliumBridge = true;

  const mpv = () => window._mpvVideoPlayerInstance || null;
  const itemIdOf = (p) => (p && p._currentPlayOptions && p._currentPlayOptions.item && p._currentPlayOptions.item.Id) || null;

  let proxy = null;
  let last = null;
  let statsTick = 0;

  function makeProxy() {
    const v = document.createElement('video');
    v.className = 'cn-mpv-proxy';
    v.muted = true;
    v.tabIndex = -1;
    v.setAttribute('aria-hidden', 'true');
    v.style.setProperty('display', 'none', 'important');
    const def = (name, get, set) => Object.defineProperty(v, name, { configurable: true, get, set: set || function () {} });
    // jellyfin-web player plugins report time in milliseconds; HTMLMediaElement uses seconds
    def('paused', () => { const p = mpv(); return !p || !!p._paused; });
    def('ended', () => { const p = mpv(); return !p || !p._currentSrc; });
    def('readyState', () => { const p = mpv(); return p && p._started ? 4 : 0; });
    def('currentTime', () => { const p = mpv(); return ((p && p._currentTime) || 0) / 1000; },
      (s) => { const p = mpv(); if (p && isFinite(s)) p.currentTime(Math.round(s * 1000)); });
    def('duration', () => { const p = mpv(); const d = p && p._duration; return d ? d / 1000 : NaN; });
    const src = () => { const id = itemIdOf(mpv()); return id ? location.origin + '/Videos/' + id + '/stream' : ''; };
    def('currentSrc', src);
    def('src', src);
    v.play = () => { const p = mpv(); if (p) p.unpause(); return Promise.resolve(); };
    v.pause = () => { const p = mpv(); if (p) p.pause(); };
    return v;
  }

  const fire = (type) => { if (proxy) proxy.dispatchEvent(new Event(type)); };

  function tick() {
    const p = mpv();
    const box = document.querySelector('.videoPlayerContainer');
    if (!p || !box || !p._currentSrc) {
      if (proxy) { fire('emptied'); proxy.remove(); proxy = null; }
      last = null;
      return;
    }
    if (!proxy) proxy = makeProxy();
    if (proxy.parentNode !== box) box.appendChild(proxy);

    const now = { id: itemIdOf(p), paused: !!p._paused, started: !!p._started, time: p._currentTime };
    if (!last || last.id !== now.id) {
      fire('emptied');
      fire('loadstart');
      if (now.started) fire(now.paused ? 'pause' : 'playing');
    } else {
      if (now.started && !last.started) fire('loadedmetadata');
      if (now.paused !== last.paused) {
        if (now.paused) fire('pause');
        else { fire('play'); fire('playing'); }
      }
      if (now.time !== last.time) fire('timeupdate');
    }
    last = now;

    // Jellyfin only fills Playback Info on the player's timeupdate, which mpv stops sending while paused
    const stats = document.querySelector('.playerStats');
    if (now.paused && stats && !stats.classList.contains('hide') && p.events) {
      statsTick = (statsTick + 1) % 4;
      if (statsTick === 1) p.events.trigger(p, 'timeupdate');
    } else {
      statsTick = 0;
    }
  }

  function start() {
    if (!(window.jmpNative || window._mpvVideoPlayer || window._mpvVideoPlayerInstance)) return false;
    setInterval(tick, 250);
    return true;
  }
  // The native shim may set its globals a moment after injected scripts run
  if (!start()) {
    let tries = 0;
    const wait = setInterval(() => { if (start() || ++tries > 40) clearInterval(wait); }, 500);
  }
})();
