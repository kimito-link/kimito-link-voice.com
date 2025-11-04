# Twitter Developer アカウント セットアップガイド

KimiLink Voice でTwitter OAuth 2.0認証を使用するための準備ガイド

最終更新: 2025-11-04

---

## 📋 目次

1. [Twitter Developer アカウント作成](#twitter-developer-アカウント作成)
2. [アプリケーション登録](#アプリケーション登録)
3. [OAuth 2.0 設定](#oauth-20-設定)
4. [認証情報の取得](#認証情報の取得)
5. [環境変数の設定](#環境変数の設定)

---

## 🔐 Twitter Developer アカウント作成

### Step 1: Developer Portal にアクセス

1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. Twitterアカウントでログイン
3. 「Sign up」または「Apply for a developer account」をクリック

### Step 2: 利用目的を選択

**おすすめ:** "Making a bot" または "Building a tool"

### Step 3: 基本情報を入力

```
Account name: あなたの名前 or 組織名
Primary country of operation: Japan
Use case: Student / Hobbyist / Professional
```

### Step 4: 利用目的を記述（英語）

**テンプレート:**

```
I am building a voice matching platform called "KimiLink Voice" 
that connects voice actors and clients. 

The platform will use Twitter OAuth 2.0 for user authentication 
and will check if users follow specific Twitter accounts 
(@streamerfunch, @idolfunch) as a requirement to access the service.

We will also display a timeline of tweets with the hashtag #KimiLinkVoice 
to showcase user reviews and feedback.

No automated actions or spam will be performed.
```

### Step 5: 承認待ち

- 通常は数分〜数時間で承認
- メールで通知が届く

---

## 🎯 アプリケーション登録

### Step 1: 新規アプリを作成

1. Developer Portal にログイン
2. 「Projects & Apps」→「Overview」
3. 「Create App」をクリック

### Step 2: アプリ名を入力

```
App name: KimiLink Voice (開発用の場合: KimiLink Voice Dev)
```

**注意:** アプリ名は一意である必要があります。既に使用されている場合は別の名前を試してください。

### Step 3: App Keys を保存

以下の3つの情報が表示されます：

- **API Key** (Client ID)
- **API Key Secret** (Client Secret)
- **Bearer Token**

**⚠️ 重要:** これらの情報は一度しか表示されないので、必ず安全な場所に保存してください。

---

## 🔧 OAuth 2.0 設定

### Step 1: App Settings にアクセス

1. 作成したアプリをクリック
2. 「Settings」タブを選択

### Step 2: User authentication settings を編集

「Set up」をクリックして以下を設定：

#### App permissions

```
☑ Read
☑ Write (レビュー投稿機能で必要)
```

#### Type of App

```
○ Web App, Automated App or Bot
```

#### App info

**Callback URI / Redirect URL:**
```
開発環境: http://localhost:3000/auth/twitter/callback
本番環境: https://your-domain.com/auth/twitter/callback
```

**Website URL:**
```
開発環境: http://localhost:3000
本番環境: https://your-domain.com
```

**Organization name:** (任意)
```
KimiLink Voice
```

**Organization website:** (任意)
```
https://your-domain.com
```

**Terms of service:** (任意)
```
https://your-domain.com/terms
```

**Privacy policy:** (任意)
```
https://your-domain.com/privacy
```

### Step 3: 保存

「Save」をクリックして設定を保存

---

## 🔑 認証情報の取得

### OAuth 2.0 Client ID と Client Secret

1. App Settings → 「Keys and tokens」タブ
2. 「OAuth 2.0 Client ID and Client Secret」セクション
3. 「Generate」をクリック（初回のみ）

以下の情報が表示されます：

```
Client ID: xxxxxxxxxxxxxxxxxxxxxxxx
Client Secret: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

**⚠️ Client Secret は再表示できないので必ず保存！**

---

## ⚙️ 環境変数の設定

### Step 1: .env ファイルを作成

プロジェクトルートに `.env` ファイルを作成：

```bash
# Twitter OAuth 2.0
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback

# 必須フォローアカウント
REQUIRED_FOLLOW_CREATOR=streamerfunch
REQUIRED_FOLLOW_IDOL=idolfunch

# セッション設定
SESSION_SECRET=your_random_secret_key_here

# サーバー設定
PORT=3000
NODE_ENV=development
```

### Step 2: SESSION_SECRET を生成

ランダムな文字列を生成：

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

### Step 3: .env.example を更新

`.env.example` を作成して、実際の値を除いたテンプレートを保存：

```bash
# Twitter OAuth 2.0
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback

# 必須フォローアカウント
REQUIRED_FOLLOW_CREATOR=streamerfunch
REQUIRED_FOLLOW_IDOL=idolfunch

# セッション設定
SESSION_SECRET=

# サーバー設定
PORT=3000
NODE_ENV=development
```

---

## ✅ 確認事項

設定が完了したら、以下を確認してください：

- [ ] Twitter Developer アカウントが承認されている
- [ ] アプリケーションが作成されている
- [ ] OAuth 2.0 が有効になっている
- [ ] Callback URL が正しく設定されている
- [ ] Client ID と Client Secret を取得している
- [ ] `.env` ファイルに認証情報を記載している
- [ ] `.env` が `.gitignore` に含まれている

---

## 🔗 参考リンク

- [Twitter Developer Portal](https://developer.twitter.com/)
- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [OAuth 2.0 Overview](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Passport.js Twitter Strategy](http://www.passportjs.org/packages/passport-twitter/)

---

## 🆘 トラブルシューティング

### エラー: "Callback URL not approved"

**原因:** Callback URL が設定されていない、または間違っている

**解決方法:**
1. App Settings → User authentication settings
2. Callback URI を確認・修正
3. 保存して数分待つ

### エラー: "Client ID not found"

**原因:** OAuth 2.0 が有効になっていない

**解決方法:**
1. App Settings → User authentication settings
2. 「Set up」をクリック
3. OAuth 2.0 を有効にする

---

<div align="center">

**KimiLink Voice - Twitter Setup Guide**

君と繋がる、声で届ける

</div>
