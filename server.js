// KimiLink Voice Server
const express = require('express');
const session = require('express-session');
// const FileStore = require('session-file-store')(session);
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const crypto = require('crypto');

// 環境変数読み込み
dotenv.config();

// Supabaseデータベース
const { upsertProfile, getProfileByTwitterId, updateFollowStatus } = require('./database/profiles');
const supabase = require('./database/supabase-client');

// Expressアプリ初期化
const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// フォロー状態のキャッシュ（5分間有効）
const followStatusCache = new Map();

// アカウント情報のサーバー側キャッシュ（7日間有効）
const accountProfileCache = new Map();
const ACCOUNT_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日間

// セッション設定（メモリストア使用 - 開発用）
app.use(session({
    // store: new FileStore({
    //     path: './sessions',
    //     ttl: 86400, // 24時間（秒単位）
    //     retries: 0
    // }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24時間
    }
}));

// ミドルウェア設定
app.use(compression()); // Gzip圧縮を有効化
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルのキャッシュ設定
app.use(express.static(path.join(__dirname), {
    maxAge: '1d', // CSS/JS等のデフォルトキャッシュ: 1日
    setHeaders: (res, filePath) => {
        // 画像ファイルは30日間キャッシュ
        if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30日
        }
        // HTML は常に最新を取得
        else if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
    }
}));

// ルート設定
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== ユーティリティ関数 =====

// PKCE用のランダム文字列生成
function generateRandomString(length = 128) {
    return crypto.randomBytes(length)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .substring(0, length);
}

// SHA256ハッシュ生成（PKCE用）
function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

// Base64URLエンコード
function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// ===== Twitter OAuth 2.0 エンドポイント =====

// ログイン開始
app.get('/auth/twitter', (req, res) => {
    try {
        // PKCE用のコード検証器とチャレンジを生成
        const codeVerifier = generateRandomString();
        const codeChallenge = base64URLEncode(sha256(codeVerifier));
        const state = generateRandomString(32);

        // セッションに保存
        req.session.codeVerifier = codeVerifier;
        req.session.state = state;

        // Twitter認証URLの構築
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.TWITTER_CLIENT_ID,
            redirect_uri: process.env.TWITTER_CALLBACK_URL,
            scope: 'tweet.read users.read follows.read offline.access',
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
        if (isDevelopment) {
            console.log('🔗 認証URL生成:', authUrl);
            console.log('📋 コールバックURL:', process.env.TWITTER_CALLBACK_URL);
        }
        res.redirect(authUrl);

    } catch (error) {
        if (isDevelopment) console.error('OAuth開始エラー:', error);
        res.status(500).json({ error: 'OAuth開始に失敗しました' });
    }
});

// OAuth コールバック
app.get('/auth/twitter/callback', async (req, res) => {
    if (isDevelopment) {
        console.log('🔄 OAuth コールバック開始');
        console.log('📥 受信したクエリパラメータ:', req.query);
        console.log('🔐 セッション状態:', {
            hasCodeVerifier: !!req.session.codeVerifier,
            hasState: !!req.session.state
        });
    }
    try {
        const { code, state, error } = req.query;
        if (isDevelopment) console.log('📝 クエリパラメータ:', { code: code ? '取得済み' : 'なし', state: state ? '取得済み' : 'なし', error });

        // エラーがある場合
        if (error) {
            if (isDevelopment) console.error('❌ Twitter認証エラー:', error);
            return res.redirect('/?login=error&reason=' + error);
        }

        // ステート検証
        if (isDevelopment) console.log('🔍 State検証:', { received: state, expected: req.session.state });
        if (!state || state !== req.session.state) {
            if (isDevelopment) console.error('❌ State検証失敗');
            throw new Error('Invalid state parameter');
        }
        if (isDevelopment) console.log('✅ State検証成功');

        // アクセストークンを取得
        if (isDevelopment) console.log('🔑 アクセストークン取得中...');
        const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token', 
            new URLSearchParams({
                code: code,
                grant_type: 'authorization_code',
                client_id: process.env.TWITTER_CLIENT_ID,
                redirect_uri: process.env.TWITTER_CALLBACK_URL,
                code_verifier: req.session.codeVerifier
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
                }
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;
        if (isDevelopment) console.log('✅ アクセストークン取得成功');

        // ユーザー情報を取得
        if (isDevelopment) console.log('👤 ユーザー情報取得中...');
        const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                'user.fields': 'profile_image_url,public_metrics,created_at'
            }
        });

        const userData = userResponse.data.data;
        if (isDevelopment) {
            console.log('✅ ユーザー情報取得成功:', userData.username);
            console.log('📊 Twitter APIから取得したメトリクス:', {
                followers_count: userData.public_metrics?.followers_count,
                following_count: userData.public_metrics?.following_count
            });
        }

        // Supabaseにプロフィールを保存
        if (isDevelopment) console.log('💾 Supabaseにプロフィールを保存中...');
        let dbProfile = null;
        try {
            dbProfile = await upsertProfile({
                twitter_id: userData.id,
                twitter_username: userData.username,
                display_name: userData.name,
                avatar_url: userData.profile_image_url,
                user_type: 'client',
                is_following_creator: false,
                is_following_idol: false
            });
            if (isDevelopment) console.log('✅ Supabaseにプロフィール保存成功:', dbProfile.id);
        } catch (dbError) {
            console.error('⚠️ Supabaseへの保存に失敗しましたが、セッションは作成します:', dbError.message);
        }

        // セッションにユーザー情報を保存
        if (isDevelopment) console.log('💾 セッションに保存中...');
        req.session.user = {
            id: userData.id,
            username: userData.username,
            displayName: userData.name,
            avatar: userData.profile_image_url,
            followers: userData.public_metrics?.followers_count || 0,
            following: userData.public_metrics?.following_count || 0,
            createdAt: userData.created_at,
            dbId: dbProfile?.id || null
        };
        if (isDevelopment) {
            console.log('📊 セッションに保存された値:', {
                followers: req.session.user.followers,
                following: req.session.user.following,
                dbId: req.session.user.dbId
            });
        }
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;

        // クリーンアップ
        delete req.session.codeVerifier;
        delete req.session.state;

        if (isDevelopment) {
            console.log('✅ セッション保存完了');
            console.log('🔄 リダイレクト: /?login=success');
        }

        // フロントエンドにリダイレクト
        res.redirect('/?login=success');

    } catch (error) {
        if (isDevelopment) {
            console.error('❌ OAuth コールバックエラー:');
            console.error('  メッセージ:', error.message);
            console.error('  レスポンス:', JSON.stringify(error.response?.data, null, 2));
            console.error('  ステータス:', error.response?.status);
            console.error('  スタック:', error.stack);
        }
        res.redirect('/?login=error');
    }
});

// ログアウト
app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'ログアウトに失敗しました' });
        }
        res.json({ success: true });
    });
});

// ===== API エンドポイント =====

// ユーザープロフィール取得（Twitter API プロキシ）
app.get('/api/user/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;

        if (!bearerToken) {
            console.error('❌ Bearer Token が設定されていません');
            return res.status(500).json({ error: 'Twitter Bearer Token が設定されていません' });
        }

        // サーバー側メモリキャッシュをチェック（7日間有効・最速）
        const cacheKey = `profile_${username}`;
        const cached = accountProfileCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < ACCOUNT_CACHE_DURATION) {
            if (isDevelopment) console.log(`💾 メモリキャッシュからプロフィール取得: ${username} (残り: ${Math.floor((ACCOUNT_CACHE_DURATION - (Date.now() - cached.timestamp)) / 1000 / 60 / 60)}時間)`);
            return res.json(cached.data);
        }

        // Supabaseからチェック（永続的・サーバー再起動後も有効）
        try {
            const { data: dbProfile, error: dbError } = await supabase
                .from('profiles')
                .select('*')
                .eq('twitter_username', username)
                .single();
            
            if (dbProfile && !dbError) {
                // Supabaseから取得できた場合
                const profileData = {
                    id: dbProfile.twitter_id,
                    username: dbProfile.twitter_username,
                    name: dbProfile.display_name,
                    profile_image_url: dbProfile.avatar_url
                };
                
                // メモリキャッシュにも保存
                accountProfileCache.set(cacheKey, {
                    timestamp: Date.now(),
                    data: profileData
                });
                
                if (isDevelopment) console.log(`💾 Supabaseからプロフィール取得: ${username}`);
                return res.json(profileData);
            }
        } catch (dbError) {
            // データベースエラーの場合はログ出力して続行
            if (isDevelopment) console.warn('⚠️ Supabase取得エラー:', dbError);
        }

        if (isDevelopment) console.log('📡 Twitter APIからプロフィール取得:', username);

        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            },
            params: {
                'user.fields': 'profile_image_url,name,description,public_metrics'
            }
        });

        if (isDevelopment) {
            console.log('✅ プロフィール取得成功:', username);
            console.log('📊 Twitter API レスポンス:', JSON.stringify(response.data, null, 2));
        }
        
        // Twitter API v2のレスポンス構造: { data: { ... } }
        // フロントエンドが直接使えるように data.data を返す
        const profileData = response.data && response.data.data ? response.data.data : response.data;
        
        // Supabaseに保存（永続化）
        try {
            await upsertProfile({
                twitter_id: profileData.id,
                twitter_username: profileData.username,
                display_name: profileData.name,
                avatar_url: profileData.profile_image_url,
                user_type: 'narrator' // フォロー必須アカウントは声優として扱う
            });
            if (isDevelopment) console.log(`💾 Supabaseにプロフィールを保存: ${username}`);
        } catch (dbError) {
            // データベース保存に失敗してもAPI結果は返す
            console.error('⚠️ Supabase保存エラー:', dbError);
        }
        
        // サーバー側メモリキャッシュにも保存（7日間）
        accountProfileCache.set(cacheKey, {
            timestamp: Date.now(),
            data: profileData
        });
        if (isDevelopment) console.log(`💾 プロフィールをキャッシュに保存: ${username} (7日間有効)`);
        
        res.json(profileData);

    } catch (error) {
        if (isDevelopment) {
            console.error('❌ プロフィール取得エラー:', {
                title: error.response?.data?.title || 'Unknown error',
                detail: error.response?.data?.detail || error.message,
                type: error.response?.data?.type,
                status: error.response?.status
            });
        }
        res.status(error.response?.status || 500).json({
            error: error.response?.data || { message: error.message }
        });
    }
});

// 現在のユーザー情報取得
app.get('/api/user/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: '認証が必要です' });
    }
    res.json(req.session.user);
});

// フォロー状態確認
app.get('/api/user/follow-status', async (req, res) => {
    try {
        if (!req.session.user || !req.session.accessToken) {
            if (isDevelopment) console.error('❌ 認証エラー: セッションまたはトークンがありません');
            return res.status(401).json({ error: '認証が必要です' });
        }

        const userId = req.session.user.id;
        const accessToken = req.session.accessToken;
        if (isDevelopment) console.log('✅ ユーザーID:', userId);

        // キャッシュをチェック（5分間有効）
        const cacheKey = `follow_${userId}`;
        const cached = followStatusCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            if (isDevelopment) console.log('📦 キャッシュから取得');
            return res.json(cached.data);
        }

        // 必須フォローアカウントのユーザーIDを取得
        const creatorUsername = process.env.REQUIRED_FOLLOW_CREATOR;
        const idolUsername = process.env.REQUIRED_FOLLOW_IDOL;
        if (isDevelopment) console.log('📝 確認対象:', creatorUsername, idolUsername);

        // ユーザー名からIDを取得
        if (isDevelopment) console.log('🔍 ユーザー名からIDを取得中...');
        const usernamesResponse = await axios.get('https://api.twitter.com/2/users/by', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                'usernames': `${creatorUsername},${idolUsername}`
            }
        });

        if (isDevelopment) console.log('📊 取得したユーザー情報:', JSON.stringify(usernamesResponse.data, null, 2));

        const users = usernamesResponse.data.data;
        if (!users || users.length === 0) {
            if (isDevelopment) console.error('❌ ユーザーが見つかりません');
            throw new Error('必須フォローアカウントが見つかりません');
        }

        const creatorId = users.find(u => u.username === creatorUsername)?.id;
        const idolId = users.find(u => u.username === idolUsername)?.id;

        if (isDevelopment) {
            console.log('✅ creatorId:', creatorId);
            console.log('✅ idolId:', idolId);
        }

        if (!creatorId || !idolId) {
            if (isDevelopment) console.error('❌ IDが取得できませんでした');
            throw new Error('必須フォローアカウントのIDが取得できません');
        }

        // フォロー状態をチェック
        if (isDevelopment) console.log('🔍 フォローリストを取得中...');
        const followingResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/following`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                'max_results': 1000
            }
        });

        if (isDevelopment) console.log('📊 フォローリスト:', followingResponse.data);

        const followingIds = followingResponse.data.data?.map(user => user.id) || [];
        if (isDevelopment) console.log('📝 フォロー中のID数:', followingIds.length);

        const creatorFollowed = followingIds.includes(creatorId);
        const idolFollowed = followingIds.includes(idolId);

        if (isDevelopment) console.log('✅ フォロー状態 - creator:', creatorFollowed, 'idol:', idolFollowed);

        const result = {
            creator: creatorFollowed,
            idol: idolFollowed
        };

        // キャッシュに保存
        followStatusCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        if (isDevelopment) console.log('💾 結果をキャッシュに保存');

        // Supabaseにフォロー状態を保存
        try {
            const twitterId = req.session.user.id;
            await updateFollowStatus(twitterId, creatorFollowed, idolFollowed);
            if (isDevelopment) console.log('✅ Supabaseにフォロー状態を保存しました');
        } catch (dbError) {
            console.error('⚠️ Supabaseへのフォロー状態保存に失敗:', dbError.message);
        }

        res.json(result);

    } catch (error) {
        if (isDevelopment) {
            console.error('❌ フォロー状態確認エラー:');
            console.error('  メッセージ:', error.message);
            console.error('  レスポンス:', JSON.stringify(error.response?.data, null, 2));
            console.error('  ステータス:', error.response?.status);
        }
        res.status(500).json({ 
            error: 'フォロー状態の確認に失敗しました',
            details: error.response?.data?.detail || error.message
        });
    }
});

// 重複したエンドポイントを削除（上記で既に定義済み）

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'KimiLink Voice is running!' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🎤 KimiLink Voice Server is running on http://localhost:${PORT}`);
    console.log(`🎨 Powered by キミトリンク工房`);
});
