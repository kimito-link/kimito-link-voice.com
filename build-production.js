// 本番環境用のビルドスクリプト
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// ディレクトリ作成
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}
if (!fs.existsSync(path.join(distDir, 'js'))) {
    fs.mkdirSync(path.join(distDir, 'js'));
}
if (!fs.existsSync(path.join(distDir, 'css'))) {
    fs.mkdirSync(path.join(distDir, 'css'));
}

// JavaScriptファイルをMinify
async function minifyJS(inputPath, outputPath) {
    try {
        const code = fs.readFileSync(inputPath, 'utf8');
        const result = await minify(code, {
            compress: {
                dead_code: true,
                drop_console: true,
                drop_debugger: true,
                keep_classnames: false,
                keep_fnames: false,
            },
            mangle: true,
            format: {
                comments: false,
            }
        });
        
        fs.writeFileSync(outputPath, result.code);
        const originalSize = fs.statSync(inputPath).size;
        const minifiedSize = fs.statSync(outputPath).size;
        const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(2);
        
        console.log(`✅ ${path.basename(inputPath)}: ${(originalSize/1024).toFixed(2)}KB → ${(minifiedSize/1024).toFixed(2)}KB (${reduction}% 削減)`);
    } catch (error) {
        console.error(`❌ エラー: ${inputPath}`, error.message);
    }
}

// メイン処理
async function build() {
    console.log('🚀 本番ビルド開始...\n');
    
    console.log('📦 JavaScript Minification:');
    await minifyJS('js/script.js', 'dist/js/script.min.js');
    await minifyJS('js/galaxy-effects.js', 'dist/js/galaxy-effects.min.js');
    
    console.log('\n✅ ビルド完了!');
    console.log('\n📌 次のステップ:');
    console.log('1. npm run build:css を実行してCSSをminifyしてください');
    console.log('2. index.htmlのscript/linkタグをdist/フォルダのファイルに変更してください');
}

build().catch(console.error);
