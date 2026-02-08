@echo off
start "" "%~dp0tgf-osteo.exe"
timeout /t 2 >nul
start http://localhost:3000
exit
