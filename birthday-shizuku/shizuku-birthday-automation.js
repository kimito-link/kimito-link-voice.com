// 蒼凪しずく 生誕祭 自動操作スクリプト
// Chrome DevTools MCPで実行

const scenario = {
    title: "🎉 蒼凪しずく 生誕祭 楽しみ！ 🎉",
    
    steps: [
        {
            step: 1,
            action: "navigate",
            url: "https://x.com",
            wait: 2000,
            description: "Twitterを開く"
        },
        {
            step: 2,
            action: "click",
            selector: 'input[placeholder*="検索"]',
            wait: 1000,
            description: "検索ボックスをクリック"
        },
        {
            step: 3,
            action: "typeSlowly",
            text: "蒼凪しずく 生誕祭 楽しみ！🎉",
            selector: 'input[placeholder*="検索"]',
            speed: 200,
            description: "1文字ずつゆっくり入力"
        },
        {
            step: 4,
            action: "press",
            key: "Enter",
            wait: 2000,
            description: "検索実行"
        },
        {
            step: 5,
            action: "navigate",
            url: "https://x.com/flap_shizuku/status/1988950811075125652",
            wait: 3000,
            description: "しずくちゃんのメイド服ツイートを開く"
        },
        {
            step: 6,
            action: "scroll",
            direction: "down",
            amount: 300,
            duration: 2000,
            description: "ゆっくりスクロールしてツイートを見る"
        },
        {
            step: 7,
            action: "click",
            selector: '[data-testid="like"]',
            wait: 1000,
            description: "❤️ いいねボタンをクリック"
        },
        {
            step: 8,
            action: "navigate",
            url: "https://x.com/flap_up_idol/status/1988510278448017445",
            wait: 3000,
            description: "JR大塚駅の生誕祭広告ツイートを開く"
        },
        {
            step: 9,
            action: "scroll",
            direction: "down",
            amount: 200,
            duration: 2000,
            description: "広告画像をゆっくり見る"
        },
        {
            step: 10,
            action: "click",
            selector: '[data-testid="like"]',
            wait: 1000,
            description: "❤️ いいねボタンをクリック"
        },
        {
            step: 11,
            action: "navigate",
            url: "https://www.tiktok.com/@idolfunch/video/7509897290023177489",
            wait: 4000,
            description: "TikTok動画を開く"
        },
        {
            step: 12,
            action: "click",
            selector: 'button[aria-label*="play"], button[data-e2e="play-icon"]',
            wait: 1000,
            description: "動画を再生"
        },
        {
            step: 13,
            action: "wait",
            duration: 5000,
            description: "動画を5秒間視聴"
        },
        {
            step: 14,
            action: "click",
            selector: 'button[data-e2e="like-icon"], button[aria-label*="いいね"]',
            wait: 1000,
            description: "❤️ TikTokいいね"
        },
        {
            step: 15,
            action: "navigate",
            url: "https://x.com/idolfunch/status/1942732395515633764",
            wait: 3000,
            description: "idolfunchのツイート動画を開く"
        },
        {
            step: 16,
            action: "click",
            selector: 'video, [data-testid="videoPlayer"]',
            wait: 1000,
            description: "動画を再生"
        },
        {
            step: 17,
            action: "wait",
            duration: 5000,
            description: "動画を視聴"
        },
        {
            step: 18,
            action: "typeInNewTab",
            url: "about:blank",
            htmlContent: `
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
                        <h1 style="
                            font-size: 6rem;
                            color: white;
                            text-shadow: 0 0 30px rgba(255,255,255,0.8);
                            animation: pulse 2s infinite;
                        ">
                            🎉
                        </h1>
                        <h2 style="
                            font-size: 4rem;
                            background: linear-gradient(45deg, #ff6b9d, #ffd93d, #6bcf7f, #4d9fff);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            margin: 2rem 0;
                        ">
                            蒼凪しずく
                        </h2>
                        <h3 style="
                            font-size: 3rem;
                            color: white;
                            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        ">
                            生誕祭 楽しみ！
                        </h3>
                        <p style="
                            font-size: 2rem;
                            color: white;
                            margin-top: 2rem;
                        ">
                            ✨ おめでとう ✨
                        </p>
                    </div>
                </div>
                <style>
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                    }
                </style>
            `,
            wait: 5000,
            description: "最終メッセージを表示"
        }
    ]
};

// 実行用の関数
async function runBirthdayScenario() {
    console.log("🎬 蒼凪しずく生誕祭シナリオ開始！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    
    for (const step of scenario.steps) {
        console.log(`\n📌 Step ${step.step}: ${step.description}`);
        console.log(`   Action: ${step.action}`);
        
        if (step.url) {
            console.log(`   URL: ${step.url}`);
        }
        if (step.text) {
            console.log(`   Text: "${step.text}"`);
        }
        if (step.wait) {
            console.log(`   Wait: ${step.wait}ms`);
        }
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ シナリオ準備完了！");
    console.log("\n📝 次のステップ:");
    console.log("1. Chrome DevTools MCPでこのスクリプトを実行");
    console.log("2. 画面録画を開始");
    console.log("3. 各ステップを手動または自動で実行");
    console.log("4. 録画を停止して動画を保存");
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scenario, runBirthdayScenario };
}

// 実行
runBirthdayScenario();
