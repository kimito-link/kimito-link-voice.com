// Supabaseクライアント初期化
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key を使用（RLS バイパス）

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase環境変数が設定されていません');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
