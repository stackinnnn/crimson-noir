@echo off
rem Double-click (or run) to try the theme from this repo in Jellium Desktop. See dev.ps1 for details.
rem Pass -Restart to close an open Jellium first.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev.ps1" %*
pause
