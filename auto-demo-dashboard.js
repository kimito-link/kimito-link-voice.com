// 🎬 KimiLink Voice - ダッシュボード専用デモ撮影
// ※ 事前にブラウザでログインしておいてください

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'http://localhost:3000';
const OUTPUT_DIR = './demo-screenshots';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎬 ダッシュボード専用デモ撮影を開始します...\n');
console.log('📝 手順:');
console.log('  1. Chromeを特別なモードで起動します');
console.log('  2. そのブラウザでログインしてください');
console.log('  3. ログイン完了後、Enterキーを押してください\n');
console.log('🔧 Chromeを起動中...\n');

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureDashboard() {
    await wait(5000);
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        args: [
            '--start-maximized',
            '--user-data-dir=./puppeteer_profile' // セッションを保持
        ]
    });

    const page = await browser.newPage();
    let shotNumber = 1;
    
    try {
        console.log('📄 ダッシュボードを開いています...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
        await wait(3000);

        // ログイン状態をチェック
        const isLoggedIn = await page.evaluate(() => {
            return document.querySelector('.user-info') !== null ||
                   document.querySelector('#userAvatar') !== null ||
                   window.location.href.includes('localhost:3000') && 
                   !window.location.href.includes('auth-cancelled');
        });

        if (!isLoggedIn) {
            console.log('\n⚠️  ログインしていないようです。');
            console.log('   以下の手順でログインしてください：\n');
            console.log('   1. ブラウザが開いたら「ログイン」ボタンをクリック');
            console.log('   2. Twitterでログイン');
            console.log('   3. ダッシュボードに戻ったら準備完了\n');
            console.log('⏸️  30秒待機します。その間にログインしてください...\n');
            
            // ログインボタンをクリック
            try {
                await page.click('#loginBtn');
                await wait(30000); // 30秒待機
                
                // ページをリロード
                await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
                await wait(2000);
            } catch (e) {
                console.log('   手動でログインしてください');
                await wait(30000);
            }
        }

        console.log('\n✅ ログイン確認完了！撮影を開始します\n');

        // ============================================
        // ダッシュボード撮影
        // ============================================
        
        console.log('📸 シーン1: ダッシュボード - ウェルカム画面');
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `dashboard_${shotNumber++}_welcome.png`),
            fullPage: true
        });

        console.log('📸 シーン2: 概要タブ');
        await page.evaluate(() => {
            const overviewTab = document.querySelector('[data-tab="overview"]');
            if (overviewTab) overviewTab.click();
        });
        await wait(1500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `dashboard_${shotNumber++}_overview.png`),
            fullPage: true
        });

        console.log('📸 シーン3: 依頼者モード');
        await page.evaluate(() => {
            const clientRole = document.querySelector('input[value="client"]');
            if (clientRole) {
                clientRole.click();
                // タブも切り替え
                const requestTab = document.querySelector('[data-tab="requests"]');
                if (requestTab) requestTab.click();
            }
        });
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `dashboard_${shotNumber++}_client_mode.png`),
            fullPage: true
        });

        console.log('📸 シーン4: 声優モード');
        await page.evaluate(() => {
            const narratorRole = document.querySelector('input[value="narrator"]');
            if (narratorRole) {
                narratorRole.click();
                // タブも切り替え
                const ordersTab = document.querySelector('[data-tab="orders"]');
                if (ordersTab) ordersTab.click();
            }
        });
        await wait(2000);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `dashboard_${shotNumber++}_narrator_mode.png`),
            fullPage: true
        });

        console.log('📸 シーン5: 履歴タブ');
        await page.evaluate(() => {
            const historyTab = document.querySelector('[data-tab="history"]');
            if (historyTab) historyTab.click();
        });
        await wait(1500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `dashboard_${shotNumber++}_history.png`),
            fullPage: true
        });

        console.log('📸 シーン6: 感謝のメッセージタブ');
        await page.evaluate(() => {
            const thanksTab = document.querySelector('[data-tab="thanks"]');
            if (thanksTab) thanksTab.click();
        });
        await wait(1500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `dashboard_${shotNumber++}_thanks.png`),
            fullPage: true
        });

        console.log('📸 シーン7: 実績タブ');
        await page.evaluate(() => {
            const achievementsTab = document.querySelector('[data-tab="achievements"]');
            if (achievementsTab) achievementsTab.click();
        });
        await wait(1500);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, `dashboard_${shotNumber++}_achievements.png`),
            fullPage: true
        });

        console.log('\n✅ ダッシュボードの撮影が完了しました！');
        console.log(`📁 保存先: ${path.resolve(OUTPUT_DIR)}\n`);
        console.log('='.repeat(60));
        console.log('📊 撮影サマリー');
        console.log('='.repeat(60));
        console.log('dashboard_1_welcome.png      - ウェルカム画面');
        console.log('dashboard_2_overview.png     - 概要タブ');
        console.log('dashboard_3_client_mode.png  - 依頼者モード');
        console.log('dashboard_4_narrator_mode.png- 声優モード');
        console.log('dashboard_5_history.png      - 履歴タブ');
        console.log('dashboard_6_thanks.png       - 感謝のメッセージ');
        console.log('dashboard_7_achievements.png - 実績タブ');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
        console.error('スタック:', error.stack);
    } finally {
        await wait(3000);
        await browser.close();
        console.log('\n✅ 撮影完了！ブラウザを閉じました。');
    }
}

captureDashboard().catch(console.error);
