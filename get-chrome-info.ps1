# Chrome DevTools Protocolから情報を取得

# 新しいタブでアプリケーションを開く
Write-Host "デバッグChromeで新しいタブを開いています..."
$newTab = Invoke-WebRequest -Uri "http://localhost:9222/json/new?http://localhost:3000" -Method Put -UseBasicParsing
Write-Host $newTab.Content

# 少し待つ
Start-Sleep -Seconds 2

# すべてのタブ情報を取得
Write-Host "`n=== すべてのタブ情報 ==="
$tabs = Invoke-WebRequest -Uri "http://localhost:9222/json" -Method Get -UseBasicParsing
Write-Host $tabs.Content

# バージョン情報を取得
Write-Host "`n=== ブラウザバージョン情報 ==="
$version = Invoke-WebRequest -Uri "http://localhost:9222/json/version" -Method Get -UseBasicParsing
Write-Host $version.Content
