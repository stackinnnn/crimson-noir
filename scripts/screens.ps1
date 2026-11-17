# Screenshot check before a release: photographs the same set of pages in Jellium Desktop twice, once with
# the theme your server has now (the released plugin) and once with this repo's js/ and css/, then builds
# screenshots-check\<date-time>\compare.html with the two side by side.
#
#   scripts\screens.cmd               close Jellium first (or add -Restart); takes a few minutes
#   scripts\screens.cmd -Only local   just this repo's version (e.g. to look over a change)
#
# Don't run it while dev.cmd is open (both would answer Jellium's theme requests). Jellium is brought to the
# front while it runs: posters only load in a visible window. The pictures stay on this PC (git-ignored).
param(
  [string]$Jellium = 'G:\windows-x64\jellium-desktop.exe',
  [int]$Port = 9229,
  [switch]$Restart,
  [ValidateSet('both', 'released', 'local')][string]$Only = 'both',
  [int]$SettleSeconds = 5
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$outRoot = Join-Path $repo 'screenshots-check'
$run = Join-Path $outRoot (Get-Date -Format 'yyyy-MM-dd HHmm')

if (Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.CommandLine -match 'dev\.ps1' }) {
  Write-Host 'dev.cmd is running. Close its window first, then run this again.' -ForegroundColor Yellow
  exit 1
}

# ---- Jellium with its debug port open ----
function Get-Targets { try { return Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json" -TimeoutSec 2 } catch { return $null } }
$targets = Get-Targets
if (-not $targets) {
  $running = Get-Process jellium-desktop -ErrorAction SilentlyContinue
  if ($running) {
    if (-not $Restart) { Write-Host 'Jellium is open without its debug port. Close it first, or run: scripts\screens.cmd -Restart' -ForegroundColor Yellow; exit 1 }
    $running | ForEach-Object { $_.CloseMainWindow() | Out-Null }; Start-Sleep 3
    Get-Process jellium-desktop -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep 1
  }
  Write-Host 'Starting Jellium...'
  Start-Process -FilePath $Jellium -ArgumentList "--remote-debug-port $Port"
  for ($i = 0; $i -lt 60 -and -not $targets; $i++) { Start-Sleep -Milliseconds 500; $targets = Get-Targets }
  if (-not $targets) { throw "Jellium didn't open its debug port ($Port)." }
}
$page = $null
for ($i = 0; $i -lt 60 -and -not $page; $i++) {
  $page = @(Get-Targets) | ForEach-Object { $_ } | Where-Object { $_.type -eq 'page' -and $_.url -match '^https?://' } | Select-Object -First 1
  if (-not $page) { Start-Sleep -Milliseconds 500 }
}
if (-not $page) { throw 'No Jellyfin page found in Jellium.' }

# Bring the window forward: hidden windows don't load posters or paint
Add-Type -Namespace CnWin -Name User32 -MemberDefinition @'
[DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
[DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
'@
Get-Process jellium-desktop -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object {
  [CnWin.User32]::ShowWindow($_.MainWindowHandle, 9) | Out-Null   # SW_RESTORE
  [CnWin.User32]::SetForegroundWindow($_.MainWindowHandle) | Out-Null
}

# ---- DevTools connection: one reader that answers theme requests while waiting for replies ----
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ws.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
$script:nextId = 0
$script:replies = @{}
$script:intercept = $false
$script:pending = $null
$buffer = New-Object byte[] 16777216
$message = New-Object IO.MemoryStream

function Send-Raw([string]$json) {
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $ws.SendAsync([ArraySegment[byte]]::new($bytes), 'Text', $true, [Threading.CancellationToken]::None).Wait()
}
function Answer-Request($msg) {
  $requestId = $msg.params.requestId
  $name = if ($msg.params.request.url -match '/CrimsonNoir/([^/?#]+)') { $Matches[1] } else { '' }
  $local = @("$repo\js\$name", "$repo\css\$name") | Where-Object { $name -and (Test-Path $_ -PathType Leaf) } | Select-Object -First 1
  if ($script:intercept -and $local) {
    $type = if ($name -like '*.css') { 'text/css; charset=utf-8' } else { 'application/javascript; charset=utf-8' }
    $body = [Convert]::ToBase64String([IO.File]::ReadAllBytes($local))
    Send-Raw ('{"id":0,"method":"Fetch.fulfillRequest","params":{"requestId":"' + $requestId + '","responseCode":200,"responseHeaders":[{"name":"Content-Type","value":"' + $type + '"},{"name":"Cache-Control","value":"no-store"}],"body":"' + $body + '"}}')
  } else {
    Send-Raw ('{"id":0,"method":"Fetch.continueRequest","params":{"requestId":"' + $requestId + '"}}')
  }
}
# Read messages for up to $ms, answering theme requests; stop early once reply $wantId arrives.
function Pump([int]$ms, [int]$wantId = -1) {
  $clock = [Diagnostics.Stopwatch]::StartNew()
  while ($clock.ElapsedMilliseconds -lt $ms -and $ws.State -eq 'Open') {
    if ($wantId -ge 0 -and $script:replies.ContainsKey($wantId)) { return }
    if (-not $script:pending) { $script:pending = $ws.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None) }
    if (-not $script:pending.Wait(200)) { continue }
    $r = $script:pending.Result; $script:pending = $null
    $message.Write($buffer, 0, $r.Count)
    if (-not $r.EndOfMessage) { continue }
    $text = [Text.Encoding]::UTF8.GetString($message.ToArray()); $message.SetLength(0)
    if ($text -match '"method":"Fetch\.requestPaused"') { Answer-Request ($text | ConvertFrom-Json); continue }
    if ($text -match '^\{"id":(\d+),') { $id = [int]$Matches[1]; if ($id -gt 0) { $script:replies[$id] = $text } }
  }
}
function Call([string]$method, [string]$params = '{}', [int]$timeoutMs = 30000) {
  $script:nextId++; $id = $script:nextId
  Send-Raw ('{"id":' + $id + ',"method":"' + $method + '","params":' + $params + '}')
  Pump $timeoutMs $id
  $reply = $script:replies[$id]; $script:replies.Remove($id)
  if (-not $reply) { throw "No reply to $method" }
  return $reply | ConvertFrom-Json
}
function Eval([string]$expression) {
  $res = Call 'Runtime.evaluate' ('{"expression":' + (ConvertTo-Json $expression -Compress) + ',"awaitPromise":true,"returnByValue":true}') 60000
  return $res.result.result.value
}

Call 'Network.enable' | Out-Null
Call 'Network.setCacheDisabled' '{"cacheDisabled":true}' | Out-Null
Call 'Network.setBypassServiceWorker' '{"bypass":true}' | Out-Null
Call 'Fetch.enable' '{"patterns":[{"urlPattern":"*/CrimsonNoir/*","requestStage":"Request"}]}' | Out-Null

# ---- The pages: a fixed set, picked the same way every run so the two passes line up ----
$pickPages = @'
(async () => {
  const c = window.ApiClient, uid = c.getCurrentUserId();
  const first = async (q) => ((await c.getItems(uid, Object.assign({ Recursive: true, Limit: 1, SortBy: 'SortName', SortOrder: 'Ascending', HasBackdrop: true }, q))).Items || [])[0];
  const film = await first({ IncludeItemTypes: 'Movie', HasOverview: true });
  const show = await first({ IncludeItemTypes: 'Series', HasOverview: true });
  const season = show && ((await c.getSeasons(show.Id, { userId: uid })).Items || []).find((s) => s.IndexNumber > 0);
  const episode = show && ((await c.getEpisodes(show.Id, { userId: uid, Limit: 1 })).Items || [])[0];
  const set = await first({ IncludeItemTypes: 'BoxSet' });
  const person = film && ((await c.getItem(uid, film.Id)).People || []).find((p) => p.Type === 'Actor');
  const nav = (label) => { const a = [...document.querySelectorAll('.cn-nav a')].find((x) => x.textContent.trim() === label); return a && a.getAttribute('href'); };
  const views = (await c.getUserViews({}, uid)).Items || [];
  const lib = (type) => { const v = views.find((x) => x.CollectionType === type); return v ? '#/' + (type === 'tvshows' ? 'tv' : type) + '?topParentId=' + v.Id + '&collectionType=' + type : null; };
  const d = (item) => item && '#/details?id=' + item.Id;
  const pages = [
    ['01 Home', '#/home'], ['02 Movies', nav('Movies') || lib('movies')], ['03 Shows', nav('Shows') || lib('tvshows')],
    ['04 Collections', nav('Collections') || lib('boxsets')], ['05 Watchlist', nav('Watchlist')], ['06 Requests', '#/downloads'],
    ['07 Calendar', '#/calendar'], ['08 Search', '#/search'], ['09 Film', d(film)], ['10 Show', d(show)], ['11 Season', d(season)],
    ['12 Episode', d(episode)], ['13 Collection', d(set)], ['14 Person', d(person)], ['15 Settings', '#/mypreferencesmenu'],
  ];
  return JSON.stringify(pages.filter((p) => p[1]));
})()
'@

function Capture-Pass([string]$label, [bool]$local) {
  $script:intercept = $local
  $dir = Join-Path $run $label
  New-Item -ItemType Directory -Force $dir | Out-Null
  Write-Host ("`n" + $label + ': loading...')
  Call 'Page.reload' '{"ignoreCache":true}' | Out-Null
  Pump 9000
  # dev.cmd adds a "Local theme" tag; if it shows here, another dev session is still answering
  # Jellium's theme requests and this pass wouldn't be what it says it is.
  if ((Eval "String([...document.querySelectorAll('div')].some((d) => /^Local theme/.test(d.textContent)))") -eq 'true') {
    Write-Host 'Another dev session (dev.cmd) is still serving the theme to Jellium. Close it and run this again.' -ForegroundColor Yellow
    $ws.Dispose(); exit 1
  }
  $pages = (Eval $pickPages) | ConvertFrom-Json
  foreach ($p in $pages) {
    $name = $p[0]; $hash = $p[1]
    Eval ("location.hash = " + (ConvertTo-Json $hash -Compress) + "; 'ok'") | Out-Null
    Pump ($SettleSeconds * 1000)
    Eval "window.scrollTo(0, 0); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r('ok'))))" | Out-Null
    Pump 400
    $shot = Call 'Page.captureScreenshot' '{"format":"jpeg","quality":82}' 60000
    [IO.File]::WriteAllBytes((Join-Path $dir "$name.jpg"), [Convert]::FromBase64String($shot.result.data))
    Write-Host "  $name"
  }
  return $pages
}

$passes = @()
if ($Only -in 'both', 'released') { $pages = Capture-Pass 'released' $false; $passes += 'released' }
if ($Only -in 'both', 'local') { $pages = Capture-Pass 'local' $true; $passes += 'local' }
$script:intercept = $false
Call 'Fetch.disable' | Out-Null
Call 'Page.reload' '{"ignoreCache":true}' | Out-Null
$ws.Dispose()

# ---- compare.html ----
$titles = @{ released = 'Released (your server now)'; local = 'This copy (js/ + css/)' }
$summary = if ($passes.Count -eq 2) { 'released theme vs this copy' } else { $titles[$passes[0]] }
$rows = foreach ($p in $pages) {
  $name = [Net.WebUtility]::HtmlEncode($p[0])
  $cells = foreach ($pass in $passes) {
    $src = $pass + '/' + [Uri]::EscapeDataString($p[0]) + '.jpg'
    "<figure><figcaption>$($titles[$pass])</figcaption><a href=""$src""><img src=""$src"" alt=""$name, $($titles[$pass])"" loading=""lazy""></a></figure>"
  }
  "<section><h2>$name</h2><div class=""pair"">$($cells -join '')</div></section>"
}
$html = @"
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Screenshot check</title>
<style>
  :root { color-scheme: dark; }
  body { background: #0b0a0b; color: #f3efef; font: 15px/1.5 system-ui, sans-serif; margin: 0; padding: 28px clamp(16px, 4vw, 48px) 60px; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; } p { color: #aaa4a5; margin: 0 0 28px; }
  section { border-top: 1px solid rgba(255,255,255,.1); padding: 18px 0 26px; }
  h2 { font-size: 1rem; margin: 0 0 12px; }
  .pair { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  figure { margin: 0; } figcaption { color: #aaa4a5; font-size: .8rem; font-weight: 600; letter-spacing: .06em; margin-bottom: 6px; text-transform: uppercase; }
  img { border: 1px solid rgba(255,255,255,.12); border-radius: 8px; display: block; height: auto; width: 100%; }
  .flip img { cursor: zoom-in; }
  button { background: #171416; border: 1px solid rgba(255,255,255,.22); border-radius: 999px; color: inherit; cursor: pointer; font: inherit; font-size: .85rem; margin-bottom: 12px; padding: 6px 14px; }
</style></head><body>
<h1>Screenshot check</h1>
<p>$(Get-Date -Format 'd MMMM yyyy, HH:mm') &middot; $($pages.Count) pages &middot; $summary. Tip: <b>Flip</b> swaps a pair in place, which makes small differences jump out.</p>
$($rows -join "`n")
<script>
  document.querySelectorAll('.pair').forEach(function (pair) {
    var imgs = pair.querySelectorAll('img'); if (imgs.length !== 2) return;
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Flip';
    b.addEventListener('click', function () { var a = imgs[0].src; imgs[0].src = imgs[1].src; imgs[1].src = a; });
    pair.parentNode.insertBefore(b, pair);
  });
</script>
</body></html>
"@
$comparePath = Join-Path $run 'compare.html'
[IO.File]::WriteAllText($comparePath, $html, [Text.UTF8Encoding]::new($false))
Write-Host "`nDone: $comparePath" -ForegroundColor Green
Start-Process $comparePath
