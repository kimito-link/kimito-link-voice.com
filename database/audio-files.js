// 音声ファイル関連のデータベース操作
const supabase = require('./supabase-client');

/**
 * 音声ファイル情報を保存
 * @param {Object} audioData - 音声ファイルデータ
 * @returns {Promise<Object>} 保存された音声ファイル情報
 */
async function createAudioFile(audioData) {
    const {
        user_id,
        twitter_username,
        title,
        description = '',
        category,
        file_url,
        file_name,
        file_size,
        is_public = true
    } = audioData;

    try {
        const { data, error } = await supabase
            .from('audio_files')
            .insert({
                user_id,
                twitter_username,
                title,
                description,
                category,
                file_url,
                file_name,
                file_size,
                is_public
            })
            .select()
            .single();

        if (error) throw error;

        console.log('✅ 音声ファイル情報を保存しました:', title);
        return data;
    } catch (error) {
        console.error('❌ 音声ファイル保存エラー:', error.message);
        throw error;
    }
}

/**
 * ユーザーの音声ファイル一覧を取得
 * @param {string} userId - ユーザーID (UUID)
 * @param {number} limit - 取得件数
 * @param {number} offset - オフセット
 * @returns {Promise<Array>} 音声ファイル一覧
 */
async function getAudioFilesByUserId(userId, limit = 50, offset = 0) {
    try {
        const { data, error } = await supabase
            .from('audio_files')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('❌ 音声ファイル取得エラー:', error.message);
        return [];
    }
}

/**
 * カテゴリ別の音声ファイルを取得
 * @param {string} category - カテゴリ ('sample', 'delivered', 'profile', 'other')
 * @param {number} limit - 取得件数
 * @param {number} offset - オフセット
 * @returns {Promise<Array>} 音声ファイル一覧
 */
async function getAudioFilesByCategory(category, limit = 50, offset = 0) {
    try {
        const { data, error } = await supabase
            .from('audio_files')
            .select('*')
            .eq('category', category)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('❌ カテゴリ別音声ファイル取得エラー:', error.message);
        return [];
    }
}

/**
 * 公開音声ファイル一覧を取得
 * @param {number} limit - 取得件数
 * @param {number} offset - オフセット
 * @returns {Promise<Array>} 公開音声ファイル一覧
 */
async function getPublicAudioFiles(limit = 50, offset = 0) {
    try {
        const { data, error } = await supabase
            .from('audio_files')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('❌ 公開音声ファイル取得エラー:', error.message);
        return [];
    }
}

/**
 * 音声ファイル情報を取得（ID指定）
 * @param {string} audioId - 音声ファイルID (UUID)
 * @returns {Promise<Object|null>} 音声ファイル情報
 */
async function getAudioFileById(audioId) {
    try {
        const { data, error } = await supabase
            .from('audio_files')
            .select('*')
            .eq('id', audioId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ 音声ファイル取得エラー:', error.message);
        return null;
    }
}

/**
 * 音声ファイル情報を更新
 * @param {string} audioId - 音声ファイルID (UUID)
 * @param {Object} updates - 更新データ
 * @returns {Promise<Object>} 更新された音声ファイル情報
 */
async function updateAudioFile(audioId, updates) {
    try {
        const { data, error } = await supabase
            .from('audio_files')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', audioId)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ 音声ファイル情報を更新しました:', audioId);
        return data;
    } catch (error) {
        console.error('❌ 音声ファイル更新エラー:', error.message);
        throw error;
    }
}

/**
 * 音声ファイルを削除
 * @param {string} audioId - 音声ファイルID (UUID)
 * @returns {Promise<boolean>} 削除成功/失敗
 */
async function deleteAudioFile(audioId) {
    try {
        const { error } = await supabase
            .from('audio_files')
            .delete()
            .eq('id', audioId);

        if (error) throw error;

        console.log('✅ 音声ファイルを削除しました:', audioId);
        return true;
    } catch (error) {
        console.error('❌ 音声ファイル削除エラー:', error.message);
        return false;
    }
}

/**
 * ユーザーの音声ファイル数を取得
 * @param {string} userId - ユーザーID (UUID)
 * @returns {Promise<number>} 音声ファイル数
 */
async function getAudioFileCount(userId) {
    try {
        const { count, error } = await supabase
            .from('audio_files')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;

        return count || 0;
    } catch (error) {
        console.error('❌ 音声ファイル数取得エラー:', error.message);
        return 0;
    }
}

module.exports = {
    createAudioFile,
    getAudioFilesByUserId,
    getAudioFilesByCategory,
    getPublicAudioFiles,
    getAudioFileById,
    updateAudioFile,
    deleteAudioFile,
    getAudioFileCount
};
