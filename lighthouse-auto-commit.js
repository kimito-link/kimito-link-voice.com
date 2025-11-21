/**
 * Lighthouse 測定 → ドキュメント更新 → Git自動コミット
 * 
 * 使い方:
 * npm run lighthouse:auto
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
    runs: 3,
    reportPath: './docs/LIGHTHOUSE_REPORT.md'
};

// メイン処理
async function main() {
    console.log('🚀 Lighthouse自動測定・ドキュメント更新・コミットを開始します...\n');
    
    try {
        // 1. Lighthouse測定
        console.log('📊 Lighthouse測定中...');
        const results = await runLighthouseMeasurement();
        
        if (results.length === 0) {
            console.error('❌ 測定に失敗しました。');
            process.exit(1);
        }
        
        // 2. 結果を分析
        console.log('\n📈 結果を分析中...');
        const analysis = analyzeResults(results);
        
        // 3. ドキュメント更新
        console.log('\n📝 ドキュメントを更新中...');
        await updateDocumentation(analysis);
        
        // 4. Git自動コミット
        console.log('\n💾 Gitにコミット中...');
        await gitAutoCommit(analysis);
        
        // 5. 結果表示
        displayResults(analysis);
        
        console.log('\n✅ すべての処理が完了しました！');
        
    } catch (error) {
        console.error('❌ エラーが発生しました:', error.message);
        process.exit(1);
    }
}

// Lighthouse測定
async function runLighthouseMeasurement() {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir);
    }
    
    const results = [];
    
    for (let i = 0; i < CONFIG.runs; i++) {
        console.log(`  測定 ${i + 1}/${CONFIG.runs} 実行中...`);
        
        const timestamp = Date.now();
        const outputPath = path.join(CONFIG.outputDir, `report-${timestamp}.json`);
        
        const command = `npx lighthouse ${CONFIG.url} --output=json --output-path=${outputPath} --quiet --chrome-flags="--headless"`;
        
        try {
            await execPromise(command);
            const reportData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            results.push(reportData);
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`  ⚠️ 測定 ${i + 1} でエラー:`, error.message);
        }
    }
    
    return results;
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
    
    const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const avgMs = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const avgFloat = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3);
    
    return {
        scores: {
            performance: avg(scores.performance),
            accessibility: avg(scores.accessibility),
            bestPractices: avg(scores['best-practices']),
            seo: avg(scores.seo)
        },
        metrics: {
            fcp: (avgMs(metrics['first-contentful-paint']) / 1000).toFixed(1),
            lcp: (avgMs(metrics['largest-contentful-paint']) / 1000).toFixed(1),
            tbt: avgMs(metrics['total-blocking-time']),
            cls: avgFloat(metrics['cumulative-layout-shift']),
            si: (avgMs(metrics['speed-index']) / 1000).toFixed(1)
        },
        timestamp: new Date()
    };
}

// ドキュメント更新
async function updateDocumentation(analysis) {
    const { scores, metrics, timestamp } = analysis;
    
    // 日付フォーマット
    const dateStr = timestamp.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-');
    
    // 新しい行を作成
    const newRow = `| ${dateStr} | ${scores.performance} | ${scores.accessibility} | ${scores.bestPractices} | ${scores.seo} | 自動測定 |`;
    
    // ファイルを読み込む
    let content = fs.readFileSync(CONFIG.reportPath, 'utf8');
    
    // 測定履歴テーブルを探して追加
    const tableRegex = /(### 測定履歴[\s\S]*?\n)((?:\|.*\n)+)/;
    
    if (tableRegex.test(content)) {
        content = content.replace(tableRegex, (match, header, table) => {
            return header + table + newRow + '\n';
        });
    } else {
        console.warn('⚠️ 測定履歴テーブルが見つかりませんでした。');
    }
    
    // 詳細メトリクスを更新（最新結果セクション）
    const metricsSection = `
**最新測定結果（${dateStr}）**: 
- 🎯 **Performance: ${scores.performance}**
- ✅ **Accessibility: ${scores.accessibility}**
- ✅ **Best Practices: ${scores.bestPractices}**
- ✅ **SEO: ${scores.seo}**
- ⚡ **FCP: ${metrics.fcp}s**
- ⚡ **LCP: ${metrics.lcp}s**
- ⚡ **TBT: ${metrics.tbt}ms**
- ✅ **CLS: ${metrics.cls}**
- ⚡ **Speed Index: ${metrics.si}s**
`;
    
    // 最終結果の前に追加
    if (content.includes('**最終確定結果')) {
        content = content.replace(/(\*\*最終確定結果[\s\S]*?)(\n---)/,
            `${metricsSection}\n\n$1$2`);
    }
    
    fs.writeFileSync(CONFIG.reportPath, content);
    console.log('  ✅ ドキュメント更新完了');
}

// Git自動コミット
async function gitAutoCommit(analysis) {
    const { scores, metrics, timestamp } = analysis;
    
    const dateStr = timestamp.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    try {
        // Git add
        await execPromise('git add docs/LIGHTHOUSE_REPORT.md lighthouse-reports/ lighthouse-history.json');
        
        // Git commit
        const commitMessage = `docs: Lighthouse自動測定結果を追加（${dateStr}）

Performance: ${scores.performance}
Accessibility: ${scores.accessibility}
Best Practices: ${scores.bestPractices}
SEO: ${scores.seo}

メトリクス:
- FCP: ${metrics.fcp}s
- LCP: ${metrics.lcp}s
- TBT: ${metrics.tbt}ms
- CLS: ${metrics.cls}
- SI: ${metrics.si}s`;
        
        await execPromise(`git commit -m "${commitMessage}"`);
        console.log('  ✅ Gitコミット完了');
        
        // Git push
        console.log('  📤 Gitにプッシュ中...');
        await execPromise('git push origin main');
        console.log('  ✅ Gitプッシュ完了');
        
    } catch (error) {
        console.error('  ⚠️ Git操作でエラー:', error.message);
    }
}

// 結果表示
function displayResults(analysis) {
    const { scores, metrics } = analysis;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 測定結果サマリー');
    console.log('='.repeat(60));
    console.log(`Performance:     ${scores.performance}`);
    console.log(`Accessibility:   ${scores.accessibility}`);
    console.log(`Best Practices:  ${scores.bestPractices}`);
    console.log(`SEO:             ${scores.seo}`);
    console.log('-'.repeat(60));
    console.log(`FCP:  ${metrics.fcp}s  |  LCP:  ${metrics.lcp}s  |  TBT: ${metrics.tbt}ms`);
    console.log(`CLS:  ${metrics.cls}   |  SI:   ${metrics.si}s`);
    console.log('='.repeat(60));
}

// 実行
main().catch(err => {
    console.error('❌ 致命的なエラー:', err);
    process.exit(1);
});
