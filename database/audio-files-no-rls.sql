-- ================================================
-- audio_files テーブル RLS無効化（サーバー側制御）
-- ================================================
-- 
-- このSQLをSupabase SQL Editorで実行してください
-- https://supabase.com/dashboard/project/ljidnprwxniixrigktss/editor
--
-- ================================================

-- RLS を無効化（サーバー側で制御する場合）
ALTER TABLE audio_files DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーを全て削除
DROP POLICY IF EXISTS "Public audio files are viewable by everyone" ON audio_files;
DROP POLICY IF EXISTS "Users can view their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can insert their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can update their own audio files" ON audio_files;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON audio_files;

-- ================================================
-- 注意事項
-- ================================================
-- 
-- RLSを無効にすると、Supabaseクライアントから直接アクセスされた場合、
-- すべてのデータが見えてしまいます。
-- 
-- 安全性を確保するため：
-- ✅ SERVICE_ROLE_KEY は絶対に公開しない
-- ✅ ANON_KEY ではなく SERVICE_ROLE_KEY のみ使用
-- ✅ server.js でアクセス制御を実装（実装済み）
-- ✅ クライアント側からSupabaseに直接アクセスしない
--
-- ================================================

-- 確認
-- SELECT * FROM pg_policies WHERE tablename = 'audio_files';
-- （何も表示されなければOK）
