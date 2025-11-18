@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   🎉 蒼凪しずく 生誕祭 自動化 🎉
echo ========================================
echo.
echo 📋 準備:
echo    1. Win+G で画面録画を開始
echo    2. PC音量を調整
echo.
echo ⏱️  約1分30秒で全自動実行されます
echo.
pause

echo.
echo 🎬 自動化を開始します...
echo.

cd ..
node birthday-shizuku\birthday-automation.js

pause
