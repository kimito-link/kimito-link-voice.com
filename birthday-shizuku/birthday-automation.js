const puppeteer = require('puppeteer');

async function runBirthdayAutomation() {
    console.log('🎬 蒼凪しずく 生誕祭 自動化開始！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    // 通常のブラウザを起動（ユーザープロファイルを使用）
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--autoplay-policy=no-user-gesture-required'  // 自動再生を許可
        ]
    });
    
    const page = await browser.newPage();
    
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
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
                    <h1 style="font-size: 4rem; color: white;">🎉</h1>
                    <h2 style="font-size: 3rem; color: white; margin: 2rem 0;">
                        これから始まります...
                    </h2>
                </div>
            </div>
        `);
        await sleep(3000);
        
        // シーン2: Twitter検索
        console.log('🔍 シーン2: Twitter検索');
        await page.goto('https://x.com/search');
        await sleep(3000);
        
        const searchBox = await page.$('input[data-testid="SearchBox_Search_Input"]');
        if (searchBox) {
            await searchBox.click();
            await sleep(1000);
            await searchBox.type('蒼凪しずく 生誕祭 楽しみ', { delay: 200 });
            await sleep(1000);
            await searchBox.press('Enter');
        }
        await sleep(3000);
        
        // シーン3: メイド服ツイート
        console.log('📸 シーン3: メイド服ツイート');
        await page.goto('https://x.com/flap_shizuku/status/1988950811075125652');
        await sleep(3000);
        await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
        await sleep(2000);
        
        const likeButton1 = await page.$('[data-testid="like"]');
        if (likeButton1) {
            await page.evaluate(el => {
                el.style.transform = 'scale(1.2)';
                el.style.transition = 'transform 0.3s';
            }, likeButton1);
            await sleep(500);
            await likeButton1.click();
            await sleep(1000);
        }
        await sleep(2000);
        
        // シーン4: JR大塚駅広告
        console.log('🚉 シーン4: JR大塚駅広告');
        await page.goto('https://x.com/flap_up_idol/status/1988510278448017445');
        await sleep(3000);
        await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }));
        await sleep(2000);
        
        await page.evaluate(() => {
            const images = document.querySelectorAll('img[alt*="Image"]');
            if (images.length > 0) {
                images[0].style.border = '5px solid #ff6b9d';
                images[0].style.boxShadow = '0 0 20px rgba(255, 107, 157, 0.6)';
            }
        });
        await sleep(2500);
        
        const likeButton2 = await page.$('[data-testid="like"]');
        if (likeButton2) {
            await likeButton2.click();
        }
        await sleep(1500);
        
        // シーン5: TikTok動画
        console.log('🎵 シーン5: TikTok動画');
        await page.goto('https://www.tiktok.com/@idolfunch/video/7509897290023177489', { waitUntil: 'networkidle2' });
        await sleep(3000);
        
        // 動画をクリックして再生
        try {
            await page.click('video');
            console.log('   ✅ 動画をクリックして再生');
        } catch (e) {
            console.log('   ⚠️ 動画クリック失敗（すでに再生中の可能性）');
        }
        
        await page.evaluate(() => {
            const video = document.querySelector('video');
            if (video) {
                video.style.border = '5px solid #ff6b9d';
                video.style.boxShadow = '0 0 30px rgba(255, 107, 157, 0.8)';
                video.muted = false; // ミュート解除
                if (video.paused) {
                    video.play().catch(e => console.log('自動再生制限:', e));
                }
            }
        });
        await sleep(8000);
        
        // シーン6: idolfunchツイート
        console.log('🎤 シーン6: idolfunchツイート');
        await page.goto('https://x.com/idolfunch/status/1942732395515633764', { waitUntil: 'networkidle2' });
        await sleep(3000);
        
        // 動画をクリックして再生
        try {
            await page.click('video');
            console.log('   ✅ Twitter動画をクリックして再生');
        } catch (e) {
            console.log('   ⚠️ 動画クリック失敗');
        }
        
        await page.evaluate(() => {
            const video = document.querySelector('video');
            if (video) {
                video.style.border = '5px solid #6bcf7f';
                video.muted = false; // ミュート解除
                if (video.paused) {
                    video.play().catch(e => console.log('自動再生制限:', e));
                }
            }
        });
        await sleep(6000);
        
        const likeButton3 = await page.$('[data-testid="like"]');
        if (likeButton3) {
            await likeButton3.click();
        }
        await sleep(1000);
        
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
                    <div style="font-size: 8rem; animation: bounce 1s infinite;">🎉</div>
                    <h1 style="
                        font-size: 5rem;
                        background: linear-gradient(45deg, #ff6b9d, #ffd93d, #6bcf7f, #4d9fff);
                        background-size: 300% 300%;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: gradientShift 3s ease infinite;
                        margin: 2rem 0;
                    ">蒼凪しずく</h1>
                    <h2 style="font-size: 3.5rem; color: white;">生誕祭 楽しみ！</h2>
                    <div style="font-size: 4rem; margin-top: 2rem;">✨</div>
                    <p style="font-size: 2rem; color: white; margin-top: 2rem;">おめでとう！</p>
                </div>
            </div>
            <style>
                @keyframes gradientShift {
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
        await sleep(5000);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ 完了！録画を停止してください！');
        
        await sleep(2000);
        
    } catch (error) {
        console.error('❌ エラー:', error);
    }
    
    console.log('\n💡 ブラウザは開いたままです。');
    console.log('   録画完了後、手動で閉じてください。');
}

// 実行
runBirthdayAutomation();
