# 🚀 今すぐ始める！簡単3ステップ

## ステップ1: 画面録画を起動（Win+G）

キーボードで **`Win + G`** を押す

→ 録画ボタン（●）をクリック

---

## ステップ2: Chromeを開く

1. **新しいChromeを起動**（普通に開いてOK）

2. **`F12`** を押す（DevToolsが開く）

3. **Console** タブをクリック

---

## ステップ3: コードをコピペして実行

### 🎬 シーン1: オープニング

**①このコードをConsoleにコピペ**
```javascript
window.location.href = "about:blank";
```
**Enterを押す** → ページが変わる

**②次にこのコードをコピペ**
```javascript
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
**Enterを押す** → アニメーションが表示される！

---

### 🔍 シーン2: Twitter検索

**①このコードをコピペ**
```javascript
window.location.href = "https://x.com/search";
```

**②ページが開いたら、このコードをコピペ**
```javascript
(async () => {
    await new Promise(r => setTimeout(r, 2000));
    
    const searchBox = document.querySelector('input[data-testid="SearchBox_Search_Input"]') || 
                     document.querySelector('input[placeholder*="検索"]');
    
    if (searchBox) {
        searchBox.click();
        searchBox.focus();
        await new Promise(r => setTimeout(r, 1000));
        
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

→ **自動で1文字ずつ入力される！**

---

### 📸 シーン3: メイド服ツイート

**①このコードをコピペ**
```javascript
window.location.href = "https://x.com/flap_shizuku/status/1988950811075125652";
```

**②ページが開いたら、このコードをコピペ**
```javascript
(async () => {
    await new Promise(r => setTimeout(r, 3000));
    
    window.scrollTo({ top: 300, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 2000));
    
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

→ **自動スクロール＆いいね！**

---

### 🚉 シーン4: JR大塚駅広告

**①このコードをコピペ**
```javascript
window.location.href = "https://x.com/flap_up_idol/status/1988510278448017445";
```

**②ページが開いたら、このコードをコピペ**
```javascript
(async () => {
    await new Promise(r => setTimeout(r, 3000));
    
    window.scrollTo({ top: 200, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 2000));
    
    const images = document.querySelectorAll('img[alt*="Image"]');
    if (images.length > 0) {
        images[0].style.border = '5px solid #ff6b9d';
        images[0].style.transition = 'all 0.5s';
        await new Promise(r => setTimeout(r, 2000));
        
        images[0].style.border = 'none';
    }
    
    const likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) {
        likeButton.click();
        await new Promise(r => setTimeout(r, 1000));
    }
})();
```

→ **画像にピンクの枠＆いいね！**

---

### 🎵 シーン5: TikTok動画

**①このコードをコピペ**
```javascript
window.location.href = "https://www.tiktok.com/@idolfunch/video/7509897290023177489";
```

**②ページが開いたら、このコードをコピペ**
```javascript
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

→ **動画が光る＆自動再生！**

---

### 🎤 シーン6: idolfunchツイート

**①このコードをコピペ**
```javascript
window.location.href = "https://x.com/idolfunch/status/1942732395515633764";
```

**②ページが開いたら、このコードをコピペ**
```javascript
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

→ **動画再生＆いいね！**

---

### 🎉 シーン7: フィナーレ

**①このコードをコピペ**
```javascript
window.location.href = "about:blank";
```

**②ページが開いたら、このコードをコピペ**
```javascript
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
                    background-size: 300% 300%;
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

→ **最高のフィナーレ！**

---

## 🎬 完成！

録画停止ボタン（■）を押して保存！

---

## 💡 ポイント

- **①と②を順番に実行**するだけ
- **Enterを押すのを忘れずに！**
- **待っていれば自動で動く**
- 動きがおかしかったら、もう一度②を実行

---

**楽しい録画を！** 🎥✨
