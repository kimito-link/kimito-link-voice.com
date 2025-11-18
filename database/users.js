// ユーザー関連のデータベース操作
const supabase = require('./supabase-client');

/**
 * ユーザーを作成または更新
 * @param {Object} userData - ユーザーデータ
 * @returns {Promise<Object>} 作成/更新されたユーザー
 */
async function upsertUser(userData) {
    const {
        twitter_id,
        twitter_username,
        display_name,
        avatar_url,
        user_type = 'client',
        is_following_creator = false,
        is_following_idol = false
    } = userData;

    try {
        // twitter_id でユーザーを検索
        const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('twitter_id', twitter_id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 = レコードが見つからない（正常）
            throw selectError;
        }

        if (existingUser) {
            // ユーザーが既に存在する場合は更新
            const { data, error } = await supabase
                .from('users')
                .update({
                    twitter_username,
                    display_name,
                    avatar_url,
                    is_following_creator,
                    is_following_idol,
                    updated_at: new Date().toISOString()
                })
                .eq('twitter_id', twitter_id)
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ ユーザー情報を更新しました:', twitter_username);
            return data;
        } else {
            // 新規ユーザーを作成
            const { data, error } = await supabase
                .from('users')
                .insert({
                    twitter_id,
                    twitter_username,
                    display_name,
                    avatar_url,
                    user_type,
                    is_following_creator,
                    is_following_idol
                })
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ 新規ユーザーを作成しました:', twitter_username);
            return data;
        }
    } catch (error) {
        console.error('❌ ユーザーのupsert処理でエラー:', error.message);
        throw error;
    }
}

/**
 * Twitter IDでユーザーを取得
 * @param {string} twitterId - Twitter ID
 * @returns {Promise<Object|null>} ユーザー情報
 */
async function getUserByTwitterId(twitterId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('twitter_id', twitterId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ ユーザー取得エラー:', error.message);
        return null;
    }
}

/**
 * UUIDでユーザーを取得
 * @param {string} userId - ユーザーUUID
 * @returns {Promise<Object|null>} ユーザー情報
 */
async function getUserById(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ ユーザー取得エラー:', error.message);
        return null;
    }
}

/**
 * フォロー状態を更新
 * @param {string} twitterId - Twitter ID
 * @param {boolean} isFollowingCreator - クリエイターアカウントのフォロー状態
 * @param {boolean} isFollowingIdol - アイドルアカウントのフォロー状態
 * @returns {Promise<Object>} 更新されたユーザー
 */
async function updateFollowStatus(twitterId, isFollowingCreator, isFollowingIdol) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                is_following_creator: isFollowingCreator,
                is_following_idol: isFollowingIdol,
                updated_at: new Date().toISOString()
            })
            .eq('twitter_id', twitterId)
            .select()
            .single();

        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('❌ フォロー状態更新エラー:', error.message);
        throw error;
    }
}

/**
 * ユーザータイプを更新
 * @param {string} userId - ユーザーUUID
 * @param {string} userType - ユーザータイプ ('client', 'narrator', 'admin')
 * @returns {Promise<Object>} 更新されたユーザー
 */
async function updateUserType(userId, userType) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                user_type: userType,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('❌ ユーザータイプ更新エラー:', error.message);
        throw error;
    }
}

module.exports = {
    upsertUser,
    getUserByTwitterId,
    getUserById,
    updateFollowStatus,
    updateUserType
};
