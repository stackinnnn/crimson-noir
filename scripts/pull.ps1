<#
  Copies the live theme from the Jellyfin server into this repo.
  Afterwards review with `git diff` and commit.
#>
. (Join-Path $PSScriptRoot 'common.ps1')
Assert-ManualInstall

$branding = Invoke-Jf -Path '/System/Configuration/branding' | ConvertFrom-Json
Write-RepoFile $CssFile $branding.CustomCss
Write-Host "pulled  $CssFile"

$jsi = Invoke-Jf -Path "/Plugins/$(Get-JsiPluginId)/Configuration" | ConvertFrom-Json
foreach ($name in $JsFiles.Keys) {
  $entry = $jsi.CustomJavaScripts | Where-Object { $_.Name -eq $name } | Select-Object -First 1
  if (-not $entry) { Write-Warning "No JavaScript Injector entry named '$name' on the server; skipped."; continue }
  Write-RepoFile $JsFiles[$name] $entry.Script
  Write-Host ("pulled  {0}  ({1})" -f $JsFiles[$name], ($(if ($entry.Enabled) { 'enabled' } else { 'DISABLED on server' })))
}

Write-Host ''
git -C $RepoRoot status --short
