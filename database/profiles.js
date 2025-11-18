// プロフィール関連のデータベース操作（既存テーブル構造に対応）
const supabase = require('./supabase-client');

/**
 * プロフィールを作成または更新（Twitter認証用）
 * @param {Object} profileData - プロフィールデータ
 * @returns {Promise<Object>} 作成/更新されたプロフィール
 */
async function upsertProfile(profileData) {
    const {
        twitter_id,
        twitter_username,
        display_name,
        avatar_url,
        user_type = 'client',
        is_following_creator = false,
        is_following_idol = false
    } = profileData;

    try {
        // twitter_id でプロフィールを検索
        const { data: existingProfile, error: selectError } = await supabase
            .from('profiles')
            .select('*')
            .eq('twitter_id', twitter_id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 = レコードが見つからない（正常）
            throw selectError;
        }

        if (existingProfile) {
            // プロフィールが既に存在する場合は更新
            const { data, error } = await supabase
                .from('profiles')
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
            
            console.log('✅ プロフィールを更新しました:', twitter_username);
            return data;
        } else {
            // 新規プロフィールを作成（必須カラムのみ）
            const { data, error } = await supabase
                .from('profiles')
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
            
            console.log('✅ 新規プロフィールを作成しました:', twitter_username);
            return data;
        }
    } catch (error) {
        console.error('❌ プロフィールのupsert処理でエラー:', error.message);
        throw error;
    }
}

/**
 * Twitter IDでプロフィールを取得
 * @param {string} twitterId - Twitter ID
 * @returns {Promise<Object|null>} プロフィール情報
 */
async function getProfileByTwitterId(twitterId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('twitter_id', twitterId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ プロフィール取得エラー:', error.message);
        return null;
    }
}

/**
 * UUIDでプロフィールを取得
 * @param {string} profileId - プロフィールUUID
 * @returns {Promise<Object|null>} プロフィール情報
 */
async function getProfileById(profileId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ プロフィール取得エラー:', error.message);
        return null;
    }
}

/**
 * Twitter usernameでプロフィールを取得
 * @param {string} username - Twitter username
 * @returns {Promise<Object|null>} プロフィール情報
 */
async function getProfileByUsername(username) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('twitter_username', username)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ プロフィール取得エラー:', error.message);
        return null;
    }
}

/**
 * フォロー状態を更新
 * @param {string} twitterId - Twitter ID
 * @param {boolean} isFollowingCreator - クリエイターアカウントのフォロー状態
 * @param {boolean} isFollowingIdol - アイドルアカウントのフォロー状態
 * @returns {Promise<Object>} 更新されたプロフィール
 */
async function updateFollowStatus(twitterId, isFollowingCreator, isFollowingIdol) {
    try {
        const { data, error } = await supabase
            .from('profiles')
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
 * @param {string} profileId - プロフィールUUID
 * @param {string} userType - ユーザータイプ ('client', 'narrator', 'admin')
 * @returns {Promise<Object>} 更新されたプロフィール
 */
async function updateUserType(profileId, userType) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                user_type: userType,
                updated_at: new Date().toISOString()
            })
            .eq('id', profileId)
            .select()
            .single();

        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('❌ ユーザータイプ更新エラー:', error.message);
        throw error;
    }
}

/**
 * 全プロフィールを取得（ページネーション対応）
 * @param {number} limit - 取得件数
 * @param {number} offset - オフセット
 * @returns {Promise<Array>} プロフィール一覧
 */
async function getAllProfiles(limit = 50, offset = 0) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('❌ プロフィール一覧取得エラー:', error.message);
        return [];
    }
}

/**
 * 声優プロフィールを取得（is_accepting_r = true）
 * @param {number} limit - 取得件数
 * @param {number} offset - オフセット
 * @returns {Promise<Array>} 声優プロフィール一覧
 */
async function getNarratorProfiles(limit = 50, offset = 0) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_type', 'narrator')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('❌ 声優プロフィール一覧取得エラー:', error.message);
        return [];
    }
}

module.exports = {
    upsertProfile,
    getProfileByTwitterId,
    getProfileById,
    getProfileByUsername,
    updateFollowStatus,
    updateUserType,
    getAllProfiles,
    getNarratorProfiles
};
