@echo off
rem Like dev.cmd, plus KefinTweaks breadcrumbs / season flattening / series info switched on in this Jellium
rem window only, to test the theme with them. Your server's KefinTweaks settings are not changed.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev.ps1" -KefinTweaks %*
pause
