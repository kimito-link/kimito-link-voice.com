# 🔐 RLS（Row Level Security）設定ガイド

**最終更新**: 2025-11-20

---

## 📋 RLSとは？

**Row Level Security（行レベルセキュリティ）** は、データベーステーブルの各行に対するアクセス制御機能です。

### メリット
- ✅ データベースレベルでセキュリティを保証
- ✅ Supabase Auth と連携して自動的に本人確認
- ✅ クライアント側から直接アクセスしても安全

### デメリット
- ❌ Supabase Auth を使わないと機能しない
- ❌ Service Role Key では RLS がバイパスされる

---

## 🏗️ KimiLink Voiceの認証構成

### 現在の構成
```
ユーザー → Twitter OAuth → Express Session → Supabase (Service Role Key)
```

- **Twitter OAuth**: 認証
- **Express Session**: セッション管理
- **Supabase Service Role Key**: データベース操作（RLSバイパス）

### Supabase Auth を使う場合の構成
```
ユーザー → Supabase Auth (Twitter Provider) → JWT Token → Supabase
```

- **Supabase Auth**: 認証とセッション管理を統合
- **JWT Token**: RLS で自動的に本人確認

---

## 🎯 推奨設定：RLS無効化（サーバー側制御）

### 理由

1. **現在の認証方式との互換性**
   - Twitter OAuth → Express Session を使用中
   - Supabase Auth を使っていない
   - RLS のポリシーが機能しない

2. **Service Role Key 使用**
   - server.js で `SUPABASE_SERVICE_ROLE_KEY` を使用
   - この鍵は RLS をバイパスする（管理者権限）
   - RLS を有効にしても意味がない

3. **サーバー側で既に実装済み**
   - ✅ ログイン確認（`req.session.user`）
   - ✅ 本人確認（`user_id` フィルタリング）
   - ✅ 2段階チェック（削除処理）

### 設定方法

Supabase SQL Editor で以下を実行：

```sql
-- RLS を無効化
ALTER TABLE audio_files DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Public audio files are viewable by everyone" ON audio_files;
DROP POLICY IF EXISTS "Users can view their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can insert their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can update their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON audio_files;
```

または、`database/audio-files-no-rls.sql` を実行してください。

---

## 🔒 セキュリティ対策

RLS を無効にしても、以下の対策で安全性を確保：

### 1. Service Role Key の保護
```env
# .env ファイル（絶対に公開しない）
SUPABASE_SERVICE_ROLE_KEY=your_secret_key_here
```

- ✅ Git にコミットしない（`.gitignore` に追加済み）
- ✅ 環境変数で管理
- ✅ クライアント側に絶対に送信しない

### 2. サーバー側アクセス制御（実装済み）

**アップロード（POST /api/audio/upload）**:
```javascript
// ログイン確認
if (!req.session.user) {
    return res.status(401).json({ error: 'ログインが必要です' });
}

// セッションのユーザーIDを使用（なりすまし防止）
user_id: req.session.user.id
```

**取得（GET /api/audio/list）**:
```javascript
// 自分のデータのみ取得
.eq('user_id', req.session.user.id)
```

**削除（DELETE /api/audio/:id）**:
```javascript
// 2段階チェック
const { data: fileData } = await supabase
    .from('audio_files')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.session.user.id)  // ← 本人確認
    .single();

if (!fileData) {
    return res.status(404).json({ error: 'ファイルが見つかりません' });
}
```

### 3. クライアント側からの直接アクセス防止

- ❌ クライアント JavaScript で Supabase クライアントを使わない
- ✅ 全てのデータベース操作は server.js 経由
- ✅ API エンドポイントでアクセス制御

---

## 🔄 将来的な移行：Supabase Auth 統合（オプション）

### メリット
- RLS を有効にできる
- JWT Token で自動的に本人確認
- セッション管理が簡素化

### 実装例

**1. Supabase Auth で Twitter ログイン**:
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter',
})
```

**2. RLS ポリシー設定**:
```sql
-- 自分のデータのみアクセス可能
CREATE POLICY "Users can access their own data"
    ON audio_files
    USING (auth.uid() = user_id);
```

**3. クライアント側から直接アクセス可能**:
```javascript
// ANON_KEY を使用（RLS が自動的に適用）
const { data } = await supabase
    .from('audio_files')
    .select('*');
// ← 自動的に自分のデータのみ取得される
```

---

## 📊 現在の状態

| 項目 | 現在 | Supabase Auth 統合後 |
|------|------|---------------------|
| 認証方式 | Twitter OAuth + Express Session | Supabase Auth (Twitter) |
| セッション管理 | Express Session | Supabase Auth |
| RLS | 無効 | 有効 |
| セキュリティ | サーバー側制御 | データベース + サーバー |
| クライアント直接アクセス | 不可 | 可（安全） |

---

## 🎯 結論

### 現在の推奨設定
- **RLS無効化** (`database/audio-files-no-rls.sql`)
- サーバー側アクセス制御を継続

### 理由
- ✅ 現在の認証方式と互換性がある
- ✅ サーバー側で十分なセキュリティを実装済み
- ✅ 複雑な移行作業が不要

### 将来的に検討
- Supabase Auth への移行
- RLS の有効化
- クライアント側からの直接アクセス

---

## 🔍 確認方法

### RLS の状態確認

Supabase SQL Editor で実行：

```sql
-- テーブルの RLS 状態を確認
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'audio_files';
```

**結果**:
- `rowsecurity = false` → RLS 無効（推奨）
- `rowsecurity = true` → RLS 有効

### ポリシー確認

```sql
-- ポリシー一覧を確認
SELECT * FROM pg_policies WHERE tablename = 'audio_files';
```

**結果**:
- 何も表示されない → ポリシーなし（推奨）
- ポリシーが表示される → 削除が必要

---

## 📚 参考リンク

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

**作成者**: KimiLink Voice Team  
**作成日**: 2025年11月20日
