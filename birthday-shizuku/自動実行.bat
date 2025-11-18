@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   🎉 蒼凪しずく 生誕祭 自動実行 🎉
echo ========================================
echo.
echo 📋 最終確認:
echo    1. Chromeでログイン済みですか？
echo    2. Win+G で画面録画を開始しましたか？
echo    3. 音量は調整しましたか？
echo.
echo ⏱️  約1分30秒で全自動実行されます
echo.
pause

echo.
echo 🎬 自動化を開始します...
echo.

cd ..
node birthday-shizuku\birthday-automation-logged-in.js

pause
