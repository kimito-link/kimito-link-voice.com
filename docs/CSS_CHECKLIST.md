# CSS実装チェックリスト

## 🎯 目的

CSSを書く時・変更する時に**絶対にチェックすべき項目**をまとめたクイックリファレンス

---

## ✅ 実装前チェック

### 色の選択

- [ ] **テキスト色は #333 以上の濃さ**（白背景の場合）
- [ ] **#666 は使わない**（薄すぎて見えない可能性）
- [ ] **コントラスト比を確認**（https://webaim.org/resources/contrastchecker/）

### レイアウト

- [ ] **親要素の背景色を確認**
- [ ] **子要素すべてのテキスト色を確認**
- [ ] **ホバー時の色も確認**

---

## ✅ 実装後チェック

### ブラウザ確認

- [ ] **Chrome**で表示確認
- [ ] **Firefox**で表示確認
- [ ] **Edge**で表示確認

### デバイス確認

- [ ] **PC**（1920x1080）
- [ ] **タブレット**（768px）
- [ ] **スマホ**（375px）

### 実機確認

- [ ] **実際のブラウザ**で開いて確認
- [ ] **Ctrl + Shift + R**で強制リフレッシュ
- [ ] **スクリーンショットを撮って確認**

---

## 🚨 絶対NGリスト

### これを使ったら即アウト

```css
/* ❌ 薄すぎる */
color: #999;
color: #aaa;
color: #ccc;

/* ❌ 暗い背景に暗いテキスト */
background: #0a0e27;
color: #333;

/* ❌ 透明度が高すぎる */
opacity: 0.3;
color: rgba(0, 0, 0, 0.3);
```

---

## ✅ 安全な色の組み合わせ

### 白い背景

```css
background: #FFFFFF;

/* ✅ これらは安全 */
color: #1a1a1a;  /* 最も濃い - メインテキスト */
color: #333;     /* 濃い - セカンダリテキスト */
color: #555;     /* やや濃い - サブテキスト */
```

### 暗い背景

```css
background: #0a0e27;

/* ✅ これらは安全 */
color: #FFFFFF;  /* 白 - メインテキスト */
color: #E0E0E0;  /* 明るいグレー - セカンダリ */
color: #B0B0B0;  /* グレー - サブテキスト */
```

### グラデーション背景

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* ✅ 白文字 + 影 */
color: #FFFFFF;
text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
font-weight: 600;
```

---

## 💡 すぐに使えるテンプレート

### カード

```css
.card {
    background: #FFFFFF;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.card-title {
    color: #1a1a1a;
    font-size: 1.3rem;
    font-weight: 700;
}

.card-text {
    color: #333;
    font-size: 1rem;
    line-height: 1.8;
}

.card-label {
    color: #555;
    font-size: 0.9rem;
    font-weight: 600;
}
```

### ボタン

```css
.btn-primary {
    background: linear-gradient(135deg, #4FC3F7 0%, #26C6DA 100%);
    color: #FFFFFF;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #26C6DA 0%, #00ACC1 100%);
    transform: translateY(-2px);
}
```

### 統計情報

```css
.stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;  /* ✅ 濃い黒 */
}

.stat-label {
    font-size: 0.85rem;
    color: #333;      /* ✅ 濃いグレー */
    font-weight: 600; /* ✅ 太字 */
}
```

---

## 🔧 よくある修正パターン

### パターン1: テキストが薄い

```css
/* ❌ 修正前 */
.text {
    color: #666;
}

/* ✅ 修正後 */
.text {
    color: #333;
    font-weight: 600;
}
```

### パターン2: ボタンのテキストが見えない

```css
/* ❌ 修正前 */
.button {
    background: #4FC3F7;
    color: #E0E0E0;
}

/* ✅ 修正後 */
.button {
    background: #4FC3F7;
    color: #FFFFFF;
    font-weight: 600;
}
```

### パターン3: グラデーション背景でテキストが見えない

```css
/* ❌ 修正前 */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #E0E0E0;
}

/* ✅ 修正後 */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #FFFFFF;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
```

---

## 📱 レスポンシブ確認手順

1. **Chromeデベロッパーツール**を開く（F12）
2. **デバイスツールバー**をオン（Ctrl + Shift + M）
3. 以下のサイズで確認：
   - 375px（iPhone）
   - 768px（iPad）
   - 1024px（タブレット横）
   - 1920px（PC）

---

## 🎨 色を変更する時の手順

1. **親要素の背景色を確認**
2. **コントラスト比チェッカーで確認**
   - https://webaim.org/resources/contrastchecker/
3. **実際のブラウザで確認**
4. **スマホ・タブレット・PCすべてで確認**
5. **スクリーンショットを撮って記録**

---

## 🚀 今すぐ修正が必要な色

プロジェクト内でこれらの色を見つけたら即修正：

```css
/* 🚨 即修正 */
color: #666;  /* → #333 に変更 */
color: #999;  /* → #555 または #333 に変更 */
color: #aaa;  /* → #555 に変更 */
color: #ccc;  /* → 使用中止 */

/* 🚨 暗い背景の場合 */
background: #0a0e27;
color: #333;  /* → #FFFFFF または #E0E0E0 に変更 */
```

---

**このチェックリストを毎回確認すれば、色の問題は100%防げます！**
