// ===== グローバル変数 =====
// 開発モード（本番環境では false に設定）
const DEVELOPMENT_MODE = false; // キャッシュを活用してAPI負荷を削減

// フォロー確認をスキップ（開発中のみ）
const SKIP_FOLLOW_CHECK = true; // 開発中はAPIレート制限回避のためスキップ

// 認証をスキップ（開発中のみ）
const SKIP_AUTHENTICATION = true; // サムネイル問題の調査のため一時的にtrue

let currentUser = null;
let followedAccounts = {
    creator: false,
    idol: false
};

// 必須フォローアカウント
const REQUIRED_ACCOUNTS = {
    creator: {
        id: 'streamerfunch',
        name: '君斗りんく@クリエイター応援',
        username: '@streamerfunch'
    },
    idol: {
        id: 'idolfunch',
        name: '君斗りんく@アイドル応援',
        username: '@idolfunch'
    }
};

// アカウントデータのキャッシュ（APIから自動取得される）
const CORRECT_ACCOUNT_DATA = {
    // 初期状態は空 - Twitter APIから自動取得
};

// アカウントデータを動的に更新する関数
function updateCorrectAccountData(username, newData) {
    // 既存のデータがあれば結合、なければ新規作成
    CORRECT_ACCOUNT_DATA[username] = {
        ...(CORRECT_ACCOUNT_DATA[username] || {}),
        ...newData,
        lastUpdated: Date.now()
    };
    console.log(`📝 ${username}のアカウントデータを${CORRECT_ACCOUNT_DATA[username].lastUpdated ? '更新' : '新規作成'}:`, CORRECT_ACCOUNT_DATA[username]);
}

// コラボレーター情報
const COLLABORATOR = {
    id: 'c0tanpoTeshi1a',
    name: 'コタのAI紀行',
    price: 30000
};

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async function() {
    // URLパラメータをチェック
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    
    if (loginStatus === 'success') {
        // ログイン成功後の処理
        console.log('✅ ログイン成功 - ダッシュボードを表示');
        
        // 実際のユーザー情報を取得
        try {
            const response = await fetch('/api/user/me');
            if (response.ok) {
                const userData = await response.json();
                console.log('📡 取得したユーザー情報:', userData);
                
                // showPlatform()で使用するプロパティにマッピング
                currentUser = {
                    id: userData.id || userData.twitter_id,
                    username: userData.username,
                    name: userData.name || userData.displayName,
                    displayName: userData.name || userData.displayName,
                    avatar: userData.profile_image_url || userData.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEE5MEUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuODpuODvOOCtuODvDwvdGV4dD48L3N2Zz4=',
                    followers: userData.public_metrics?.followers_count || userData.followers || 0,
                    following: userData.public_metrics?.following_count || userData.following || 0
                };
                console.log('✅ マッピング後のcurrentUser:', currentUser);
            } else {
                // フォールバック
                console.warn('⚠️ /api/user/me が失敗。フォールバックユーザーを使用');
                currentUser = {
                    id: 'authenticated_user',
                    username: 'authenticated',
                    name: '認証済みユーザー',
                    displayName: '認証済みユーザー',
                    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEE5MEUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuODpuODvOOCtuODvDwvdGV4dD48L3N2Zz4=',
                    followers: 0,
                    following: 0
                };
            }
        } catch (error) {
            console.error('❌ ユーザー情報取得エラー:', error);
            currentUser = {
                id: 'authenticated_user',
                username: 'authenticated',
                name: '認証済みユーザー',
                displayName: '認証済みユーザー',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEE5MEUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuODpuODvOOCtuODvDwvdGV4dD48L3N2Zz4=',
                followers: 0,
                following: 0
            };
        }
        followedAccounts.creator = true;
        followedAccounts.idol = true;
        
        // URLをクリーンアップ（showPlatformの前に実行）
        window.history.replaceState({}, document.title, '/');
        
        console.log('🎯 showPlatform()を呼び出します');
        // ダッシュボードを直接表示
        showPlatform();
        
        // アカウント情報を非同期で取得（バックグラウンドで実行）
        console.log('🚀 アカウント情報を非同期で取得開始');
        updateAccountDisplays().catch(error => {
            console.log('⚠️ アカウント情報取得エラー:', error.message);
        });
        
        return;
    } else if (loginStatus === 'error') {
        alert('ログインに失敗しました。もう一度お試しください。');
        window.history.replaceState({}, document.title, '/');
    } else {
        // 認証スキップモードの場合
        if (SKIP_AUTHENTICATION) {
            console.log('🚧 開発モード: 認証をスキップしてダッシュボードを直接表示');
            // モックユーザーを設定
            currentUser = {
                id: 'dev_user',
                username: 'developer',
                name: '開発者テストユーザー',
                displayName: '開発者テストユーザー',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEE5MEUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRldjwvdGV4dD48L3N2Zz4=',
                followers: 123,
                following: 456
            };
            followedAccounts.creator = true;
            followedAccounts.idol = true;
            
            // アカウント情報を取得してダッシュボードを表示
            try {
                await updateAccountDisplays();
            } catch (error) {
                console.log('⚠️ 開発モードでのアカウント情報取得をスキップ:', error.message);
            }
            
            showPlatform();
            return;
        }
        
        // 常にセッションを確認（開発モードでも）
        await checkAuthStatus();
    }
    
    // ナビゲーションのイベントリスナー
    setupNavigation();
    
    // モックデータで統計を更新
    updateMockStats();
});

// 認証状態を確認
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
            currentUser = await response.json();
            
            // 開発モード: フォロー確認をスキップしてダッシュボードを表示
            if (SKIP_FOLLOW_CHECK) {
                console.log('🚧 開発モード: フォロー確認をスキップしてダッシュボードを表示');
                followedAccounts.creator = true;
                followedAccounts.idol = true;
                
                // 開発モードでもアカウント情報は取得する
                try {
                    await updateAccountDisplays();
                } catch (error) {
                    console.log('⚠️ 開発モードでのアカウント情報取得をスキップ:', error.message);
                }
                
                showPlatform();
                return;
            }
            
            // フォロー状態を確認
            await checkFollowStatusOnLoad();
        }
    } catch (error) {
        console.log('未ログイン:', error);
    }
}

// ===== ログイン処理 =====
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showFollowModal() {
    const modal = document.getElementById('followModal');
    modal.style.display = 'flex';
    
    // 開発モード: スキップボタンを追加
    if (SKIP_FOLLOW_CHECK) {
        setTimeout(() => {
            console.log('🚧 開発モード: 3秒後に自動的にダッシュボードへ移動');
            hideFollowModal();
            showPlatform();
        }, 3000);
    }
}

function hideFollowModal() {
    document.getElementById('followModal').style.display = 'none';
}

function loginWithTwitter() {
    // Twitter OAuth 2.0 フローを開始
    window.location.href = '/auth/twitter';
}

// ===== フォロー確認 =====
async function checkFollowStatus() {
    try {
        // APIを呼び出してフォロー状態を確認
        const response = await fetch('/api/user/follow-status');
        
        if (!response.ok) {
            throw new Error('Failed to check follow status');
        }
        
        const data = await response.json();
        followedAccounts.creator = data.creator;
        followedAccounts.idol = data.idol;
        
        // アカウント情報を取得して表示を更新
        await updateAccountDisplays();
        
        // UI更新
        updateFollowStatus('follow-status-1', followedAccounts.creator);
        updateFollowStatus('follow-status-2', followedAccounts.idol);
        
        // 両方フォローしている場合はプラットフォームへ
        if (followedAccounts.creator && followedAccounts.idol) {
            setTimeout(() => {
                hideFollowModal();
                showPlatform();
            }, 1500);
        } else {
            // フォローされていないアカウントのTwitterページを開く
            if (!followedAccounts.creator) {
                setTimeout(() => {
                    window.open(`https://twitter.com/${REQUIRED_ACCOUNTS.creator.id}`, '_blank');
                }, 500);
            }
            if (!followedAccounts.idol) {
                setTimeout(() => {
                    window.open(`https://twitter.com/${REQUIRED_ACCOUNTS.idol.id}`, '_blank');
                }, 1000);
            }
        }
        
    } catch (error) {
        console.error('フォロー確認エラー:', error);
        alert('フォロー状態の確認に失敗しました。');
    }
}

// アカウント表示を更新する関数
async function updateAccountDisplays() {
    console.log('🔄 アカウント情報の取得を開始...');
    
    // 開発モードでは既存のキャッシュを強制クリア
    if (DEVELOPMENT_MODE) {
        console.log('🗑️ 開発モード: 全キャッシュを強制クリア');
        // 全てのローカルストレージをクリア
        localStorage.clear();
        console.log('🗑️ ローカルストレージを完全クリア');
        
        // セッションストレージもクリア
        sessionStorage.clear();
        console.log('🗑️ セッションストレージを完全クリア');
        
        console.log('📡 Twitter APIから最新のアカウント情報を自動取得します');
    }
    
    try {
        // クリエイターアカウント情報を取得（サーバー側キャッシュを活用）
        await fetchAccountWithRetry('streamerfunch', 'creator');
        
        // アイドルアカウント情報を取得（サーバー側キャッシュを活用）
        await fetchAccountWithRetry('idolfunch', 'idol');
        
        console.log('✅ 両アカウント情報の取得完了（キャッシュ活用）');
        
    } catch (error) {
        console.error('❌ アカウント情報取得エラー:', error);
    }
}

// キャッシュ優先のアカウント取得
async function fetchAccountWithRetry(username, type, maxRetries = 3) {
    // まずキャッシュをチェック（開発モード以外）
    if (!DEVELOPMENT_MODE) {
        const cachedData = getCachedAccountData(username);
        if (cachedData) {
            updateAccountDisplay(type, cachedData);
            return;
        }
    }
    
    // 正しいデータが設定されている場合は優先使用
    if (CORRECT_ACCOUNT_DATA[username]) {
        console.log(`🎯 ${username}の正しいデータを使用`);
        updateAccountDisplay(type, CORRECT_ACCOUNT_DATA[username]);
        return;
    }
    
    // APIから取得を試行
    console.log(`📡 ${type}アカウント情報をAPIから取得中...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📡 ${type}アカウント情報を取得中... (試行 ${attempt}/${maxRetries})`);
            const response = await fetch(`/api/user/profile/${username}`);
            console.log(`📡 ${type}レスポンス:`, response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${type}データ取得成功:`, data);
                
                // CORRECT_ACCOUNT_DATAに保存（将来の参照用）
                updateCorrectAccountData(username, data);
                
                // キャッシュに保存
                setCachedAccountData(username, data);
                
                // 表示を更新
                updateAccountDisplay(type, data);
                return; // 成功したら終了
            } else if (response.status === 429) {
                // レート制限の場合は段階的に待機時間を延長
                const waitTime = Math.min(30000 * attempt, 300000); // 30秒〜5分まで段階的に延長
                console.warn(`⏰ レート制限検出 (${type}/${username})。${waitTime}ms待機後にリトライ... (${attempt}/${maxRetries})`);
                
                // 最後の試行でない場合は待機してリトライ
                if (attempt < maxRetries) {
                    await sleep(waitTime);
                } else {
                    // 最後の試行でもレート制限の場合、古いキャッシュがあれば使用
                    const oldCachedData = getCachedAccountData(username, true); // 期限切れでも取得
                    if (oldCachedData) {
                        console.warn(`⚠️ 古いキャッシュデータを使用: ${username}`);
                        updateAccountDisplay(type, oldCachedData);
                        return;
                    }
                    // キャッシュもない場合はフォールバック
                    console.warn(`❌ 最大試行回数に達しました。フォールバックを使用します`);
                    useFallbackDisplay(type, username);
                    return;
                }
            } else {
                console.error(`❌ ${type}データ取得失敗:`, response.status);
                break; // その他のエラーの場合はリトライしない
            }
        } catch (error) {
            console.error(`❌ ${type}アカウント取得エラー (試行 ${attempt}):`, error);
            if (attempt === maxRetries) {
                console.error(`❌ ${type}アカウント取得を諦めました`);
                // 静的フォールバックを使用
                useFallbackDisplay(type, username);
            }
        }
    }
}

// 動的フォールバック表示（どのアカウントでも対応）
function useFallbackDisplay(type, username) {
    console.log(`🔄 ${type}アカウントに動的フォールバックを使用`);
    
    // 統一された読み込み中アイコン（回転するスピナー）
    const loadingSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 200 200" to="360 200 200" dur="1s" repeatCount="indefinite"/></defs><circle cx="200" cy="200" r="180" fill="#f5f5f5"/><circle cx="200" cy="200" r="120" fill="none" stroke="#cccccc" stroke-width="24" stroke-dasharray="150 600" stroke-linecap="round"><animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 200 200" to="360 200 200" dur="1s" repeatCount="indefinite"/></circle><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="30" fill="#999999" text-anchor="middle" dy=".3em">読み込み中...</text></svg>`;
    const svgPlaceholder = `data:image/svg+xml;base64,${btoa(loadingSvg)}`;
    
    const fallbackData = {
        name: `読み込み中...`,
        username: username,
        profile_image_url: svgPlaceholder
    };
    
    updateAccountDisplay(type, fallbackData);
}

// スリープ関数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== キャッシュ管理 =====
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日間（ミリ秒） - スケーラビリティのため延長

// キャッシュからアカウント情報を取得
function getCachedAccountData(username, allowExpired = false) {
    try {
        const cacheKey = `account_${username}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // キャッシュが期限切れかチェック
        if (now - data.timestamp > CACHE_DURATION) {
            if (!allowExpired) {
                localStorage.removeItem(cacheKey);
                console.log(`🗑️ ${username}のキャッシュが期限切れのため削除`);
                return null;
            } else {
                console.log(`⚠️ ${username}の期限切れキャッシュを使用`);
                return data.accountData;
            }
        }
        
        console.log(`💾 ${username}のキャッシュデータを使用`);
        return data.accountData;
    } catch (error) {
        console.error('キャッシュ読み込みエラー:', error);
        return null;
    }
}

// アカウント情報をキャッシュに保存
function setCachedAccountData(username, accountData) {
    try {
        const cacheKey = `account_${username}`;
        const cacheData = {
            timestamp: Date.now(),
            accountData: accountData
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log(`💾 ${username}のデータをキャッシュに保存`);
    } catch (error) {
        console.error('キャッシュ保存エラー:', error);
    }
}

// 個別アカウント表示を更新
function updateAccountDisplay(type, accountData) {
    console.log(`🎨 ${type}アカウント表示を更新中...`, accountData);
    const avatarId = type === 'creator' ? 'creatorAvatar' : 'idolAvatar';
    const avatarElement = document.getElementById(avatarId);
    console.log(`🔍 アバター要素 (${avatarId}):`, avatarElement);
    console.log(`🔍 プロフィール画像URL:`, accountData.profile_image_url);
    console.log(`🔍 アカウントデータ全体:`, JSON.stringify(accountData, null, 2));
    
    if (avatarElement && accountData.profile_image_url) {
        // Twitter APIから取得した画像URLを使用（高解像度版）
        const highResImageUrl = accountData.profile_image_url.replace('_normal', '_400x400');
        console.log(`🖼️ 画像URL更新: ${highResImageUrl}`);
        
        // 全てのアカウントに強制更新処理を適用（確実な表示のため）
        console.log(`🎯 ${type}アカウントの強制更新処理を実行`);
        
        // キャッシュバスターを使用して強制的に新しい画像を読み込む
        const cacheBustedUrl = highResImageUrl + '?t=' + Date.now();
        
        // 画像を一度クリアしてから設定（確実な更新のため）
        avatarElement.src = '';
        
        // 少し待ってから新しい画像を設定
        setTimeout(() => {
            avatarElement.src = cacheBustedUrl;
            avatarElement.alt = accountData.name || username;
            console.log(`✅ ${type}アバター強制更新完了: ${cacheBustedUrl}`);
        }, 100);
        
    } else {
        console.warn(`⚠️ 問題の詳細:`);
        console.warn(`  - アバター要素存在: ${!!avatarElement}`);
        console.warn(`  - 画像URL存在: ${!!accountData.profile_image_url}`);
        console.warn(`  - アバターID: ${avatarId}`);
        console.warn(`  - アカウントデータ:`, accountData);
    }
    
    // 名前とユーザー名も更新
    const itemElement = avatarElement?.closest('.follow-check-item');
    if (itemElement) {
        const nameElement = itemElement.querySelector('h4');
        const usernameElement = itemElement.querySelector('p');
        
        if (nameElement && accountData.name) {
            console.log(`📝 名前更新: ${accountData.name}`);
            nameElement.textContent = accountData.name;
        }
        if (usernameElement && accountData.username) {
            console.log(`📝 ユーザー名更新: @${accountData.username}`);
            usernameElement.textContent = `@${accountData.username}`;
        }
    } else {
        console.warn(`⚠️ フォローチェック要素が見つかりません`);
    }
}

function updateFollowStatus(elementId, isFollowing) {
    const statusElement = document.getElementById(elementId);
    if (statusElement) {
        if (isFollowing) {
            statusElement.innerHTML = '<span class="status-following">✓ フォロー中</span>';
        } else {
            statusElement.innerHTML = '<span class="status-pending">未フォロー</span>';
        }
    }
}

async function checkFollowStatusOnLoad() {
    try {
        // 開発モードでフォロー確認をスキップ
        if (SKIP_FOLLOW_CHECK) {
            console.log('🚧 開発モード: フォロー確認をスキップしてダッシュボードを表示');
            followedAccounts.creator = true;
            followedAccounts.idol = true;
            showPlatform();
            return;
        }

        // APIを呼び出してフォロー状態を確認
        const response = await fetch('/api/user/follow-status');
        
        if (!response.ok) {
            throw new Error('Failed to check follow status');
        }
        
        const data = await response.json();
        followedAccounts.creator = data.creator;
        followedAccounts.idol = data.idol;
        
        // アカウント情報を取得して表示を更新
        await updateAccountDisplays();
        
        if (followedAccounts.creator && followedAccounts.idol) {
            showPlatform();
        } else {
            showFollowModal();
            // フォロー状態を表示
            updateFollowStatus('follow-status-1', followedAccounts.creator);
            updateFollowStatus('follow-status-2', followedAccounts.idol);
        }
    } catch (error) {
        console.error('フォロー状態確認エラー:', error);
        // エラーの場合はフォローモーダルを表示
        showFollowModal();
    }
}

// ===== プラットフォーム表示 =====
function showPlatform() {
    console.log('🎨 showPlatform()が呼ばれました');
    console.log('🎨 currentUser:', currentUser);
    
    try {
        const publicPage = document.getElementById('publicPage');
        const dashboard = document.getElementById('dashboard');
        
        if (!publicPage || !dashboard) {
            console.error('❌ publicPageまたはdashboard要素が見つかりません');
            return;
        }
        
        publicPage.style.display = 'none';
        dashboard.style.display = 'block';
        console.log('✅ publicPageを非表示、dashboardを表示に切り替えました');
        
        // ユーザー情報を表示
        if (currentUser) {
            try {
                // ヘッダー
                const userAvatar = document.getElementById('userAvatar');
                const userName = document.getElementById('userName');
                if (userAvatar) userAvatar.src = currentUser.avatar || '';
                if (userName) userName.textContent = currentUser.displayName || currentUser.name || '';
                
                // プロフィールカード
                const profileAvatar = document.getElementById('profileAvatar');
                const profileName = document.getElementById('profileName');
                const profileHandle = document.getElementById('profileHandle');
                const followerCount = document.getElementById('followerCount');
                const followingCount = document.getElementById('followingCount');
                
                if (profileAvatar) profileAvatar.src = currentUser.avatar || '';
                if (profileName) profileName.textContent = currentUser.displayName || currentUser.name || '';
                if (profileHandle) profileHandle.textContent = '@' + (currentUser.username || '');
                if (followerCount) followerCount.textContent = currentUser.followers || 0;
                if (followingCount) followingCount.textContent = currentUser.following || 0;
                
                console.log('✅ ユーザー情報の表示完了');
            } catch (error) {
                console.error('❌ ユーザー情報表示エラー:', error);
            }
        } else {
            console.warn('⚠️ currentUserが設定されていません');
        }
    } catch (error) {
        console.error('❌ showPlatform()でエラーが発生:', error);
    }
    
    // 必須フォローアカウントのプロフィール画像を取得
    // 開発モードでフォロー確認をスキップする場合はAPIリクエストも省略
    if (!SKIP_FOLLOW_CHECK) {
        loadRequiredAccountsAvatars();
    } else {
        console.log('🚧 開発モード: プロフィール画像取得をスキップ');
    }
    
    // Twitter タイムラインを読み込み
    loadTwitterTimeline();
}

// 必須フォローアカウントの画像と名前を取得
async function loadRequiredAccountsAvatars() {
    try {
        // クリエイター応援アカウント
        const creatorResponse = await fetch('/api/user/profile/' + REQUIRED_ACCOUNTS.creator.id);
        if (creatorResponse.ok) {
            const creatorData = await creatorResponse.json();
            
            // APIレスポンスの構造を確認（dataプロパティがある場合）
            const userData = creatorData.data || creatorData;
            
            // 画像を更新
            const creatorAvatar = document.getElementById('creatorAvatar');
            if (creatorAvatar && userData.profile_image_url) {
                creatorAvatar.src = userData.profile_image_url;
            }
            
            // 表示名を更新
            const creatorNameElement = document.querySelector('.follow-check-item:nth-child(1) .follow-check-info h4');
            if (creatorNameElement && userData.name) {
                creatorNameElement.textContent = userData.name;
            }
            
            console.log('✅ クリエイター応援の情報を更新:', userData.name);
        } else {
            console.warn('⚠️ クリエイター応援プロフィール取得失敗（APIレート制限の可能性）');
        }
        
        // アイドル応援アカウント
        const idolResponse = await fetch('/api/user/profile/' + REQUIRED_ACCOUNTS.idol.id);
        if (idolResponse.ok) {
            const idolData = await idolResponse.json();
            
            // APIレスポンスの構造を確認（dataプロパティがある場合）
            const userData = idolData.data || idolData;
            
            // 画像を更新
            const idolAvatar = document.getElementById('idolAvatar');
            if (idolAvatar && userData.profile_image_url) {
                idolAvatar.src = userData.profile_image_url;
            }
            
            // 表示名を更新
            const idolNameElement = document.querySelector('.follow-check-item:nth-child(2) .follow-check-info h4');
            if (idolNameElement && userData.name) {
                idolNameElement.textContent = userData.name;
            }
            
            console.log('✅ アイドル応援の情報を更新:', userData.name);
        } else {
            console.warn('⚠️ アイドル応援プロフィール取得失敗（APIレート制限の可能性）');
        }
    } catch (error) {
        console.error('プロフィール情報の取得エラー:', error);
        // エラーの場合はデフォルト表示のまま
    }
}

// ===== ナビゲーション =====
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // すべてのリンクとセクションから active クラスを削除
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            // クリックされたリンクとセクションに active クラスを追加
            this.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// ===== ログアウト =====
async function logout() {
    if (confirm('ログアウトしますか?')) {
        try {
            // サーバーのセッションを破棄
            await fetch('/auth/logout', { method: 'POST' });
            
            // クライアント側の状態をクリア
            currentUser = null;
            followedAccounts = { creator: false, idol: false };
            
            // UIをリセット
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('publicPage').style.display = 'block';
        } catch (error) {
            console.error('ログアウトエラー:', error);
            alert('ログアウトに失敗しました。');
        }
    }
}

// ===== Twitter タイムライン読み込み =====
function loadTwitterTimeline() {
    const timelineContainer = document.getElementById('twitterTimeline');
    
    // 要素が存在しない場合は処理をスキップ
    if (!timelineContainer) {
        console.log('⚠️ twitterTimeline要素が見つかりません。スキップします。');
        return;
    }
    
    // モックツイートデータ
    const mockTweets = [
        {
            user: 'ユーザーA',
            username: 'user_a',
            avatar: 'https://via.placeholder.com/50',
            content: 'KimiLink Voice最高! 声が届く感じがすごくいい! #kimitoLinkVoice',
            timestamp: '2時間前',
            likes: 15,
            retweets: 3
        },
        {
            user: 'ユーザーB',
            username: 'user_b',
            avatar: 'https://via.placeholder.com/50',
            content: 'クリエイターとして使ってみたけど、めちゃくちゃ便利! #kimitoLinkVoice @streamerfunch',
            timestamp: '5時間前',
            likes: 28,
            retweets: 7
        },
        {
            user: 'ユーザーC',
            username: 'user_c',
            avatar: 'https://via.placeholder.com/50',
            content: 'コタのAI紀行さんとのコラボ機能が楽しみ! #kimitoLinkVoice @c0tanpoTeshi1a',
            timestamp: '1日前',
            likes: 42,
            retweets: 12
        }
    ];
    
    // ツイートを表示
    timelineContainer.innerHTML = mockTweets.map(tweet => `
        <div class="tweet-card space-card" style="margin-bottom: 1rem; padding: 1rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                <img src="${tweet.avatar}" alt="${tweet.user}" style="width: 50px; height: 50px; border-radius: 50%;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <strong>${tweet.user}</strong>
                        <span style="color: var(--text-secondary);">@${tweet.username}</span>
                        <span style="color: var(--text-muted);">· ${tweet.timestamp}</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${tweet.content}</p>
                    <div style="display: flex; gap: 2rem; color: var(--text-muted); font-size: 0.9rem;">
                        <span>❤️ ${tweet.likes}</span>
                        <span>🔄 ${tweet.retweets}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== レビューツイート =====
function tweetReview() {
    const tweetText = encodeURIComponent('KimiLink Voice使ってみた! #kimitoLinkVoice');
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&via=streamerfunch,idolfunch`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
}

// ===== コラボ依頼 =====
function requestCollab() {
    const message = `コタのAI紀行さんとのコラボを依頼しますか?\n\n料金: ¥${COLLABORATOR.price.toLocaleString()}\n\n内容:\n- プロフェッショナルな動画編集\n- AI技術を活用した高品質な動画\n- SNSでの拡散サポート`;
    
    if (confirm(message)) {
        // Twitter DMまたはメンション
        const mentionText = encodeURIComponent(`@${COLLABORATOR.id} KimiLink Voiceでコラボをお願いしたいです! #kimitoLinkVoice`);
        const tweetUrl = `https://twitter.com/intent/tweet?text=${mentionText}`;
        window.open(tweetUrl, '_blank', 'width=550,height=420');
        
        alert('コラボ依頼のツイートを送信しました!コタのAI紀行さんから返信をお待ちください。');
    }
}

// ===== 統計データ更新 =====
function updateMockStats() {
    // 実際のデータ（Phase 3のデータベース実装まではゼロ）
    const stats = {
        voiceCount: 0,
        reviewCount: 0,
        reachCount: 0,
        likesCount: 0,
        retweetCount: 0,
        replyCount: 0
    };
    
    // DOM要素が存在する場合のみ更新
    const elements = {
        voiceCount: document.getElementById('voiceCount'),
        reviewCount: document.getElementById('reviewCount'),
        reachCount: document.getElementById('reachCount'),
        likesCount: document.getElementById('likesCount'),
        retweetCount: document.getElementById('retweetCount'),
        replyCount: document.getElementById('replyCount')
    };
    
    Object.keys(elements).forEach(key => {
        if (elements[key]) {
            animateCounter(elements[key], stats[key]);
        }
    });
}

// ===== カウンターアニメーション =====
function animateCounter(element, targetValue) {
    let currentValue = 0;
    const increment = targetValue / 50;
    const duration = 1000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            element.textContent = targetValue.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(currentValue).toLocaleString();
        }
    }, stepTime);
}

// ===== チャート描画 (Chart.jsが必要) =====
function drawMonthlyChart() {
    const canvas = document.getElementById('monthlyStatsChart');
    if (!canvas) return;
    
    // Chart.jsがロードされていない場合はスキップ
    if (typeof Chart === 'undefined') {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">チャートライブラリを読み込んでいます...</p>';
        return;
    }
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '音声配信数',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a0aec0'
                    },
                    grid: {
                        color: 'rgba(102, 126, 234, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#a0aec0'
                    },
                    grid: {
                        color: 'rgba(102, 126, 234, 0.1)'
                    }
                }
            }
        }
    });
}

// ===== ユーティリティ関数 =====
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
    
    return date.toLocaleDateString('ja-JP');
}

// ===== エラーハンドリング =====
window.addEventListener('error', function(e) {
    console.error('エラーが発生しました:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未処理のPromiseエラー:', e.reason);
});

// ===== サービスワーカー登録（PWA対応） =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
                
                // 更新チェック
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker update found');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('✨ New content is available; please refresh.');
                            // 必要に応じて更新通知を表示
                        }
                    });
                });
            })
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

// ===== エクスポート =====
// モジュール化が必要な場合
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loginWithTwitter,
        checkFollowStatus,
        logout,
        tweetReview,
        requestCollab
    };
}
