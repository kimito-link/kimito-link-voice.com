// 🎬 KimiLink Voice - 自動デモ動画撮影システム（ストーリー版）
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
console.log('📖 シナリオ: TOPページ → 機能紹介 → ダッシュボード操作\n');

async function captureDemo() {
    const browser = await puppeteer.launch({
        headless: false, // ブラウザを表示（撮影を見れる）
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    
    try {
        console.log('📄 トップページを開いています...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        // シーン1: トップページ全体
        console.log('📸 シーン1: トップページのスクリーンショット');
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '01_top_page.png'),
            fullPage: true
        });

        // シーン2: ヒーローセクション
        console.log('📸 シーン2: ヒーローセクション');
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '02_hero_section.png')
        });

        // シーン3: 声優カードまでスクロール
        console.log('📸 シーン3: 声優カードセクション');
        await page.evaluate(() => {
            const narratorSection = document.querySelector('.narrator-grid');
            if (narratorSection) {
                narratorSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '03_narrator_cards.png')
        });

        // シーン4: コラボメンバーまでスクロール
        console.log('📸 シーン4: コラボメンバーセクション');
        await page.evaluate(() => {
            const collabSection = document.querySelector('#collabAvatar');
            if (collabSection) {
                collabSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '04_collab_member.png')
        });

        // シーン5: スマホサイズでの表示
        console.log('📱 シーン5: スマホサイズ（iPhone 12 Pro）');
        await page.setViewport({
            width: 390,
            height: 844,
            deviceScaleFactor: 3
        });
        await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '05_mobile_view.png'),
            fullPage: true
        });

        // シーン6: タブレットサイズでの表示
        console.log('📱 シーン6: タブレットサイズ（iPad）');
        await page.setViewport({
            width: 768,
            height: 1024,
            deviceScaleFactor: 2
        });
        await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '06_tablet_view.png'),
            fullPage: true
        });

        console.log('\n✅ すべてのスクリーンショットを撮影しました！');
        console.log(`📁 保存先: ${path.resolve(OUTPUT_DIR)}\n`);

        // サマリー表示
        console.log('='.repeat(60));
        console.log('📊 撮影サマリー');
        console.log('='.repeat(60));
        console.log('01_top_page.png       - トップページ全体');
        console.log('02_hero_section.png   - ヒーローセクション');
        console.log('03_narrator_cards.png - 声優カード');
        console.log('04_collab_member.png  - コラボメンバー');
        console.log('05_mobile_view.png    - スマホ表示');
        console.log('06_tablet_view.png    - タブレット表示');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
    } finally {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 確認用に3秒待機
        await browser.close();
        console.log('\n✅ 撮影完了！ブラウザを閉じました。');
    }
}

// スクリプト実行
captureDemo().catch(console.error);
