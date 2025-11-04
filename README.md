# KimiLink Voice

<div align="center">
  <img src="images/logo.png" alt="KimiLink Voice Logo" width="200"/>

  **君と繋がる、声で届ける**

  音声配信プラットフォーム with Twitter連携
</div>

## 🌟 概要

KimiLink Voiceは、クリエイターとファンをつなぐ音声配信プラットフォームです。宇宙をテーマにした美しいUIと、Twitter連携による拡散機能を備えています。

## ✨ 主な機能

### 🔐 ログインシステム
- Twitterアカウントでのソーシャルログイン
- 君斗リンクの2つのアカウント（@streamerfunch、@idolfunch）のフォローが必須
- 3ステップで簡単に参加完了

### 📊 ダッシュボード
- **プロフィール管理**: アイコン、アカウント名、フォロワー数の可視化
- **実績表示**:
  - 音声配信数
  - レビュー数
  - リーチ数
- **エンゲージメント統計**: いいね、リツイート、返信数

### 💬 レビューシステム
- Twitter連携による拡散型レビュー
- `#kimitoLinkVoice` ハッシュタグで感想を共有
- プラットフォーム内でタイムライン表示
- ワンクリックでレビューツイート

### 🎬 オプション機能
**コタのAI紀行さんコラボ (+¥30,000)**
- プロフェッショナルな動画編集
- AI技術を活用した高品質な動画制作
- SNSでの拡散サポート
- ワンクリックでコラボ依頼

### 🎨 デザイン特徴
- 🌌 宇宙をテーマにしたダークモードUI
- ✨ 美しい星空アニメーション背景
- 📱 完全レスポンシブ対応（PC・タブレット・スマホ）
- 🎯 クロスブラウザ対応
- 💫 スムーズなアニメーション効果

## 🚀 セットアップ

### 必要なもの
- Webサーバー（Apache、Nginx、など）
- モダンブラウザ（Chrome、Firefox、Safari、Edge）

### インストール手順

1. **プロジェクトのクローン**
```bash
git clone https://github.com/yourusername/kimitolink-voice.git
cd kimitolink-voice
```

2. **画像の配置**
`images/`フォルダに以下の画像を配置してください:
- `logo.png` - メインロゴ
- `icon-creator.png` - クリエイター応援アカウントのアイコン
- `icon-idol.png` - アイドル応援アカウントのアイコン
- `kota-ai-icon.png` - コタのAI紀行さんのアイコン

3. **Webサーバーで公開**
```bash
# 例: Python Simple HTTP Server
python -m http.server 8000

# または Node.js http-server
npx http-server
```

4. **ブラウザでアクセス**
```
http://localhost:8000
```

## 📁 ファイル構造

```
KimiLink Voice/
├── index.html          # メインHTMLファイル
├── styles.css          # スタイルシート（宇宙テーマ）
├── script.js           # JavaScriptロジック
├── README.md           # このファイル
└── images/            # 画像リソース
    ├── logo.png
    ├── icon-creator.png
    ├── icon-idol.png
    └── kota-ai-icon.png
```

## 🔧 カスタマイズ

### カラーテーマの変更
`styles.css`の`:root`セクションでカラー変数を編集:

```css
:root {
    --primary-color: #667eea;    /* メインカラー */
    --secondary-color: #764ba2;  /* セカンダリカラー */
    --accent-color: #f093fb;     /* アクセントカラー */
    /* ... */
}
```

### Twitter連携の設定
`script.js`でTwitterアカウント情報を編集:

```javascript
const REQUIRED_ACCOUNTS = {
    creator: {
        id: 'streamerfunch',  // あなたのアカウントID
        name: '君斗りんく@クリエイター応援'
    },
    idol: {
        id: 'idolfunch',      // あなたのアカウントID
        name: '君斗りんく@アイドル応援'
    }
};
```

### コラボ料金の変更
```javascript
const COLLABORATOR = {
    id: 'c0tanpoTeshi1a',
    name: 'コタのAI紀行',
    price: 30000  // 料金を変更
};
```

## 🔐 Twitter API連携（本番環境）

本番環境では以下の実装が必要です:

1. **Twitter Developer Portal**でアプリを登録
2. **OAuth 2.0**の設定
3. **API Keys**の取得
4. **Callback URL**の設定

### 環境変数
```.env
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
```

## 📱 レスポンシブブレークポイント

- **デスクトップ**: 1024px以上
- **タブレット**: 768px - 1023px
- **スマートフォン**: 767px以下
- **小型スマートフォン**: 480px以下

## 🎯 ブラウザサポート

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 🛠 技術スタック

- **HTML5**: セマンティックマークアップ
- **CSS3**: フレックスボックス、グリッド、アニメーション
- **JavaScript (ES6+)**: モダンな構文
- **Web APIs**: LocalStorage、Service Worker
- **Twitter API**: OAuth 2.0、タイムライン取得

## 📈 今後の機能予定

- [ ] 音声アップロード機能
- [ ] ライブストリーミング
- [ ] ダイレクトメッセージ
- [ ] 通知システム
- [ ] プッシュ通知
- [ ] PWA対応完全版
- [ ] 多言語対応
- [ ] ダークモード/ライトモード切替

## 🤝 コラボレーター

### コタのAI紀行さん
- Twitter: [@c0tanpoTeshi1a](https://twitter.com/c0tanpoTeshi1a)
- 動画制作・AI技術による高品質コンテンツ制作

### 君斗りんく
- クリエイター応援: [@streamerfunch](https://twitter.com/streamerfunch)
- アイドル応援: [@idolfunch](https://twitter.com/idolfunch)

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

## 🙏 謝辞

- デザインインスピレーション: 宇宙・星空
- ロゴデザイン: 君斗リンク
- コラボレーション: コタのAI紀行さん

## 📞 お問い合わせ

- Twitter: [@streamerfunch](https://twitter.com/streamerfunch)
- Twitter: [@idolfunch](https://twitter.com/idolfunch)
- ハッシュタグ: `#kimitoLinkVoice`

---

<div align="center">
  Made with ❤️ by KimiLink Team

  **君と繋がる、声で届ける**
</div>
---

## 📚 ドキュメント

詳細なドキュメントは `docs/` フォルダにあります：

### 📖 開発者向け

| ファイル | 内容 |
|---------|------|
| [REQUIREMENTS.md](docs/REQUIREMENTS.md) | 要件定義・技術仕様・DB設計 |
| [TODO.md](docs/TODO.md) | 開発タスク・進捗管理 |
| [SONNET-OR-OPUS.md](docs/SONNET-OR-OPUS.md) | AI使い分けガイド（重要！） |
| [DESIGN.md](docs/DESIGN.md) | デザイン仕様・スタイルガイド |
| [DECISIONS.md](docs/DECISIONS.md) | 技術的意思決定の記録 |
| [CHANGELOG.md](docs/CHANGELOG.md) | 変更履歴 |

### 🚀 運用・デプロイ

| ファイル | 内容 |
|---------|------|
| [DEPLOY.md](docs/DEPLOY.md) | デプロイ手順 |
| [PROJECT.md](docs/PROJECT.md) | プロジェクト情報 |

### 👤 ユーザー向け

| ファイル | 内容 |
|---------|------|
| [USER-GUIDE.md](docs/USER-GUIDE.md) | ユーザーガイド |
| [images-README.md](docs/images-README.md) | 画像リソースの説明 |

---

## 🤖 AI開発を始める場合

**Windsurf や Claude に引き継ぐ時:**

1. 以下のファイルを順番に読んでもらう:
```
   - README.md（このファイル）
   - docs/REQUIREMENTS.md
   - docs/TODO.md
   - docs/SONNET-OR-OPUS.md
```

2. 初回メッセージの例:
```
   こんにちは！KimiLink Voice プロジェクトを引き継ぎます。

   以下のファイルを読んで、プロジェクト全体を理解してください：
   1. README.md
   2. docs/REQUIREMENTS.md
   3. docs/TODO.md
   4. docs/SONNET-OR-OPUS.md

   読み終わったら、現在のPhaseと次のタスクを教えてください。
```

---

## 📂 プロジェクト構成
```
KimiLink Voice/
├─ README.md              # このファイル（プロジェクト概要）
├─ docs/                  # 📚 ドキュメント
│   ├─ REQUIREMENTS.md
│   ├─ TODO.md
│   ├─ SONNET-OR-OPUS.md
│   └─ ...
├─ css/                   # スタイルシート
├─ js/                    # JavaScript
│   ├─ script.js
│   └─ galaxy-effects.js
├─ images/                # 画像リソース
├─ index.html             # メインページ
├─ package.json           # Node.js設定
└─ LICENSE                # ライセンス
```

---
| [WORKFLOW.md](docs/WORKFLOW.md) | Claude と Windsurf の使い分け |