# Shared helpers for pull.ps1 / push.ps1 (Windows PowerShell 5.1 compatible).
$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$Utf8 = New-Object System.Text.UTF8Encoding($false)

# Repo file  <->  where it lives on the server
$CssFile = 'css/crimson-noir.css'
$JsFiles = [ordered]@{
  'Crimson Noir'       = 'js/crimson-noir.js'
  'Slideshow JS'       = 'js/slideshow.js'
  'Jellium mpv bridge' = 'js/jellium-mpv-bridge.js'
}

function Get-CnConfig {
  $p = Join-Path $PSScriptRoot 'config.local.json'
  if (-not (Test-Path $p)) { throw "Missing scripts\config.local.json. Copy config.example.json and fill in server + apiKey." }
  $c = [IO.File]::ReadAllText($p) | ConvertFrom-Json
  if (-not $c.server -or -not $c.apiKey -or $c.apiKey -like 'paste*') { throw 'config.local.json needs "server" and "apiKey".' }
  $c.server = $c.server.TrimEnd('/')
  $c
}

function Invoke-Jf {
  param([string]$Method = 'GET', [string]$Path, [string]$Json)
  $cfg = $script:Cfg
  $req = @{
    Uri = $cfg.server + $Path; Method = $Method; UseBasicParsing = $true
    Headers = @{ Authorization = 'MediaBrowser Client="crimson-noir-repo", Device="script", DeviceId="crimson-noir-repo", Version="1.0", Token="' + $cfg.apiKey + '"' }
  }
  if ($Json) { $req.Body = $Utf8.GetBytes($Json); $req.ContentType = 'application/json; charset=utf-8' }
  $r = Invoke-WebRequest @req
  # Decode as UTF-8 ourselves: PS 5.1 can guess the wrong charset
  $Utf8.GetString($r.RawContentStream.ToArray())
}

function Get-JsiPluginId {
  $plugins = Invoke-Jf -Path '/Plugins' | ConvertFrom-Json
  $p = $plugins | Where-Object { $_.Name -match 'JavaScript ?Injector' } | Select-Object -First 1
  if (-not $p) { throw 'JavaScript Injector plugin not found on the server.' }
  $p.Id
}

# Text as stored in the repo: LF line endings, ending in exactly one newline
function Normalize([string]$t) {
  if ($null -eq $t) { return $null }
  ($t -replace "`r`n", "`n").TrimEnd("`n") + "`n"
}

function Read-RepoFile($rel) {
  $p = Join-Path $RepoRoot $rel
  if (-not (Test-Path $p)) { return $null }
  Normalize ([IO.File]::ReadAllText($p, $Utf8))
}

function Write-RepoFile($rel, $text) {
  $p = Join-Path $RepoRoot $rel
  New-Item -ItemType Directory -Force (Split-Path $p) | Out-Null
  [IO.File]::WriteAllText($p, (Normalize $text), $Utf8)
}

$script:Cfg = Get-CnConfig

# These scripts sync a MANUAL install (Branding > Custom CSS + JavaScript Injector). On a server that
# runs the Crimson Noir plugin they would wipe the repo CSS (pull) or load the theme twice (push).
function Assert-ManualInstall {
  $plugins = Invoke-Jf -Path '/Plugins' | ConvertFrom-Json
  $p = @($plugins) | ForEach-Object { $_ } | Where-Object { $_.Id -eq 'a4fe4b36-2a1d-4909-b78e-69d0816d0add' -or $_.Name -eq 'Crimson Noir' } | Select-Object -First 1
  if ($p -and $p.Status -ne 'Disabled') {
    throw "This server runs the Crimson Noir plugin ($($p.Version)). Edit css/ and js/ here, commit, then publish with GitHub Actions > Release; the server updates from the plugin catalog."
  }
}
