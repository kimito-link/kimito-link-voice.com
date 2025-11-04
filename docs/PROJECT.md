# KimiLink Voice - プロジェクト構成

## 📂 ディレクトリ構造

```
KimiLink Voice/
│
├── 📄 index.html              # メインHTMLファイル
├── 🎨 styles.css              # スタイルシート
├── ⚡ script.js               # JavaScriptロジック
├── 🔧 service-worker.js       # PWA Service Worker
├── 📱 manifest.json           # PWAマニフェスト
│
├── 📚 ドキュメント
│   ├── README.md              # プロジェクト概要
│   ├── USER-GUIDE.md          # 使い方ガイド
│   ├── DEPLOY.md              # デプロイガイド
│   ├── LICENSE                # ライセンス
│   └── PROJECT.md             # このファイル
│
├── 🖼️ images/                 # 画像リソース
│   ├── logo.png               # メインロゴ
│   ├── icon-creator.png       # クリエイター応援アイコン
│   ├── icon-idol.png          # アイドル応援アイコン
│   ├── kota-ai-icon.png       # コタのAI紀行アイコン
│   └── README.md              # 画像についての説明
│
└── 🔐 設定ファイル
    └── .env.example           # 環境変数サンプル
```

## 📋 ファイル説明

### コアファイル

#### index.html
- **目的**: アプリケーションのメイン構造
- **主要セクション**:
  - ログインモーダル
  - フォロー確認モーダル
  - メインプラットフォーム（ダッシュボード、レビュー、実績、オプション）
  - ヘッダー・フッター
- **依存関係**: styles.css, script.js

#### styles.css
- **目的**: UIスタイルとアニメーション
- **特徴**:
  - 宇宙テーマのデザイン
  - レスポンシブ対応
  - カスタムアニメーション（星空背景）
  - カラーバリエーション
  - 4つのブレークポイント
- **主要セクション**:
  - 基本設定（CSS変数）
  - 宇宙背景アニメーション
  - モーダル
  - カード
  - ボタン
  - レスポンシブ
- **行数**: 約1,000行

#### script.js
- **目的**: アプリケーションロジックとインタラクション
- **主要機能**:
  - Twitter認証処理
  - フォロー状態確認
  - ダッシュボード管理
  - Twitter API連携
  - レビューシステム
  - 統計データ表示
- **行数**: 約500行

#### service-worker.js
- **目的**: PWA対応、オフライン機能
- **機能**:
  - キャッシュ管理
  - オフラインサポート
  - プッシュ通知
- **行数**: 約150行

#### manifest.json
- **目的**: PWAメタデータ
- **内容**:
  - アプリ名・説明
  - アイコン設定
  - テーマカラー
  - 表示モード

### ドキュメント

#### README.md
- プロジェクト概要
- 主な機能説明
- セットアップ手順
- カスタマイズ方法
- 技術スタック
- ライセンス情報

#### USER-GUIDE.md
- ユーザー向け使い方ガイド
- ステップバイステップの手順
- よくある質問（FAQ）
- トラブルシューティング

#### DEPLOY.md
- デプロイ方法の詳細ガイド
- 各種ホスティングサービスの設定
- セキュリティ設定
- CI/CD設定

#### LICENSE
- MITライセンス
- 第三者ライセンス情報
- 商標に関する注意事項

### 設定ファイル

#### .env.example
- 環境変数のサンプル
- Twitter API設定
- アプリケーション設定
- データベース設定（将来用）
- セキュリティ設定

## 🔧 技術仕様

### フロントエンド

| 項目 | 詳細 |
|------|------|
| HTML | HTML5、セマンティックマークアップ |
| CSS | CSS3、フレックスボックス、グリッド、アニメーション |
| JavaScript | ES6+、モジュール、async/await |
| フォント | Noto Sans JP (Google Fonts) |

### ブラウザサポート

| ブラウザ | 最小バージョン |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

### レスポンシブデザイン

| デバイス | ブレークポイント |
|----------|------------------|
| デスクトップ | 1024px以上 |
| タブレット | 768px - 1023px |
| スマートフォン | 767px以下 |
| 小型スマホ | 480px以下 |

## 🎨 デザインシステム

### カラーパレット

```css
--primary-color: #667eea;     /* メインブルー */
--secondary-color: #764ba2;   /* パープル */
--accent-color: #f093fb;      /* ピンク */
--success-color: #4ade80;     /* グリーン */
--warning-color: #fbbf24;     /* イエロー */
--danger-color: #f87171;      /* レッド */

--bg-dark: #0a0e27;           /* ダークブルー */
--bg-darker: #050810;         /* より暗いブルー */
--card-bg: rgba(20, 25, 50, 0.8);  /* カード背景 */
```

### タイポグラフィ

```css
フォントファミリー: 'Noto Sans JP', sans-serif
基本サイズ: 16px
行の高さ: 1.6

見出しサイズ:
- h1: 2.5rem (40px)
- h2: 2rem (32px)
- h3: 1.5rem (24px)
```

### スペーシング

```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
```

## 🔌 API連携

### Twitter API

#### 使用エンドポイント

1. **OAuth 2.0 認証**
   - `POST /oauth2/token`
   - `GET /2/users/me`

2. **フォロー状態確認**
   - `GET /2/users/:id/following`

3. **ツイート取得**
   - `GET /2/tweets/search/recent`
   - クエリ: `#kimitoLinkVoice`

4. **ユーザー情報**
   - `GET /2/users/:id`

#### レート制限

| エンドポイント | 制限 |
|----------------|------|
| ユーザー認証 | 75リクエスト/15分 |
| フォロー確認 | 15リクエスト/15分 |
| ツイート検索 | 180リクエスト/15分 |

## 📊 データフロー

### 1. ログインフロー
```
ユーザー → Twitterログイン → OAuth認証 → トークン取得 
→ ユーザー情報取得 → LocalStorage保存 → フォロー確認
```

### 2. フォロー確認フロー
```
ユーザー → フォロー状態リクエスト → Twitter API 
→ フォロー状態取得 → UI更新 → プラットフォームへ
```

### 3. レビュー投稿フロー
```
ユーザー → レビューボタン → Twitter投稿画面 
→ ツイート送信 → タイムライン更新 → プラットフォームに反映
```

### 4. コラボ依頼フロー
```
ユーザー → コラボボタン → 確認ダイアログ → Twitter投稿 
→ メンション送信 → コタのAI紀行さんへ通知
```

## 🔐 セキュリティ

### 実装済み

- ✅ HTTPS強制（本番環境）
- ✅ HTTPセキュリティヘッダー
- ✅ XSS対策
- ✅ CSRF対策（OAuth）
- ✅ セッション管理

### 推奨設定

```nginx
# セキュリティヘッダー
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'";
```

## 🚀 パフォーマンス

### 最適化施策

1. **画像最適化**
   - 適切なサイズにリサイズ
   - WebP形式を使用
   - Lazy loading

2. **CSS/JS最適化**
   - ミニファイ
   - Gzip圧縮
   - CDN活用

3. **キャッシュ戦略**
   - Service Workerによるキャッシュ
   - ブラウザキャッシュ（1年）
   - CDNキャッシュ

4. **読み込み最適化**
   - クリティカルCSS
   - JSの非同期読み込み
   - フォントの最適化

### 目標指標

| 指標 | 目標値 |
|------|--------|
| FCP（First Contentful Paint） | < 1.8秒 |
| LCP（Largest Contentful Paint） | < 2.5秒 |
| FID（First Input Delay） | < 100ms |
| CLS（Cumulative Layout Shift） | < 0.1 |
| Lighthouse Score | > 90 |

## 📈 将来の拡張計画

### フェーズ1（短期）
- [ ] 音声アップロード機能
- [ ] ユーザープロフィール編集
- [ ] 通知システム
- [ ] 検索機能強化

### フェーズ2（中期）
- [ ] ライブストリーミング
- [ ] ダイレクトメッセージ
- [ ] プレミアム機能
- [ ] モバイルアプリ

### フェーズ3（長期）
- [ ] AI音声解析
- [ ] 多言語対応
- [ ] コラボ機能の自動化
- [ ] アナリティクス強化

## 🤝 コントリビューション

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/kimitolink-voice.git
cd kimitolink-voice

# 環境変数を設定
cp .env.example .env
# .envファイルを編集

# ローカルサーバーを起動
python -m http.server 8000
# または
npx http-server
```

### コントリビューションガイドライン

1. **Issueを作成**
   - バグ報告
   - 機能リクエスト
   - ドキュメント改善

2. **Pull Requestを作成**
   - フォーク
   - ブランチ作成
   - コード変更
   - テスト
   - PR作成

3. **コードスタイル**
   - インデント: 4スペース
   - 命名規則: camelCase（JS）、kebab-case（CSS）
   - コメント: 必要に応じて日本語

## 📞 サポート

### 連絡先

- **Twitter**: [@streamerfunch](https://twitter.com/streamerfunch)
- **Twitter**: [@idolfunch](https://twitter.com/idolfunch)
- **GitHub Issues**: [リンク]
- **ハッシュタグ**: `#kimitoLinkVoice`

### サポート時間

- 平日: 10:00 - 18:00 (JST)
- 土日祝: 対応なし（緊急時を除く）

---

<div align="center">

**KimiLink Voice Project**

君と繋がる、声で届ける

Made with ❤️ by KimiLink Team

</div>
