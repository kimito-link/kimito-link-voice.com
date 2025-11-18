# アプリケーションをデバッグChromeで開く
$url = "http://localhost:3000"

# 少し待ってからブラウザで開く
Start-Sleep -Seconds 2
Start-Process $url

Write-Host "アプリケーションを開きました: $url"
