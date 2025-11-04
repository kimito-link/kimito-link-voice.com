# TODO - KimiLink Voice

最終更新: 2025-11-02

---

## 🎯 現在のフェーズ

**Phase 1: 基盤構築（11tyセットアップ）**

---

## Phase 1: 基盤構築 ⚙️

### 環境セットアップ
- [ ] Node.js インストール確認 (`node -v`)
- [ ] npm インストール確認 (`npm -v`)
- [ ] package.json 作成
- [ ] 11ty インストール (`npm install @11ty/eleventy`)
- [ ] .eleventy.js 設定ファイル作成
- [ ] .gitignore 作成（node_modules, _site 除外）

### ディレクトリ構成
- [ ] src/ フォルダ作成
- [ ] src/_includes/ 作成
- [ ] src/_includes/layouts/ 作成
- [ ] src/_includes/components/ 作成
- [ ] src/assets/css/ 作成
- [ ] src/assets/js/ 作成
- [ ] src/pages/ 作成

### コンポーネント作成
- [ ] layouts/base.njk（ベースレイアウト）
- [ ] layouts/public.njk（公開ページ用）
- [ ] components/header.njk
- [ ] components/footer.njk
- [ ] components/narrator-card.njk
- [ ] components/collab-card.njk
- [ ] components/modals.njk

### ページ作成
- [ ] pages/index.njk（TOPページ）
- [ ] pages/narrators/[handle].njk（声優詳細テンプレート）

### スタイル
- [ ] 既存styles.cssを11ty用に移行
- [ ] コンポーネント別CSS整理
- [ ] レスポンシブ対応確認

### 動作確認
- [ ] `npm run dev` で開発サーバー起動
- [ ] TOPページ表示確認
- [ ] 声優カード表示確認
- [ ] ヘッダー・フッター表示確認

---

## Phase 2: 認証システム 🔐

### Twitter OAuth
- [ ] Twitter Developer アカウント作成
- [ ] アプリケーション登録
- [ ] API Key/Secret 取得
- [ ] OAuth 2.0 設定

### バックエンド
- [ ] Node.js + Express セットアップ
- [ ] Passport.js インストール
- [ ] passport-twitter 設定
- [ ] /api/auth/twitter エンドポイント作成
- [ ] /api/auth/callback エンドポイント作成
- [ ] セッション管理（express-session）

### フロントエンド
- [ ] ログインボタン実装
- [ ] ログインモーダル実装
- [ ] フォロー確認モーダル実装
- [ ] Twitter API でフォロー状態確認
- [ ] ログアウト機能

---

## Phase 3: データベース 🗄️

### Supabase セットアップ
- [ ] Supabase アカウント作成
- [ ] プロジェクト作成
- [ ] データベース作成

### テーブル作成
- [ ] users テーブル
- [ ] narrators テーブル
- [ ] requests テーブル
- [ ] reviews テーブル
- [ ] payment_links テーブル

### API作成
- [ ] Supabase JavaScript Client インストール
- [ ] ユーザー登録 API
- [ ] ユーザー取得 API
- [ ] 声優プロフィール取得 API
- [ ] 声優プロフィール更新 API

---

## Phase 4: 依頼者機能 📝

### 見積もりフォーム
- [ ] 声優詳細ページに見積もりフォーム追加
- [ ] 文字数カウント機能
- [ ] 台本読みスタイル/応援ボイス選択
- [ ] 特急対応オプション
- [ ] 見積もり金額計算

### 依頼作成
- [ ] 依頼作成フォーム
- [ ] 依頼データをDB保存
- [ ] 依頼確認メール（将来的）

### 依頼者ダッシュボード
- [ ] admin/client/index.njk 作成
- [ ] 依頼一覧表示
- [ ] 依頼詳細表示
- [ ] ステータス表示（進行中/完了）

---

## Phase 5: 声優機能 🎤

### プロフィール編集
- [ ] admin/narrator/profile.njk 作成
- [ ] プロフィール編集フォーム
- [ ] 音声サンプルアップロード（Cloudinary）
- [ ] タグ設定

### 決済リンク設定
- [ ] admin/narrator/payment.njk 作成
- [ ] PayPay QRコードアップロード
- [ ] 銀行振込情報入力
- [ ] その他リンク追加（Buy Me a Coffee等）

### 受注管理
- [ ] admin/narrator/requests.njk 作成
- [ ] 新着依頼一覧
- [ ] 依頼受諾・辞退機能
- [ ] 制作中ステータス管理
- [ ] 音声ファイルアップロード機能

### 実績表示
- [ ] admin/narrator/stats.njk 作成
- [ ] 総依頼数表示
- [ ] 平均評価表示
- [ ] 総売上表示（グラフ）

---

## Phase 6: レビュー機能 ⭐

### Twitter連携
- [ ] Twitter API v2 でハッシュタグ検索
- [ ] #KimiLinkVoice ツイート取得
- [ ] レビューとして保存

### レビュー表示
- [ ] TOPページにレビューセクション
- [ ] タイムライン形式で表示
- [ ] ツイート埋め込み

### レビュー投稿
- [ ] レビュー投稿ボタン
- [ ] Twitter投稿ダイアログ
- [ ] ハッシュタグ自動挿入

---

## Phase 7: コラボ機能 🎬

### コラボクリエイター
- [ ] コラボカード実装
- [ ] コラボ依頼ボタン
- [ ] Twitter DM 送信

### 複数クリエイター表示
- [ ] クリエイターデータ管理
- [ ] 動的にカード生成

---

## Phase 8: 最適化 & デプロイ 🚀

### パフォーマンス
- [ ] 画像最適化（WebP変換）
- [ ] CSS/JS minify
- [ ] Lazy loading 実装

### SEO
- [ ] メタタグ設定
- [ ] OGP設定
- [ ] sitemap.xml 生成
- [ ] robots.txt

### デプロイ
- [ ] Netlify / Vercel アカウント作成
- [ ] GitHub リポジトリ連携
- [ ] 環境変数設定
- [ ] 本番デプロイ
- [ ] カスタムドメイン設定

---

## Phase 9: 管理者機能（将来） 👑

- [ ] 管理者ダッシュボード
- [ ] ユーザー管理
- [ ] コンテンツ管理
- [ ] 統計・分析

---

## 🔥 今日やること

- [ ] Node.js 確認
- [ ] package.json 作成
- [ ] 11ty インストール
- [ ] ディレクトリ構成作成

---

## 📝 メモ

### 決定事項
- 11ty（静的サイト生成）を使用
- Supabase（データベース）
- Twitter OAuth（認証）
- Cloudinary（音声・画像ストレージ）

### 保留中
- 決済機能（Stripe Connect）は Phase 10以降

### 問題・課題
- （ここに実装中の問題を記録）

## Phase 6: レビュー機能 ⭐

### Twitter連携レビューシステム
- [ ] Twitter API v2 でハッシュタグ検索
- [ ] `#KimitoLinkvoice` + `@声優名` で検索
- [ ] ツイートをiframe埋め込みで表示
- [ ] 声優詳細ページにレビュー一覧表示
- [ ] 自動更新（定期的にAPI取得）

### 表示イメージ
```
┌─────────────────────────────┐
│ 佐藤みお @kimitolink        │
├─────────────────────────────┤
│                             │
│ 【レビュー】                │
│                             │
│ [ツイート1 - iframe埋め込み]│
│ [ツイート2 - iframe埋め込み]│
│ [ツイート3 - iframe埋め込み]│
│                             │
│ ※ハッシュタグ #KimitoLinkvoice │
│   とメンション @佐藤みお で   │
│   自動的に収集              │
└─────────────────────────────┘
```

### 技術詳細
- Twitter API v2 Recent Search
- oEmbed API でiframe取得
- 1時間ごとに自動更新（cron）
