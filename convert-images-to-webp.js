// 画像をWebP形式に変換するスクリプト
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 変換する画像のディレクトリ
const imageDirectories = [
    'images/icon',
    'images/yukkuri',
    'images/logo/RGB/透過'
];

// WebP出力ディレクトリ
const webpOutputDir = 'images/webp';

// WebP品質設定
const WEBP_QUALITY = 85;

// ディレクトリ作成
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// 画像をWebPに変換
async function convertImageToWebP(inputPath, outputPath) {
    try {
        const stats = fs.statSync(inputPath);
        const originalSize = stats.size;

        await sharp(inputPath)
            .webp({ quality: WEBP_QUALITY })
            .toFile(outputPath);

        const newStats = fs.statSync(outputPath);
        const newSize = newStats.size;
        const reduction = ((1 - newSize / originalSize) * 100).toFixed(2);

        console.log(`✅ ${path.basename(inputPath)}: ${(originalSize/1024).toFixed(2)}KB → ${(newSize/1024).toFixed(2)}KB (${reduction}% 削減)`);
        
        return { originalSize, newSize, reduction };
    } catch (error) {
        console.error(`❌ エラー: ${inputPath}`, error.message);
        return null;
    }
}

// メイン処理
async function convertAllImages() {
    console.log('🖼️  画像をWebP形式に変換中...\n');
    
    // WebP出力ディレクトリを作成
    ensureDirectoryExists(webpOutputDir);
    
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let convertedCount = 0;

    for (const dir of imageDirectories) {
        const fullDirPath = path.join(__dirname, dir);
        
        if (!fs.existsSync(fullDirPath)) {
            console.log(`⚠️  ディレクトリが見つかりません: ${dir}`);
            continue;
        }

        console.log(`📁 ${dir} を処理中...`);
        
        const files = fs.readdirSync(fullDirPath);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png)$/i.test(file)
        );

        for (const file of imageFiles) {
            const inputPath = path.join(fullDirPath, file);
            const outputFileName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            const outputPath = path.join(__dirname, webpOutputDir, outputFileName);

            const result = await convertImageToWebP(inputPath, outputPath);
            
            if (result) {
                totalOriginalSize += result.originalSize;
                totalNewSize += result.newSize;
                convertedCount++;
            }
        }
        
        console.log(''); // 空行
    }

    // 結果サマリー
    console.log('\n📊 変換結果サマリー:');
    console.log('================================');
    console.log(`変換ファイル数: ${convertedCount}`);
    console.log(`元のサイズ: ${(totalOriginalSize/1024).toFixed(2)}KB`);
    console.log(`新しいサイズ: ${(totalNewSize/1024).toFixed(2)}KB`);
    console.log(`削減率: ${((1 - totalNewSize / totalOriginalSize) * 100).toFixed(2)}%`);
    console.log(`削減量: ${((totalOriginalSize - totalNewSize)/1024).toFixed(2)}KB`);
    
    console.log('\n✅ 変換完了!');
    console.log(`\n📌 WebP画像は ${webpOutputDir}/ に保存されました`);
}

// 実行
convertAllImages().catch(console.error);
