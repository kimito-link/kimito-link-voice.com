# 🔐 KimiLink Voice 認証システム

**最終更新**: 2025-11-18

---

## 📋 概要

KimiLink VoiceはTwitter OAuth 2.0 (PKCE) による認証システムを実装しています。
ユーザーはTwitterアカウントでログインし、必須アカウントをフォローすることでプラットフォームにアクセスできます。

---

## ✅ 実装済み機能

### 🔒 認証フロー
1. **ログインボタンクリック** → ログインモーダル表示
2. **Twitterでログイン** → Twitter OAuth 2.0認証開始
3. **Twitter認証完了** → コールバックでアクセストークン取得
4. **フォロー確認** → 必須アカウントのフォロー状態チェック
5. **ダッシュボード表示** → フォロー完了でプラットフォームへ

### 🔑 認証エンドポイント

#### `GET /auth/twitter`
Twitter OAuth 2.0認証を開始します。

**処理内容**:
- PKCEコード検証器とチャレンジを生成
- Stateパラメータを生成（CSRF対策）
- セッションに保存
- Twitter認証URLへリダイレクト

**スコープ**:
- `tweet.read` - ツイート読み取り
- `users.read` - ユーザー情報読み取り
- `follows.read` - フォロー状態読み取り
- `offline.access` - リフレッシュトークン

---

#### `GET /auth/twitter/callback`
Twitter認証後のコールバック処理。

**処理内容**:
1. Stateパラメータ検証（CSRF対策）
2. 認証コードをアクセストークンに交換
3. ユーザー情報を取得（プロフィール画像、メトリクス含む）
4. セッションに保存
5. フロントエンドにリダイレクト

**成功時**: `/?login=success`にリダイレクト
**失敗時**: `/?login=error`にリダイレクト

---

#### `POST /auth/logout`
ログアウト処理。

**処理内容**:
- セッションを破棄
- クライアント側のクッキーをクリア

**レスポンス**:
```json
{
  "success": true
}
```

---

### 📊 APIエンドポイント

#### `GET /api/user/me`
現在ログイン中のユーザー情報を取得。

**認証**: 必須（セッション）

**レスポンス**:
```json
{
  "id": "1234567890",
  "username": "example_user",
  "displayName": "Example User",
  "avatar": "https://pbs.twimg.com/profile_images/...",
  "followers": 1234,
  "following": 567,
  "createdAt": "2020-01-01T00:00:00.000Z"
}
```

**エラー** (401):
```json
{
  "error": "認証が必要です"
}
```

---

#### `GET /api/user/follow-status`
必須アカウントのフォロー状態を確認。

**認証**: 必須（セッション）

**処理内容**:
1. キャッシュをチェック（5分間有効）
2. Twitter APIでフォローリストを取得
3. 必須アカウントをフォローしているか確認
4. 結果をキャッシュに保存

**レスポンス**:
```json
{
  "creator": true,
  "idol": false
}
```

**キャッシュ期間**: 5分間
**レート制限対策**: キャッシュにより同一ユーザーの連続リクエストを制限

---

#### `GET /api/user/profile/:username`
指定ユーザーのプロフィール情報を取得。

**認証**: 必須（セッション）

**パラメータ**:
- `username` - Twitterユーザー名

**レスポンス**:
```json
{
  "id": "1234567890",
  "username": "example_user",
  "name": "Example User",
  "profile_image_url": "https://pbs.twimg.com/profile_images/..."
}
```

---

## 🔧 環境変数

### `.env`ファイル設定

```env
# Twitter OAuth 2.0 設定
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback

# 必須フォローアカウント
REQUIRED_FOLLOW_CREATOR=streamerfunch
REQUIRED_FOLLOW_IDOL=idolfunch

# セッション設定
SESSION_SECRET=your_random_secret_key

# サーバー設定
PORT=3000
NODE_ENV=development
```

---

## 🎯 フロントエンド連携

### ログイン処理 (`js/script.js`)

```javascript
// ログインボタンクリック
function loginWithTwitter() {
    window.location.href = '/auth/twitter';
}

// 認証状態チェック
async function checkAuthStatus() {
    const response = await fetch('/api/user/me');
    if (response.ok) {
        currentUser = await response.json();
        // フォロー確認へ
        await checkFollowStatus();
    }
}

// フォロー確認
async function checkFollowStatus() {
    const response = await fetch('/api/user/follow-status');
    const data = await response.json();
    
    if (data.creator && data.idol) {
        // 両方フォロー済み → ダッシュボードへ
        showPlatform();
    } else {
        // フォローモーダル表示
        showFollowModal();
    }
}
```

---

## 🔒 セキュリティ機能

### 1. PKCE (Proof Key for Code Exchange)
OAuth 2.0の認証コード横取り攻撃を防ぐ。

**実装内容**:
- Code Verifier: ランダムな128文字の文字列
- Code Challenge: SHA256でハッシュ化してBase64URLエンコード
- Twitter認証時にChallengeを送信
- トークン交換時にVerifierを送信

### 2. State パラメータ
CSRF（クロスサイトリクエストフォージェリ）攻撃を防ぐ。

**実装内容**:
- 認証開始時にランダムなStateを生成
- セッションに保存
- コールバック時にStateを検証

### 3. セッション管理
Express Sessionでセッション管理。

**設定**:
- `httpOnly: true` - JavaScriptからのアクセス禁止
- `secure: true (本番)` - HTTPS接続のみ
- `maxAge: 24時間` - セッション有効期限

### 4. レート制限対策
フォロー状態のキャッシュでAPIコール削減。

**実装内容**:
- キャッシュ期間: 5分間
- Map型でメモリ上に保存
- ユーザーIDをキーとして管理

---

## 📊 開発モード設定

### フォロー確認スキップ

開発中はTwitter APIのレート制限を回避するため、フォロー確認をスキップできます。

**`js/script.js`の設定**:
```javascript
// 開発モード（本番環境では false に設定）
const DEVELOPMENT_MODE = true;

// フォロー確認をスキップ（開発中のみ）
const SKIP_FOLLOW_CHECK = true;
```

**動作**:
- フォロー確認APIをスキップ
- 自動的にダッシュボードへ遷移
- 本番環境では必ず `false` に設定

---

## 🧪 テスト方法

### 1. サーバー起動
```bash
npm start
```

### 2. ブラウザでアクセス
```
http://localhost:3000
```

### 3. ログインフロー確認
1. 「Twitterでログイン」ボタンをクリック
2. Twitter認証画面へリダイレクト
3. 認証後、コールバックURLに戻る
4. フォロー確認モーダルが表示される
5. 必須アカウントをフォロー
6. ダッシュボードへ遷移

### 4. APIエンドポイントテスト

**ユーザー情報取得**:
```bash
curl http://localhost:3000/api/user/me
```

**フォロー状態確認**:
```bash
curl http://localhost:3000/api/user/follow-status
```

**ヘルスチェック**:
```bash
curl http://localhost:3000/api/health
```

---

## 🐛 トラブルシューティング

### エラー: "Invalid state parameter"
**原因**: セッションが無効またはCSRF攻撃の可能性
**解決策**: ブラウザのキャッシュとクッキーをクリアして再度ログイン

### エラー: "認証が必要です"
**原因**: セッションが期限切れまたは未ログイン
**解決策**: 再度ログインしてください

### エラー: "フォロー状態の確認に失敗しました"
**原因**: Twitter APIレート制限またはアクセストークン無効
**解決策**: 
- 開発モード: `SKIP_FOLLOW_CHECK = true`に設定
- 本番環境: 数分待ってから再試行

### Twitter認証エラー
**原因**: Twitter Developer Appの設定ミス
**確認事項**:
1. Callback URLが正しく設定されているか
2. Client IDとSecretが正しいか
3. OAuth 2.0が有効化されているか

---

## 📚 参考リソース

### Twitter API ドキュメント
- [OAuth 2.0 Authorization Code Flow with PKCE](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code)
- [Twitter API v2 - Users Lookup](https://developer.twitter.com/en/docs/twitter-api/users/lookup/introduction)
- [Twitter API v2 - Follows](https://developer.twitter.com/en/docs/twitter-api/users/follows/introduction)

### セキュリティ
- [PKCE (RFC 7636)](https://tools.ietf.org/html/rfc7636)
- [CSRF Protection](https://owasp.org/www-community/attacks/csrf)

---

## ✅ チェックリスト

### 実装済み
- [x] Twitter OAuth 2.0 PKCE認証
- [x] セッション管理
- [x] フォロー状態確認
- [x] ユーザー情報取得
- [x] ログイン/ログアウト
- [x] CSRF対策（State検証）
- [x] レート制限対策（キャッシュ）
- [x] 開発モード設定

### 今後の拡張
- [ ] リフレッシュトークンによる自動更新
- [ ] ユーザー情報のSupabase保存
- [ ] ロール管理（依頼者/声優/管理者）
- [ ] プロフィール編集機能
- [ ] セッションの永続化（Redis等）

---

**作成者**: KimiLink Voice Team  
**作成日**: 2025年11月18日
