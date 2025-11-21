# KimiLink Voice レスポンシブデザイン＆クロスプラットフォーム対応ガイドライン

## 📱 基本方針

**すべての機能・コンポーネントは最初からレスポンシブ対応必須**

- モバイルファースト設計
- 280px（折りたたみスマホ）〜 4K（3840px）まで完全対応
- タッチ操作とマウス操作の両方を考慮
- 縦横両方向（Portrait/Landscape）に対応
- すべてのブラウザで同一のUX

---

## 🎯 ブレークポイント

### 標準ブレークポイント（8段階）

| デバイス | 幅 | 対象デバイス例 |
|---------|---|--------------|
| **超小型** | ≤280px | Galaxy Fold 5（折りたたみ） |
| **極小** | 281-360px | iPhone SE, Galaxy S8+ |
| **小型** | 361-400px | iPhone 12 mini, Pixel 7 |
| **標準スマホ** | 401-480px | iPhone 12 Pro, iPhone 14 Pro Max |
| **大型スマホ/小型タブレット** | 481-768px | iPad Mini, Galaxy S20 Ultra |
| **標準タブレット** | 769-1024px | iPad Air, iPad Pro |
| **Surface/小型PC** | 1025-1366px | Surface Pro 7, Surface Duo |
| **PC/大型ディスプレイ** | ≥1367px | デスクトップ、4K |

### メディアクエリの記述順

```css
/* デスクトップファースト（基本スタイル） */
.component {
    /* PC向けスタイル */
}

/* タブレット以下 */
@media (max-width: 1024px) {
    /* タブレット向け調整 */
}

/* スマホ以下 */
@media (max-width: 768px) {
    /* スマホ向け調整 */
}

/* 小型スマホ以下 */
@media (max-width: 480px) {
    /* 小型スマホ向け調整 */
}
```

---

## 🌐 クロスブラウザ対応

### 対応ブラウザ

| ブラウザ | バージョン | 優先度 |
|---------|----------|-------|
| **Chrome** | 最新版 + 2バージョン | 最高 |
| **Safari** | 最新版 + 2バージョン | 最高 |
| **Firefox** | 最新版 + 2バージョン | 高 |
| **Edge** | 最新版 + 2バージョン | 高 |
| **iOS Safari** | iOS 14+ | 最高 |
| **Android Chrome** | Android 10+ | 最高 |

### ベンダープレフィックス必須プロパティ

```css
/* スクロールバー非表示 */
.element {
    -ms-overflow-style: none;  /* IE/Edge */
    scrollbar-width: none;     /* Firefox */
}
.element::-webkit-scrollbar {
    display: none;             /* Chrome/Safari */
}

/* バックドロップフィルター */
.element {
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
}

/* トランスフォーム */
.element {
    -webkit-transform: translateY(-2px);
    transform: translateY(-2px);
}

/* トランジション */
.element {
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
}
```

---

## 📱 クロスデバイス対応

### iOS（iPhone/iPad）

#### 必須対応

1. **タップハイライトの除去**
```css
* {
    -webkit-tap-highlight-color: transparent;
}
```

2. **スムーズスクロール**
```css
.scrollable {
    -webkit-overflow-scrolling: touch;
}
```

3. **フォントサイズの自動調整防止**
```css
input, textarea {
    font-size: 16px; /* 16px未満だとズームされる */
}
```

4. **Safe Area対応**
```css
.header {
    padding-top: env(safe-area-inset-top);
}
```

#### テスト必須デバイス
- iPhone SE（最小画面）
- iPhone 14 Pro（標準）
- iPhone 14 Pro Max（最大）
- iPad Mini
- iPad Air

---

### Android

#### 必須対応

1. **Material Design準拠のタップ効果**
```css
button:active {
    transform: scale(0.98);
}
```

2. **高DPI対応**
```css
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    /* 高解像度画像 */
}
```

3. **フォントレンダリング**
```css
* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
```

#### テスト必須デバイス
- Pixel 7（標準Android）
- Galaxy S20 Ultra（大画面）
- Galaxy Fold 5（折りたたみ）

---

### Windows（Surface/PC）

#### 必須対応

1. **タッチとマウスの両対応**
```css
/* タッチデバイス */
@media (pointer: coarse) {
    .button {
        min-height: 44px; /* タップしやすいサイズ */
    }
}

/* マウスデバイス */
@media (pointer: fine) {
    .button:hover {
        /* ホバー効果 */
    }
}
```

2. **スクロールバーのカスタマイズ**
```css
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-thumb {
    background: rgba(79, 172, 254, 0.5);
    border-radius: 4px;
}
```

#### テスト必須デバイス
- Surface Pro 7
- Surface Duo
- 標準デスクトップ（1920x1080）
- 4Kディスプレイ（3840x2160）

---

## 🎨 レスポンシブデザインのベストプラクティス

### 1. フレキシブルレイアウト

#### グリッドシステム
```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

/* スマホ */
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
}
```

#### フレックスボックス
```css
.flex-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

/* スマホ */
@media (max-width: 768px) {
    .flex-container {
        flex-direction: column;
    }
}
```

---

### 2. 可変フォントサイズ

```css
/* 基本 */
body {
    font-size: 16px;
}

h1 {
    font-size: 2.5rem; /* 40px */
}

/* タブレット */
@media (max-width: 1024px) {
    h1 {
        font-size: 2rem; /* 32px */
    }
}

/* スマホ */
@media (max-width: 768px) {
    h1 {
        font-size: 1.75rem; /* 28px */
    }
}

/* 小型スマホ */
@media (max-width: 480px) {
    h1 {
        font-size: 1.5rem; /* 24px */
    }
}
```

---

### 3. レスポンシブ画像

```html
<!-- WebP + フォールバック -->
<picture>
    <source srcset="image.webp" type="image/webp">
    <img src="image.png" alt="説明" loading="lazy">
</picture>

<!-- レスポンシブ画像 -->
<img srcset="image-320w.jpg 320w,
             image-640w.jpg 640w,
             image-1280w.jpg 1280w"
     sizes="(max-width: 768px) 100vw,
            (max-width: 1024px) 50vw,
            33vw"
     src="image-640w.jpg" alt="説明">
```

---

### 4. タッチ対応

#### 最小タップエリア
```css
/* iOS Human Interface Guidelines: 44x44px */
/* Material Design: 48x48px */

.touch-target {
    min-width: 44px;
    min-height: 44px;
    padding: 12px;
}
```

#### タップ効果
```css
.button:active {
    transform: scale(0.98);
    opacity: 0.8;
}
```

---

### 5. ナビゲーション

#### ハンバーガーメニュー（768px以下）
```css
/* デスクトップ */
.main-nav {
    display: flex;
}

.hamburger {
    display: none;
}

/* スマホ */
@media (max-width: 768px) {
    .main-nav {
        display: none;
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        height: 100vh;
        transition: right 0.3s ease;
    }
    
    .main-nav.active {
        right: 0;
    }
    
    .hamburger {
        display: block;
    }
}
```

#### タブナビゲーション（横スクロール）
```css
.tabs {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
    display: none;
}

.tab {
    flex-shrink: 0;
    white-space: nowrap;
}
```

---

## ✅ 新機能実装チェックリスト

### 開発前
- [ ] モバイルファーストで設計
- [ ] 全ブレークポイントでのレイアウト確認
- [ ] タッチ操作を考慮

### 実装中
- [ ] メディアクエリを記述（768px, 480px必須）
- [ ] ベンダープレフィックスを追加
- [ ] タップエリアは44px以上
- [ ] フォントサイズは可変

### 実装後
- [ ] Chrome DevTools レスポンシブモードでテスト
- [ ] iPhone（Safari）で実機テスト
- [ ] Android（Chrome）で実機テスト
- [ ] iPad（Safari）で実機テスト
- [ ] Surface（Edge）でテスト
- [ ] 横向きでテスト
- [ ] スクロール動作確認
- [ ] タップ操作確認

---

## 🛠️ テストツール

### ブラウザDevTools
- **Chrome DevTools**: デバイスツールバー（Ctrl+Shift+M）
- **Firefox DevTools**: レスポンシブデザインモード（Ctrl+Shift+M）
- **Safari DevTools**: レスポンシブデザインモード

### 実機テスト
- **BrowserStack**: クラウド実機テスト
- **LambdaTest**: クロスブラウザテスト
- **実機**: 最低限 iPhone, Android, iPad, PC

---

## 🚫 避けるべきこと

### ❌ NG例

```css
/* 固定幅 */
.container {
    width: 1200px; /* NG */
}

/* 固定フォントサイズ */
h1 {
    font-size: 40px; /* NG */
}

/* ベンダープレフィックスなし */
.element {
    backdrop-filter: blur(20px); /* NG */
}

/* タップエリアが小さい */
.button {
    padding: 5px; /* NG */
}
```

### ✅ OK例

```css
/* 可変幅 */
.container {
    max-width: 1200px;
    width: 100%;
    padding: 0 20px;
}

/* 相対フォントサイズ */
h1 {
    font-size: 2.5rem;
}

/* ベンダープレフィックスあり */
.element {
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
}

/* タップエリアが十分 */
.button {
    min-height: 44px;
    padding: 12px 24px;
}
```

---

## 📝 実装例

### ダッシュボード

```css
/* デスクトップ */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

/* タブレット */
@media (max-width: 1024px) {
    .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }
}

/* スマホ */
@media (max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 15px;
    }
}
```

### モーダル

```css
/* デスクトップ */
.modal-content {
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
}

/* スマホ */
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        max-height: 85vh;
    }
}

/* 小型スマホ */
@media (max-width: 480px) {
    .modal-content {
        width: 100%;
        max-height: 82vh;
    }
}
```

### ボタン

```css
.btn {
    padding: 12px 24px;
    font-size: 1rem;
    min-height: 44px;
    transition: all 0.3s ease;
}

/* タッチデバイス */
@media (pointer: coarse) {
    .btn {
        min-height: 48px;
        padding: 14px 28px;
    }
}

/* クリック効果 */
.btn:active {
    transform: scale(0.98);
}
```

---

## 🎯 パフォーマンス最適化

### 1. 画像最適化
- WebP形式を使用
- レスポンシブ画像（srcset）
- Lazy Loading（loading="lazy"）

### 2. CSSの最適化
- Critical CSSのインライン化
- 使用していないCSSの削除
- メディアクエリの最適化

### 3. JavaScriptの最適化
- デバウンス・スロットル
- Intersection Observer API
- 遅延読み込み

---

## 📚 参考資料

- [MDN: Responsive Design](https://developer.mozilla.org/ja/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google: Mobile-First Indexing](https://developers.google.com/search/mobile-sites/mobile-first-indexing)
- [Apple: iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design: Layout](https://material.io/design/layout/understanding-layout.html)

---

## 更新履歴

- **2025-11-21**: 初版作成
  - 8段階ブレークポイント定義
  - クロスブラウザ対応ガイドライン
  - クロスデバイス対応ガイドライン
  - 実装チェックリスト
