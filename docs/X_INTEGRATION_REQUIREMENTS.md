# X (旧Twitter) 連携機能 要件定義書

**作成日**: 2025年11月20日  
**優先度**: 高（開発の肝）  
**ステータス**: 計画中

---

## 📋 概要

KimiLink Voiceプロジェクトにおいて、X (旧Twitter) との連携は開発の中核機能です。
どのXアカウントの情報も正確に取得・管理できるシステムを構築します。

---

## 🎯 目標

### 1. 管理画面によるアカウント設定
現在は`js/script.js`の`REQUIRED_ACCOUNTS`をハードコードで編集していますが、
これを**管理画面（UI）**から設定できるようにします。

#### 現在の実装
```javascript
const REQUIRED_ACCOUNTS = {
    creator: {
        id: 'streamerfunch',
        name: '君斗りんく@クリエイター応援',
        username: '@streamerfunch'
    },
    idol: {
        id: 'idolfunch',
        name: '君斗りんく@アイドル応援',
        username: '@idolfunch'
    }
};
```

#### 目標の実装
- 管理画面で以下を設定可能に：
  - アカウントの追加・削除・編集
  - アカウントタイプの設定（creator, idol, その他）
  - 表示順序の変更
  - 有効/無効の切り替え

---

## 🔍 取得すべきXアカウント情報

### 基本情報
- ✅ **アカウント名** (name) - 実装済み
- ✅ **ユーザーID** (username/id) - 実装済み
- ✅ **プロフィール画像** (profile_image_url) - 実装済み
- ⏳ **プロフィール文章** (description) - 未実装
- ⏳ **フォロー数** (following_count) - 未実装
- ⏳ **フォロワー数** (followers_count) - 未実装

### ツイート情報
- ⏳ **最新ツイート** (recent tweets)
- ⏳ **ツイート内容** (text)
- ⏳ **ツイート時刻** (created_at)
- ⏳ **いいね数** (like_count)
- ⏳ **リツイート数** (retweet_count)
- ⏳ **リプライ数** (reply_count)
- ⏳ **メディア** (photos, videos)

### 追加情報
- ⏳ **ヘッダー画像** (banner_url)
- ⏳ **検証済みバッジ** (verified)
- ⏳ **アカウント作成日** (created_at)
- ⏳ **場所** (location)
- ⏳ **ウェブサイト** (url)
- ⏳ **ピン留めツイート** (pinned_tweet)

### すべての情報を正確に取得
X (旧Twitter) APIで取得可能な**すべての情報**を網羅的に取得できるようにします。

---

## 🏗️ 実装計画

### Phase 1: データベース設計 ⏳
**目的**: アカウント情報を永続化

#### テーブル設計

```sql
-- X連携アカウント管理テーブル
CREATE TABLE x_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_type VARCHAR(50) NOT NULL,  -- 'creator', 'idol', 'narrator', 'collaborator'
    
    -- 基本情報
    twitter_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    profile_image_url TEXT,
    banner_url TEXT,
    
    -- 統計情報
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    tweet_count INTEGER DEFAULT 0,
    
    -- その他
    location TEXT,
    website_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at_twitter TIMESTAMP,
    
    -- 管理情報
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Xツイート情報テーブル
CREATE TABLE x_tweets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES x_accounts(id) ON DELETE CASCADE,
    
    -- ツイート情報
    tweet_id TEXT NOT NULL UNIQUE,
    text TEXT NOT NULL,
    created_at_twitter TIMESTAMP NOT NULL,
    
    -- エンゲージメント
    like_count INTEGER DEFAULT 0,
    retweet_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    quote_count INTEGER DEFAULT 0,
    impression_count INTEGER DEFAULT 0,
    
    -- メディア
    has_media BOOLEAN DEFAULT false,
    media_urls TEXT[],
    
    -- その他
    is_pinned BOOLEAN DEFAULT false,
    in_reply_to_user_id TEXT,
    
    -- 管理情報
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_x_accounts_type ON x_accounts(account_type);
CREATE INDEX idx_x_accounts_active ON x_accounts(is_active);
CREATE INDEX idx_x_tweets_account ON x_tweets(account_id);
CREATE INDEX idx_x_tweets_created ON x_tweets(created_at_twitter DESC);
```

---

### Phase 2: バックエンドAPI設計 ⏳
**目的**: X APIとの連携とデータ管理

#### エンドポイント設計

##### アカウント管理
```
POST   /api/admin/x-accounts              # アカウント追加
GET    /api/admin/x-accounts              # アカウント一覧取得
GET    /api/admin/x-accounts/:id          # アカウント詳細取得
PUT    /api/admin/x-accounts/:id          # アカウント更新
DELETE /api/admin/x-accounts/:id          # アカウント削除
POST   /api/admin/x-accounts/:id/sync     # アカウント情報を同期
```

##### ツイート管理
```
GET    /api/admin/x-accounts/:id/tweets   # アカウントのツイート一覧
POST   /api/admin/x-accounts/:id/sync-tweets  # ツイートを同期
GET    /api/tweets/timeline                # タイムライン取得
```

##### 公開API
```
GET    /api/x-accounts                     # 有効なアカウント一覧
GET    /api/x-accounts/:username/profile   # プロフィール情報
GET    /api/x-accounts/:username/tweets    # ツイート一覧
```

---

### Phase 3: フロントエンド実装 ⏳
**目的**: 管理画面とユーザー画面の構築

#### 管理画面 (`/admin/x-accounts`)
- ✅ アカウント一覧表示
- ✅ アカウント追加フォーム
- ✅ アカウント編集フォーム
- ✅ アカウント削除機能
- ✅ 同期ボタン（X APIから最新情報を取得）
- ✅ 並び替え機能
- ✅ フィルタリング機能

#### ユーザー画面
- ✅ フォロー状態表示（現在実装済み）
- ⏳ アカウント詳細表示
- ⏳ ツイートタイムライン表示
- ⏳ プロフィール情報の詳細表示

---

### Phase 4: X API v2 完全統合 ⏳
**目的**: Twitter API v2の全機能を活用

#### 使用するエンドポイント

1. **ユーザー情報取得**
   ```
   GET /2/users/:id
   GET /2/users/by/username/:username
   GET /2/users
   ```

2. **ツイート取得**
   ```
   GET /2/users/:id/tweets
   GET /2/tweets/:id
   GET /2/tweets
   ```

3. **フォロー情報**
   ```
   GET /2/users/:id/followers
   GET /2/users/:id/following
   ```

4. **いいね情報**
   ```
   GET /2/users/:id/liked_tweets
   ```

5. **リスト情報**
   ```
   GET /2/users/:id/owned_lists
   ```

#### 取得フィールド設定
```javascript
const USER_FIELDS = [
    'id',
    'name',
    'username',
    'description',
    'profile_image_url',
    'protected',
    'verified',
    'created_at',
    'location',
    'url',
    'entities',
    'public_metrics', // followers_count, following_count, tweet_count, listed_count
    'pinned_tweet_id'
];

const TWEET_FIELDS = [
    'id',
    'text',
    'created_at',
    'author_id',
    'in_reply_to_user_id',
    'referenced_tweets',
    'attachments',
    'public_metrics', // retweet_count, reply_count, like_count, quote_count
    'entities',
    'geo',
    'lang',
    'possibly_sensitive',
    'source'
];

const MEDIA_FIELDS = [
    'media_key',
    'type',
    'url',
    'duration_ms',
    'height',
    'width',
    'preview_image_url',
    'alt_text'
];
```

---

## 🔐 セキュリティ考慮事項

### 認証・認可
- 管理画面へのアクセスは管理者のみ
- Twitter API認証情報の安全な管理
- Rate Limit対策（キャッシュシステム）

### データ保護
- 個人情報の適切な取り扱い
- GDPR/日本の個人情報保護法への対応
- データ保持期間の設定

---

## 📊 レート制限対策

### Twitter API v2 レート制限
- ユーザー情報取得: 300 リクエスト/15分（アプリ認証）
- ツイート取得: 1500 リクエスト/15分（アプリ認証）
- フォロー情報: 15 リクエスト/15分（ユーザー認証）

### 対策
1. ✅ **キャッシュシステム** (24時間) - 実装済み
2. ⏳ **バックグラウンド同期** - 定期的に更新
3. ⏳ **Webhook統合** - リアルタイム更新
4. ⏳ **レート制限モニタリング** - 残り回数を監視

---

## 🎨 UI/UX設計

### 管理画面イメージ
```
┌─────────────────────────────────────────────┐
│  X (旧Twitter) アカウント管理                │
├─────────────────────────────────────────────┤
│  [+ 新規アカウント追加]  [🔄 全件同期]      │
├─────────────────────────────────────────────┤
│  フィルタ: [すべて ▼] [有効のみ] [並び替え] │
├─────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ │
│  │ 👤 君斗りんく@クリエイター応援         │ │
│  │ @streamerfunch                         │ │
│  │ フォロワー: 1,234  フォロー: 567      │ │
│  │ 最終同期: 2分前                        │ │
│  │ [編集] [同期] [削除] [無効化]         │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 👤 君斗りんく@アイドル応援             │ │
│  │ @idolfunch                             │ │
│  │ フォロワー: 987  フォロー: 432        │ │
│  │ 最終同期: 5分前                        │ │
│  │ [編集] [同期] [削除] [無効化]         │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📝 実装優先順位

### 優先度: 高 🔴
1. ✅ 基本的なアカウント情報の取得（実装済み）
2. ⏳ データベース設計・実装
3. ⏳ 管理画面の基本機能

### 優先度: 中 🟡
4. ⏳ ツイート情報の取得
5. ⏳ 詳細プロフィール表示
6. ⏳ バックグラウンド同期

### 優先度: 低 🟢
7. ⏳ リアルタイム更新（Webhook）
8. ⏳ 高度なフィルタリング
9. ⏳ 分析・統計機能

---

## 🔄 マイグレーション計画

### Step 1: 現在の実装を維持
- `REQUIRED_ACCOUNTS`はそのまま使用可能
- 後方互換性を保つ

### Step 2: データベースへ移行
- 初回起動時に`REQUIRED_ACCOUNTS`からデータベースへ自動マイグレーション
- 以降はデータベースを優先使用

### Step 3: 管理画面リリース
- 管理画面からの設定が可能に
- `REQUIRED_ACCOUNTS`は非推奨（後方互換性のため残す）

---

## 📚 参考資料

### Twitter API v2 ドキュメント
- [User lookup](https://developer.twitter.com/en/docs/twitter-api/users/lookup/introduction)
- [Manage Tweets](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/introduction)
- [Rate limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

### 関連ファイル
- `js/script.js` - 現在の実装
- `server.js` - バックエンドAPI
- `database/schema.sql` - データベース設計
- `docs/PROGRESS.md` - 開発進捗

---

## ✅ チェックリスト

### Phase 1: 計画
- [x] 要件定義書の作成
- [ ] データベース設計の承認
- [ ] API設計の承認
- [ ] UI/UXデザインの承認

### Phase 2: 開発
- [ ] データベースマイグレーション
- [ ] バックエンドAPI実装
- [ ] 管理画面UI実装
- [ ] テスト実装

### Phase 3: デプロイ
- [ ] ステージング環境でのテスト
- [ ] 本番環境デプロイ
- [ ] ドキュメント更新

---

**最終更新**: 2025年11月20日  
**次回レビュー予定**: Phase 1完了後
