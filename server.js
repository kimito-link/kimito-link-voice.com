// KimiLink Voice Server
const express = require('express');
const session = require('express-session');
// const FileStore = require('session-file-store')(session);
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const crypto = require('crypto');

// 環境変数読み込み
dotenv.config();

// Expressアプリ初期化
const app = express();
const PORT = process.env.PORT || 3000;

// フォロー状態のキャッシュ（5分間有効）
const followStatusCache = new Map();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

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
        res.redirect(authUrl);

    } catch (error) {
        console.error('OAuth開始エラー:', error);
        res.status(500).json({ error: 'OAuth開始に失敗しました' });
    }
});

// OAuth コールバック
app.get('/auth/twitter/callback', async (req, res) => {
    console.log('🔄 OAuth コールバック開始');
    try {
        const { code, state, error } = req.query;
        console.log('📝 クエリパラメータ:', { code: code ? '取得済み' : 'なし', state: state ? '取得済み' : 'なし', error });

        // エラーがある場合
        if (error) {
            console.error('❌ Twitter認証エラー:', error);
            return res.redirect('/?login=error&reason=' + error);
        }

        // ステート検証
        console.log('🔍 State検証:', { received: state, expected: req.session.state });
        if (!state || state !== req.session.state) {
            console.error('❌ State検証失敗');
            throw new Error('Invalid state parameter');
        }
        console.log('✅ State検証成功');

        // アクセストークンを取得
        console.log('🔑 アクセストークン取得中...');
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
        console.log('✅ アクセストークン取得成功');

        // ユーザー情報を取得
        console.log('👤 ユーザー情報取得中...');
        const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                'user.fields': 'profile_image_url,public_metrics,created_at'
            }
        });

        const userData = userResponse.data.data;
        console.log('✅ ユーザー情報取得成功:', userData.username);
        console.log('📊 Twitter APIから取得したメトリクス:', {
            followers_count: userData.public_metrics?.followers_count,
            following_count: userData.public_metrics?.following_count
        });

        // セッションにユーザー情報を保存
        console.log('💾 セッションに保存中...');
        req.session.user = {
            id: userData.id,
            username: userData.username,
            displayName: userData.name,
            avatar: userData.profile_image_url,
            followers: userData.public_metrics?.followers_count || 0,
            following: userData.public_metrics?.following_count || 0,
            createdAt: userData.created_at
        };
        console.log('📊 セッションに保存された値:', {
            followers: req.session.user.followers,
            following: req.session.user.following
        });
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;

        // クリーンアップ
        delete req.session.codeVerifier;
        delete req.session.state;

        console.log('✅ セッション保存完了');
        console.log('🔄 リダイレクト: /?login=success');

        // フロントエンドにリダイレクト
        res.redirect('/?login=success');

    } catch (error) {
        console.error('❌ OAuth コールバックエラー:');
        console.error('  メッセージ:', error.message);
        console.error('  レスポンス:', JSON.stringify(error.response?.data, null, 2));
        console.error('  ステータス:', error.response?.status);
        console.error('  スタック:', error.stack);
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
            console.error('❌ 認証エラー: セッションまたはトークンがありません');
            return res.status(401).json({ error: '認証が必要です' });
        }

        const userId = req.session.user.id;
        const accessToken = req.session.accessToken;
        console.log('✅ ユーザーID:', userId);

        // キャッシュをチェック（5分間有効）
        const cacheKey = `follow_${userId}`;
        const cached = followStatusCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            console.log('📦 キャッシュから取得');
            return res.json(cached.data);
        }

        // 必須フォローアカウントのユーザーIDを取得
        const creatorUsername = process.env.REQUIRED_FOLLOW_CREATOR;
        const idolUsername = process.env.REQUIRED_FOLLOW_IDOL;
        console.log('📝 確認対象:', creatorUsername, idolUsername);

        // ユーザー名からIDを取得
        console.log('🔍 ユーザー名からIDを取得中...');
        const usernamesResponse = await axios.get('https://api.twitter.com/2/users/by', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                'usernames': `${creatorUsername},${idolUsername}`
            }
        });

        console.log('📊 取得したユーザー情報:', JSON.stringify(usernamesResponse.data, null, 2));

        const users = usernamesResponse.data.data;
        if (!users || users.length === 0) {
            console.error('❌ ユーザーが見つかりません');
            throw new Error('必須フォローアカウントが見つかりません');
        }

        const creatorId = users.find(u => u.username === creatorUsername)?.id;
        const idolId = users.find(u => u.username === idolUsername)?.id;

        console.log('✅ creatorId:', creatorId);
        console.log('✅ idolId:', idolId);

        if (!creatorId || !idolId) {
            console.error('❌ IDが取得できませんでした');
            throw new Error('必須フォローアカウントのIDが取得できません');
        }

        // フォロー状態をチェック
        console.log('🔍 フォローリストを取得中...');
        const followingResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/following`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                'max_results': 1000
            }
        });

        console.log('📊 フォローリスト:', followingResponse.data);

        const followingIds = followingResponse.data.data?.map(user => user.id) || [];
        console.log('📝 フォロー中のID数:', followingIds.length);

        const creatorFollowed = followingIds.includes(creatorId);
        const idolFollowed = followingIds.includes(idolId);

        console.log('✅ フォロー状態 - creator:', creatorFollowed, 'idol:', idolFollowed);

        const result = {
            creator: creatorFollowed,
            idol: idolFollowed
        };

        // キャッシュに保存
        followStatusCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        console.log('💾 結果をキャッシュに保存');

        res.json(result);

    } catch (error) {
        console.error('❌ フォロー状態確認エラー:');
        console.error('  メッセージ:', error.message);
        console.error('  レスポンス:', JSON.stringify(error.response?.data, null, 2));
        console.error('  ステータス:', error.response?.status);
        res.status(500).json({ 
            error: 'フォロー状態の確認に失敗しました',
            details: error.response?.data?.detail || error.message
        });
    }
});

// 指定ユーザーのプロフィール情報取得
app.get('/api/user/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log('👤 プロフィール取得:', username);

        // アクセストークンを取得（認証済みユーザーのトークンを使用）
        if (!req.session.accessToken) {
            return res.status(401).json({ error: '認証が必要です' });
        }

        const accessToken = req.session.accessToken;

        // ユーザー情報を取得
        const userResponse = await axios.get('https://api.twitter.com/2/users/by/username/' + username, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                'user.fields': 'profile_image_url'
            }
        });

        const userData = userResponse.data.data;
        console.log('✅ プロフィール取得成功:', userData.username);

        res.json({
            id: userData.id,
            username: userData.username,
            name: userData.name,
            profile_image_url: userData.profile_image_url
        });

    } catch (error) {
        console.error('❌ プロフィール取得エラー:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'プロフィール情報の取得に失敗しました',
            details: error.response?.data?.detail || error.message
        });
    }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'KimiLink Voice is running!' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🎤 KimiLink Voice Server is running on http://localhost:${PORT}`);
    console.log(`🎨 Powered by キミトリンク工房`);
});
