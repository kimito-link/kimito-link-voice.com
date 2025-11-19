@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   蒼凪しずく 生誕祭 自動化（改善版）
echo ========================================
echo.
echo 📋 実行前チェックリスト:
echo   ✓ Chrome デバッグモードで起動済み
echo   ✓ Twitter にログイン済み
echo   ✓ 画面録画を開始済み
echo.
echo 🚀 自動化を開始します...
echo.

node birthday-automation-improved.js

echo.
echo ========================================
echo   実行完了
echo ========================================
echo.
pause
