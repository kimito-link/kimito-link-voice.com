# Chrome DevTools MCP セットアップガイド

## 概要
Chrome DevTools MCPを使用すると、AIがブラウザのDevToolsに接続してパフォーマンス測定やデバッグを自動で行えます。

## インストール済みの内容

### 1. MCPサーバー
- **パッケージ**: `@getollie/chrome-devtools-mcp@0.6.2`
- **インストール場所**: グローバル

### 2. 設定ファイル
- **場所**: `.windsurf/mcp_config.json`
- **サーバー名**: `chrome-devtools`

## 使用方法

### 1. サーバーを起動
```bash
npm start
```
サーバーが `http://localhost:3000` で起動します。

### 2. Chromeでデバッグモードを有効化
Chromeを以下のフラグで起動してリモートデバッグを有効にします：

**Windows:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

**または、新しいユーザープロファイルで起動:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:\temp\chrome-debug
```

### 3. アプリケーションにアクセス
デバッグモードで起動したChromeで以下にアクセス：
```
http://localhost:3000
```

### 4. MCPサーバーに接続
Windsurf IDEでMCPサーバーが自動的に利用可能になります。

## Chrome DevTools MCPでできること

### 🎯 パフォーマンス測定
- ページロード時間の測定
- レンダリング性能の分析
- ネットワークリクエストの監視
- メモリ使用量の追跡

### 🐛 デバッグ
- コンソールエラーの自動検出
- ネットワークエラーの特定
- CORS問題の診断
- JavaScriptエラーのトレース

### 🎭 ユーザー操作シミュレーション
- ボタンクリックのシミュレーション
- フォーム入力のテスト
- レイアウト崩れの検証
- DOM/CSS要素の検査

### 📊 パフォーマンストレース
- 最大コンテンツ描画時間（LCP）の測定
- First Contentful Paint (FCP)の測定
- Time to Interactive (TTI)の測定
- パフォーマンスボトルネックの特定

## トラブルシューティング

### MCPサーバーが見つからない
1. Windsurf IDEを再起動
2. MCP設定が正しく読み込まれているか確認

### Chromeに接続できない
1. Chromeがリモートデバッグモードで起動しているか確認
2. ポート9222が他のプロセスで使用されていないか確認
3. ファイアウォールの設定を確認

### パフォーマンステストが実行できない
1. アプリケーションが正しく起動しているか確認
2. ブラウザでページが正常に表示されるか確認
3. コンソールでエラーが出ていないか確認

## 参考情報
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Lighthouse Performance Metrics](https://web.dev/lighthouse-performance/)

## 次のステップ
1. サーバーを起動して基本的なパフォーマンステストを実行
2. 特定のユーザー操作フローをシミュレーション
3. パフォーマンスボトルネックを特定して最適化
