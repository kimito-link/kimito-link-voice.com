@echo off
echo.
echo ========================================
echo   Chrome をデバッグモードで起動
echo ========================================
echo.
echo 注意: 既存のChromeを全て閉じてから実行してください
echo.
pause

REM 既存のChromeプロセスを終了
taskkill /F /IM chrome.exe 2>nul

echo.
echo Chromeを起動中...
echo ログインしてください
echo.

REM ユーザーのデフォルトプロファイルでChromeを起動
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 "https://x.com"

timeout /t 5

echo.
echo ========================================
echo   準備完了！
echo   1. Twitterにログインしてください
echo   2. ログイン後、次のファイルを実行:
echo      「自動実行.bat」
echo ========================================
echo.
pause
