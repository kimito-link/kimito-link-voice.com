# 生誕祭デモページを開く
$demoPath = "c:\Users\info\OneDrive\デスクトップ\GitHub\KimiLinkVoice\birthday-shizuku\demo.html"
$absolutePath = Resolve-Path $demoPath

# Chrome DevTools Protocolで新しいタブを開く
Write-Host "🎉 生誕祭デモページを開いています..."
$response = Invoke-WebRequest -Uri "http://localhost:9222/json/new?file:///$($absolutePath.Path.Replace('\','/'))" -Method Put -UseBasicParsing

Write-Host "✅ デモページを開きました！"
Write-Host ""
Write-Host "📊 タブ情報:"
Write-Host $response.Content
