// Chrome DevTools Protocol を使用したパフォーマンステスト
const CDP = require('chrome-remote-interface');

async function testPerformance() {
    let client;
    try {
        // Chrome DevTools Protocol に接続
        client = await CDP({ port: 9222 });
        const { Network, Page, Runtime, Performance } = client;

        console.log('✅ Chrome DevTools に接続しました');

        // 必要なドメインを有効化
        await Network.enable();
        await Page.enable();
        await Performance.enable();

        console.log('🔄 http://localhost:3000 にナビゲート中...');

        // パフォーマンスメトリクスの収集開始
        const startTime = Date.now();

        // ページに移動
        await Page.navigate({ url: 'http://localhost:3000' });
        await Page.loadEventFired();

        const loadTime = Date.now() - startTime;

        console.log(`✅ ページロード完了: ${loadTime}ms`);

        // パフォーマンスメトリクスを取得
        const metrics = await Performance.getMetrics();
        
        console.log('\n📊 パフォーマンスメトリクス:');
        console.log('================================');
        
        metrics.metrics.forEach(metric => {
            if (metric.name.includes('Duration') || 
                metric.name.includes('Time') || 
                metric.name.includes('Count')) {
                console.log(`  ${metric.name}: ${metric.value}`);
            }
        });

        // JavaScript実行でWeb Vitalsを取得
        const webVitals = await Runtime.evaluate({
            expression: `
                (function() {
                    return {
                        timing: performance.timing,
                        navigation: performance.navigation,
                        memory: performance.memory ? {
                            usedJSHeapSize: performance.memory.usedJSHeapSize,
                            totalJSHeapSize: performance.memory.totalJSHeapSize,
                            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                        } : null
                    };
                })()
            `,
            returnByValue: true
        });

        if (webVitals.result && webVitals.result.value) {
            const data = webVitals.result.value;
            
            if (data.timing) {
                const timing = data.timing;
                console.log('\n🕐 ページロードタイミング:');
                console.log('================================');
                console.log(`  DNS lookup: ${timing.domainLookupEnd - timing.domainLookupStart}ms`);
                console.log(`  TCP接続: ${timing.connectEnd - timing.connectStart}ms`);
                console.log(`  リクエスト: ${timing.responseStart - timing.requestStart}ms`);
                console.log(`  レスポンス: ${timing.responseEnd - timing.responseStart}ms`);
                console.log(`  DOM処理: ${timing.domComplete - timing.domLoading}ms`);
                console.log(`  ページロード完了: ${timing.loadEventEnd - timing.navigationStart}ms`);
            }

            if (data.memory) {
                console.log('\n💾 メモリ使用量:');
                console.log('================================');
                console.log(`  使用中: ${(data.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
                console.log(`  合計: ${(data.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
                console.log(`  上限: ${(data.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
            }
        }

        // ネットワークリクエストの統計
        const resources = await Runtime.evaluate({
            expression: `
                (function() {
                    const resources = performance.getEntriesByType('resource');
                    return {
                        total: resources.length,
                        byType: resources.reduce((acc, r) => {
                            const type = r.initiatorType || 'other';
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                        }, {}),
                        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
                    };
                })()
            `,
            returnByValue: true
        });

        if (resources.result && resources.result.value) {
            const data = resources.result.value;
            console.log('\n🌐 ネットワークリソース:');
            console.log('================================');
            console.log(`  総リクエスト数: ${data.total}`);
            console.log(`  転送サイズ: ${(data.totalSize / 1024).toFixed(2)} KB`);
            console.log('  リソース種別:');
            Object.entries(data.byType).forEach(([type, count]) => {
                console.log(`    ${type}: ${count}`);
            });
        }

        console.log('\n✅ パフォーマンステスト完了！');

    } catch (err) {
        console.error('❌ エラー:', err.message);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// テスト実行
testPerformance().catch(console.error);
