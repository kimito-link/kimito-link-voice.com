$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$args = @(
    "--remote-debugging-port=9222",
    "--user-data-dir=C:\temp\chrome-debug-birthday",
    "about:blank"
)

Start-Process -FilePath $chromePath -ArgumentList $args
Write-Host "Chrome起動完了！ポート9222でデバッグモード実行中..."
