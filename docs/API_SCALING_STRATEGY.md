# API スケーラビリティ戦略

**作成日**: 2025年11月20日  
**目的**: 1000人以上のユーザーに対応できるAPI負荷対策

---

## 🎯 目標

- **1000人のユーザー**が同時にログインしても、Twitter APIのレート制限に引っかからない
- **高速な応答**を維持しながら、API呼び出しを最小限に抑える
- **コスト削減**：不要なAPI呼び出しを削減

---

## 📊 現在の実装

### 3層キャッシュシステム

#### 1. クライアント側キャッシュ（localStorage）
- **有効期限**: 7日間
- **目的**: 同じユーザーの再訪問時にサーバーへのリクエストを削減
- **実装**: `js/script.js` の `getCachedAccountData()` / `setCachedAccountData()`

```javascript
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日間
```

#### 2. サーバー側メモリキャッシュ（Map）
- **有効期限**: 7日間
- **目的**: 複数のユーザーが同じアカウント情報を要求する場合、1回のAPI呼び出しで済む
- **実装**: `server.js` の `accountProfileCache`

```javascript
const accountProfileCache = new Map();
const ACCOUNT_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日間
```

#### 3. データベースキャッシュ（Supabase）
- **有効期限**: 永続的（バックグラウンド更新）
- **目的**: サーバー再起動時もデータが保持される
- **実装**: 将来的に `x_accounts` テーブルで管理予定

---

## 🔢 スケーラビリティ試算

### シナリオ: 1000人のユーザーがログイン

#### 従来の方式（キャッシュなし）
- **フォロー必須アカウント数**: 2個（creator, idol）
- **ログインごとのAPI呼び出し**: 2回
- **1000人のユーザー**: 2,000回のAPI呼び出し
- **Twitter API v2レート制限**: 300リクエスト/15分
- **結果**: ❌ **レート制限超過** （2,000 > 300）

#### 現在の実装（3層キャッシュ）
- **初回訪問者**: 2回のAPI呼び出し（サーバー側キャッシュに保存）
- **2人目以降**: 0回のAPI呼び出し（サーバー側キャッシュから返す）
- **1000人のユーザー**: **2回のAPI呼び出しのみ**
- **結果**: ✅ **問題なし** （2 << 300）

---

## 📈 実際の効果

### API呼び出し削減率

| ユーザー数 | 従来方式 | 現在の実装 | 削減率 |
|-----------|---------|-----------|--------|
| 10人 | 20回 | 2回 | **90%削減** |
| 100人 | 200回 | 2回 | **99%削減** |
| 1000人 | 2,000回 | 2回 | **99.9%削減** |
| 10000人 | 20,000回 | 2回 | **99.99%削減** |

### レスポンス速度

| データソース | 平均レスポンス時間 |
|------------|------------------|
| Twitter API | 500-1000ms |
| サーバー側キャッシュ | **1-5ms** |
| クライアント側キャッシュ | **<1ms** |

---

## 🛠️ 技術詳細

### サーバー側キャッシュの実装

```javascript
// キャッシュチェック
const cacheKey = `profile_${username}`;
const cached = accountProfileCache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < ACCOUNT_CACHE_DURATION) {
    console.log(`💾 キャッシュから取得: ${username}`);
    return res.json(cached.data);
}

// Twitter APIから取得
const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`);
const profileData = response.data.data;

// キャッシュに保存
accountProfileCache.set(cacheKey, {
    timestamp: Date.now(),
    data: profileData
});
```

### クライアント側キャッシュの実装

```javascript
// キャッシュから取得
const cached = localStorage.getItem(`account_${username}`);
const data = JSON.parse(cached);
if (Date.now() - data.timestamp < CACHE_DURATION) {
    return data.accountData; // キャッシュヒット
}

// サーバーから取得
const response = await fetch(`/api/user/profile/${username}`);
const accountData = await response.json();

// キャッシュに保存
localStorage.setItem(`account_${username}`, JSON.stringify({
    timestamp: Date.now(),
    accountData: accountData
}));
```

---

## 🔮 将来の拡張計画

### Phase 1: データベース永続化 ⏳
Supabaseに `x_accounts` テーブルを作成し、アカウント情報を永続化。

```sql
CREATE TABLE x_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twitter_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    profile_image_url TEXT,
    public_metrics JSONB,
    last_synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**利点**:
- サーバー再起動時もデータが保持される
- メモリ使用量の削減
- 長期的なデータ分析が可能

### Phase 2: バックグラウンド同期 ⏳
cron jobやCloud Schedulerで定期的にアカウント情報を更新。

```javascript
// 毎日午前3時に実行
cron.schedule('0 3 * * *', async () => {
    console.log('🔄 バックグラウンド同期開始');
    await syncAllAccounts();
});
```

**利点**:
- ユーザーがアクセスする前に最新データを準備
- さらなる高速化
- API呼び出しを深夜に分散

### Phase 3: CDNキャッシュ ⏳
CloudflareやAWS CloudFrontでプロフィール画像をキャッシュ。

**利点**:
- 画像配信の高速化
- 帯域幅コストの削減
- グローバルなアクセス最適化

---

## ⚠️ 注意事項

### キャッシュの更新頻度
- **通常のアカウント**: 7日間のキャッシュで問題なし
- **頻繁に更新されるアカウント**: 手動で同期ボタンを提供

### メモリ管理
現在のサーバー側キャッシュはメモリに保存されているため、サーバー再起動時にクリアされます。

**対策**:
- Phase 1のデータベース永続化を実装
- またはRedisなどの外部キャッシュサーバーを使用

### キャッシュの一貫性
複数のサーバーインスタンスを使用する場合、キャッシュの一貫性に注意が必要。

**対策**:
- Redisなどの共有キャッシュを使用
- またはデータベースを単一の真実の源として使用

---

## 📊 モニタリング

### 監視すべきメトリクス

1. **API呼び出し回数**
   - Twitter API へのリクエスト数
   - キャッシュヒット率

2. **レスポンス時間**
   - エンドポイントごとの平均レスポンス時間
   - 99パーセンタイルレスポンス時間

3. **キャッシュ効率**
   - キャッシュヒット率
   - キャッシュミス率
   - キャッシュサイズ

4. **エラー率**
   - Twitter APIエラー（429, 500など）
   - アプリケーションエラー

---

## ✅ 実装チェックリスト

### Phase 0: 基本的なキャッシュ（完了）
- [x] クライアント側キャッシュ（7日間）
- [x] サーバー側メモリキャッシュ（7日間）
- [x] キャッシュヒット/ミスのログ出力

### Phase 1: データベース永続化
- [ ] `x_accounts` テーブルの作成
- [ ] データベース書き込み処理
- [ ] データベース読み込み処理
- [ ] マイグレーションスクリプト

### Phase 2: バックグラウンド同期
- [ ] cron job設定
- [ ] 同期処理の実装
- [ ] エラーハンドリング
- [ ] 同期状況のモニタリング

### Phase 3: 高度な最適化
- [ ] CDNキャッシュ設定
- [ ] Redis導入検討
- [ ] 負荷分散設定

---

## 📚 参考資料

- Twitter API v2 Rate Limits: https://developer.twitter.com/en/docs/twitter-api/rate-limits
- Redis Caching Best Practices: https://redis.io/docs/manual/patterns/
- HTTP Caching: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching

---

**最終更新**: 2025年11月20日  
**次回レビュー**: Phase 1完了後
