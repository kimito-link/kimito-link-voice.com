-- KimiLink Voice データベーススキーマ
-- Supabase SQL Editor で実行してください
-- 作成日: 2025-11-18

-- ===== ENUM型の定義 =====

-- ユーザータイプ
CREATE TYPE user_type_enum AS ENUM ('client', 'narrator', 'admin');

-- 依頼スタイル
CREATE TYPE request_style_enum AS ENUM ('script_reading', 'cheer_voice');

-- 依頼ステータス
CREATE TYPE request_status_enum AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- 決済タイプ
CREATE TYPE payment_type_enum AS ENUM ('paypay', 'bank', 'other');

-- ===== テーブル作成 =====

-- 1. users（ユーザー基本情報）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twitter_id VARCHAR(255) UNIQUE NOT NULL,
    twitter_username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    user_type user_type_enum NOT NULL DEFAULT 'client',
    is_following_creator BOOLEAN DEFAULT FALSE,
    is_following_idol BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_twitter_id ON users(twitter_id);
CREATE INDEX idx_users_user_type ON users(user_type);

-- コメント
COMMENT ON TABLE users IS 'ユーザー基本情報';
COMMENT ON COLUMN users.twitter_id IS 'Twitter ID（数値）';
COMMENT ON COLUMN users.twitter_username IS 'Twitter @ユーザー名';
COMMENT ON COLUMN users.user_type IS 'ユーザータイプ: client（依頼者）, narrator（声優）, admin（管理者）';

-- ===== 2. narrators（声優プロフィール） =====
CREATE TABLE IF NOT EXISTS narrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handle VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    specialties TEXT[],
    voice_sample_url TEXT,
    base_price INTEGER,
    price_per_100chars INTEGER,
    express_fee INTEGER,
    total_requests INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_narrators_user_id ON narrators(user_id);
CREATE INDEX idx_narrators_handle ON narrators(handle);

-- コメント
COMMENT ON TABLE narrators IS '声優プロフィール情報';
COMMENT ON COLUMN narrators.handle IS 'URL用のユニークなハンドル名';
COMMENT ON COLUMN narrators.specialties IS '得意ジャンル（配列）';
COMMENT ON COLUMN narrators.base_price IS '基本料金（円）';
COMMENT ON COLUMN narrators.price_per_100chars IS '100文字あたりの料金（円）';

-- ===== 3. requests（依頼情報） =====
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    narrator_id UUID NOT NULL REFERENCES narrators(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    script TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    style request_style_enum NOT NULL,
    is_express BOOLEAN DEFAULT FALSE,
    estimated_price INTEGER NOT NULL,
    status request_status_enum NOT NULL DEFAULT 'pending',
    delivery_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_narrator_id ON requests(narrator_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);

-- コメント
COMMENT ON TABLE requests IS '音声依頼情報';
COMMENT ON COLUMN requests.style IS '依頼スタイル: script_reading（台本読み）, cheer_voice（応援ボイス）';
COMMENT ON COLUMN requests.status IS 'ステータス: pending（待機中）, accepted（受諾）, in_progress（制作中）, completed（完了）, cancelled（キャンセル）';

-- ===== 4. reviews（レビュー） =====
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    narrator_id UUID NOT NULL REFERENCES narrators(id) ON DELETE CASCADE,
    tweet_id VARCHAR(255) UNIQUE,
    tweet_url TEXT,
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_reviews_request_id ON reviews(request_id);
CREATE INDEX idx_reviews_narrator_id ON reviews(narrator_id);
CREATE INDEX idx_reviews_tweet_id ON reviews(tweet_id);

-- コメント
COMMENT ON TABLE reviews IS 'レビュー情報（Twitter連携）';
COMMENT ON COLUMN reviews.rating IS '評価（1-5）';

-- ===== 5. payment_links（決済リンク） =====
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    narrator_id UUID NOT NULL REFERENCES narrators(id) ON DELETE CASCADE,
    payment_type payment_type_enum NOT NULL,
    link_url TEXT,
    qr_code_url TEXT,
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    account_type VARCHAR(50),
    account_number VARCHAR(50),
    account_holder VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_payment_links_narrator_id ON payment_links(narrator_id);
CREATE INDEX idx_payment_links_is_active ON payment_links(is_active);

-- コメント
COMMENT ON TABLE payment_links IS '決済リンク情報';
COMMENT ON COLUMN payment_links.payment_type IS '決済タイプ: paypay, bank（銀行振込）, other';

-- ===== トリガー関数 =====

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_narrators_updated_at
    BEFORE UPDATE ON narrators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_links_updated_at
    BEFORE UPDATE ON payment_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===== Row Level Security (RLS) の有効化 =====

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- ===== RLS ポリシー =====

-- users: 自分の情報のみ読み取り・更新可能
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- narrators: 全員が閲覧可能、自分のプロフィールのみ更新可能
CREATE POLICY "Everyone can view narrators"
    ON narrators FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Narrators can update own profile"
    ON narrators FOR UPDATE
    USING (user_id::text = auth.uid()::text);

-- requests: 関係者のみアクセス可能
CREATE POLICY "Users can view own requests"
    ON requests FOR SELECT
    USING (
        client_id::text = auth.uid()::text
        OR narrator_id IN (
            SELECT id FROM narrators WHERE user_id::text = auth.uid()::text
        )
    );

-- reviews: 全員が閲覧可能
CREATE POLICY "Everyone can view reviews"
    ON reviews FOR SELECT
    TO public
    USING (true);

-- payment_links: 関係者のみアクセス可能
CREATE POLICY "Narrators can view own payment links"
    ON payment_links FOR SELECT
    USING (
        narrator_id IN (
            SELECT id FROM narrators WHERE user_id::text = auth.uid()::text
        )
    );

-- ===== 完了メッセージ =====
DO $$
BEGIN
    RAISE NOTICE '✅ KimiLink Voice データベーススキーマの作成が完了しました';
    RAISE NOTICE '';
    RAISE NOTICE '作成されたテーブル:';
    RAISE NOTICE '  - users (ユーザー基本情報)';
    RAISE NOTICE '  - narrators (声優プロフィール)';
    RAISE NOTICE '  - requests (依頼情報)';
    RAISE NOTICE '  - reviews (レビュー)';
    RAISE NOTICE '  - payment_links (決済リンク)';
    RAISE NOTICE '';
    RAISE NOTICE 'Row Level Security (RLS) が有効化されています';
END $$;
