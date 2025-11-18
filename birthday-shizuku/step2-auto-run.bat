@echo off
cls
echo.
echo ========================================
echo   Birthday Automation
echo ========================================
echo.
echo Ready?
echo 1. Start screen recording (Win+G)
echo 2. Adjust volume
echo 3. Press Enter to start
echo.
pause

echo.
echo Starting automation...
echo.

cd ..
node birthday-shizuku\birthday-automation-logged-in.js

pause
