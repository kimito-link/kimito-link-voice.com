const puppeteer = require('puppeteer');

async function runBirthdayAutomation() {
    console.log('🎬 蒼凪しずく 生誕祭 自動化開始！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📌 デバッグモードのChromeに接続中...');
    
    try {
        // 既存のデバッグChromeに接続
        const browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222',
            defaultViewport: null
        });
        
        const pages = await browser.pages();
        const page = pages[0];
        
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        console.log('✅ 接続成功！');
        console.log('');
        
        // シーン1: オープニング
        console.log('🎬 シーン1: オープニング');
        await page.goto('about:blank');
        await page.setContent(`
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
                    <h1 style="font-size: 6rem; color: white; animation: pulse 1s infinite;">🎉</h1>
                    <h2 style="font-size: 4rem; color: white; margin: 2rem 0;">
                        これから始まります...
                    </h2>
                </div>
                <style>
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                </style>
            </div>
        `);
        await sleep(4000);
        
        // シーン2: Twitter検索
        console.log('🔍 シーン2: Twitter検索');
        await page.goto('https://x.com/search?q=%E8%92%BC%E5%87%AA%E3%81%97%E3%81%9A%E3%81%8F%20%E7%94%9F%E8%AA%95%E7%A5%AD%20%E6%A5%BD%E3%81%97%E3%81%BF&src=typed_query', { waitUntil: 'networkidle2' });
        await sleep(6000);
        
        // シーン3: メイド服ツイート
        console.log('📸 シーン3: メイド服ツイート');
        await page.goto('https://x.com/flap_shizuku/status/1988950811075125652', { waitUntil: 'networkidle2' });
        await sleep(3000);
        
        // スクロールして表示
        await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
        await sleep(2000);
        
        // いいねボタンを探してクリック
        try {
            const likeButton = await page.$('[data-testid="like"]');
            if (likeButton) {
                await likeButton.click();
                console.log('   ✅ いいね完了');
            }
        } catch (e) {
            console.log('   ⚠️ いいねスキップ');
        }
        await sleep(3000);
        
        // シーン4: JR大塚駅広告
        console.log('🚉 シーン4: JR大塚駅広告');
        await page.goto('https://x.com/flap_up_idol/status/1988510278448017445', { waitUntil: 'networkidle2' });
        await sleep(3000);
        
        await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }));
        await sleep(2000);
        
        // 画像をハイライト
        await page.evaluate(() => {
            const images = document.querySelectorAll('img[alt*="Image"]');
            if (images.length > 0) {
                images[0].style.border = '5px solid #ff6b9d';
                images[0].style.boxShadow = '0 0 20px rgba(255, 107, 157, 0.6)';
                setTimeout(() => {
                    images[0].style.border = 'none';
                    images[0].style.boxShadow = 'none';
                }, 2500);
            }
        });
        
        await sleep(2500);
        
        try {
            const likeButton = await page.$('[data-testid="like"]');
            if (likeButton) {
                await likeButton.click();
                console.log('   ✅ いいね完了');
            }
        } catch (e) {
            console.log('   ⚠️ いいねスキップ');
        }
        await sleep(2000);
        
        // シーン5: TikTok動画
        console.log('🎵 シーン5: TikTok動画');
        await page.goto('https://www.tiktok.com/@idolfunch/video/7509897290023177489', { waitUntil: 'networkidle2' });
        await sleep(4000);
        
        // 動画をクリックして再生
        try {
            await page.click('video');
            console.log('   ✅ 動画再生開始');
            
            // ミュート解除
            await page.evaluate(() => {
                const video = document.querySelector('video');
                if (video) {
                    video.muted = false;
                    video.volume = 1.0;
                }
            });
        } catch (e) {
            console.log('   ⚠️ 動画クリック失敗');
        }
        
        await sleep(10000);
        
        // シーン6: idolfunchツイート
        console.log('🎤 シーン6: idolfunchツイート');
        await page.goto('https://x.com/idolfunch/status/1942732395515633764', { waitUntil: 'networkidle2' });
        await sleep(3000);
        
        // 動画をクリックして再生
        try {
            await page.click('video');
            console.log('   ✅ Twitter動画再生開始');
            
            // ミュート解除
            await page.evaluate(() => {
                const video = document.querySelector('video');
                if (video) {
                    video.muted = false;
                    video.volume = 1.0;
                }
            });
        } catch (e) {
            console.log('   ⚠️ 動画クリック失敗');
        }
        
        await sleep(8000);
        
        try {
            const likeButton = await page.$('[data-testid="like"]');
            if (likeButton) {
                await likeButton.click();
                console.log('   ✅ いいね完了');
            }
        } catch (e) {
            console.log('   ⚠️ いいねスキップ');
        }
        await sleep(2000);
        
        // シーン7: フィナーレ
        console.log('🎉 シーン7: フィナーレ');
        await page.goto('about:blank');
        await page.setContent(`
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
                <div>
                    <div style="font-size: 10rem; animation: bounce 1s infinite;">🎉</div>
                    <h1 style="
                        font-size: 6rem;
                        background: linear-gradient(45deg, #ff6b9d, #ffd93d, #6bcf7f, #4d9fff);
                        background-size: 300% 300%;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: gradient 3s ease infinite;
                        margin: 2rem 0;
                    ">蒼凪しずく</h1>
                    <h2 style="font-size: 4rem; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                        生誕祭 楽しみ！
                    </h2>
                    <div style="font-size: 5rem; margin-top: 2rem;">✨</div>
                    <p style="font-size: 3rem; color: white; margin-top: 2rem;">おめでとう！</p>
                </div>
            </div>
            <style>
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-30px); }
                }
            </style>
        `);
        await sleep(6000);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ 完了！録画を停止してください！');
        console.log('');
        
        await browser.disconnect();
        console.log('💡 ブラウザは開いたままです。');
        
    } catch (error) {
        console.error('❌ エラー:', error.message);
        console.log('');
        console.log('💡 トラブルシューティング:');
        console.log('   1. 「既存Chrome起動.bat」を実行しましたか？');
        console.log('   2. Chromeが http://localhost:9222 で起動していますか？');
        console.log('   3. Twitterにログインしていますか？');
    }
}

runBirthdayAutomation();
