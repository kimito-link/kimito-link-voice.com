// Supabase簡易接続テスト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Supabase簡易接続テスト\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('環境変数確認:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ 設定済み' : '❌ 未設定');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ 設定済み' : '❌ 未設定');
console.log('');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 環境変数が設定されていません');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📊 profilesテーブルの確認...');

// タイムアウト設定（10秒）
const timeout = setTimeout(() => {
    console.log('⏱️ タイムアウト: 接続に時間がかかりすぎています');
    process.exit(1);
}, 10000);

supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .then(({ data, error, count }) => {
        clearTimeout(timeout);
        
        if (error) {
            console.log('❌ エラー:', error.message);
            console.log('詳細:', error);
        } else {
            console.log('✅ profiles テーブルが存在します');
            console.log('📊 レコード数:', count || 0);
        }
        
        process.exit(0);
    })
    .catch((err) => {
        clearTimeout(timeout);
        console.error('❌ 接続エラー:', err.message);
        process.exit(1);
    });

console.log('⏳ 接続中...');
