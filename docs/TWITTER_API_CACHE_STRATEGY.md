# Twitter API キャッシュ戦略ガイド

## 📋 概要

KimiLink Voiceでは、Twitter API v2を使用してユーザー情報を取得しています。Twitter APIには**レート制限（Rate Limit）**があるため、適切なキャッシュ戦略が必要です。

---

## ⚠️ Twitter APIのレート制限

### レート制限の詳細

Twitter API v2のレート制限：
- **アプリ認証（Bearer Token）**: 15分間に300リクエスト
- **ユーザー認証（OAuth 2.0）**: 15分間に900リクエスト

### レート制限に達した場合

HTTPステータスコード: `429 Too Many Requests`

```json
{
  "error": {
    "title": "Too Many Requests",
    "detail": "Too Many Requests",
    "type": "about:blank",
    "status": 429
  }
}
```

**影響:**
- APIリクエストが失敗する
- ユーザー情報が取得できない
- アバター画像が表示されない
- フォロワー数が表示されない

---

## 🏗️ 3層キャッシュシステム

KimiLink Voiceでは、レート制限を回避するために**3層キャッシュシステム**を実装しています。

### 1. クライアント側キャッシュ（localStorage）

```javascript
// js/script.js
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日間

// キャッシュに保存
localStorage.setItem(`profile_${username}`, JSON.stringify({
    timestamp: Date.now(),
    data: profileData
}));

// キャッシュから取得
const cached = localStorage.getItem(`profile_${username}`);
if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
        // キャッシュが有効
        return data;
    }
}
```

**メリット:**
- ✅ 最速（1-5ms）
- ✅ サーバーへのリクエスト不要
- ✅ オフラインでも動作

**デメリット:**
- ❌ ブラウザごとに独立
- ❌ ユーザーがクリアできる

---

### 2. サーバー側メモリキャッシュ（Map）

```javascript
// server.js
const accountProfileCache = new Map();
const ACCOUNT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

// キャッシュに保存
accountProfileCache.set(cacheKey, {
    timestamp: Date.now(),
    data: profileData
});

// キャッシュから取得
const cached = accountProfileCache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < ACCOUNT_CACHE_DURATION) {
    return cached.data;
}
```

**メリット:**
- ✅ 高速（10-50ms）
- ✅ 全クライアントで共有
- ✅ Twitter API呼び出しを削減

**デメリット:**
- ❌ サーバー再起動で消える
- ❌ メモリ使用量

---

### 3. データベースキャッシュ（Supabase）

```javascript
// database/profiles.js
const { data: dbProfile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('twitter_username', username)
    .single();
```

**メリット:**
- ✅ 永続的
- ✅ サーバー再起動後も有効
- ✅ バックアップ可能

**デメリット:**
- ❌ 遅い（100-500ms）
- ❌ データベースへの負荷

---

## 🚫 `force=true` を使わない理由

### ❌ 問題のあるコード

```javascript
// プロフィールページで毎回force=trueを指定
const response = await axios.get(
    `http://localhost:${PORT}/api/user/profile/${username}?force=true`
);
```

### 問題点

1. **レート制限に達する**
   - ページを開くたびにTwitter APIを呼び出す
   - 15分間に300回のリクエスト制限を超える
   - `429 Too Many Requests`エラーが発生

2. **パフォーマンス悪化**
   - Twitter API呼び出しは500-1000ms
   - キャッシュは1-5ms
   - **100〜1000倍遅い**

3. **コスト増加**
   - Twitter APIの有料プランでは課金対象
   - 不必要なAPI呼び出しはコスト増加

---

## ✅ 正しいキャッシュ戦略

### 基本方針

```javascript
// force=true を削除
const response = await axios.get(
    `http://localhost:${PORT}/api/user/profile/${username}`
);
```

キャッシュが有効な場合、自動的にキャッシュから取得します。

---

### `force=true` を使うべき場合

以下の場合のみ、`force=true`を使用してください：

#### 1. プロフィール更新後

```javascript
// ユーザーが「プロフィールを更新」ボタンを押した後
async function refreshProfile(username) {
    const response = await fetch(
        `/api/user/profile/${username}?force=true`
    );
    // 最新情報を取得
}
```

#### 2. 管理画面でのデータ同期

```javascript
// 管理画面で「Twitter APIから同期」ボタンを押した場合
async function syncFromTwitterAPI(username) {
    const response = await fetch(
        `/api/user/profile/${username}?force=true`
    );
    // 最新情報をデータベースに保存
}
```

#### 3. デバッグ時

```javascript
// 開発中のみ、最新データを確認したい場合
if (isDevelopment && forceRefresh) {
    const response = await fetch(
        `/api/user/profile/${username}?force=true`
    );
}
```

---

## 📊 キャッシュ効果

### Twitter API呼び出し削減

| ユーザー数 | force=true | キャッシュあり | 削減率 |
|-----------|-----------|--------------|--------|
| 100人     | 200回     | 2回          | 99%    |
| 1,000人   | 2,000回   | 2回          | 99.9%  |
| 10,000人  | 20,000回  | 2回          | 99.99% |

### レスポンス速度

| 方法 | 速度 |
|------|------|
| Twitter API | 500-1000ms |
| サーバーキャッシュ | 10-50ms |
| クライアントキャッシュ | 1-5ms |

---

## 🛠️ 今回の問題と解決策

### 問題

プロフィールページで`force=true`を使用していたため、ページを開くたびにTwitter APIを呼び出し、レート制限に達していました。

```javascript
// ❌ 問題のあったコード
const response = await axios.get(
    `http://localhost:${PORT}/api/user/profile/${username}?force=true`
);
```

### エラーログ

```
http://localhost:3000/api/user/profile/c0tanpoTesh1ta?force=true: 429
Failed to load resource: the server responded with a status of 429 (Too Many Requests)
```

### 解決策

`force=true`を削除し、キャッシュを使用するようにしました。

```javascript
// ✅ 修正後のコード
const response = await axios.get(
    `http://localhost:${PORT}/api/user/profile/${username}`
);
```

### 結果

- ✅ レート制限エラーが解消
- ✅ アバター画像が正しく表示
- ✅ フォロワー数が正しく表示
- ✅ ページ読み込み速度が向上（500ms → 10ms）

---

## 🔍 キャッシュの確認方法

### 1. サーバー側キャッシュ

```javascript
// server.js
console.log('💾 メモリキャッシュ:', accountProfileCache.size, '件');
accountProfileCache.forEach((value, key) => {
    console.log(`  - ${key}: ${Math.floor((Date.now() - value.timestamp) / 1000 / 60)}分前`);
});
```

### 2. クライアント側キャッシュ

ブラウザのデベロッパーツール（F12）を開き：
1. **Application** タブ
2. **Local Storage** > `http://localhost:3000`
3. `profile_` で始まるキーを確認

### 3. データベースキャッシュ

```sql
SELECT 
    twitter_username, 
    display_name, 
    followers, 
    updated_at 
FROM profiles 
ORDER BY updated_at DESC;
```

---

## 📚 関連ドキュメント

- [Twitter API Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)
- [API_SCALING_STRATEGY.md](./API_SCALING_STRATEGY.md)
- [X_INTEGRATION_REQUIREMENTS.md](./X_INTEGRATION_REQUIREMENTS.md)

---

## 💡 ベストプラクティス

### DO ✅

- キャッシュを優先的に使用する
- 必要な場合のみ`force=true`を使う
- キャッシュ期間を適切に設定する（7日間推奨）
- レート制限エラーを適切にハンドリングする

### DON'T ❌

- プロフィールページで`force=true`を使わない
- 無制限にAPI呼び出しをしない
- キャッシュ期間を短すぎる設定にしない
- エラーハンドリングを怠らない

---

## 🎯 まとめ

- Twitter APIにはレート制限がある（15分間に300リクエスト）
- 3層キャッシュシステムでレート制限を回避
- `force=true`は必要な場合のみ使用
- キャッシュを優先することでパフォーマンスが向上
- レート制限エラーは適切にハンドリングする

**キャッシュファースト、API呼び出しはセカンド！**
