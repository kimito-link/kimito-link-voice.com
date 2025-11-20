# 🎵 音声ファイルアップロード機能セットアップガイド

**最終更新**: 2025-11-20

---

## 📋 概要

KimiLink Voiceの音声ファイルアップロード機能の実装状況と、必要な修正・設定について説明します。

---

## ✅ 実装済みの機能

### 1. データベーステーブル
- ✅ `audio_files` テーブル作成済み（Supabase SQL Editor）
- ✅ インデックス設定済み（user_id, created_at, category）
- ✅ コメント追加済み

### 2. APIエンドポイント（server.js）
| エンドポイント | メソッド | 機能 | 実装状況 |
|--------------|---------|------|----------|
| `/api/audio/upload` | POST | 音声ファイルアップロード | ✅ |
| `/api/audio/list` | GET | 音声ファイル一覧取得 | ✅ |
| `/api/audio/:id` | DELETE | 音声ファイル削除 | ✅ |

### 3. ファイルアップロード設定
- ✅ Multer設定済み
- ✅ ファイルサイズ制限: 50MB
- ✅ 対応形式: MP3, WAV, OGG, M4A
- ✅ ローカルストレージ: `uploads/audio/`

---

## ⚠️ 修正が必要な項目

### 1. user_idの型の統一

**現在の問題**:
- データベース: `user_id VARCHAR(255)` ← Twitter ID（文字列）
- 推奨: `user_id UUID` ← profilesテーブルのid（UUID）

**理由**:
- profilesテーブルとの外部キー制約を設定するため
- データの整合性を保つため

**修正方法**:

#### オプションA: テーブル構造を変更（推奨）

```sql
-- 既存データをバックアップ後、テーブルを再作成
DROP TABLE IF EXISTS audio_files CASCADE;

-- 改善版のSQLを実行
-- database/audio-files-improved.sql を参照
```

#### オプションB: 現在の構造を維持

```javascript
// server.jsで Twitter ID を使い続ける
// user_id: req.session.user.twitterId
```

### 2. Supabase Storage統合（オプション）

**現在**: ローカルファイルシステム（`uploads/audio/`）に保存
**推奨**: Supabase Storageに保存

**メリット**:
- スケーラブル（サーバー再起動でもファイルが残る）
- CDN配信で高速アクセス
- バックアップと復旧が簡単

**実装例**:

```javascript
// server.jsに追加
const { createAudioFile } = require('./database/audio-files');

app.post('/api/audio/upload', upload.single('audio'), async (req, res) => {
    try {
        // ローカルファイルをSupabase Storageにアップロード
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileName = `${req.session.user.dbId}/${Date.now()}-${req.file.originalname}`;
        
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('audio-files')
            .upload(fileName, fileBuffer, {
                contentType: req.file.mimetype
            });
        
        if (uploadError) throw uploadError;
        
        // 公開URLを取得
        const { data: urlData } = supabase
            .storage
            .from('audio-files')
            .getPublicUrl(fileName);
        
        // データベースに保存
        const audioData = await createAudioFile({
            user_id: req.session.user.dbId,
            twitter_username: req.session.user.username,
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            file_url: urlData.publicUrl,
            file_name: req.file.originalname,
            file_size: req.file.size,
            is_public: req.body.is_public === 'true'
        });
        
        // ローカルファイルを削除
        fs.unlinkSync(req.file.path);
        
        res.json({ success: true, data: audioData });
    } catch (error) {
        console.error('❌ アップロードエラー:', error);
        res.status(500).json({ error: error.message });
    }
});
```

### 3. セッション管理の修正

**現在の問題**:
- `req.session.user.id` が Twitter ID（文字列）
- データベースでは UUID が必要

**修正方法**:

```javascript
// server.js の OAuth コールバックで
req.session.user = {
    id: userData.id,              // Twitter ID（文字列）
    dbId: dbProfile.id,            // Supabase UUID ← 追加
    username: userData.username,
    name: userData.name,
    profile_image_url: userData.profile_image_url
};
```

---

## 🔐 Row Level Security (RLS) 設定

### Supabase Storage バケット作成

1. **Supabaseダッシュボードにアクセス**
   ```
   https://supabase.com/dashboard/project/ljidnprwxniixrigktss
   ```

2. **Storage → Create a new bucket**
   - Bucket name: `audio-files`
   - Public bucket: ✅ チェック（公開音声の場合）

3. **RLS ポリシー設定**

```sql
-- 公開音声は誰でも閲覧可能
CREATE POLICY "Public audio files are viewable by everyone"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = 'public');

-- 自分の音声ファイルのみアップロード可能
CREATE POLICY "Users can upload their own audio files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 自分の音声ファイルのみ削除可能
CREATE POLICY "Users can delete their own audio files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🧪 テスト方法

### 1. テーブル構造確認

```bash
node check-audio-table.js
```

### 2. アップロード機能テスト

```bash
# サーバー起動
npm start

# ブラウザで http://localhost:3000 にアクセス
# ログイン後、音声アップロードフォームを使用
```

### 3. curlでテスト

```bash
curl -X POST http://localhost:3000/api/audio/upload \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -F "audio=@sample.mp3" \
  -F "title=テスト音声" \
  -F "category=sample" \
  -F "description=テスト用" \
  -F "is_public=true"
```

---

## 📝 次のステップ

### 優先度: 高
1. ✅ audio_filesテーブルの作成確認
   ```bash
   node check-audio-table.js
   ```

2. ⏳ user_idの型を確認・修正
   - VARCHAR → UUID への変更
   - または現在の構造を維持

3. ⏳ セッション管理の修正
   - `req.session.user.dbId` の追加

### 優先度: 中
4. ⏳ Supabase Storage統合
   - バケット作成
   - アップロード処理の変更

5. ⏳ RLS ポリシー設定
   - テーブルとStorageのポリシー

### 優先度: 低
6. ⏳ フロントエンド実装
   - アップロードフォーム
   - ファイルリスト表示
   - 再生プレーヤー

---

## 🐛 トラブルシューティング

### エラー: "relation does not exist"
**原因**: テーブルが作成されていない
**解決策**: Supabase SQL Editorで `database/audio-files-improved.sql` を実行

### エラー: "violates foreign key constraint"
**原因**: user_idがprofilesテーブルに存在しない
**解決策**: 
- profilesテーブルにユーザーが存在することを確認
- user_idに正しいUUIDを使用

### エラー: "File too large"
**原因**: ファイルサイズが50MBを超えている
**解決策**: ファイルサイズを確認、または`server.js`の制限を変更

---

## 📚 参考リンク

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**作成者**: KimiLink Voice Team  
**作成日**: 2025年11月20日
