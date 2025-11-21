/**
 * デバッグ＆自動修正提案システム
 * 
 * 実行すると：
 * 1. 自動デバッグを実行
 * 2. 結果を分析
 * 3. 問題を検出
 * 4. 修正コードを生成
 * 5. 修正提案ファイルを作成
 * 
 * 使い方:
 * npm run fix
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 完全自動デバッグ＆修正システムを開始します...\n');

// 自動デバッグを実行
const debug = spawn('node', ['auto-debug.js'], {
    stdio: 'inherit',
    shell: true
});

debug.on('close', (code) => {
    if (code !== 0) {
        console.error('\n❌ デバッグ実行エラー');
        process.exit(1);
    }

    console.log('\n\n🔍 デバッグ結果を自動分析中...\n');

    // 最新のレポートファイルを取得
    const reportDir = './debug-reports';
    const files = fs.readdirSync(reportDir)
        .filter(f => f.startsWith('report-') && f.endsWith('.json'))
        .map(f => ({
            name: f,
            path: path.join(reportDir, f),
            time: fs.statSync(path.join(reportDir, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
        console.error('❌ レポートファイルが見つかりません');
        process.exit(1);
    }

    const latestReport = files[0];
    console.log(`📄 最新レポート: ${latestReport.name}\n`);

    // レポートを読み込み
    const report = JSON.parse(fs.readFileSync(latestReport.path, 'utf8'));

    // 結果を表示
    displayReport(report);

    // 問題を分析
    const issues = analyzeIssues(report);

    // 修正提案を生成
    const fixes = generateFixes(issues, report);

    // 修正提案ファイルを作成
    saveFixes(fixes);

    console.log('\n✅ 完全自動分析完了！');
    console.log('\n📝 修正提案を確認: ./FIXES.md');
});

function displayReport(report) {
    console.log('='.repeat(70));
    console.log('📊 デバッグサマリー');
    console.log('='.repeat(70));
    console.log(`総ログ数:      ${report.summary.totalLogs}`);
    console.log(`エラー:        ${report.summary.errors} ${report.summary.errors > 0 ? '❌' : '✅'}`);
    console.log(`警告:          ${report.summary.warnings} ${report.summary.warnings > 0 ? '⚠️' : '✅'}`);
    console.log(`APIコール:     ${report.summary.apiCalls}`);
    console.log(`失敗したAPI:   ${report.summary.failedApiCalls} ${report.summary.failedApiCalls > 0 ? '❌' : '✅'}`);
    console.log('='.repeat(70));
    console.log();
}

function analyzeIssues(report) {
    const issues = [];

    // APIエラーを分析
    report.apiCalls.forEach(call => {
        if (call.status >= 400) {
            issues.push({
                type: 'API Error',
                severity: call.status >= 500 ? 'critical' : 'high',
                url: call.url,
                status: call.status,
                method: call.method,
                response: call.response
            });
        }
    });

    // コラボメンバーAPIをチェック
    const collabCalls = report.apiCalls.filter(c => c.url.includes('c0tanpoTesh1ta'));
    if (collabCalls.length === 0) {
        issues.push({
            type: 'Missing API Call',
            severity: 'high',
            message: 'コラボメンバーのAPI呼び出しが実行されていません',
            function: 'loadCollabMemberCard()'
        });
    }

    // コンソールエラーを分析
    report.errors.forEach(error => {
        issues.push({
            type: 'Console Error',
            severity: 'medium',
            message: error.text || error.message,
            location: error.location
        });
    });

    return issues;
}

function generateFixes(issues, report) {
    const fixes = [];

    issues.forEach(issue => {
        switch (issue.type) {
            case 'API Error':
                if (issue.status === 404) {
                    fixes.push({
                        title: `API 404エラー: ${issue.url}`,
                        problem: 'APIエンドポイントが見つかりません',
                        solution: [
                            '1. ユーザー名のスペルを確認',
                            '2. APIエンドポイントのURLを確認',
                            '3. サーバー側のルーティングを確認'
                        ],
                        code: `// 修正例（js/script.js）
async function loadCollabMemberCard() {
    const username = 'c0tanpoTesh1ta'; // 正しいスペルを確認
    console.log('🤝 コラボメンバー情報取得中...', username);
    
    const apiUrl = \`/api/user/profile/\${username}\`;
    console.log('📡 API呼び出し:', apiUrl);
    
    const response = await fetch(apiUrl);
    // ...
}`
                    });
                } else if (issue.status === 401 || issue.status === 403) {
                    fixes.push({
                        title: '認証エラー',
                        problem: 'Twitter APIの認証に失敗しています',
                        solution: [
                            '1. .envファイルを確認',
                            '2. TWITTER_BEARER_TOKENが正しく設定されているか確認',
                            '3. トークンの有効期限を確認'
                        ],
                        code: `// .env
TWITTER_BEARER_TOKEN=あなたのBearer Token`
                    });
                }
                break;

            case 'Missing API Call':
                fixes.push({
                    title: 'コラボメンバーAPI呼び出しが実行されていません',
                    problem: 'loadCollabMemberCard()が呼ばれていないか、エラーで停止しています',
                    solution: [
                        '1. script.jsの初期化処理を確認',
                        '2. DOMContentLoadedイベントを確認',
                        '3. 関数が正しくエクスポートされているか確認'
                    ],
                    code: `// js/script.js（初期化部分）
window.addEventListener('DOMContentLoaded', function() {
    loadNarratorCard1();
    loadNarratorCard2();
    loadVoiceActorCard();
    loadCollabMemberCard(); // ← この行があるか確認
});`
                });
                break;

            case 'Console Error':
                fixes.push({
                    title: `コンソールエラー: ${issue.message}`,
                    problem: issue.message,
                    location: issue.location,
                    solution: [
                        '1. エラーメッセージを確認',
                        '2. 該当行を修正',
                        '3. 変数のスコープを確認'
                    ]
                });
                break;
        }
    });

    // 詳細なAPI情報を追加
    fixes.push({
        title: '📊 APIコール詳細',
        details: report.apiCalls.map(call => ({
            url: call.url,
            status: call.status,
            method: call.method,
            success: call.status < 400
        }))
    });

    return fixes;
}

function saveFixes(fixes) {
    let markdown = '# 🔧 自動修正提案レポート\n\n';
    markdown += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
    markdown += '---\n\n';

    if (fixes.length === 0) {
        markdown += '## ✅ 問題は検出されませんでした！\n\n';
        markdown += 'すべて正常に動作しています。\n';
    } else {
        markdown += `## ⚠️ ${fixes.length}件の項目があります\n\n`;

        fixes.forEach((fix, index) => {
            markdown += `### ${index + 1}. ${fix.title}\n\n`;

            if (fix.problem) {
                markdown += `**問題:**\n${fix.problem}\n\n`;
            }

            if (fix.solution) {
                markdown += `**解決策:**\n`;
                fix.solution.forEach(s => {
                    markdown += `${s}\n`;
                });
                markdown += '\n';
            }

            if (fix.code) {
                markdown += `**修正コード:**\n\`\`\`javascript\n${fix.code}\n\`\`\`\n\n`;
            }

            if (fix.location) {
                markdown += `**場所:** ${fix.location}\n\n`;
            }

            if (fix.details) {
                markdown += `**詳細:**\n\`\`\`json\n${JSON.stringify(fix.details, null, 2)}\n\`\`\`\n\n`;
            }

            markdown += '---\n\n';
        });
    }

    fs.writeFileSync('./FIXES.md', markdown);
    console.log('\n✅ 修正提案を保存: ./FIXES.md');
}
