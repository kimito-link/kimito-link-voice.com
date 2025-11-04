# 画像リソースについて

このフォルダには、KimiLink Voiceプラットフォームで使用する画像を配置してください。

## 必要な画像ファイル

### 1. logo.png
- **用途**: メインロゴ
- **推奨サイズ**: 512x512px (最小: 256x256px)
- **形式**: PNG (透過背景推奨)
- **場所**: 
  - ヘッダーロゴ
  - ログイン画面
  - フッター
  - PWAアイコン

### 2. icon-creator.png
- **用途**: 君斗りんく@クリエイター応援のアイコン
- **アカウント**: @streamerfunch
- **推奨サイズ**: 200x200px
- **形式**: PNG または JPG
- **場所**:
  - フォロー確認画面
  - フォロー状態カード

### 3. icon-idol.png
- **用途**: 君斗りんく@アイドル応援のアイコン
- **アカウント**: @idolfunch
- **推奨サイズ**: 200x200px
- **形式**: PNG または JPG
- **場所**:
  - フォロー確認画面
  - フォロー状態カード

### 4. kota-ai-icon.png
- **用途**: コタのAI紀行さんのアイコン
- **アカウント**: @c0tanpoTeshi1a
- **推奨サイズ**: 200x200px
- **形式**: PNG または JPG
- **場所**:
  - コラボカード

## 画像の取得方法

### Twitterアイコンのダウンロード手順

1. **Twitterプロフィールにアクセス**
   ```
   https://twitter.com/[アカウント名]
   ```

2. **アイコンを右クリックして保存**
   - Chrome: 「画像を保存」
   - Firefox: 「画像を名前を付けて保存」
   - Safari: 「画像を"ダウンロード"に保存」

3. **または、高解像度版を取得**
   - アイコンのURLを開く
   - URLの末尾の `_normal` を `_400x400` に変更
   - 例: `https://pbs.twimg.com/profile_images/.../xxx_normal.jpg`
   - →   `https://pbs.twimg.com/profile_images/.../xxx_400x400.jpg`

### ロゴの作成

君斗リンクのロゴについては、アップロードされたPDFガイドライン
「logo_guide_kimitolink_ol.pdf」を参照してください。

## 画像の最適化

### 推奨ツール
- **TinyPNG**: https://tinypng.com/ (PNG圧縮)
- **Squoosh**: https://squoosh.app/ (Google製、全形式対応)
- **ImageOptim**: https://imageoptim.com/ (Mac用)

### 最適化のポイント
- PNGは透過が必要ない場合JPGに変換
- 品質は80-90%で十分
- レスポンシブ対応のため、適切なサイズにリサイズ

## プレースホルダー画像

画像が用意できない場合、以下のサービスで一時的な画像を使用できます：

```html
<!-- ロゴ用 -->
<img src="https://via.placeholder.com/512x512/667eea/ffffff?text=KimiLink" alt="Logo">

<!-- アイコン用 -->
<img src="https://via.placeholder.com/200x200/764ba2/ffffff?text=Icon" alt="Icon">
```

## ファイル命名規則

- 小文字とハイフンを使用
- スペースは使わない
- 日本語ファイル名は避ける

✅ 良い例: `logo.png`, `icon-creator.png`
❌ 悪い例: `Logo.PNG`, `アイコン クリエイター.jpg`

## ディレクトリ構造

```
images/
├── logo.png              # メインロゴ
├── icon-creator.png      # クリエイター応援アイコン
├── icon-idol.png         # アイドル応援アイコン
├── kota-ai-icon.png      # コタのAI紀行アイコン
└── README.md            # このファイル
```

## 著作権について

- 使用する画像は適切な権利を持っていることを確認してください
- TwitterアイコンはTwitterの利用規約に従って使用してください
- ロゴは君斗リンクのブランドガイドラインに従ってください

## お問い合わせ

画像に関する質問は以下までお願いします：
- Twitter: @streamerfunch
- Twitter: @idolfunch
