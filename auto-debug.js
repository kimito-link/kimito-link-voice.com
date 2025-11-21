/**
 * 自動デバッグシステム
 * 
 * Chrome DevTools Protocolを使ってページのコンソールログを自動収集
 * 
 * 使い方:
 * node auto-debug.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 設定
const CONFIG = {
    url: 'http://localhost:3000',
    outputDir: './debug-reports',
    screenshotDir: './debug-reports/screenshots',
    waitTime: 5000, // ページ読み込み後の待機時間
};

// メイン処理
async function runAutoDebug() {
    console.log('🔍 自動デバッグシステムを開始します...\n');
    
    let browser;
    const logs = [];
    const errors = [];
    const warnings = [];
    const apiCalls = [];
    
    try {
        // ディレクトリ作成
        if (!fs.existsSync(CONFIG.outputDir)) {
            fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        }
        if (!fs.existsSync(CONFIG.screenshotDir)) {
            fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
        }
        
        // ブラウザ起動
        console.log('🌐 ブラウザを起動中...');
        browser = await puppeteer.launch({
            headless: false, // ブラウザを表示
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // コンソールログをキャプチャ
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            const location = msg.location();
            
            const logEntry = {
                type,
                text,
                location: `${location.url}:${location.lineNumber}`,
                timestamp: new Date().toISOString()
            };
            
            logs.push(logEntry);
            
            // タイプ別に分類
            if (type === 'error') {
                errors.push(logEntry);
                console.log(`❌ ERROR: ${text}`);
            } else if (type === 'warning') {
                warnings.push(logEntry);
                console.log(`⚠️  WARN: ${text}`);
            } else {
                console.log(`📝 ${type.toUpperCase()}: ${text}`);
            }
        });
        
        // ページエラーをキャプチャ
        page.on('pageerror', error => {
            const errorEntry = {
                type: 'pageerror',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            };
            errors.push(errorEntry);
            console.log(`💥 PAGE ERROR: ${error.message}`);
        });
        
        // ネットワークリクエストを監視
        page.on('response', async response => {
            const url = response.url();
            const status = response.status();
            
            // APIコールのみ記録
            if (url.includes('/api/')) {
                const apiCall = {
                    url,
                    status,
                    method: response.request().method(),
                    timestamp: new Date().toISOString()
                };
                
                // レスポンスボディを取得（JSONの場合）
                try {
                    const contentType = response.headers()['content-type'];
                    if (contentType && contentType.includes('application/json')) {
                        apiCall.response = await response.json();
                    }
                } catch (e) {
                    // JSON以外は無視
                }
                
                apiCalls.push(apiCall);
                
                if (status >= 400) {
                    console.log(`❌ API ERROR: ${url} - Status ${status}`);
                } else {
                    console.log(`✅ API: ${url} - Status ${status}`);
                }
            }
        });
        
        // ページを開く
        console.log(`\n📄 ページを開いています: ${CONFIG.url}`);
        await page.goto(CONFIG.url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // スクリーンショット（全体）
        console.log('\n📸 スクリーンショットを撮影中...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({
            path: path.join(CONFIG.screenshotDir, `page-${timestamp}.png`),
            fullPage: true
        });
        
        // コラボメンバーセクションまでスクロール
        console.log('\n📜 コラボメンバーセクションまでスクロール...');
        await page.evaluate(() => {
            const collabSection = document.querySelector('.collaborator-section');
            if (collabSection) {
                collabSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        // 待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // コラボメンバーセクションのスクリーンショット
        await page.screenshot({
            path: path.join(CONFIG.screenshotDir, `collab-${timestamp}.png`),
            fullPage: false
        });
        
        // さらに待機してすべてのログを収集
        console.log(`\n⏳ ${CONFIG.waitTime / 1000}秒待機してログを収集中...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.waitTime));
        
        // レポート生成
        const report = generateReport(logs, errors, warnings, apiCalls);
        
        // レポートを保存
        const reportPath = path.join(CONFIG.outputDir, `report-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 レポート保存: ${reportPath}`);
        
        // テキストサマリーを表示
        displaySummary(report);
        
        // 問題を自動検出
        detectIssues(report);
        
    } catch (error) {
        console.error('\n❌ 自動デバッグ中にエラーが発生:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// レポート生成
function generateReport(logs, errors, warnings, apiCalls) {
    return {
        timestamp: new Date().toISOString(),
        summary: {
            totalLogs: logs.length,
            errors: errors.length,
            warnings: warnings.length,
            apiCalls: apiCalls.length,
            failedApiCalls: apiCalls.filter(c => c.status >= 400).length
        },
        logs,
        errors,
        warnings,
        apiCalls
    };
}

// サマリー表示
function displaySummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 デバッグサマリー');
    console.log('='.repeat(60));
    console.log(`総ログ数:      ${report.summary.totalLogs}`);
    console.log(`エラー:        ${report.summary.errors}`);
    console.log(`警告:          ${report.summary.warnings}`);
    console.log(`APIコール:     ${report.summary.apiCalls}`);
    console.log(`失敗したAPI:   ${report.summary.failedApiCalls}`);
    console.log('='.repeat(60));
}

// 問題検出
function detectIssues(report) {
    console.log('\n🔍 問題を検出中...\n');
    
    const issues = [];
    
    // APIエラーをチェック
    report.apiCalls.forEach(call => {
        if (call.status === 404) {
            issues.push({
                type: 'API 404',
                message: `APIが見つかりません: ${call.url}`,
                suggestion: 'エンドポイントのURLを確認してください'
            });
        } else if (call.status >= 500) {
            issues.push({
                type: 'API Server Error',
                message: `サーバーエラー: ${call.url} (Status ${call.status})`,
                suggestion: 'サーバー側のログを確認してください'
            });
        } else if (call.status === 401 || call.status === 403) {
            issues.push({
                type: 'API Auth Error',
                message: `認証エラー: ${call.url}`,
                suggestion: 'Twitter Bearer Tokenを確認してください'
            });
        }
    });
    
    // コンソールエラーをチェック
    report.errors.forEach(error => {
        if (error.text && error.text.includes('Failed to fetch')) {
            issues.push({
                type: 'Network Error',
                message: 'ネットワークエラーが発生しています',
                suggestion: 'サーバーが起動しているか確認してください'
            });
        }
    });
    
    // コラボメンバーの問題をチェック
    const collabApiCalls = report.apiCalls.filter(c => c.url.includes('c0tanpoTesh1ta'));
    if (collabApiCalls.length === 0) {
        issues.push({
            type: 'Missing API Call',
            message: 'コラボメンバーのAPI呼び出しが見つかりません',
            suggestion: 'loadCollabMemberCard() が実行されているか確認してください'
        });
    } else {
        const failedCalls = collabApiCalls.filter(c => c.status >= 400);
        if (failedCalls.length > 0) {
            failedCalls.forEach(call => {
                issues.push({
                    type: 'Collab API Error',
                    message: `コラボメンバーAPI失敗: Status ${call.status}`,
                    detail: call.response,
                    suggestion: 'ユーザー名のスペルを確認してください'
                });
            });
        }
    }
    
    // 問題を表示
    if (issues.length === 0) {
        console.log('✅ 問題は検出されませんでした！');
    } else {
        console.log(`⚠️  ${issues.length}件の問題が検出されました:\n`);
        issues.forEach((issue, index) => {
            console.log(`${index + 1}. [${issue.type}]`);
            console.log(`   ${issue.message}`);
            if (issue.detail) {
                console.log(`   詳細: ${JSON.stringify(issue.detail, null, 2)}`);
            }
            console.log(`   💡 提案: ${issue.suggestion}\n`);
        });
    }
    
    return issues;
}

// 実行
runAutoDebug().then(() => {
    console.log('\n✅ 自動デバッグ完了！');
    process.exit(0);
}).catch(err => {
    console.error('\n❌ 致命的なエラー:', err);
    process.exit(1);
});
