// 蒼凪しずく 生誕祭 - Chrome DevTools MCP 自動操作スクリプト
// 画面録画しながら実行してください

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeSlowly(text, delay = 200) {
    for (const char of text) {
        document.activeElement.value += char;
        document.activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(delay);
    }
}

// メインシナリオ
const birthdayScenario = [
    {
        name: "オープニング",
        url: "about:blank",
        code: async () => {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    font-family: Arial, sans-serif;
                    text-align: center;
                    animation: fadeIn 1s;
                ">
                    <div>
                        <h1 style="font-size: 4rem; color: white; text-shadow: 0 0 20px rgba(255,255,255,0.5);">
                            🎉
                        </h1>
                        <h2 style="font-size: 3rem; color: white; margin: 2rem 0;">
                            これから始まります...
                        </h2>
                    </div>
                </div>
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                </style>
            `;
            await sleep(3000);
        }
    },
    {
        name: "Twitter検索",
        url: "https://x.com/search",
        code: async () => {
            await sleep(2000);
            
            // 検索ボックスを見つけてクリック
            const searchBox = document.querySelector('input[data-testid="SearchBox_Search_Input"]') || 
                             document.querySelector('input[placeholder*="検索"]') ||
                             document.querySelector('input[aria-label*="検索"]');
            
            if (searchBox) {
                searchBox.click();
                searchBox.focus();
                await sleep(1000);
                
                // ゆっくり入力
                const searchText = "蒼凪しずく 生誕祭 楽しみ";
                for (const char of searchText) {
                    searchBox.value += char;
                    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
                    await sleep(200);
                }
                
                await sleep(1000);
                
                // エンターキー
                searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                await sleep(3000);
            }
        }
    },
    {
        name: "しずくちゃんメイド服ツイート",
        url: "https://x.com/flap_shizuku/status/1988950811075125652",
        code: async () => {
            await sleep(3000);
            
            // ゆっくりスクロール
            window.scrollTo({ top: 300, behavior: 'smooth' });
            await sleep(2000);
            
            // いいねボタンを探してクリック
            const likeButton = document.querySelector('[data-testid="like"]');
            if (likeButton && !likeButton.querySelector('[data-testid="unlike"]')) {
                // ボタンをハイライト
                likeButton.style.transform = 'scale(1.2)';
                likeButton.style.transition = 'transform 0.3s';
                await sleep(500);
                
                likeButton.click();
                await sleep(1000);
                
                likeButton.style.transform = 'scale(1)';
            }
            
            await sleep(2000);
        }
    },
    {
        name: "JR大塚駅 生誕祭広告",
        url: "https://x.com/flap_up_idol/status/1988510278448017445",
        code: async () => {
            await sleep(3000);
            
            // 画像をゆっくり表示
            window.scrollTo({ top: 200, behavior: 'smooth' });
            await sleep(2000);
            
            // 画像クリックで拡大
            const images = document.querySelectorAll('img[alt*="Image"]');
            if (images.length > 0) {
                images[0].style.border = '5px solid #ff6b9d';
                images[0].style.transition = 'all 0.5s';
                await sleep(1000);
                
                images[0].click();
                await sleep(3000);
                
                // 閉じる
                const closeButton = document.querySelector('[aria-label="閉じる"]') ||
                                   document.querySelector('[data-testid="app-bar-close"]');
                if (closeButton) {
                    closeButton.click();
                }
            }
            
            await sleep(2000);
            
            // いいね
            const likeButton = document.querySelector('[data-testid="like"]');
            if (likeButton) {
                likeButton.click();
                await sleep(1000);
            }
        }
    },
    {
        name: "TikTok動画",
        url: "https://www.tiktok.com/@idolfunch/video/7509897290023177489",
        code: async () => {
            await sleep(4000);
            
            // 動画を探して再生
            const video = document.querySelector('video');
            if (video) {
                // 動画をハイライト
                video.style.border = '5px solid #ff6b9d';
                video.style.boxShadow = '0 0 30px rgba(255, 107, 157, 0.6)';
                await sleep(1000);
                
                if (video.paused) {
                    video.play();
                }
                
                // 5秒間視聴
                await sleep(5000);
                
                video.style.border = 'none';
                video.style.boxShadow = 'none';
            }
            
            // いいねボタン
            const likeButton = document.querySelector('button[data-e2e="like-icon"]') ||
                              document.querySelector('button[aria-label*="いいね"]');
            if (likeButton) {
                likeButton.style.transform = 'scale(1.3)';
                likeButton.style.transition = 'transform 0.3s';
                await sleep(500);
                
                likeButton.click();
                await sleep(1000);
                
                likeButton.style.transform = 'scale(1)';
            }
            
            await sleep(2000);
        }
    },
    {
        name: "idolfunch ツイート動画",
        url: "https://x.com/idolfunch/status/1942732395515633764",
        code: async () => {
            await sleep(3000);
            
            // 動画を再生
            const video = document.querySelector('video');
            if (video) {
                video.style.border = '5px solid #6bcf7f';
                video.style.transition = 'all 0.5s';
                await sleep(500);
                
                if (video.paused) {
                    video.click();
                }
                
                // 視聴
                await sleep(5000);
                
                video.style.border = 'none';
            }
            
            // いいね
            const likeButton = document.querySelector('[data-testid="like"]');
            if (likeButton) {
                likeButton.click();
                await sleep(1000);
            }
        }
    },
    {
        name: "フィナーレ",
        url: "about:blank",
        code: async () => {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    font-family: Arial, sans-serif;
                    text-align: center;
                    overflow: hidden;
                ">
                    <div class="content">
                        <div class="emoji" style="font-size: 8rem; animation: bounce 1s infinite;">🎉</div>
                        <h1 class="title" style="
                            font-size: 5rem;
                            background: linear-gradient(45deg, #ff6b9d, #ffd93d, #6bcf7f, #4d9fff);
                            background-size: 300% 300%;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            animation: gradientShift 3s ease infinite, fadeInScale 1s ease-out;
                            margin: 2rem 0;
                        ">蒼凪しずく</h1>
                        <h2 style="
                            font-size: 3.5rem;
                            color: white;
                            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                            animation: fadeIn 1s ease-out 0.5s both;
                        ">生誕祭 楽しみ！</h2>
                        <div style="
                            font-size: 4rem;
                            margin-top: 2rem;
                            animation: fadeIn 1s ease-out 1s both;
                        ">✨</div>
                        <p style="
                            font-size: 2rem;
                            color: white;
                            margin-top: 2rem;
                            animation: fadeIn 1s ease-out 1.5s both;
                        ">おめでとう！</p>
                    </div>
                    <div class="confetti-container"></div>
                </div>
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes fadeInScale {
                        from { 
                            opacity: 0;
                            transform: scale(0.5);
                        }
                        to { 
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    
                    @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-30px); }
                    }
                    
                    @keyframes fall {
                        to {
                            transform: translateY(100vh) rotate(360deg);
                            opacity: 0;
                        }
                    }
                    
                    .confetti {
                        position: absolute;
                        font-size: 2rem;
                        animation: fall 5s linear infinite;
                    }
                </style>
                <script>
                    // 紙吹雪アニメーション
                    const container = document.querySelector('.confetti-container');
                    const emojis = ['🎉', '🎊', '✨', '💕', '🎂', '🎈', '⭐', '💖', '🌟', '🎁'];
                    
                    function createConfetti() {
                        const confetti = document.createElement('div');
                        confetti.className = 'confetti';
                        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                        confetti.style.left = Math.random() * 100 + '%';
                        confetti.style.animationDelay = Math.random() * 2 + 's';
                        confetti.style.animationDuration = (Math.random() * 3 + 3) + 's';
                        container.appendChild(confetti);
                        
                        setTimeout(() => confetti.remove(), 8000);
                    }
                    
                    setInterval(createConfetti, 300);
                </script>
            `;
            
            await sleep(5000);
        }
    }
];

console.log(`
🎬 蒼凪しずく 生誕祭 自動録画シナリオ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 シナリオ:
${birthdayScenario.map((scene, i) => `${i + 1}. ${scene.name}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 使用方法:

1. 画面録画ソフトを起動（OBS Studio, Windows Game Bar など）
2. 録画開始
3. 各URLを順番に開いて、Consoleでコードを実行
4. 自動操作を録画
5. 録画停止

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 各ステップの実行方法:
ブラウザのDevTools Console で以下を実行:

// ステップ1を実行:
window.location.href = "${birthdayScenario[0].url}";
// ページが開いたら以下を実行:
${birthdayScenario[0].code.toString()}

// 以降、各ステップも同様に実行してください
`);

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { birthdayScenario, sleep, typeSlowly };
}
