@echo off
cd /d "%~dp0"
powershell -NoProfile -Command "$j = Get-Content -Raw -Encoding UTF8 textes.json; Set-Content -Encoding UTF8 textes.js ('/* Copie de textes.json pour le double-clic. */' + [Environment]::NewLine + 'window.TEXTES = ' + $j + ';')"
echo textes.js mis a jour.
pause
