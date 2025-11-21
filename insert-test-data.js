// テストデータを挿入するスクリプト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestData() {
    console.log('🔧 テストデータを挿入します...\n');
    
    const testMessages = [
        {
            user_id: 'test_user_1',
            user_name: '配信者Aさん',
            user_handle: '@streamer_a',
            user_avatar: 'https://via.placeholder.com/60',
            followers_count: 1234,
            message: '素敵なボイスありがとうございました！\n台本のよさを3倍にも4倍にもしてくれたね！',
            target_voice_actor: '@streamerfunch'
        },
        {
            user_id: 'test_user_2',
            user_name: 'VTuber Bさん',
            user_handle: '@vtuber_b',
            user_avatar: 'https://via.placeholder.com/60',
            followers_count: 5678,
            message: 'プロフェッショナルな対応と高品質な音声でした！また依頼します！',
            target_voice_actor: '@streamerfunch'
        },
        {
            user_id: 'test_user_3',
            user_name: '企業Cさん',
            user_handle: '@company_c',
            user_avatar: 'https://via.placeholder.com/60',
            followers_count: 10234,
            message: '企業向けのナレーション音声を依頼しました。クライアントからも高評価をいただきました。',
            target_voice_actor: '@streamerfunch'
        },
        {
            user_id: 'test_user_4',
            user_name: '動画編集者Dさん',
            user_handle: '@editor_d',
            user_avatar: 'https://via.placeholder.com/60',
            followers_count: 3456,
            message: '納品スピードも速く、クオリティも素晴らしかったです。次回もお願いします！',
            target_voice_actor: '@streamerfunch'
        },
        {
            user_id: 'test_user_5',
            user_name: 'ゲーム実況者Eさん',
            user_handle: '@gamer_e',
            user_avatar: 'https://via.placeholder.com/60',
            followers_count: 8901,
            message: '視聴者からの反応が良く、再生数も伸びました！ありがとうございました！',
            target_voice_actor: '@streamerfunch'
        },
        {
            user_id: 'test_user_6',
            user_name: 'アイドルFさん',
            user_handle: '@idol_f',
            user_avatar: 'https://via.placeholder.com/60',
            followers_count: 12345,
            message: 'ファンからの反応が素晴らしく、リピートしたいです！ありがとうございました！',
            target_voice_actor: '@streamerfunch'
        }
    ];
    
    const { data, error } = await supabase
        .from('thanks_messages')
        .insert(testMessages);
    
    if (error) {
        console.error('❌ エラー:', error);
    } else {
        console.log('✅ テストデータを6件挿入しました！');
        console.log('✅ ブラウザをリロードして確認してください');
    }
}

insertTestData();
