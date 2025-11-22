# 🎵 音声サンプルファイル準備ガイド

## 📁 ディレクトリ構造

```
uploads/
└── samples/
    ├── streamerfunch/
    │   ├── intro.mp3          # 自己紹介音声（1分程度）
    │   ├── portfolio1.mp3     # ポートフォリオ音声1
    │   ├── portfolio2.mp3     # ポートフォリオ音声2
    │   ├── portfolio3.mp3     # ポートフォリオ音声3
    │   └── thanks.mp3         # 「ありがとう！」短い音声
    │
    ├── idolfunch/
    │   ├── intro.mp3
    │   ├── portfolio1.mp3
    │   ├── portfolio2.mp3
    │   └── thanks.mp3
    │
    └── c0tanpoTesh1ta/
        ├── intro.mp3
        ├── portfolio1.mp3
        ├── portfolio2.mp3
        └── thanks.mp3
```

---

## 🎤 音声ファイルの種類

### 1. **intro.mp3** - 自己紹介音声（必須）

**長さ**: 1分程度  
**内容例**:

```
こんにちは！君斗りんくです。
私はこんな声ができます。

【アニメ風の可愛い声】
「おはよう！今日も頑張ってね！」

【大人の女性の声】
「いらっしゃいませ。こちらへどうぞ。」

【少年のような声】
「よーし！冒険に出発だ！」

【その他】
虫の鳴き声や、動物の鳴き声まで対応できます。

よろしくお願いします！
```

### 2. **portfolio1.mp3, portfolio2.mp3, portfolio3.mp3** - ポートフォリオ音声

**長さ**: 30秒〜1分  
**内容**: 実際の依頼作品のサンプル、デモ音声など

### 3. **thanks.mp3** - ボタン押下時の短い音声（オプション）

**長さ**: 1〜3秒  
**内容例**:
- 「ありがとう！」
- 「よろしくね！」
- 「感謝です！」

---

## 📝 音声ファイルの仕様

### 推奨フォーマット
- **形式**: MP3
- **ビットレート**: 128kbps〜320kbps
- **サンプルレート**: 44.1kHz
- **チャンネル**: モノラルまたはステレオ

### ファイルサイズ
- **intro.mp3**: 1〜3MB（1分程度）
- **portfolio音声**: 500KB〜2MB（30秒〜1分）
- **thanks.mp3**: 50KB〜200KB（1〜3秒）

---

## 🚀 実装済み機能

### TOPページ（声優カード）

#### ボタン構成
```
┌─────────────────────────┐
│   [🎵 自己紹介を聞く]   │ ← intro.mp3を再生
│   [🐦 フォロー]         │ ← Twitterフォロー + thanks.mp3
│   [📝 依頼する]         │ ← thanks.mp3 + プロフィールページへ
└─────────────────────────┘
```

#### 音声再生の流れ

1. **「自己紹介を聞く」ボタン**
   - `intro.mp3` を再生
   - 既に他の音声が再生中の場合は停止
   - トースト通知で「自己紹介音声を再生しています」と表示

2. **「フォロー」ボタン**
   - `thanks.mp3` を再生（0.5秒後にTwitterへ遷移）
   - 音声ファイルがない場合はエラー表示なし

3. **「依頼する」ボタン**
   - `thanks.mp3` を再生
   - 0.5秒後にプロフィールページへ遷移

### プロフィールページ

#### ポートフォリオ音声セクション
```html
<section class="profile-section">
    <h2>サンプルボイス</h2>
    <audio controls>
        <source src="/uploads/samples/streamerfunch/intro.mp3">
    </audio>
    <audio controls>
        <source src="/uploads/samples/streamerfunch/portfolio1.mp3">
    </audio>
    <audio controls>
        <source src="/uploads/samples/streamerfunch/portfolio2.mp3">
    </audio>
</section>
```

---

## 🎬 実装例

### JavaScript（script.js）

```javascript
/**
 * 自己紹介音声を再生
 */
function playIntroVoice(username, event) {
    if (event) event.stopPropagation();
    const audioPath = `/uploads/samples/${username}/intro.mp3`;
    const audio = new Audio(audioPath);
    audio.play();
}

/**
 * 「ありがとう！」音声を再生
 */
function playThanksVoice(username, event) {
    if (event) event.stopPropagation();
    const audioPath = `/uploads/samples/${username}/thanks.mp3`;
    const audio = new Audio(audioPath);
    audio.play();
}
```

### HTML（index.html）

```html
<div class="narrator-actions">
    <!-- 自己紹介を聞く -->
    <button onclick="playIntroVoice('streamerfunch', event)">
        <i class="fas fa-play"></i> 自己紹介を聞く
    </button>
    
    <!-- フォロー -->
    <a href="https://twitter.com/streamerfunch" 
       onclick="playThanksVoice('streamerfunch', event)">
        <i class="fab fa-twitter"></i> フォロー
    </a>
    
    <!-- 依頼する -->
    <button onclick="playThanksVoice('streamerfunch', event); 
                     setTimeout(() => location.href='/streamerfunch/profile/', 500)">
        <i class="fas fa-paper-plane"></i> 依頼する
    </button>
</div>
```

---

## 📋 音声ファイル準備チェックリスト

### 各声優ごとに準備

- [ ] `intro.mp3` - 自己紹介音声（1分程度）
- [ ] `portfolio1.mp3` - ポートフォリオ音声1
- [ ] `portfolio2.mp3` - ポートフォリオ音声2
- [ ] `portfolio3.mp3` - ポートフォリオ音声3（オプション）
- [ ] `thanks.mp3` - 短い音声（オプション）

### ディレクトリ作成

```bash
# uploadsディレクトリがない場合は作成
mkdir -p uploads/samples/streamerfunch
mkdir -p uploads/samples/idolfunch
mkdir -p uploads/samples/c0tanpoTesh1ta
```

### ファイル配置

```bash
# 音声ファイルを配置
cp intro.mp3 uploads/samples/streamerfunch/
cp portfolio1.mp3 uploads/samples/streamerfunch/
cp thanks.mp3 uploads/samples/streamerfunch/
```

---

## 🎯 将来の拡張

### Phase 2: 管理画面からアップロード
- ダッシュボードから音声ファイルをアップロード
- プレビュー機能
- ファイル管理（追加・削除・並び替え）

### Phase 3: 複数のサンプル音声
- カテゴリー別サンプル（アニメ、ナレーション、歌など）
- タグ付け機能
- 検索機能

---

## 🐛 トラブルシューティング

### 音声が再生されない

**原因1**: ファイルパスが間違っている
```javascript
// 正しい
/uploads/samples/streamerfunch/intro.mp3

// 間違い
/uploads/sample/streamerfunch/intro.mp3  // samplesではなくsample
```

**原因2**: ファイル形式が対応していない
- MP3, WAV, OGG, M4Aが推奨

**原因3**: ファイルサイズが大きすぎる
- 10MB以下を推奨

### ボタンを押しても何も起きない

**確認1**: コンソールでエラーを確認
```
F12 → Console タブ
```

**確認2**: ファイルが存在するか確認
```bash
ls uploads/samples/streamerfunch/
```

---

## 📞 サポート

音声ファイルの準備で困ったことがあれば、開発チームまでお問い合わせください。

---

**作成日**: 2025/11/22  
**最終更新**: 2025/11/22
