// audio_filesテーブル構造確認スクリプト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 audio_files テーブル構造確認\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 環境変数が設定されていません');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    try {
        // テーブルのレコード数を確認
        const { data, error, count } = await supabase
            .from('audio_files')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.log('❌ エラー:', error.message);
            console.log('📝 テーブルが存在しないか、アクセス権限がありません');
            return;
        }
        
        console.log('✅ audio_files テーブルが存在します');
        console.log('📊 レコード数:', count || 0);
        
        // 実際のデータを1件取得して構造を確認
        const { data: sampleData, error: sampleError } = await supabase
            .from('audio_files')
            .select('*')
            .limit(1);
        
        if (sampleError) {
            console.log('❌ データ取得エラー:', sampleError.message);
        } else if (sampleData && sampleData.length > 0) {
            console.log('\n📋 テーブル構造（サンプルデータ）:');
            console.log(JSON.stringify(sampleData[0], null, 2));
        } else {
            console.log('\n📋 テーブルは空です（レコードなし）');
            console.log('💡 テーブル構造を確認するには、Supabaseダッシュボードの Table Editor をご覧ください');
        }
        
    } catch (err) {
        console.error('❌ 接続エラー:', err.message);
    }
}

checkTable().then(() => process.exit(0));
