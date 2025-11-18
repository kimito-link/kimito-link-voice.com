# 🎬 蒼凪しずく 生誕祭 録画ガイド

## 📋 必要なもの

1. **画面録画ソフト**
   - Windows Game Bar（Win+G）
   - OBS Studio（推奨）
   - Bandicam
   - など

2. **Chrome ブラウザ**（DevTools使用）

3. **準備するURL**
   - ✅ Twitter検索
   - ✅ しずくちゃんメイド服: https://x.com/flap_shizuku/status/1988950811075125652
   - ✅ JR大塚駅広告: https://x.com/flap_up_idol/status/1988510278448017445
   - ✅ TikTok動画: https://www.tiktok.com/@idolfunch/video/7509897290023177489
   - ✅ idolfunchツイート: https://x.com/idolfunch/status/1942732395515633764

## 🎥 録画手順（推奨方法）

### ステップ1: 準備

```bash
# プロジェクトフォルダに移動
cd birthday-shizuku

# スクリプトを確認
node auto-recording.js
```

### ステップ2: 録画開始

1. **OBS Studio または Game Barを起動**
   - Windows Game Bar: `Win + G`
   - 録画範囲: ブラウザウィンドウ全体

2. **Chromeを開く**
   - F12でDevToolsを開く
   - Consoleタブを選択

3. **録画開始ボタンをクリック**

### ステップ3: 自動操作実行

#### 🎬 シーン1: オープニング（3秒）

```javascript
// Consoleに貼り付けて実行
window.location.href = "about:blank";

// ページが開いたら実行
(async () => {
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            text-align: center;
        ">
            <div>
                <h1 style="font-size: 4rem; color: white;">🎉</h1>
                <h2 style="font-size: 3rem; color: white; margin: 2rem 0;">
                    これから始まります...
                </h2>
            </div>
        </div>
    `;
    await new Promise(r => setTimeout(r, 3000));
})();
```

#### 🔍 シーン2: Twitter検索（10秒）

```javascript
window.location.href = "https://x.com/search";

// ページが読み込まれたら実行
(async () => {
    await new Promise(r => setTimeout(r, 2000));
    
    const searchBox = document.querySelector('input[data-testid="SearchBox_Search_Input"]') || 
                     document.querySelector('input[placeholder*="検索"]');
    
    if (searchBox) {
        searchBox.click();
        searchBox.focus();
        await new Promise(r => setTimeout(r, 1000));
        
        // ゆっくり1文字ずつ入力
        const text = "蒼凪しずく 生誕祭 楽しみ";
        for (const char of text) {
            searchBox.value += char;
            searchBox.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(r => setTimeout(r, 200));
        }
        
        await new Promise(r => setTimeout(r, 1000));
        searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    }
})();
```

#### 📸 シーン3: メイド服ツイート（8秒）

```javascript
window.location.href = "https://x.com/flap_shizuku/status/1988950811075125652";

// ページが読み込まれたら実行
(async () => {
    await new Promise(r => setTimeout(r, 3000));
    
    // ゆっくりスクロール
    window.scrollTo({ top: 300, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 2000));
    
    // いいねボタン
    const likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) {
        likeButton.style.transform = 'scale(1.2)';
        likeButton.style.transition = 'transform 0.3s';
        await new Promise(r => setTimeout(r, 500));
        
        likeButton.click();
        await new Promise(r => setTimeout(r, 1000));
        
        likeButton.style.transform = 'scale(1)';
    }
    
    await new Promise(r => setTimeout(r, 2000));
})();
```

#### 🚉 シーン4: JR大塚駅広告（10秒）

```javascript
window.location.href = "https://x.com/flap_up_idol/status/1988510278448017445";

// ページが読み込まれたら実行
(async () => {
    await new Promise(r => setTimeout(r, 3000));
    
    window.scrollTo({ top: 200, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 2000));
    
    // 画像をハイライト
    const images = document.querySelectorAll('img[alt*="Image"]');
    if (images.length > 0) {
        images[0].style.border = '5px solid #ff6b9d';
        images[0].style.transition = 'all 0.5s';
        await new Promise(r => setTimeout(r, 2000));
        
        images[0].style.border = 'none';
    }
    
    // いいね
    const likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) {
        likeButton.click();
        await new Promise(r => setTimeout(r, 1000));
    }
})();
```

#### 🎵 シーン5: TikTok動画（10秒）

```javascript
window.location.href = "https://www.tiktok.com/@idolfunch/video/7509897290023177489";

// ページが読み込まれたら実行
(async () => {
    await new Promise(r => setTimeout(r, 4000));
    
    const video = document.querySelector('video');
    if (video) {
        video.style.border = '5px solid #ff6b9d';
        video.style.boxShadow = '0 0 30px rgba(255, 107, 157, 0.6)';
        
        if (video.paused) video.play();
        
        await new Promise(r => setTimeout(r, 5000));
        
        video.style.border = 'none';
        video.style.boxShadow = 'none';
    }
})();
```

#### 🎤 シーン6: idolfunchツイート（8秒）

```javascript
window.location.href = "https://x.com/idolfunch/status/1942732395515633764";

// ページが読み込まれたら実行
(async () => {
    await new Promise(r => setTimeout(r, 3000));
    
    const video = document.querySelector('video');
    if (video) {
        video.style.border = '5px solid #6bcf7f';
        
        if (video.paused) video.click();
        
        await new Promise(r => setTimeout(r, 5000));
        
        video.style.border = 'none';
    }
    
    const likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) likeButton.click();
})();
```

#### 🎉 シーン7: フィナーレ（5秒）

```javascript
window.location.href = "about:blank";

// ページが開いたら実行
(async () => {
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            text-align: center;
        ">
            <div>
                <div style="font-size: 8rem; animation: bounce 1s infinite;">🎉</div>
                <h1 style="
                    font-size: 5rem;
                    background: linear-gradient(45deg, #ff6b9d, #ffd93d, #6bcf7f, #4d9fff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 2rem 0;
                ">蒼凪しずく</h1>
                <h2 style="font-size: 3.5rem; color: white;">生誕祭 楽しみ！</h2>
                <div style="font-size: 4rem; margin-top: 2rem;">✨</div>
                <p style="font-size: 2rem; color: white; margin-top: 2rem;">おめでとう！</p>
            </div>
        </div>
        <style>
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-30px); }
            }
        </style>
    `;
    
    await new Promise(r => setTimeout(r, 5000));
})();
```

### ステップ4: 録画停止

録画を停止して保存！

## 🎬 編集のヒント

### BGM候補
- 明るいポップソング
- アップテンポな曲
- お祝いっぽい曲

### エフェクト
- シーン切り替え: フェード、ワイプ
- テキスト: 「蒼凪しずく 生誕祭 2025」
- ハート、星のエフェクト

### タイムライン（合計約54秒）
```
0:00-0:03  オープニング
0:03-0:13  Twitter検索
0:13-0:21  メイド服ツイート
0:21-0:31  JR大塚駅広告
0:31-0:41  TikTok動画
0:41-0:49  idolfunchツイート
0:49-0:54  フィナーレ
```

## 💡 トラブルシューティング

### 要素が見つからない
- `await new Promise(r => setTimeout(r, 5000));` で待機時間を増やす

### 自動再生がブロックされる
- 手動で一度再生ボタンをクリック

### いいねボタンが反応しない
- ログインが必要な場合があります

## ✨ 完成イメージ

**タイトル**: 「🎉 蒼凪しずく 生誕祭 楽しみ！」  
**長さ**: 約1分  
**フォーマット**: 1920x1080 (Full HD)  
**用途**: Twitter, TikTok投稿用

---

**楽しい録画を！** 🎥✨
