@echo off
cd /d "%~dp0"

start "" /B "tgf-osteo.exe" >nul 2>&1

timeout /t 2 >nul
start http://localhost:3000
exit

