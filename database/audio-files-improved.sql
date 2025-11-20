-- 音声ファイルテーブル（改善版）
-- 既存テーブルを削除して再作成する場合は、以下のコメントを外してください
-- DROP TABLE IF EXISTS audio_files CASCADE;

CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- UUIDに変更（profilesテーブルと一致）
    twitter_username VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- 'sample', 'delivered', 'profile', 'other'
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- 外部キー制約を追加（profilesテーブルとの関連）
    CONSTRAINT fk_audio_files_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE
);

-- インデックスを作成（クエリ高速化）
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON audio_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_files_category ON audio_files(category);
CREATE INDEX IF NOT EXISTS idx_audio_files_public ON audio_files(is_public) WHERE is_public = true;

-- コメントを追加
COMMENT ON TABLE audio_files IS '声優の音声ファイル管理テーブル';
COMMENT ON COLUMN audio_files.user_id IS 'Twitterユーザー ID（profilesテーブルのid）';
COMMENT ON COLUMN audio_files.category IS 'sample, delivered, profile, other';

-- Row Level Security (RLS) を有効化
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: 誰でも公開音声を閲覧可能
CREATE POLICY "Public audio files are viewable by everyone"
    ON audio_files FOR SELECT
    USING (is_public = true);

-- RLS ポリシー: 自分の音声ファイルは全て閲覧可能
CREATE POLICY "Users can view their own audio files"
    ON audio_files FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- RLS ポリシー: 自分の音声ファイルのみアップロード可能
CREATE POLICY "Users can insert their own audio files"
    ON audio_files FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

-- RLS ポリシー: 自分の音声ファイルのみ更新可能
CREATE POLICY "Users can update their own audio files"
    ON audio_files FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- RLS ポリシー: 自分の音声ファイルのみ削除可能
CREATE POLICY "Users can delete their own audio files"
    ON audio_files FOR DELETE
    USING (auth.uid()::text = user_id::text);
