/**
 * Lighthouse履歴ビューアー
 * 
 * 使い方:
 * node lighthouse-history-viewer.js
 */

const fs = require('fs');

function viewHistory() {
    const historyFile = './lighthouse-history.json';
    
    if (!fs.existsSync(historyFile)) {
        console.log('❌ 履歴ファイルが見つかりません。');
        console.log('まず lighthouse-auto.js を実行してください。');
        return;
    }
    
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    
    if (history.length === 0) {
        console.log('📭 履歴がありません。');
        return;
    }
    
    console.log('\n📈 Lighthouse測定履歴\n');
    console.log('='.repeat(80));
    
    history.forEach((entry, index) => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        console.log(`\n${index + 1}. ${dateStr}`);
        console.log('-'.repeat(80));
        console.log(`Performance: ${entry.scores.performance}  |  ` +
                    `Accessibility: ${entry.scores.accessibility}  |  ` +
                    `Best Practices: ${entry.scores.bestPractices}  |  ` +
                    `SEO: ${entry.scores.seo}`);
        console.log(`FCP: ${entry.metrics.fcp.toFixed(1)}s  |  ` +
                    `LCP: ${entry.metrics.lcp.toFixed(1)}s  |  ` +
                    `TBT: ${entry.metrics.tbt}ms  |  ` +
                    `CLS: ${entry.metrics.cls.toFixed(3)}  |  ` +
                    `SI: ${entry.metrics.si.toFixed(1)}s`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // トレンド分析
    if (history.length >= 2) {
        const latest = history[history.length - 1];
        const previous = history[history.length - 2];
        
        const perfDiff = latest.scores.performance - previous.scores.performance;
        const tbtDiff = latest.metrics.tbt - previous.metrics.tbt;
        const lcpDiff = latest.metrics.lcp - previous.metrics.lcp;
        
        console.log('\n📊 前回からの変化:');
        console.log('-'.repeat(80));
        console.log(`Performance: ${perfDiff > 0 ? '+' : ''}${perfDiff} ${perfDiff > 0 ? '📈' : perfDiff < 0 ? '📉' : '➡️'}`);
        console.log(`TBT: ${tbtDiff > 0 ? '+' : ''}${tbtDiff}ms ${tbtDiff < 0 ? '📈' : tbtDiff > 0 ? '📉' : '➡️'}`);
        console.log(`LCP: ${lcpDiff > 0 ? '+' : ''}${lcpDiff.toFixed(1)}s ${lcpDiff < 0 ? '📈' : lcpDiff > 0 ? '📉' : '➡️'}`);
    }
    
    console.log('\n');
}

viewHistory();
