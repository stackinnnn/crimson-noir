<#
  Uploads repo files that differ from what's on the Jellyfin server.
  The server's current copies are saved to backups\<timestamp>\ first.

  .\scripts\push.ps1            upload everything that changed
  .\scripts\push.ps1 -DryRun    only list what would change
  .\scripts\push.ps1 -Only css,crimson-noir   limit to some files (css, crimson-noir, slideshow, bridge)
#>
param([switch]$DryRun, [string[]]$Only)
. (Join-Path $PSScriptRoot 'common.ps1')

$short = @{ 'css' = $CssFile; 'crimson-noir' = $JsFiles['Crimson Noir']; 'slideshow' = $JsFiles['Slideshow JS']; 'bridge' = $JsFiles['Jellium mpv bridge'] }
$allowed = if ($Only) { $Only | ForEach-Object { if (-not $short.ContainsKey($_)) { throw "Unknown -Only value '$_' (use: $($short.Keys -join ', '))" }; $short[$_] } } else { $short.Values }

$pluginId = Get-JsiPluginId
$brandingRaw = Invoke-Jf -Path '/System/Configuration/branding'
$jsiRaw = Invoke-Jf -Path "/Plugins/$pluginId/Configuration"
$branding = $brandingRaw | ConvertFrom-Json
$jsi = $jsiRaw | ConvertFrom-Json

$changes = @()
if ($allowed -contains $CssFile) {
  $local = Read-RepoFile $CssFile
  if ($local -and $local -ne (Normalize $branding.CustomCss)) { $changes += $CssFile; $branding.CustomCss = $local }
}
$jsChanged = $false
foreach ($name in $JsFiles.Keys) {
  $rel = $JsFiles[$name]
  if ($allowed -notcontains $rel) { continue }
  $local = Read-RepoFile $rel
  if (-not $local) { continue }
  $entry = $jsi.CustomJavaScripts | Where-Object { $_.Name -eq $name } | Select-Object -First 1
  if (-not $entry) { Write-Warning "No entry '$name' on the server. Add it once in the JavaScript Injector page, then push."; continue }
  if ($local -ne (Normalize $entry.Script)) { $changes += $rel; $entry.Script = $local; $jsChanged = $true }
}

if (-not $changes) { Write-Host 'Server already matches the repo. Nothing to push.'; return }
Write-Host 'Changed:'; $changes | ForEach-Object { Write-Host "  $_" }
if ($DryRun) { Write-Host '(dry run: nothing uploaded)'; return }

$stamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$bdir = Join-Path $RepoRoot "backups\$stamp"
New-Item -ItemType Directory -Force $bdir | Out-Null
[IO.File]::WriteAllText((Join-Path $bdir 'branding.json'), $brandingRaw, $Utf8)
[IO.File]::WriteAllText((Join-Path $bdir 'javascript-injector.json'), $jsiRaw, $Utf8)
Write-Host "Server copy saved to backups\$stamp"

if ($changes -contains $CssFile) {
  Invoke-Jf -Method POST -Path '/System/Configuration/branding' -Json ($branding | ConvertTo-Json -Depth 20 -Compress) | Out-Null
}
if ($jsChanged) {
  Invoke-Jf -Method POST -Path "/Plugins/$pluginId/Configuration" -Json ($jsi | ConvertTo-Json -Depth 20 -Compress) | Out-Null
}

# Re-read to confirm the server kept it (an open JS Injector settings page can save a stale copy over it)
Start-Sleep -Seconds 3
$ok = $true
$b2 = Invoke-Jf -Path '/System/Configuration/branding' | ConvertFrom-Json
$j2 = Invoke-Jf -Path "/Plugins/$pluginId/Configuration" | ConvertFrom-Json
foreach ($rel in $changes) {
  $server = if ($rel -eq $CssFile) { $b2.CustomCss } else {
    $name = ($JsFiles.GetEnumerator() | Where-Object { $_.Value -eq $rel }).Key
    ($j2.CustomJavaScripts | Where-Object { $_.Name -eq $name } | Select-Object -First 1).Script
  }
  if ((Normalize $server) -eq (Read-RepoFile $rel)) { Write-Host "  ok    $rel" } else { Write-Warning "  NOT SAVED: $rel"; $ok = $false }
}
if ($ok) { Write-Host 'Pushed. Reload Jellyfin to see it. Remember to commit.' } else { Write-Warning 'Some files did not stick. Close any open JavaScript Injector or Branding dashboard page and push again.' }
