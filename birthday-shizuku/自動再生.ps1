# 蒼凪しずく 生誕祭 自動再生スクリプト

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 蒼凪しずく 生誕祭 自動再生 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 準備:" -ForegroundColor Yellow
Write-Host "   1. Win+G で画面録画を開始してください"
Write-Host "   2. PCの音量を調整してください（TikTok用）"
Write-Host "   3. スピーカー/ヘッドホンの音が出るか確認"
Write-Host ""
Write-Host "⏱️  約1分30秒で全シーン自動再生されます" -ForegroundColor Green
Write-Host ""
Write-Host "💡 TikTokは自動再生時に音が出ます" -ForegroundColor Yellow
Write-Host "   手動で音量ボタンを押す必要はありません" -ForegroundColor Yellow
Write-Host ""
Read-Host "準備ができたら Enter を押してください"

Write-Host ""
Write-Host "🎬 開始します..." -ForegroundColor Green
Start-Sleep -Seconds 2

# オープニング
Write-Host ""
Write-Host "📌 シーン1: オープニング" -ForegroundColor Cyan
$html1 = @"
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Opening</title></head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:Arial;margin:0">
<div style="text-align:center"><h1 style="font-size:6rem;color:white;animation:pulse 1s infinite">🎉</h1>
<h2 style="font-size:4rem;color:white;margin:2rem 0">これから始まります...</h2></div>
<style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}</style>
</body></html>
"@
$tempFile1 = "$env:TEMP\birthday_opening.html"
$html1 | Out-File -FilePath $tempFile1 -Encoding UTF8
Start-Process chrome $tempFile1
Start-Sleep -Seconds 4

# URLリスト
$urls = @(
    @{Name="Twitter検索"; URL="https://x.com/search?q=%E8%92%BC%E5%87%AA%E3%81%97%E3%81%9A%E3%81%8F%20%E7%94%9F%E8%AA%95%E7%A5%AD%20%E6%A5%BD%E3%81%97%E3%81%BF&src=typed_query"; Wait=6},
    @{Name="メイド服ツイート"; URL="https://x.com/flap_shizuku/status/1988950811075125652"; Wait=8},
    @{Name="JR大塚駅広告"; URL="https://x.com/flap_up_idol/status/1988510278448017445"; Wait=8},
    @{Name="TikTok動画"; URL="https://www.tiktok.com/@idolfunch/video/7509897290023177489"; Wait=12},
    @{Name="idolfunchツイート"; URL="https://x.com/idolfunch/status/1942732395515633764"; Wait=10}
)

# Chromeを1つ開く
Write-Host "📌 シーン2: Twitter検索" -ForegroundColor Cyan
Start-Process chrome $urls[0].URL
Start-Sleep -Seconds $urls[0].Wait

# 残りのURLを順番に開く
for ($i = 1; $i -lt $urls.Count; $i++) {
    Write-Host "📌 シーン$($i+2): $($urls[$i].Name)" -ForegroundColor Cyan
    
    # 既存のChromeウィンドウでURLを開く（新しいタブ）
    Start-Process chrome $urls[$i].URL
    Start-Sleep -Seconds $urls[$i].Wait
}

# フィナーレ
Write-Host "📌 シーン7: フィナーレ" -ForegroundColor Cyan
$html2 = @"
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Finale</title></head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:Arial;margin:0;overflow:hidden">
<div style="text-align:center">
<div style="font-size:10rem;animation:bounce 1s infinite">🎉</div>
<h1 style="font-size:6rem;background:linear-gradient(45deg,#ff6b9d,#ffd93d,#6bcf7f,#4d9fff);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradient 3s ease infinite;margin:2rem 0">蒼凪しずく</h1>
<h2 style="font-size:4rem;color:white;text-shadow:0 2px 10px rgba(0,0,0,0.3)">生誕祭 楽しみ！</h2>
<div style="font-size:5rem;margin-top:2rem">✨</div>
<p style="font-size:3rem;color:white;margin-top:2rem">おめでとう！</p>
</div>
<style>
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-30px)}}
@keyframes gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
</style>
</body></html>
"@
$tempFile2 = "$env:TEMP\birthday_finale.html"
$html2 | Out-File -FilePath $tempFile2 -Encoding UTF8
Start-Process chrome $tempFile2
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ 完了！録画を停止してください！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "💡 開いたタブを閉じる場合は、" -ForegroundColor Yellow
Write-Host "   各タブで Ctrl+W を押してください" -ForegroundColor Yellow
Write-Host ""
Read-Host "Enterを押して終了"
