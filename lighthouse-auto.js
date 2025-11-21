/**
 * Lighthouse 自動測定スクリプト
 * 
 * 使い方:
 * node lighthouse-auto.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 測定設定
const CONFIG = {
    url: 'http://localhost:3000',
    outputDir: './lighthouse-reports',
    runs: 3, // 測定回数（平均を取る）
};

// 測定実行
async function runLighthouse() {
    console.log('🚀 Lighthouse自動測定を開始します...\n');
    
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir);
    }
    
    const results = [];
    
    // 複数回測定
    for (let i = 0; i < CONFIG.runs; i++) {
        console.log(`📊 測定 ${i + 1}/${CONFIG.runs} 実行中...`);
        
        const timestamp = Date.now();
        const outputPath = path.join(CONFIG.outputDir, `report-${timestamp}.json`);
        
        // Lighthouseをコマンドラインで実行
        const command = `npx lighthouse ${CONFIG.url} --output=json --output-path=${outputPath} --quiet --chrome-flags="--headless"`;
        
        try {
            await execPromise(command);
            
            // 結果を読み込む
            const reportData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            results.push(reportData);
            
            // 少し待つ
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`❌ 測定 ${i + 1} でエラーが発生しました:`, error.message);
        }
    }
    
    if (results.length === 0) {
        console.error('❌ すべての測定が失敗しました。');
        return;
    }
    
    // 結果を分析
    analyzeResults(results);
    
    console.log('\n✅ 測定完了！');
}

// 結果を分析
function analyzeResults(results) {
    const scores = {
        performance: [],
        accessibility: [],
        'best-practices': [],
        seo: []
    };
    
    const metrics = {
        'first-contentful-paint': [],
        'largest-contentful-paint': [],
        'total-blocking-time': [],
        'cumulative-layout-shift': [],
        'speed-index': []
    };
    
    // データ収集
    results.forEach(result => {
        scores.performance.push(result.categories.performance.score * 100);
        scores.accessibility.push(result.categories.accessibility.score * 100);
        scores['best-practices'].push(result.categories['best-practices'].score * 100);
        scores.seo.push(result.categories.seo.score * 100);
        
        metrics['first-contentful-paint'].push(result.audits['first-contentful-paint'].numericValue);
        metrics['largest-contentful-paint'].push(result.audits['largest-contentful-paint'].numericValue);
        metrics['total-blocking-time'].push(result.audits['total-blocking-time'].numericValue);
        metrics['cumulative-layout-shift'].push(result.audits['cumulative-layout-shift'].numericValue);
        metrics['speed-index'].push(result.audits['speed-index'].numericValue);
    });
    
    // 平均計算
    const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const avgMs = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    
    console.log('\n📊 測定結果（平均）:');
    console.log('==========================================');
    console.log(`Performance:     ${avg(scores.performance)}`);
    console.log(`Accessibility:   ${avg(scores.accessibility)}`);
    console.log(`Best Practices:  ${avg(scores['best-practices'])}`);
    console.log(`SEO:             ${avg(scores.seo)}`);
    console.log('==========================================');
    console.log('\n⚡ メトリクス:');
    console.log('------------------------------------------');
    console.log(`FCP:  ${(avgMs(metrics['first-contentful-paint']) / 1000).toFixed(1)}s`);
    console.log(`LCP:  ${(avgMs(metrics['largest-contentful-paint']) / 1000).toFixed(1)}s`);
    console.log(`TBT:  ${avgMs(metrics['total-blocking-time'])}ms`);
    console.log(`CLS:  ${(metrics['cumulative-layout-shift'].reduce((a, b) => a + b, 0) / metrics['cumulative-layout-shift'].length).toFixed(3)}`);
    console.log(`SI:   ${(avgMs(metrics['speed-index']) / 1000).toFixed(1)}s`);
    console.log('------------------------------------------');
    
    // 履歴に追加
    appendToHistory({
        date: new Date().toISOString(),
        scores: {
            performance: avg(scores.performance),
            accessibility: avg(scores.accessibility),
            bestPractices: avg(scores['best-practices']),
            seo: avg(scores.seo)
        },
        metrics: {
            fcp: avgMs(metrics['first-contentful-paint']) / 1000,
            lcp: avgMs(metrics['largest-contentful-paint']) / 1000,
            tbt: avgMs(metrics['total-blocking-time']),
            cls: metrics['cumulative-layout-shift'].reduce((a, b) => a + b, 0) / metrics['cumulative-layout-shift'].length,
            si: avgMs(metrics['speed-index']) / 1000
        }
    });
}


// 履歴に追加
function appendToHistory(data) {
    const historyFile = './lighthouse-history.json';
    let history = [];
    
    if (fs.existsSync(historyFile)) {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    
    history.push(data);
    
    // 最新30件のみ保持
    if (history.length > 30) {
        history = history.slice(-30);
    }
    
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

// エラーハンドリング
runLighthouse().catch(err => {
    console.error('❌ エラーが発生しました:', err);
    process.exit(1);
});
