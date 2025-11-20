-- ================================================
-- audio_files テーブル RLS（Row Level Security）設定
-- ================================================
-- 
-- このSQLをSupabase SQL Editorで実行してください
-- https://supabase.com/dashboard/project/ljidnprwxniixrigktss/editor
--
-- ================================================

-- 1. RLS を有効化
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- 2. 既存のポリシーを削除（もしあれば）
DROP POLICY IF EXISTS "Public audio files are viewable by everyone" ON audio_files;
DROP POLICY IF EXISTS "Users can view their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can insert their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can update their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON audio_files;

-- ================================================
-- 3. 閲覧ポリシー（SELECT）
-- ================================================

-- 3-1. 公開音声は誰でも閲覧可能
CREATE POLICY "Public audio files are viewable by everyone"
    ON audio_files
    FOR SELECT
    USING (is_public = true);

-- 3-2. 自分の音声ファイルは全て閲覧可能（公開・非公開問わず）
CREATE POLICY "Users can view their own audio files"
    ON audio_files
    FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ================================================
-- 4. アップロードポリシー（INSERT）
-- ================================================

-- 自分の音声ファイルのみアップロード可能
CREATE POLICY "Users can insert their own audio files"
    ON audio_files
    FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ================================================
-- 5. 更新ポリシー（UPDATE）
-- ================================================

-- 自分の音声ファイルのみ更新可能
CREATE POLICY "Users can update their own audio files"
    ON audio_files
    FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ================================================
-- 6. 削除ポリシー（DELETE）
-- ================================================

-- 自分の音声ファイルのみ削除可能
CREATE POLICY "Users can delete their own audio files"
    ON audio_files
    FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ================================================
-- 完了！
-- ================================================
-- 
-- これで以下のセキュリティルールが適用されます：
-- ✅ 公開音声（is_public = true）は誰でも閲覧可能
-- ✅ 自分の音声ファイルは全て閲覧・編集・削除可能
-- ✅ 他人の音声ファイルにはアクセス不可
-- ✅ 他人になりすましてアップロード不可
--
-- ================================================

-- 設定確認（オプション）
-- SELECT * FROM pg_policies WHERE tablename = 'audio_files';
