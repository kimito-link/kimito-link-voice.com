# KimiLink Voice - 要件定義書

最終更新: 2025-11-04

---

## 📋 目次

1. [システム概要](#システム概要)
2. [ユーザータイプと権限](#ユーザータイプと権限)
3. [データベース設計](#データベース設計)
4. [認証システム](#認証システム)
5. [技術スタック](#技術スタック)
6. [開発フェーズ](#開発フェーズ)

---

## 🎯 システム概要

### プロジェクト名
**KimiLink Voice（キミトリンク ボイス）**

**キャッチフレーズ:** 君と繋がる、声で届ける

### プロジェクトの目的

声優・ナレーターと依頼者をマッチングする音声配信プラットフォーム。Twitter連携により、レビュー拡散とコミュニティ形成を促進する。

### ターゲットユーザー

#### 1. 依頼者（クライアント）👤
- 個人クリエイター（YouTuber、配信者、ゲーム開発者）
- 中小企業（CM制作、動画制作）
- 音声コンテンツ制作者

#### 2. 声優（ナレーター）🎤
- プロ声優
- アマチュア声優
- ナレーター
- 朗読者

#### 3. 管理者（将来）👑
- プラットフォーム運営者
- コンテンツ管理者

### 主要機能

#### 🔐 認証機能
- Twitter OAuth 2.0 ログイン
- 必須アカウントフォロー確認（@streamerfunch、@idolfunch）
- セッション管理

#### 📝 依頼管理
- 見積もりフォーム（文字数計算、オプション選択）
- 依頼作成・閲覧
- ステータス管理（進行中、完了、キャンセル）

#### 🎤 声優機能
- プロフィール編集
- 音声サンプルアップロード
- 受注管理
- 実績表示

#### ⭐ レビューシステム
- Twitter連携（#KimiLinkVoice）
- レビュータイムライン表示
- ワンクリックレビュー投稿

#### 💰 決済機能（Phase 10以降）
- 決済リンク管理（PayPay、銀行振込等）
- 売上統計

#### 🎬 コラボ機能
- コラボクリエイター表示
- コラボ依頼（Twitter DM連携）

---

## 👥 ユーザータイプと権限

### 依頼者（Client）

| 機能 | 権限 |
|------|------|
| ログイン | ✅ Twitter OAuth |
| 声優検索・閲覧 | ✅ 全て閲覧可能 |
| 見積もり作成 | ✅ 可能 |
| 依頼作成 | ✅ 可能 |
| 依頼一覧 | ✅ 自分の依頼のみ |
| レビュー投稿 | ✅ 可能 |

### 声優（Narrator）

| 機能 | 権限 |
|------|------|
| ログイン | ✅ Twitter OAuth |
| プロフィール編集 | ✅ 自分のみ |
| 音声アップロード | ✅ 可能 |
| 依頼閲覧 | ✅ 自分宛のみ |
| 依頼受諾・辞退 | ✅ 可能 |
| 決済リンク設定 | ✅ 可能 |
| 実績閲覧 | ✅ 自分のみ |

### 管理者（Admin - Phase 10以降）

| 機能 | 権限 |
|------|------|
| 全ユーザー管理 | ✅ 可能 |
| 全依頼閲覧 | ✅ 可能 |
| コンテンツ削除 | ✅ 可能 |
| 統計閲覧 | ✅ 全て |

---

## 🗄️ データベース設計

### ER図概要
```
users ──┬── narrators
        │
        └── requests ── reviews
                 │
                 └── payment_links
```

### 1. users（ユーザー基本情報）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | UUID | PRIMARY KEY | ユーザーID |
| twitter_id | VARCHAR(255) | UNIQUE, NOT NULL | Twitter ID |
| twitter_username | VARCHAR(255) | NOT NULL | Twitter @ユーザー名 |
| display_name | VARCHAR(255) | NOT NULL | 表示名 |
| avatar_url | TEXT | | プロフィール画像URL |
| user_type | ENUM | NOT NULL | 'client' or 'narrator' |
| is_following_creator | BOOLEAN | DEFAULT FALSE | @streamerfunch フォロー |
| is_following_idol | BOOLEAN | DEFAULT FALSE | @idolfunch フォロー |
| created_at | TIMESTAMP | DEFAULT NOW() | 登録日時 |
| updated_at | TIMESTAMP | | 更新日時 |

**インデックス:**
- twitter_id（UNIQUE）
- user_type

---

### 2. narrators（声優プロフィール）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | UUID | PRIMARY KEY | 声優ID |
| user_id | UUID | FOREIGN KEY → users.id | ユーザーID |
| handle | VARCHAR(100) | UNIQUE, NOT NULL | URL用ハンドル名 |
| bio | TEXT | | 自己紹介 |
| specialties | TEXT[] | | 得意ジャンル（配列） |
| voice_sample_url | TEXT | | 音声サンプルURL |
| base_price | INTEGER | | 基本料金（円） |
| price_per_100chars | INTEGER | | 100文字あたり料金 |
| express_fee | INTEGER | | 特急料金 |
| total_requests | INTEGER | DEFAULT 0 | 総依頼数 |
| average_rating | DECIMAL(3,2) | DEFAULT 0.00 | 平均評価 |
| created_at | TIMESTAMP | DEFAULT NOW() | 登録日時 |
| updated_at | TIMESTAMP | | 更新日時 |

**インデックス:**
- user_id（FOREIGN KEY）
- handle（UNIQUE）

---

### 3. requests（依頼情報）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | UUID | PRIMARY KEY | 依頼ID |
| client_id | UUID | FOREIGN KEY → users.id | 依頼者ID |
| narrator_id | UUID | FOREIGN KEY → narrators.id | 声優ID |
| title | VARCHAR(255) | NOT NULL | 依頼タイトル |
| script | TEXT | NOT NULL | 台本 |
| character_count | INTEGER | NOT NULL | 文字数 |
| style | ENUM | NOT NULL | 'script_reading' or 'cheer_voice' |
| is_express | BOOLEAN | DEFAULT FALSE | 特急対応 |
| estimated_price | INTEGER | NOT NULL | 見積もり金額 |
| status | ENUM | NOT NULL | 'pending', 'accepted', 'in_progress', 'completed', 'cancelled' |
| delivery_url | TEXT | | 納品ファイルURL |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | | 更新日時 |
| completed_at | TIMESTAMP | | 完了日時 |

**インデックス:**
- client_id
- narrator_id
- status

---

### 4. reviews（レビュー）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | UUID | PRIMARY KEY | レビューID |
| request_id | UUID | FOREIGN KEY → requests.id | 依頼ID |
| client_id | UUID | FOREIGN KEY → users.id | 依頼者ID |
| narrator_id | UUID | FOREIGN KEY → narrators.id | 声優ID |
| tweet_id | VARCHAR(255) | UNIQUE | ツイートID |
| tweet_url | TEXT | | ツイートURL |
| content | TEXT | | レビュー内容 |
| rating | INTEGER | | 評価（1-5） |
| created_at | TIMESTAMP | DEFAULT NOW() | 投稿日時 |

**インデックス:**
- request_id
- narrator_id
- tweet_id（UNIQUE）

---

### 5. payment_links（決済リンク）

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| id | UUID | PRIMARY KEY | リンクID |
| narrator_id | UUID | FOREIGN KEY → narrators.id | 声優ID |
| payment_type | ENUM | NOT NULL | 'paypay', 'bank', 'other' |
| link_url | TEXT | | リンクURL（PayPay等） |
| qr_code_url | TEXT | | QRコードURL |
| bank_name | VARCHAR(255) | | 銀行名 |
| branch_name | VARCHAR(255) | | 支店名 |
| account_type | VARCHAR(50) | | 口座種別 |
| account_number | VARCHAR(50) | | 口座番号 |
| account_holder | VARCHAR(255) | | 口座名義 |
| description | TEXT | | 備考 |
| is_active | BOOLEAN | DEFAULT TRUE | 有効フラグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | | 更新日時 |

**インデックス:**
- narrator_id

---

## 🔐 認証システム

### Twitter OAuth 2.0 フロー

```
1. ユーザー
   ↓
2. [Twitterでログイン] ボタンクリック
   ↓
3. Twitter認証画面へリダイレクト
   ↓
4. ユーザーがアプリを認証
   ↓
5. コールバックURL + 認証コード
   ↓
6. サーバーでトークン取得
   ↓
7. Twitter API でユーザー情報取得
   ↓
8. DB にユーザー登録/更新
   ↓
9. セッション作成
   ↓
10. フォロー確認モーダル表示
```

### フォロー確認プロセス

1. **必須アカウント:**
   - @streamerfunch（君斗りんく@クリエイター応援）
   - @idolfunch（君斗りんく@アイドル応援）

2. **確認方法:**
   - Twitter API: `GET /2/users/:id/following`
   - 両アカウントのフォロー状態をチェック

3. **未フォローの場合:**
   - フォロー確認モーダル表示
   - 各アカウントページへのリンク表示
   - フォロー完了まで待機

4. **フォロー完了後:**
   - プラットフォームへアクセス許可
   - ダッシュボード表示

### セッション管理

- **ストレージ:** express-session + Redis（将来）
- **有効期限:** 7日間
- **Cookie設定:**
  - HttpOnly: true
  - Secure: true（本番環境）
  - SameSite: 'lax'

---

## 🛠 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|------------|------|
| HTML5 | - | セマンティックマークアップ |
| CSS3 | - | スタイリング、アニメーション |
| JavaScript (ES6+) | - | インタラクティブ機能 |
| Noto Sans JP | - | フォント |

### 静的サイト生成（SSG）

| 技術 | バージョン | 用途 |
|------|------------|------|
| 11ty (Eleventy) | ^2.0.0 | 静的サイト生成 |
| Nunjucks | - | テンプレートエンジン |

### バックエンド

| 技術 | バージョン | 用途 |
|------|------------|------|
| Node.js | 18+ | ランタイム |
| Express | ^4.18.2 | Webサーバー |
| Passport.js | ^0.7.0 | 認証ミドルウェア |
| passport-twitter | ^1.0.4 | Twitter OAuth |

### データベース

| 技術 | バージョン | 用途 |
|------|------------|------|
| Supabase | - | PostgreSQL ホスティング |
| PostgreSQL | 14+ | リレーショナルDB |

### ストレージ

| 技術 | バージョン | 用途 |
|------|------------|------|
| Cloudinary | - | 音声・画像ストレージ |

### デプロイ

| 技術 | バージョン | 用途 |
|------|------------|------|
| Netlify / Vercel | - | 静的サイトホスティング |
| GitHub Actions | - | CI/CD |

### 開発ツール

| 技術 | バージョン | 用途 |
|------|------------|------|
| Git | - | バージョン管理 |
| GitHub | - | リポジトリホスティング |
| nodemon | ^3.0.2 | 開発サーバー |

---

## 🚀 開発フェーズ

### Phase 1: 基盤構築 ⚙️

**期間:** 1-2日

- 11ty（Eleventy）セットアップ
- ディレクトリ構成作成
- コンポーネント（header, footer等）作成
- ページテンプレート作成
- スタイル移行

### Phase 2: 認証システム 🔐

**期間:** 2-3日

- Twitter Developer アカウント登録
- OAuth 2.0 実装（Passport.js）
- ログイン/ログアウト機能
- フォロー確認モーダル
- セッション管理

### Phase 3: データベース 🗄️

**期間:** 1-2日

- Supabase セットアップ
- テーブル作成（5テーブル）
- API エンドポイント作成
- 基本的なCRUD実装

### Phase 4: 依頼者機能 📝

**期間:** 2-3日

- 見積もりフォーム実装
- 依頼作成機能
- 依頼者ダッシュボード
- 依頼一覧・詳細表示

### Phase 5: 声優機能 🎤

**期間:** 3-4日

- プロフィール編集
- 音声サンプルアップロード（Cloudinary）
- 決済リンク設定
- 受注管理ダッシュボード
- 実績表示

### Phase 6: レビュー機能 ⭐

**期間:** 2-3日

- Twitter API v2 連携
- ハッシュタグ検索（#KimiLinkVoice）
- レビュータイムライン表示
- レビュー投稿（Twitter連携）

### Phase 7: コラボ機能 🎬

**期間:** 1日

- コラボクリエイターカード
- コラボ依頼ボタン
- Twitter DM 連携

### Phase 8: 最適化 & デプロイ 🚀

**期間:** 2-3日

- 画像最適化（WebP）
- CSS/JS minify
- SEO設定（メタタグ、OGP）
- Lighthouse 最適化
- 本番デプロイ（Netlify/Vercel）

### Phase 9: 管理者機能（将来） 👑

**期間:** 未定

- 管理者ダッシュボード
- ユーザー管理
- コンテンツ管理
- 統計・分析

### Phase 10: 決済システム（将来） 💰

**期間:** 未定

- Stripe Connect 統合
- 自動決済処理
- 売上管理

---

## 📊 非機能要件

### パフォーマンス

| 指標 | 目標値 |
|------|--------|
| FCP (First Contentful Paint) | < 1.8秒 |
| LCP (Largest Contentful Paint) | < 2.5秒 |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Lighthouse Score | > 90 |

### セキュリティ

- HTTPS 強制
- HTTPセキュリティヘッダー設定
- XSS対策
- CSRF対策
- SQL Injection対策
- レート制限

### ブラウザサポート

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

### レスポンシブ対応

- デスクトップ: 1024px以上
- タブレット: 768px-1023px
- スマートフォン: 767px以下
- 小型スマホ: 480px以下

---

## 📝 補足資料

### 参照ドキュメント

- [TODO.md](TODO.md) - 詳細なタスクリスト
- [DESIGN.md](DESIGN.md) - デザイン仕様
- [PROJECT.md](PROJECT.md) - プロジェクト構成
- [SONNET-OR-OPUS.md](SONNET-OR-OPUS.md) - AI使い分けガイド

### 外部リソース

- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [11ty Documentation](https://www.11ty.dev/docs/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

<div align="center">

**KimiLink Voice - 要件定義書**

君と繋がる、声で届ける

最終更新: 2025-11-04

</div>
