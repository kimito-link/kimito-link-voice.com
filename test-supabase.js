// Supabaseデータベースの接続確認とテーブル一覧取得
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase接続テスト\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '設定済み ✅' : '未設定 ❌');
console.log('');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase環境変数が設定されていません');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
    console.log('📊 データベーステーブルを確認中...\n');
    
    const tables = ['users', 'narrators', 'requests', 'reviews', 'payment_links'];
    const results = [];
    
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                if (error.code === '42P01') {
                    console.log(`❌ ${table.padEnd(15)} - テーブルが存在しません`);
                    results.push({ table, exists: false });
                } else {
                    console.log(`⚠️  ${table.padEnd(15)} - エラー: ${error.message}`);
                    results.push({ table, exists: false, error: error.message });
                }
            } else {
                console.log(`✅ ${table.padEnd(15)} - 存在します（レコード数: ${count || 0}）`);
                results.push({ table, exists: true, count: count || 0 });
            }
        } catch (err) {
            console.log(`❌ ${table.padEnd(15)} - エラー: ${err.message}`);
            results.push({ table, exists: false, error: err.message });
        }
    }
    
    console.log('\n' + '='.repeat(50));
    
    const existingTables = results.filter(r => r.exists);
    const missingTables = results.filter(r => !r.exists);
    
    if (existingTables.length > 0) {
        console.log(`\n✅ 存在するテーブル: ${existingTables.length}/${tables.length}`);
        existingTables.forEach(t => {
            console.log(`   - ${t.table} (${t.count}件)`);
        });
    }
    
    if (missingTables.length > 0) {
        console.log(`\n❌ 存在しないテーブル: ${missingTables.length}/${tables.length}`);
        missingTables.forEach(t => {
            console.log(`   - ${t.table}`);
        });
        console.log('\n💡 テーブルを作成するには:');
        console.log('   1. Supabase Dashboard にログイン');
        console.log('   2. SQL Editor を開く');
        console.log('   3. database/schema.sql の内容を実行');
    } else {
        console.log('\n🎉 すべてのテーブルが存在します！');
    }
}

testDatabase().catch(console.error);
