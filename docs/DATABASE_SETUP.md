# 🗄️ KimiLink Voice データベースセットアップガイド

**最終更新**: 2025-11-18

---

## 📋 概要

KimiLink VoiceはSupabase（PostgreSQL）をデータベースとして使用します。
このガイドでは、データベースのセットアップ状況確認と実装方法を説明します。

---

## ✅ 環境変数設定済み

`.env`ファイルに以下の設定が完了しています：

```env
SUPABASE_URL=https://ljidnprwxniixrigktss.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔍 データベース状態の確認方法

### 方法1: Supabaseダッシュボードで確認

1. **Supabaseダッシュボードにアクセス**
   ```
   https://supabase.com/dashboard
   ```

2. **プロジェクトを選択**
   - プロジェクトID: `ljidnprwxniixrigktss`

3. **Table Editorを開く**
   - 左サイドバーから「Table Editor」をクリック
   - 作成済みのテーブル一覧が表示されます

### 方法2: テストスクリプトで確認

```bash
node test-supabase.js
```

このスクリプトは以下のテーブルの存在をチェックします：
- ✅ `users` - ユーザー基本情報
- ✅ `narrators` - 声優プロフィール
- ✅ `requests` - 依頼情報
- ✅ `reviews` - レビュー
- ✅ `payment_links` - 決済リンク

---

## 🏗️ テーブル構造

### 1. users（ユーザー基本情報）

| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | UUID | ユーザーID（主キー）|
| twitter_id | VARCHAR(255) | Twitter ID（ユニーク）|
| twitter_username | VARCHAR(255) | Twitter @ユーザー名 |
| display_name | VARCHAR(255) | 表示名 |
| avatar_url | TEXT | プロフィール画像URL |
| user_type | ENUM | 'client', 'narrator', 'admin' |
| is_following_creator | BOOLEAN | @streamerfunch フォロー |
| is_following_idol | BOOLEAN | @idolfunch フォロー |
| created_at | TIMESTAMP | 登録日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

### 2. narrators（声優プロフィール）

| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | UUID | 声優ID（主キー）|
| user_id | UUID | ユーザーID（外部キー）|
| handle | VARCHAR(100) | URL用ハンドル名 |
| bio | TEXT | 自己紹介 |
| specialties | TEXT[] | 得意ジャンル（配列）|
| voice_sample_url | TEXT | 音声サンプルURL |
| base_price | INTEGER | 基本料金（円）|
| price_per_100chars | INTEGER | 100文字料金 |
| express_fee | INTEGER | 特急料金 |
| total_requests | INTEGER | 総依頼数 |
| average_rating | DECIMAL(3,2) | 平均評価 |

---

### 3. requests（依頼情報）

| カラム名 | 型 | 説明 |
|----------|-----|------|
| id | UUID | 依頼ID（主キー）|
| client_id | UUID | 依頼者ID（外部キー）|
| narrator_id | UUID | 声優ID（外部キー）|
| title | VARCHAR(255) | 依頼タイトル |
| script | TEXT | 台本 |
| character_count | INTEGER | 文字数 |
| style | ENUM | 'script_reading', 'cheer_voice' |
| is_express | BOOLEAN | 特急対応 |
| estimated_price | INTEGER | 見積もり金額 |
| status | ENUM | 'pending', 'accepted', 'in_progress', 'completed', 'cancelled' |
| delivery_url | TEXT | 納品URL |

---

## 🛠️ データベース操作

### 作成済みファイル

```
database/
├── schema.sql              # データベーススキーマ定義
├── supabase-client.js      # Supabaseクライアント初期化
└── users.js                # ユーザー操作関数
```

### 使用方法

#### ユーザーの作成・更新

```javascript
const { upsertUser } = require('./database/users');

// Twitter認証後にユーザー情報を保存
const user = await upsertUser({
    twitter_id: userData.id,
    twitter_username: userData.username,
    display_name: userData.name,
    avatar_url: userData.profile_image_url,
    user_type: 'client',
    is_following_creator: true,
    is_following_idol: true
});
```

#### ユーザーの取得

```javascript
const { getUserByTwitterId } = require('./database/users');

// Twitter IDでユーザーを取得
const user = await getUserByTwitterId('1234567890');
```

---

## 🔧 テーブルが存在しない場合

### Supabase SQL Editorで実行

1. **Supabaseダッシュボードにログイン**
   ```
   https://supabase.com/dashboard
   ```

2. **SQL Editorを開く**
   - 左サイドバー → 「SQL Editor」

3. **スキーマを実行**
   - `database/schema.sql` の内容をコピー
   - SQL Editorに貼り付け
   - 「Run」ボタンをクリック

これで全テーブルが作成されます。

---

## 🔐 Row Level Security (RLS)

データベースはRLS（行レベルセキュリティ）が有効化されています。

### ポリシー概要

**users:**
- 自分の情報のみ閲覧・更新可能

**narrators:**
- 全員が閲覧可能
- 自分のプロフィールのみ更新可能

**requests:**
- 関係者（依頼者または声優）のみアクセス可能

**reviews:**
- 全員が閲覧可能

**payment_links:**
- 自分の決済リンクのみアクセス可能

---

## 📊 データベース統合済み機能

### 実装済み

- ✅ Supabaseクライアント初期化
- ✅ ユーザー作成・更新（upsert）
- ✅ ユーザー取得（Twitter ID / UUID）
- ✅ フォロー状態更新
- ✅ ユーザータイプ更新

### 未実装（次のステップ）

- [ ] Twitter認証後の自動ユーザー登録
- [ ] 声優プロフィール操作
- [ ] 依頼管理
- [ ] レビュー機能
- [ ] 決済リンク管理

---

## 🚀 次のステップ

### 1. server.jsにデータベース統合

Twitter認証コールバック処理でSupabaseにユーザー情報を保存：

```javascript
// server.js の /auth/twitter/callback 内
const { upsertUser } = require('./database/users');

// ユーザー情報取得後
const dbUser = await upsertUser({
    twitter_id: userData.id,
    twitter_username: userData.username,
    display_name: userData.name,
    avatar_url: userData.profile_image_url,
    is_following_creator: followStatus.creator,
    is_following_idol: followStatus.idol
});

// DBのUUIDをセッションに保存
req.session.user.dbId = dbUser.id;
```

### 2. 声優プロフィール機能実装

`database/narrators.js` を作成して声優関連の操作を実装。

### 3. 依頼管理機能実装

`database/requests.js` を作成して依頼関連の操作を実装。

---

## 🧪 テスト方法

### 1. データベース接続確認

```bash
node test-supabase.js
```

### 2. ユーザー作成テスト

```javascript
const { upsertUser } = require('./database/users');

upsertUser({
    twitter_id: '1234567890',
    twitter_username: 'test_user',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg'
}).then(user => {
    console.log('✅ ユーザー作成成功:', user);
}).catch(error => {
    console.error('❌ エラー:', error.message);
});
```

---

## 📝 チェックリスト

### データベースセットアップ
- [x] Supabase環境変数設定
- [ ] テーブル作成確認（Supabaseダッシュボード）
- [ ] RLS ポリシー確認
- [ ] テストスクリプト実行

### コード統合
- [x] Supabaseクライアント作成
- [x] ユーザー操作関数作成
- [ ] server.jsに統合
- [ ] 認証フローとDB連携
- [ ] エラーハンドリング

---

## 🐛 トラブルシューティング

### エラー: "relation does not exist"
**原因**: テーブルが作成されていない
**解決策**: `database/schema.sql` を Supabase SQL Editor で実行

### エラー: "new row violates row-level security policy"
**原因**: RLS ポリシーがアクセスを拒否
**解決策**: Service Role Key を使用するか、ポリシーを確認

### 接続エラー
**原因**: 環境変数の設定ミス
**解決策**: `.env` ファイルの `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を確認

---

## 📚 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**作成者**: KimiLink Voice Team  
**作成日**: 2025年11月18日
