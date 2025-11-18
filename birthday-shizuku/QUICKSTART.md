# ⚡ 超簡単！1回コピペで全自動

## 🚀 たった2ステップ

### ステップ1: 録画開始
**`Win + G`** → 録画ボタン（●）クリック

### ステップ2: 全自動実行

1. **Chromeを開く**

2. **`F12`** を押す（DevToolsが開く）

3. **Console** タブをクリック

4. **このコードを全部コピー**して、Consoleに貼り付け → **Enter**

```javascript
(async function() {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    console.log('🎬 蒼凪しずく 生誕祭 - 完全自動開始！ 3秒後に開始...');
    await sleep(3000);
    
    // シーン1: オープニング
    console.log('🎬 シーン1: オープニング');
    window.location.href = "about:blank";
    await sleep(1000);
    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:Arial;text-align:center"><div><h1 style="font-size:4rem;color:white">🎉</h1><h2 style="font-size:3rem;color:white;margin:2rem 0">これから始まります...</h2></div></div>';
    await sleep(3000);
    
    // シーン2: Twitter検索
    console.log('🔍 シーン2: Twitter検索');
    window.location.href = "https://x.com/search";
    await sleep(3000);
    const searchBox = document.querySelector('input[data-testid="SearchBox_Search_Input"]') || document.querySelector('input[placeholder*="検索"]');
    if (searchBox) {
        searchBox.click();
        searchBox.focus();
        await sleep(1000);
        const text = "蒼凪しずく 生誕祭 楽しみ";
        for (const char of text) {
            searchBox.value += char;
            searchBox.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(200);
        }
        await sleep(1000);
        searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    }
    await sleep(3000);
    
    // シーン3: メイド服ツイート
    console.log('📸 シーン3: メイド服ツイート');
    window.location.href = "https://x.com/flap_shizuku/status/1988950811075125652";
    await sleep(3000);
    window.scrollTo({ top: 300, behavior: 'smooth' });
    await sleep(2000);
    let likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) {
        likeButton.style.transform = 'scale(1.2)';
        likeButton.style.transition = 'transform 0.3s';
        await sleep(500);
        likeButton.click();
        await sleep(1000);
        likeButton.style.transform = 'scale(1)';
    }
    await sleep(2000);
    
    // シーン4: JR大塚駅広告
    console.log('🚉 シーン4: JR大塚駅広告');
    window.location.href = "https://x.com/flap_up_idol/status/1988510278448017445";
    await sleep(3000);
    window.scrollTo({ top: 200, behavior: 'smooth' });
    await sleep(2000);
    const images = document.querySelectorAll('img[alt*="Image"]');
    if (images.length > 0) {
        images[0].style.border = '5px solid #ff6b9d';
        images[0].style.boxShadow = '0 0 20px rgba(255, 107, 157, 0.6)';
        await sleep(2500);
        images[0].style.border = 'none';
        images[0].style.boxShadow = 'none';
    }
    likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) likeButton.click();
    await sleep(1500);
    
    // シーン5: TikTok動画
    console.log('🎵 シーン5: TikTok動画');
    window.location.href = "https://www.tiktok.com/@idolfunch/video/7509897290023177489";
    await sleep(4000);
    let video = document.querySelector('video');
    if (video) {
        video.style.border = '5px solid #ff6b9d';
        video.style.boxShadow = '0 0 30px rgba(255, 107, 157, 0.8)';
        if (video.paused) video.play();
        await sleep(5000);
        video.style.border = 'none';
        video.style.boxShadow = 'none';
    }
    await sleep(1000);
    
    // シーン6: idolfunchツイート
    console.log('🎤 シーン6: idolfunchツイート');
    window.location.href = "https://x.com/idolfunch/status/1942732395515633764";
    await sleep(3000);
    video = document.querySelector('video');
    if (video) {
        video.style.border = '5px solid #6bcf7f';
        if (video.paused) video.click();
        await sleep(4000);
        video.style.border = 'none';
    }
    likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) likeButton.click();
    await sleep(1000);
    
    // シーン7: フィナーレ
    console.log('🎉 シーン7: フィナーレ');
    window.location.href = "about:blank";
    await sleep(1000);
    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:Arial;text-align:center;overflow:hidden"><div><div style="font-size:8rem;animation:bounce 1s infinite">🎉</div><h1 style="font-size:5rem;background:linear-gradient(45deg,#ff6b9d,#ffd93d,#6bcf7f,#4d9fff);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradientShift 3s ease infinite;margin:2rem 0">蒼凪しずく</h1><h2 style="font-size:3.5rem;color:white">生誕祭 楽しみ！</h2><div style="font-size:4rem;margin-top:2rem">✨</div><p style="font-size:2rem;color:white;margin-top:2rem">おめでとう！</p></div></div><style>@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-30px)}}</style>';
    await sleep(5000);
    
    console.log('✅ 完了！録画を停止してください！');
})();
```

---

## ⏱️ 自動で流れるシーン（約54秒）

1. 🎬 **オープニング** (3秒)
2. 🔍 **Twitter検索** - 自動入力 (10秒)
3. 📸 **メイド服ツイート** - 自動いいね (8秒)
4. 🚉 **JR大塚駅広告** - 画像ハイライト (10秒)
5. 🎵 **TikTok動画** - 自動再生 (10秒)
6. 🎤 **idolfunchツイート** - 動画再生 (8秒)
7. 🎉 **フィナーレ** (5秒)

---

## 💡 ポイント

- ✅ **1回コピペするだけ**
- ✅ **全自動で約54秒**
- ✅ **待つだけでOK**
- ✅ **完了したら録画停止**

---

## 📹 詳細版が必要な場合

より読みやすいコードは **`full-auto.js`** を参照してください。

---

**超簡単！今すぐ始められます！** 🎬✨
