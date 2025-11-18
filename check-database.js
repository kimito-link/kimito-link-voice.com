// Supabaseデータベースの状態を確認するスクリプト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase環境変数が設定されていません');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Supabaseデータベースを確認中...\n');
    
    const tables = ['users', 'narrators', 'requests', 'reviews', 'payment_links'];
    
    for (const table of tables) {
        try {
            console.log(`📋 テーブル: ${table}`);
            
            // テーブルからデータを取得（存在確認）
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                if (error.code === '42P01') {
                    console.log(`   ❌ テーブルが存在しません\n`);
                } else {
                    console.log(`   ⚠️  エラー: ${error.message}\n`);
                }
            } else {
                console.log(`   ✅ テーブルが存在します（レコード数: ${count || 0}）\n`);
            }
        } catch (err) {
            console.log(`   ❌ 確認エラー: ${err.message}\n`);
        }
    }
    
    console.log('✅ 確認完了');
}

checkDatabase().catch(console.error);
