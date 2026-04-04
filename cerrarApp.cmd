@echo off
echo Cerrando Servidor...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Servidor cerrado
pause
