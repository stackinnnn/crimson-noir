@echo off
rem Screenshot check before a release: the same pages with the released theme and with this repo's copy,
rem side by side in screenshots-check\<date>\compare.html. Close Jellium (and dev.cmd) first, or add -Restart.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0screens.ps1" %*
pause
