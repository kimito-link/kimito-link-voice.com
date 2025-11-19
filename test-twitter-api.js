// Twitter API直接テスト用スクリプト
const axios = require('axios');
require('dotenv').config();

async function testTwitterAPI() {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
        console.error('❌ Bearer Token が設定されていません');
        return;
    }
    
    console.log('🔑 Bearer Token:', bearerToken.substring(0, 20) + '...');
    
    try {
        // streamerfunchのプロフィールを取得（先にこちらを試す）
        console.log('📡 streamerfunchのプロフィールを取得中...');
        const creatorResponse = await axios.get('https://api.twitter.com/2/users/by/username/streamerfunch', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            },
            params: {
                'user.fields': 'profile_image_url,name,description'
            }
        });
        
        console.log('✅ streamerfunch データ取得成功:');
        console.log(JSON.stringify(creatorResponse.data, null, 2));
        
        // 少し待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // idolfunchのプロフィールを取得
        console.log('📡 idolfunchのプロフィールを取得中...');
        const idolResponse = await axios.get('https://api.twitter.com/2/users/by/username/idolfunch', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            },
            params: {
                'user.fields': 'profile_image_url,name,description'
            }
        });
        
        console.log('✅ idolfunch データ取得成功:');
        console.log(JSON.stringify(idolResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ エラー:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
    }
}

testTwitterAPI();
