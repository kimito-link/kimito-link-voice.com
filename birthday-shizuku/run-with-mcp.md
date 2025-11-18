# 🎬 Chrome DevTools MCP で実行する方法

## 現在の状況

Chrome DevTools MCPサーバーが接続されていないため、以下の方法で実行してください。

## 方法1: 手動実行（推奨）

### ステップ1: 録画開始
```
Win + G
```

### ステップ2: Chromeで実行
1. Chromeを開く
2. F12 → Console
3. **QUICKSTART.md**のコードをコピペ
4. Enter → 全自動で実行！

---

## 方法2: MCPサーバーを再起動して実行

### 1. Chromeをデバッグモードで起動
```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222","--user-data-dir=C:\temp\chrome-debug-birthday","about:blank"
```

### 2. Windsurfを再起動
MCPサーバーが自動的に接続されます

### 3. その後、以下のコマンドで実行可能になります
（Windsurfが対応している場合）

---

## 💡 現時点での推奨方法

**QUICKSTART.md**のコードを使った**手動実行**が最も確実です！

1. 録画開始（Win+G）
2. Chrome Console でコードを実行
3. 全自動で54秒間実行される
4. 録画停止

---

これが最も簡単で確実な方法です！ 🎥✨
