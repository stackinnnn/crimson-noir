# Try the theme straight from this repo in Jellium Desktop, against your real server, without releasing.
#
#   scripts\dev.cmd              start Jellium in dev mode (double-click it; close Jellium first)
#   scripts\dev.cmd -Restart     close a running Jellium and restart it in dev mode
#   scripts\dev-kefin.cmd        same, plus KefinTweaks breadcrumbs / season flattening / series info switched
#                                on in this Jellium window only (adds -KefinTweaks; the server setting is untouched)
#   ... -Settings '{"MoreDetailsOpen":true}'
#                                try plugin settings-page options before releasing: the JSON is given to the theme
#                                as window.CrimsonNoirSettings, as the plugin does (DefaultAccent, HomeSlideshow,
#                                SlideshowCount, SlideshowSeconds, SlideshowUnwatchedOnly, MoreDetailsOpen, HiddenNavItems, NavOrder)
#   Dashboard > Plugins > Crimson Noir also shows this repo's settings page; Save keeps the settings in
#   scripts\dev-settings.json (git-ignored, server untouched) and Ctrl+R applies them. Delete that file to go back.
#
# Jellium still loads your server's web UI, but every /CrimsonNoir/<file> request (the plugin's theme files)
# is answered with the copy in this repo's js/ or css/ folder instead. Nothing on the server changes and other
# devices keep the released theme. Edit a file, press Ctrl+R in Jellium, and the change is live.
# Dev mode lasts while this window stays open; close it (or quit Jellium) to go back to the released theme.
param(
  [string]$Jellium = 'G:\windows-x64\jellium-desktop.exe',
  [int]$Port = 9229,
  [switch]$Restart,
  [switch]$KefinTweaks,
  [string]$Settings = ''
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent

function Get-Targets {
  try { return Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json" -TimeoutSec 2 } catch { return $null }
}

# 1. Jellium with its debug port open
$targets = Get-Targets
if (-not $targets) {
  $running = Get-Process jellium-desktop -ErrorAction SilentlyContinue
  if ($running) {
    if (-not $Restart) {
      Write-Host 'Jellium is already open (without dev mode). Close it first, or run: scripts\dev.cmd -Restart' -ForegroundColor Yellow
      exit 1
    }
    Write-Host 'Closing Jellium...'
    $running | ForEach-Object { $_.CloseMainWindow() | Out-Null }
    Start-Sleep -Seconds 3
    Get-Process jellium-desktop -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 1
  }
  if (-not (Test-Path $Jellium)) { throw "Jellium not found at $Jellium (pass -Jellium <path>)" }
  Write-Host 'Starting Jellium in dev mode...'
  Start-Process -FilePath $Jellium -ArgumentList "--remote-debug-port $Port"
  for ($i = 0; $i -lt 60 -and -not $targets; $i++) { Start-Sleep -Milliseconds 500; $targets = Get-Targets }
  if (-not $targets) { throw "Jellium didn't open its debug port ($Port)." }
}

# 2. The Jellyfin page inside Jellium
$page = $null
for ($i = 0; $i -lt 60 -and -not $page; $i++) {
  $page = @(Get-Targets) | ForEach-Object { $_ } | Where-Object { $_.type -eq 'page' -and $_.url -match '^https?://' -and $_.url -notmatch '^devtools' } | Select-Object -First 1
  if (-not $page) { Start-Sleep -Milliseconds 500 }
}
if (-not $page) { throw 'No Jellyfin page found in Jellium.' }

# 3. Talk to it over the DevTools protocol
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ws.Options.KeepAliveInterval = [TimeSpan]::FromSeconds(20)
$ws.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
$script:nextId = 0
function Send-Cdp([string]$method, [string]$paramsJson = '{}') {
  $script:nextId++
  $json = '{"id":' + $script:nextId + ',"method":"' + $method + '","params":' + $paramsJson + '}'
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $ws.SendAsync([ArraySegment[byte]]::new($bytes), 'Text', $true, [Threading.CancellationToken]::None).Wait()
}

# A small "Local theme" tag in the corner, added to the end of the local crimson-noir.js as it's served,
# so it's obvious which theme you're looking at
$badge = @'

;(function () {
  var tag = document.createElement('div');
  tag.textContent = 'Local theme';
  tag.title = 'Crimson Noir is loading from your repo (scripts/dev.ps1)';
  tag.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:2147483647;padding:4px 10px;border-radius:999px;font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.04em;color:#fff;background:rgba(219,0,0,.85);pointer-events:none';
  document.body.append(tag);
  console.info('[Crimson Noir] dev mode: theme files come from the local repo');
})();
'@

# -KefinTweaks: switch on the KefinTweaks features the theme makes room for, in this window only, by loading
# their scripts from the same KefinTweaks version the server already uses
$kefin = @'

;(function () {
  var files = {
    breadcrumbs: ['breadcrumbs.js', 'breadcrumbNav.css'],
    flattenSingleSeasonShows: ['seriesEpisodes.js', 'seriesEpisodes.css'],
    seriesInfo: ['seriesInfo.js', null]
  };
  var tries = 0;
  (function go() {
    var cfg = window.KefinTweaksConfig;
    var utils = Array.prototype.map.call(document.scripts, function (s) { return s.src; })
      .filter(function (src) { return /KefinTweaks[^/]*\/scripts\/utils\.js/.test(src); })[0];
    if (!cfg || !cfg.scripts || !utils || !window.KefinTweaksUtils) { if (tries++ < 60) setTimeout(go, 500); return; }
    var base = utils.replace(/utils\.js.*$/, '');
    Object.keys(files).forEach(function (name) {
      if (cfg.scripts[name]) return; // already on for real
      cfg.scripts[name] = true;
      if (files[name][1]) { var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = base + files[name][1]; document.head.append(link); }
      var script = document.createElement('script'); script.src = base + files[name][0]; document.head.append(script);
    });
    console.info('[Crimson Noir] dev mode: KefinTweaks breadcrumbs, season flattening and series info on for this window');
  })();
})();
'@
if ($KefinTweaks) {
  $badge = $badge.Replace("'Local theme'", "'Local theme + KefinTweaks'") + $kefin
}
$badgeBytes = [Text.Encoding]::UTF8.GetBytes($badge)

Send-Cdp 'Network.enable'
Send-Cdp 'Network.setCacheDisabled' '{"cacheDisabled":true}'
Send-Cdp 'Network.setBypassServiceWorker' '{"bypass":true}'
# The plugin's settings page also comes from the repo, and what it saves stays on this PC (scripts\dev-settings.json,
# git-ignored) instead of reaching the server; the theme then gets those settings on the next reload (Ctrl+R).
$pluginId = 'a4fe4b36-2a1d-4909-b78e-69d0816d0add'
$devSettingsPath = Join-Path $PSScriptRoot 'dev-settings.json'
$configPage = Join-Path $repo 'src\Jellyfin.Plugin.CrimsonNoir\Configuration\config.html'
function Get-DevThemeSettings {
  # The same shape the plugin injects (TransformationPatches.SettingsJson): lists become arrays
  if (-not (Test-Path $devSettingsPath)) { return $null }
  $c = Get-Content $devSettingsPath -Raw | ConvertFrom-Json
  $split = { param($v) @(([string]$v).Split(',') | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ -match '^[a-z]+$' }) }
  $o = [ordered]@{
    DefaultAccent = $c.DefaultAccent; HomeSlideshow = $c.HomeSlideshow; SlideshowCount = $c.SlideshowCount
    SlideshowSeconds = $c.SlideshowSeconds; SlideshowUnwatchedOnly = $c.SlideshowUnwatchedOnly; MoreDetailsOpen = $c.MoreDetailsOpen
    HiddenNavItems = & $split $c.HiddenNavItems; NavOrder = & $split $c.NavOrder
  }
  return (ConvertTo-Json $o -Compress)
}
Send-Cdp 'Fetch.enable' ('{"patterns":[{"urlPattern":"*/CrimsonNoir/*","requestStage":"Request"},{"urlPattern":"*configurationpage?name=Crimson*","requestStage":"Request"},{"urlPattern":"*/Plugins/' + $pluginId + '/Configuration*","requestStage":"Request"}]}')
Send-Cdp 'Page.reload' '{"ignoreCache":true}'

Write-Host ''
Write-Host "Dev mode on: Jellium is using the theme files in $repo" -ForegroundColor Green
Write-Host 'Edit js/ or css/, then press Ctrl+R in Jellium. Close this window to stop.'
Write-Host ''

# 4. Answer the theme's file requests with the local copies
$buffer = New-Object byte[] 1048576
while ($ws.State -eq 'Open') {
  $stream = New-Object IO.MemoryStream
  try {
    do {
      $result = $ws.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
      $stream.Write($buffer, 0, $result.Count)
    } while (-not $result.EndOfMessage -and $result.MessageType -ne 'Close')
  } catch { break }
  if ($result.MessageType -eq 'Close') { break }
  $text = [Text.Encoding]::UTF8.GetString($stream.ToArray())
  if ($text -notmatch '"method":"Fetch\.requestPaused"') { continue }

  $msg = $text | ConvertFrom-Json
  $requestId = $msg.params.requestId
  $url = $msg.params.request.url

  # Plugin settings page and its saves (kept on this PC)
  if ($url -match 'configurationpage\?name=Crimson') {
    $body = [Convert]::ToBase64String([IO.File]::ReadAllBytes($configPage))
    Send-Cdp 'Fetch.fulfillRequest' ('{"requestId":"' + $requestId + '","responseCode":200,"responseHeaders":[{"name":"Content-Type","value":"text/html; charset=utf-8"},{"name":"Cache-Control","value":"no-store"}],"body":"' + $body + '"}')
    Write-Host ((Get-Date -Format 'HH:mm:ss') + '  local  settings page')
    continue
  }
  if ($url -match "/Plugins/$pluginId/Configuration") {
    $method = $msg.params.request.method
    if ($method -eq 'POST' -and $msg.params.request.postData) {
      [IO.File]::WriteAllText($devSettingsPath, $msg.params.request.postData, (New-Object Text.UTF8Encoding $false))
      Send-Cdp 'Fetch.fulfillRequest' ('{"requestId":"' + $requestId + '","responseCode":204,"responseHeaders":[{"name":"Cache-Control","value":"no-store"}]}')
      Write-Host ((Get-Date -Format 'HH:mm:ss') + '  saved  settings to scripts\dev-settings.json (server untouched); press Ctrl+R to see them') -ForegroundColor Green
    } elseif ($method -eq 'GET' -and (Test-Path $devSettingsPath)) {
      $body = [Convert]::ToBase64String([IO.File]::ReadAllBytes($devSettingsPath))
      Send-Cdp 'Fetch.fulfillRequest' ('{"requestId":"' + $requestId + '","responseCode":200,"responseHeaders":[{"name":"Content-Type","value":"application/json; charset=utf-8"},{"name":"Cache-Control","value":"no-store"}],"body":"' + $body + '"}')
      Write-Host ((Get-Date -Format 'HH:mm:ss') + '  local  settings')
    } else {
      Send-Cdp 'Fetch.continueRequest' ('{"requestId":"' + $requestId + '"}')
    }
    continue
  }
  $name = if ($url -match '/CrimsonNoir/([^/?#]+)') { $Matches[1] } else { '' }
  $local = @("$repo\js\$name", "$repo\css\$name") | Where-Object { $name -and (Test-Path $_ -PathType Leaf) } | Select-Object -First 1

  if ($local) {
    $type = if ($name -like '*.css') { 'text/css; charset=utf-8' } else { 'application/javascript; charset=utf-8' }
    $bytes = [IO.File]::ReadAllBytes($local)
    if ($name -eq 'crimson-noir.js') {
      $bytes = $bytes + $badgeBytes
      $use = if ($Settings) { $Settings } else { Get-DevThemeSettings }
      if ($use) { $bytes = [Text.Encoding]::UTF8.GetBytes("window.CrimsonNoirSettings = $use;`n") + $bytes }
    }
    $body = [Convert]::ToBase64String($bytes)
    Send-Cdp 'Fetch.fulfillRequest' ('{"requestId":"' + $requestId + '","responseCode":200,"responseHeaders":[{"name":"Content-Type","value":"' + $type + '"},{"name":"Cache-Control","value":"no-store"}],"body":"' + $body + '"}')
    Write-Host ((Get-Date -Format 'HH:mm:ss') + "  local  $name")
  } else {
    Send-Cdp 'Fetch.continueRequest' ('{"requestId":"' + $requestId + '"}')
    Write-Host ((Get-Date -Format 'HH:mm:ss') + "  server $name")
  }
}
Write-Host 'Jellium closed; dev mode off.'
