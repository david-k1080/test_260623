@echo off
cd /d "%~dp0"
title Meeting Interpreter - close this window to stop

where node >nul 2>nul
if errorlevel 1 goto nonode

if exist node_modules goto run
echo First run only: installing (1-2 minutes)...
call npm install --omit=dev
if errorlevel 1 goto installfail

:run
if not exist interpreter.env if not exist .env echo [!] interpreter.env not found - translation will show [MOCK]. See interpreter.env.example
echo Opening http://localhost:3000 (Chrome recommended)
start "" /min cmd /c "timeout /t 3 >nul & start http://localhost:3000"
node server.js
echo.
echo Server stopped.
pause
exit /b 0

:nonode
echo [!] Node.js is not installed.
echo     Install the LTS version from https://nodejs.org , then run this file again.
pause
exit /b 1

:installfail
echo [!] npm install failed. Check your internet connection, then run again.
echo     Copy the error text above and send it to me.
pause
exit /b 1
