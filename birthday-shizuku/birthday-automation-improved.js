const puppeteer = require('puppeteer');

async function runBirthdayAutomation() {
    console.log('🎬 蒼凪しずく 生誕祭 自動化開始！（改善版）');
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
        
        // Twitterログイン状態を確認する関数
        async function checkTwitterLogin() {
            console.log('🔍 Twitterログイン状態を確認中...');
            
            try {
                await page.goto('https://x.com', { waitUntil: 'networkidle2', timeout: 10000 });
                await sleep(3000);
                
                // ログイン画面の要素をチェック
                const loginElements = await page.$$eval('*', elements => {
                    return elements.some(el => {
                        const text = el.textContent || '';
                        return text.includes('ログイン') || 
                               text.includes('Sign in') || 
                               text.includes('電話、メール、ユーザー名') ||
                               text.includes('Phone, email, or username');
                    });
                });
                
                // URLでもチェック
                const currentUrl = page.url();
                const isLoginPage = currentUrl.includes('/login') || 
                                  currentUrl.includes('/i/flow/login') ||
                                  loginElements;
                
                if (isLoginPage) {
                    console.log('❌ Twitterにログインしていません');
                    return false;
                } else {
                    console.log('✅ Twitterログイン済み');
                    return true;
                }
            } catch (error) {
                console.log('⚠️ ログイン状態確認でエラー:', error.message);
                return false;
            }
        }
        
        // ログイン処理のガイダンス
        async function handleLoginRequired() {
            console.log('');
            console.log('🚨 Twitterログインが必要です！');
            console.log('━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 手動ログイン手順:');
            console.log('   1. 現在のブラウザタブでTwitterにログイン');
            console.log('   2. ログイン完了後、このスクリプトを再実行');
            console.log('   3. または、Ctrl+Cで中断してください');
            console.log('');
            console.log('⏰ 60秒待機します...');
            
            // 60秒待機してから再チェック
            for (let i = 60; i > 0; i--) {
                process.stdout.write(`\r⏱️  残り ${i} 秒...`);
                await sleep(1000);
            }
            console.log('\n');
            
            return await checkTwitterLogin();
        }
        
        // 安全なページ遷移関数
        async function safeNavigate(url, description) {
            console.log(`🔗 ${description}`);
            
            try {
                await page.goto(url, { 
                    waitUntil: 'networkidle2', 
                    timeout: 15000 
                });
                
                // ログイン画面にリダイレクトされていないかチェック
                await sleep(2000);
                const currentUrl = page.url();
                
                if (currentUrl.includes('/login') || currentUrl.includes('/i/flow/login')) {
                    console.log('⚠️ ログイン画面にリダイレクトされました');
                    return false;
                }
                
                console.log('   ✅ ページ読み込み完了');
                return true;
            } catch (error) {
                console.log(`   ❌ エラー: ${error.message}`);
                return false;
            }
        }
        
        // 安全ないいね処理
        async function safeLike() {
            try {
                // 複数のセレクターを試行
                const likeSelectors = [
                    '[data-testid="like"]',
                    '[aria-label*="いいね"]',
                    '[aria-label*="Like"]',
                    'button[data-testid="like"]'
                ];
                
                for (const selector of likeSelectors) {
                    const likeButton = await page.$(selector);
                    if (likeButton) {
                        // ボタンが表示されているかチェック
                        const isVisible = await page.evaluate(el => {
                            const rect = el.getBoundingClientRect();
                            return rect.width > 0 && rect.height > 0;
                        }, likeButton);
                        
                        if (isVisible) {
                            await likeButton.click();
                            console.log('   ✅ いいね完了');
                            return true;
                        }
                    }
                }
                
                console.log('   ⚠️ いいねボタンが見つかりません');
                return false;
            } catch (error) {
                console.log('   ⚠️ いいね処理でエラー:', error.message);
                return false;
            }
        }
        
        // メイン処理開始
        console.log('🔐 Twitterログイン状態確認...');
        let isLoggedIn = await checkTwitterLogin();
        
        if (!isLoggedIn) {
            isLoggedIn = await handleLoginRequired();
            
            if (!isLoggedIn) {
                console.log('❌ ログインが完了していません。処理を中断します。');
                console.log('💡 手動でログイン後、再度実行してください。');
                await browser.disconnect();
                return;
            }
        }
        
        console.log('🎬 自動化シナリオ開始！');
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
                        蒼凪しずく 生誕祭
                    </h2>
                    <p style="font-size: 2rem; color: white;">自動化開始...</p>
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
        const searchSuccess = await safeNavigate(
            'https://x.com/search?q=%E8%92%BC%E5%87%AA%E3%81%97%E3%81%9A%E3%81%8F%20%E7%94%9F%E8%AA%95%E7%A5%AD%20%E6%A5%BD%E3%81%97%E3%81%BF&src=typed_query',
            'Twitter検索ページ'
        );
        
        if (searchSuccess) {
            await sleep(6000);
        } else {
            console.log('⚠️ 検索ページの読み込みに失敗、スキップします');
        }
        
        // シーン3: メイド服ツイート
        console.log('📸 シーン3: メイド服ツイート');
        const maidTweetSuccess = await safeNavigate(
            'https://x.com/flap_shizuku/status/1988950811075125652',
            'メイド服ツイート'
        );
        
        if (maidTweetSuccess) {
            await sleep(3000);
            
            // スクロールして表示
            await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
            await sleep(2000);
            
            // いいね処理
            await safeLike();
            await sleep(3000);
        }
        
        // シーン4: JR大塚駅広告
        console.log('🚉 シーン4: JR大塚駅広告');
        const stationAdSuccess = await safeNavigate(
            'https://x.com/flap_up_idol/status/1988510278448017445',
            'JR大塚駅広告ツイート'
        );
        
        if (stationAdSuccess) {
            await sleep(3000);
            
            await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }));
            await sleep(2000);
            
            // 画像をハイライト
            await page.evaluate(() => {
                const images = document.querySelectorAll('img[alt*="Image"], img[src*="media"]');
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
            await safeLike();
            await sleep(2000);
        }
        
        // シーン5: TikTok動画
        console.log('🎵 シーン5: TikTok動画');
        try {
            await page.goto('https://www.tiktok.com/@idolfunch/video/7509897290023177489', { 
                waitUntil: 'networkidle2',
                timeout: 15000
            });
            await sleep(4000);
            
            // 動画をクリックして再生
            try {
                await page.click('video');
                console.log('   ✅ 動画再生開始');
                
                // ミュート解除を試行
                await page.evaluate(() => {
                    const video = document.querySelector('video');
                    if (video) {
                        video.muted = false;
                        video.volume = 1.0;
                        video.play();
                    }
                });
            } catch (e) {
                console.log('   ⚠️ 動画操作失敗:', e.message);
            }
            
            await sleep(10000);
        } catch (error) {
            console.log('   ⚠️ TikTok読み込み失敗:', error.message);
        }
        
        // シーン6: idolfunchツイート
        console.log('🎤 シーン6: idolfunchツイート');
        const idolTweetSuccess = await safeNavigate(
            'https://x.com/idolfunch/status/1942732395515633764',
            'idolfunchツイート'
        );
        
        if (idolTweetSuccess) {
            await sleep(3000);
            
            // 動画をクリックして再生
            try {
                const videoElement = await page.$('video');
                if (videoElement) {
                    await videoElement.click();
                    console.log('   ✅ Twitter動画再生開始');
                    
                    // ミュート解除
                    await page.evaluate(() => {
                        const video = document.querySelector('video');
                        if (video) {
                            video.muted = false;
                            video.volume = 1.0;
                        }
                    });
                } else {
                    console.log('   ⚠️ 動画要素が見つかりません');
                }
            } catch (e) {
                console.log('   ⚠️ 動画クリック失敗:', e.message);
            }
            
            await sleep(8000);
            await safeLike();
            await sleep(2000);
        }
        
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
        console.error('❌ 致命的エラー:', error.message);
        console.log('');
        console.log('🔧 トラブルシューティング:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Chrome起動確認:');
        console.log('   「既存Chrome起動.bat」を実行しましたか？');
        console.log('');
        console.log('2. デバッグポート確認:');
        console.log('   http://localhost:9222 にアクセスできますか？');
        console.log('');
        console.log('3. Twitterログイン確認:');
        console.log('   ブラウザでhttps://x.comにアクセスしてログイン状態を確認');
        console.log('');
        console.log('4. 再実行手順:');
        console.log('   - 上記を確認後、このスクリプトを再実行');
        console.log('   - または「step2-auto-run.bat」を実行');
        console.log('');
        console.log('💡 問題が解決しない場合は手動でTwitter操作を行ってください。');
    }
}

runBirthdayAutomation();
