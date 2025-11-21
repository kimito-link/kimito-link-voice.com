// 🎬 KimiLink Voice - ストーリー型デモ撮影システム
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'http://localhost:3000';
const OUTPUT_DIR = './demo-screenshots';

// 出力ディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎬 KimiLink Voice - ストーリー型デモ撮影を開始します...\n');
console.log('📖 シナリオ: TOPページ → ログイン → ダッシュボード（最大15シーン）\n');
console.log('   ※ ログイン時に10秒待機するので、その間にTwitterでログインしてください\n');

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureStoryDemo() {
    const browser = await puppeteer.launch({
        headless: false, // ブラウザを表示
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    let shotNumber = 1;
    
    try {
        // ============================================
        // パート1: TOPページの魅力を伝える
        // ============================================
        console.log('\n🎬 パート1: TOPページ紹介\n');
        
        console.log('📄 シーン1: TOPページを開く');
        await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_top_page_hero.png`)
        });

        console.log('📸 シーン2: ヒーローセクション');
        await page.evaluate(() => window.scrollTo(0, 0));
        await wait(1500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_hero_section.png`)
        });

        console.log('📸 シーン3: CTAボタン');
        await page.evaluate(() => {
            const ctaButton = document.querySelector('.hero-cta-box');
            if (ctaButton) {
                ctaButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_cta_buttons.png`)
        });

        console.log('📸 シーン4: 声優カード紹介');
        await page.evaluate(() => {
            const narratorGrid = document.querySelector('.narrator-grid');
            if (narratorGrid) {
                narratorGrid.scrollIntoView({ behavior: 'smooth' });
            }
        });
        await wait(2500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_voice_actors.png`)
        });

        console.log('📸 シーン5: コラボメンバー');
        await page.evaluate(() => {
            const collabSection = document.querySelector('#collabAvatar');
            if (collabSection) {
                const parent = collabSection.closest('.section');
                if (parent) {
                    parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
        await wait(2500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_collab_member.png`)
        });

        console.log('📸 シーン6: ログインボタン（ハイライト）');
        await page.evaluate(() => window.scrollTo(0, 0));
        await wait(1000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_login_button.png`)
        });

        console.log('🔐 シーン7: ログインボタンをクリック');
        console.log('   ※ ここから先は手動でTwitterログインが必要です');
        console.log('   ※ 10秒待機するので、その間にログインしてください...');
        
        // ログインボタンをクリック
        try {
            await page.click('#loginBtn');
            await wait(2000);
            
            // OAuth画面のスクリーンショット
            console.log('📸 シーン8: Twitter OAuth画面');
            await wait(1000);
            await page.screenshot({
                path: path.join(OUTPUT_DIR, `${shotNumber++}_oauth_screen.png`)
            });
            
            console.log('\n⏸️  10秒待機します...');
            console.log('   この間にTwitterでログインを完了してください！');
            await wait(10000);
            
            // ダッシュボードに遷移したかチェック
            const currentUrl = page.url();
            if (currentUrl.includes('localhost:3000') && !currentUrl.includes('auth')) {
                console.log('✅ ログイン成功！ダッシュボードを撮影します');
                
                console.log('📸 シーン9: ダッシュボード - ウェルカム画面');
                await wait(2000);
                await page.screenshot({
                    path: path.join(OUTPUT_DIR, `${shotNumber++}_dashboard_welcome.png`),
                    fullPage: true
                });

                console.log('📸 シーン10: ダッシュボード - タブ切り替え');
                // 依頼者タブをクリック
                await page.evaluate(() => {
                    const tabs = document.querySelectorAll('[data-tab]');
                    if (tabs.length > 1) tabs[1].click();
                });
                await wait(1500);
                await page.screenshot({
                    path: path.join(OUTPUT_DIR, `${shotNumber++}_dashboard_tabs.png`),
                    fullPage: true
                });
            } else {
                console.log('⚠️  ログインがまだ完了していないようです');
                console.log('   ダッシュボードの撮影はスキップします');
            }
        } catch (error) {
            console.log('⚠️  ログイン操作をスキップ:', error.message);
        }

        // ============================================
        // パート2: 機能の詳細説明（TOPページ）
        // ============================================
        console.log('\n🎬 パート2: 各セクションの詳細\n');
        
        console.log('📸 シーン11: 使い方セクション');
        await page.evaluate(() => {
            const usageSection = document.querySelector('.usage-section');
            if (usageSection) {
                usageSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.scrollTo({ top: 1500, behavior: 'smooth' });
            }
        });
        await wait(2500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_usage_section.png`)
        });

        console.log('📸 シーン12: フッター・リンク');
        await page.evaluate(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_footer.png`)
        });

        console.log('📸 シーン13: 全体を俯瞰（フルページ）');
        await page.evaluate(() => window.scrollTo(0, 0));
        await wait(1000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_full_page_overview.png`),
            fullPage: true
        });

        // ============================================
        // パート3: レスポンシブデザイン
        // ============================================
        console.log('\n🎬 パート3: レスポンシブデザイン\n');
        
        console.log('📱 シーン14: スマホ表示（iPhone 12 Pro）');
        await page.setViewport({
            width: 390,
            height: 844,
            deviceScaleFactor: 3
        });
        await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_mobile_top.png`),
            fullPage: true
        });

        console.log('📱 シーン15: タブレット表示（iPad）');
        await page.setViewport({
            width: 768,
            height: 1024,
            deviceScaleFactor: 2
        });
        await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `${shotNumber++}_tablet_top.png`),
            fullPage: true
        });

        // サマリー
        console.log('\n✅ すべてのシーンを撮影しました！');
        console.log(`📁 保存先: ${path.resolve(OUTPUT_DIR)}\n`);
        console.log('='.repeat(70));
        console.log('📊 撮影サマリー');
        console.log('='.repeat(70));
        console.log('【パート1: TOPページ】');
        console.log('  01 - TOPページ（ヒーロー）');
        console.log('  02 - ヒーローセクション');
        console.log('  03 - CTAボタン');
        console.log('  04 - 声優カード');
        console.log('  05 - コラボメンバー');
        console.log('  06 - ログインボタン');
        console.log('  07 - ログインボタンクリック');
        console.log('  08 - Twitter OAuth画面');
        console.log('  09 - ダッシュボード - ウェルカム');
        console.log('  10 - ダッシュボード - タブ切り替え');
        console.log('\n【パート2: 詳細セクション】');
        console.log('  11 - 使い方セクション');
        console.log('  12 - フッター・リンク');
        console.log('  13 - 全体俯瞰（フルページ）');
        console.log('\n【パート3: レスポンシブ】');
        console.log('  14 - スマホ表示');
        console.log('  15 - タブレット表示');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
        console.error('スタック:', error.stack);
    } finally {
        await wait(3000);
        await browser.close();
        console.log('\n✅ 撮影完了！ブラウザを閉じました。');
        console.log('\n💡 これらの画像を使って動画編集してください！');
        console.log('   VIDEO_SCRIPT.md のスクリプトに合わせて編集すると良いです。');
    }
}

// スクリプト実行
captureStoryDemo().catch(console.error);
