@echo off
echo Starting Chrome in debug mode...
echo Please close all Chrome windows first.
echo.
pause

taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Chrome...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 "https://x.com"

echo.
echo Chrome started!
echo Please login to Twitter, then run step2-auto-run.bat
echo.
pause
