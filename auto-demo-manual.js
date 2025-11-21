// 🎬 KimiLink Voice - 手動操作デモ撮影
// キーボードでスクリーンショットを撮影

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const OUTPUT_DIR = './demo-screenshots';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎬 手動操作デモ撮影システム\n');
console.log('📝 使い方:');
console.log('  1. ブラウザが開きます');
console.log('  2. ログインして、好きなタブを表示');
console.log('  3. ターミナルに戻って Enterキー を押すとスクリーンショット撮影');
console.log('  4. 撮影したいシーン全てで繰り返し');
console.log('  5. 完了したら "q" を入力して終了\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let shotNumber = 1;
let page;

async function captureCurrent() {
    if (!page) {
        console.log('❌ ブラウザがまだ起動していません');
        return;
    }

    try {
        const filename = `manual_${shotNumber++}_screenshot.png`;
        await page.screenshot({
            path: path.join(OUTPUT_DIR, filename),
            fullPage: true
        });
        console.log(`✅ 撮影完了: ${filename}\n`);
        console.log(`次のシーンを表示して Enter を押してください (終了: q)`);
    } catch (error) {
        console.error('❌ 撮影エラー:', error.message);
    }
}

async function startManualCapture() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--new-window',
            'http://localhost:3000'
        ]
    });

    const pages = await browser.pages();
    page = pages[0] || await browser.newPage();
    
    if (!pages[0]) {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    }

    console.log('✅ ブラウザ起動完了！\n');
    console.log('📸 準備ができたら Enter を押してください\n');

    rl.on('line', async (input) => {
        if (input.toLowerCase() === 'q' || input.toLowerCase() === 'quit') {
            console.log('\n🎉 撮影を終了します...');
            console.log(`📁 合計 ${shotNumber - 1} 枚撮影しました`);
            console.log(`📂 保存先: ${path.resolve(OUTPUT_DIR)}\n`);
            await browser.close();
            rl.close();
            process.exit(0);
        } else {
            await captureCurrent();
        }
    });
}

startManualCapture().catch(console.error);
