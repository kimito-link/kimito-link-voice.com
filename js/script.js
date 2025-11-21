// ===== グローバル変数 =====
// 開発モード（本番環境では false に設定）
const DEVELOPMENT_MODE = true; // 一時的にtrue: キャッシュをクリアしてAPI再取得

// フォロー確認をスキップ（開発中のみ）
const SKIP_FOLLOW_CHECK = true; // 開発中はAPIレート制限回避のためスキップ

// 認証をスキップ（開発中のみ）
const SKIP_AUTHENTICATION = false; // 本番環境では必ずfalse - 認証を必須にする

// ===== Supabase初期化 =====
const SUPABASE_URL = 'https://ljidnprwxniixrigktss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqaWRucHJ3eG5paXhyaWdrdHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTU3MTUsImV4cCI6MjA3ODA3MTcxNX0.PyqHGu4zKEI2eKivLM3syIjntgtPU0ohX_6aMgUWFcI';

let supabaseClient = null;

// ページ読み込み後にSupabaseクライアントを初期化
window.addEventListener('DOMContentLoaded', function() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabaseクライアント初期化完了');
        console.log('📊 Supabase URL:', SUPABASE_URL);
    } else {
        console.error('❌ Supabase JSライブラリが読み込まれていません');
    }
});

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

// ===== アカウント履歴管理 =====
const ACCOUNT_HISTORY_KEY = 'kimilink_account_history';
const MAX_ACCOUNT_HISTORY = 5;

// アカウント履歴をlocalStorageから取得
function getAccountHistory() {
    try {
        const history = localStorage.getItem(ACCOUNT_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('アカウント履歴の取得に失敗:', error);
        return [];
    }
}

// アカウント履歴を保存
function saveAccountToHistory(account) {
    try {
        let history = getAccountHistory();
        
        // 既存の同じアカウントを削除（重複防止）
        history = history.filter(a => a.id !== account.id);
        
        // 新しいアカウントを先頭に追加
        history.unshift({
            id: account.id,
            username: account.username,
            displayName: account.displayName || account.name,
            avatar: account.avatar,
            lastLogin: Date.now()
        });
        
        // 最大件数を超えたら古いものを削除
        if (history.length > MAX_ACCOUNT_HISTORY) {
            history = history.slice(0, MAX_ACCOUNT_HISTORY);
        }
        
        localStorage.setItem(ACCOUNT_HISTORY_KEY, JSON.stringify(history));
        console.log('✅ アカウント履歴を保存:', account.username);
    } catch (error) {
        console.error('アカウント履歴の保存に失敗:', error);
    }
}

// アカウント履歴から削除
function removeAccountFromHistory(accountId) {
    try {
        let history = getAccountHistory();
        history = history.filter(a => a.id !== accountId);
        localStorage.setItem(ACCOUNT_HISTORY_KEY, JSON.stringify(history));
        console.log('✅ アカウント履歴から削除:', accountId);
    } catch (error) {
        console.error('アカウント履歴の削除に失敗:', error);
    }
}

// コラボレーター情報
const COLLABORATOR = {
    id: 'c0tanpoTeshi1a',
    name: 'コタのAI紀行',
    price: 30000
};

// ===== ヘルパー関数 =====

/**
 * テキスト内のURLを自動的にリンク化する
 * @param {string} text - リンク化するテキスト
 * @returns {string} - HTMLタグを含むリンク化されたテキスト
 */
function linkifyText(text) {
    if (!text) return '';
    
    // URLパターン（http, https, t.coなど）
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    // エスケープして安全なHTMLに
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
    // URLをリンクに変換
    return escapedText.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="profile-link">${url}</a>`;
    });
}

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
                    description: userData.description || '',
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
        
        // ダッシュボードを直接表示（エラーでも止まらないように）
        try {
            showPlatform();
            console.log('✅ showPlatform()完了');
        } catch (error) {
            console.error('❌ showPlatform()エラー:', error);
            // エラーでも続行
        }
        
        // アカウント情報を非同期で取得（バックグラウンドで実行）
        console.log('🚀 アカウント情報を非同期で取得開始');
        updateAccountDisplays().catch(error => {
            console.log('⚠️ アカウント情報取得エラー:', error.message);
        });
        
        return;
    } else if (loginStatus === 'error') {
        // エラーの理由を確認
        const errorReason = urlParams.get('reason');
        
        if (errorReason === 'access_denied') {
            // ユーザーが認証をキャンセルした場合
            console.log('ℹ️ ユーザーが認証をキャンセルしました');
            // エラーメッセージは表示せず、静かにログイン画面に戻る
        } else if (errorReason === 'session_lost') {
            // セッションが失われた場合
            alert('セッションが失われました。もう一度ログインしてください。');
        } else {
            // その他のエラー
            alert('ログインに失敗しました。もう一度お試しください。');
        }
        
        // URLをクリーンアップ
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
    
    // モーダルのイベントリスナー設定
    setupModalListeners();
});

// 認証状態を確認
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
            currentUser = await response.json();
            
            // アカウント履歴に保存
            saveAccountToHistory(currentUser);
            
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
function showLoginModal(event) {
    // イベントの伝播を停止
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('🎭 ログインモーダルを表示します');
    
    // モーダルを表示
    const modal = document.getElementById('loginModal');
    if (!modal) {
        console.error('❌ loginModal要素が見つかりません');
        return;
    }
    
    modal.style.display = 'flex';
    console.log('✅ モーダル表示完了');
    
    // 必須アカウント情報を動的に更新
    updateLoginModalAccounts();
    
    // bodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
    
    // スクロール検出とヒント表示の設定（スマホのみ）
    setupModalScrollHint();
}

// モーダルのスクロールヒント設定
function setupModalScrollHint() {
    const modalContent = document.querySelector('#loginModal .modal-content');
    const scrollHint = document.getElementById('scrollHint');
    
    if (!modalContent || !scrollHint) return;
    
    // スクロールが必要かどうかを確認
    const hasScroll = modalContent.scrollHeight > modalContent.clientHeight;
    
    if (hasScroll) {
        scrollHint.style.display = 'flex';
        
        // スクロールイベントリスナー（重複登録を防ぐ）
        const handleScroll = function() {
            const scrollTop = modalContent.scrollTop;
            const scrollHeight = modalContent.scrollHeight;
            const clientHeight = modalContent.clientHeight;
            
            // スクロールしたらヒントを非表示
            if (scrollTop > 20) {
                modalContent.classList.add('scrolled');
            }
            
            // 最下部に達したらクラスを追加
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                modalContent.classList.add('scrolled-to-bottom');
            } else {
                modalContent.classList.remove('scrolled-to-bottom');
            }
        };
        
        // 既存のリスナーを削除してから追加
        modalContent.removeEventListener('scroll', handleScroll);
        modalContent.addEventListener('scroll', handleScroll);
        
        // 4秒後に自動的にヒントをフェードアウト
        setTimeout(() => {
            if (scrollHint) {
                scrollHint.style.opacity = '0';
                setTimeout(() => {
                    scrollHint.style.display = 'none';
                }, 300);
            }
        }, 4000);
    } else {
        scrollHint.style.display = 'none';
    }
}

// ログインモーダルのアカウント情報を更新（管理画面での変更に対応）
async function updateLoginModalAccounts() {
    // クリエイターアカウント
    const creatorNameEl = document.getElementById('loginModalCreatorName');
    const creatorUsernameEl = document.getElementById('loginModalCreatorUsername');
    const creatorAvatarEl = document.getElementById('loginModalCreatorAvatar');
    if (creatorNameEl) creatorNameEl.textContent = REQUIRED_ACCOUNTS.creator.name;
    if (creatorUsernameEl) creatorUsernameEl.textContent = REQUIRED_ACCOUNTS.creator.username;
    
    // アイドルアカウント
    const idolNameEl = document.getElementById('loginModalIdolName');
    const idolUsernameEl = document.getElementById('loginModalIdolUsername');
    const idolAvatarEl = document.getElementById('loginModalIdolAvatar');
    if (idolNameEl) idolNameEl.textContent = REQUIRED_ACCOUNTS.idol.name;
    if (idolUsernameEl) idolUsernameEl.textContent = REQUIRED_ACCOUNTS.idol.username;
    
    console.log('📋 ログインモーダルのアカウント情報を更新:', REQUIRED_ACCOUNTS);
    
    // APIからプロフィール画像を取得
    try {
        // クリエイターアカウントの画像取得
        const creatorResponse = await fetch('/api/user/profile/' + REQUIRED_ACCOUNTS.creator.id);
        if (creatorResponse.ok) {
            const creatorData = await creatorResponse.json();
            const creatorUserData = creatorData.data || creatorData;
            if (creatorAvatarEl && creatorUserData.profile_image_url) {
                const imageUrl = creatorUserData.profile_image_url.replace('_normal', '_400x400');
                creatorAvatarEl.src = imageUrl;
                // エラーハンドリング
                creatorAvatarEl.onerror = function() {
                    this.onerror = null;
                    this.src = creatorUserData.profile_image_url;
                };
            }
        }
        
        // アイドルアカウントの画像取得
        const idolResponse = await fetch('/api/user/profile/' + REQUIRED_ACCOUNTS.idol.id);
        if (idolResponse.ok) {
            const idolData = await idolResponse.json();
            const idolUserData = idolData.data || idolData;
            if (idolAvatarEl && idolUserData.profile_image_url) {
                const imageUrl = idolUserData.profile_image_url.replace('_normal', '_400x400');
                idolAvatarEl.src = imageUrl;
                // エラーハンドリング
                idolAvatarEl.onerror = function() {
                    this.onerror = null;
                    this.src = idolUserData.profile_image_url;
                };
            }
        }
        
        console.log('✅ ログインモーダルのプロフィール画像を更新完了');
    } catch (error) {
        console.warn('⚠️ ログインモーダルのプロフィール画像取得エラー:', error);
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    
    // bodyのスクロールを有効化
    document.body.style.overflow = '';
    
    // モーダルのスクロール位置とクラスをリセット
    const modalContent = document.querySelector('#loginModal .modal-content');
    const scrollHint = document.getElementById('scrollHint');
    
    if (modalContent) {
        modalContent.scrollTop = 0;
        modalContent.classList.remove('scrolled', 'scrolled-to-bottom');
    }
    
    if (scrollHint) {
        scrollHint.style.display = 'none';
        scrollHint.style.opacity = '1';
    }
}

// モーダルのイベントリスナー設定
function setupModalListeners() {
    const loginModal = document.getElementById('loginModal');
    const switchAccountModal = document.getElementById('switchAccountModal');
    
    // ログインモーダル: 外側クリックで閉じる
    if (loginModal) {
        loginModal.addEventListener('click', function(event) {
            if (event.target === loginModal) {
                hideLoginModal();
            }
        });
    }
    
    // アカウント切り替えモーダル: 外側クリックで閉じる
    if (switchAccountModal) {
        switchAccountModal.addEventListener('click', function(event) {
            if (event.target === switchAccountModal) {
                hideSwitchAccountModal();
            }
        });
    }
    
    // Escキーでモーダルを閉じる
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // ログインモーダルが開いている場合
            if (loginModal && loginModal.style.display === 'flex') {
                hideLoginModal();
            }
            // アカウント切り替えモーダルが開いている場合
            if (switchAccountModal && switchAccountModal.style.display === 'flex') {
                hideSwitchAccountModal();
            }
        }
    });
    
    console.log('✅ モーダルのイベントリスナーを設定しました');
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

function loginWithTwitter(event) {
    // イベントの伝播を停止
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('🔑 Twitter OAuth フローを開始します');
    console.log('📍 リダイレクト先: /auth/twitter');
    
    // Twitter OAuth 2.0 フローを開始
    window.location.href = '/auth/twitter';
}

// ===== 音声アップロード機能 =====
let selectedFile = null;
let narratorSelectedFile = null;

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ファイルサイズチェック (50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます。50MB以下のファイルを選択してください。');
        return;
    }
    
    // ファイル形式チェック
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        alert('対応していないファイル形式です。MP3, WAV, OGG, M4A形式のファイルを選択してください。');
        return;
    }
    
    selectedFile = file;
    
    // アップロードエリアを非表示にしてフォームを表示
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('uploadForm').style.display = 'block';
    
    // ファイル名をタイトルに自動入力
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    document.getElementById('audioTitle').value = fileName;
}

function cancelUpload() {
    selectedFile = null;
    document.getElementById('audioFile').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('uploadForm').style.display = 'none';
    
    // フォームをリセット
    document.getElementById('audioTitle').value = '';
    document.getElementById('audioDescription').value = '';
    document.getElementById('audioCategory').value = '';
    document.getElementById('audioPublic').checked = true;
}

async function submitUpload() {
    if (!selectedFile) {
        alert('ファイルが選択されていません。');
        return;
    }
    
    const title = document.getElementById('audioTitle').value.trim();
    const description = document.getElementById('audioDescription').value.trim();
    const category = document.getElementById('audioCategory').value;
    const isPublic = document.getElementById('audioPublic').checked;
    
    if (!title) {
        alert('タイトルを入力してください。');
        return;
    }
    
    if (!category) {
        alert('カテゴリを選択してください。');
        return;
    }
    
    // FormDataを作成
    const formData = new FormData();
    formData.append('audio', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('is_public', isPublic);
    
    try {
        // ゆっくりローディング表示
        showProgressLoading('音声ファイルをアップロード中...', 0);
        
        // フォームを非表示にして進捗表示を表示
        document.getElementById('uploadForm').style.display = 'none';
        const progressDiv = document.getElementById('uploadProgress');
        progressDiv.style.display = 'block';
        
        // 進捗情報を設定
        document.getElementById('progressFileName').textContent = selectedFile.name;
        document.getElementById('progressFileSize').textContent = formatFileSize(selectedFile.size);
        
        // API呼び出し
        console.log('📤 音声ファイルをアップロードします:', {
            title,
            description,
            category,
            isPublic,
            fileSize: selectedFile.size,
            fileName: selectedFile.name
        });
        
        // XMLHttpRequestで進捗を監視しながらアップロード
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                
                // ゆっくりローディングのプログレスを更新
                let statusMessage = 'アップロード中...';
                if (percentComplete < 30) {
                    statusMessage = 'アップロード開始...';
                } else if (percentComplete < 70) {
                    statusMessage = 'アップロード中...';
                } else if (percentComplete < 95) {
                    statusMessage = '処理中...';
                } else {
                    statusMessage = '完了間近...';
                }
                showProgressLoading(statusMessage, percentComplete);
                
                // 進捗バーを更新
                document.getElementById('progressBar').style.width = percentComplete + '%';
                document.getElementById('progressPercentage').textContent = percentComplete + '%';
                
                // ステータスメッセージを更新
                document.getElementById('progressStatus').textContent = statusMessage;
                
                // 予想残り時間を計算
                const elapsedTime = (Date.now() - startTime) / 1000; // 秒
                const uploadSpeed = e.loaded / elapsedTime; // バイト/秒
                const remainingBytes = e.total - e.loaded;
                const remainingTime = Math.ceil(remainingBytes / uploadSpeed);
                
                if (remainingTime > 60) {
                    const minutes = Math.floor(remainingTime / 60);
                    const seconds = remainingTime % 60;
                    document.getElementById('progressTime').textContent = `予想残り時間: ${minutes}分${seconds}秒`;
                } else if (remainingTime > 0) {
                    document.getElementById('progressTime').textContent = `予想残り時間: ${remainingTime}秒`;
                } else {
                    document.getElementById('progressTime').textContent = '完了間近...';
                }
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                console.log('✅ アップロード成功:', response);
                
                document.getElementById('progressStatus').textContent = '完了！';
                document.getElementById('progressTime').textContent = '';
                
                // ゆっくり成功メッセージ表示
                showSuccess('音声ファイルがアップロードされました！✨', 2000);
                
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    cancelUpload();
                    loadVoiceList();
                }, 2000);
            } else {
                throw new Error('アップロードに失敗しました');
            }
        });
        
        xhr.addEventListener('error', () => {
            throw new Error('ネットワークエラーが発生しました');
        });
        
        xhr.open('POST', '/api/audio/upload');
        xhr.send(formData);
        
    } catch (error) {
        console.error('❌ アップロードエラー:', error);
        hideLoading();
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('uploadForm').style.display = 'block';
        alert('アップロードに失敗しました。もう一度お試しください。');
    }
}

// ファイルサイズをフォーマット
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== 声優用音声アップロード機能 =====
function handleNarratorFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ファイルサイズチェック (50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます。50MB以下のファイルを選択してください。');
        return;
    }
    
    // ファイル形式チェック
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        alert('対応していないファイル形式です。MP3, WAV, OGG, M4A形式のファイルを選択してください。');
        return;
    }
    
    narratorSelectedFile = file;
    
    // アップロードエリアを非表示にしてフォームを表示
    document.getElementById('narratorUploadArea').style.display = 'none';
    document.getElementById('narratorUploadForm').style.display = 'block';
    
    // ファイル名をタイトルに自動入力
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    document.getElementById('narratorAudioTitle').value = fileName;
}

function cancelNarratorUpload() {
    narratorSelectedFile = null;
    document.getElementById('narratorAudioFile').value = '';
    document.getElementById('narratorUploadArea').style.display = 'block';
    document.getElementById('narratorUploadForm').style.display = 'none';
    
    // フォームをリセット
    document.getElementById('narratorAudioTitle').value = '';
    document.getElementById('narratorAudioDescription').value = '';
    document.getElementById('narratorAudioCategory').value = '';
    document.getElementById('narratorAudioPortfolio').checked = true;
    document.getElementById('narratorAudioPublic').checked = true;
}

async function submitNarratorUpload() {
    if (!narratorSelectedFile) {
        alert('ファイルが選択されていません。');
        return;
    }
    
    const title = document.getElementById('narratorAudioTitle').value.trim();
    const description = document.getElementById('narratorAudioDescription').value.trim();
    const category = document.getElementById('narratorAudioCategory').value;
    const addToPortfolio = document.getElementById('narratorAudioPortfolio').checked;
    const isPublic = document.getElementById('narratorAudioPublic').checked;
    
    if (!title) {
        alert('タイトルを入力してください。');
        return;
    }
    
    if (!category) {
        alert('カテゴリを選択してください。');
        return;
    }
    
    // FormDataを作成
    const formData = new FormData();
    formData.append('audio', narratorSelectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('add_to_portfolio', addToPortfolio);
    formData.append('is_public', isPublic);
    
    try {
        // ゆっくりローディング表示
        showProgressLoading('音声ファイルをアップロード中...', 0);
        
        // フォームを非表示にして進捗表示を表示
        document.getElementById('narratorUploadForm').style.display = 'none';
        const progressDiv = document.getElementById('narratorUploadProgress');
        progressDiv.style.display = 'block';
        
        // 進捗情報を設定
        document.getElementById('narratorProgressFileName').textContent = narratorSelectedFile.name;
        document.getElementById('narratorProgressFileSize').textContent = formatFileSize(narratorSelectedFile.size);
        
        // API呼び出し（未実装）
        console.log('📤 声優音声ファイルをアップロードします:', {
            title,
            description,
            category,
            addToPortfolio,
            isPublic,
            fileSize: narratorSelectedFile.size,
            fileName: narratorSelectedFile.name
        });
        
        // 進捗をシミュレート（実際のAPI実装時に置き換え）
        await simulateNarratorUploadProgress(narratorSelectedFile.size);
        
        // 成功後の処理
        showToast('音声のアップロードが完了しました！', 'success');
        
        // リセット
        narratorSelectedFile = null;
        document.getElementById('narratorAudioFile').value = '';
        document.getElementById('narratorUploadProgress').style.display = 'none';
        document.getElementById('narratorUploadArea').style.display = 'block';
        
        // フォームをリセット
        document.getElementById('narratorAudioTitle').value = '';
        document.getElementById('narratorAudioDescription').value = '';
        document.getElementById('narratorAudioCategory').value = '';
        document.getElementById('narratorAudioPortfolio').checked = true;
        document.getElementById('narratorAudioPublic').checked = true;
        
    } catch (error) {
        console.error('❌ アップロードエラー:', error);
        showToast('アップロードに失敗しました', 'error');
        
        // エラー時は進捗を非表示にしてフォームを再表示
        document.getElementById('narratorUploadProgress').style.display = 'none';
        document.getElementById('narratorUploadForm').style.display = 'block';
    }
}

async function simulateNarratorUploadProgress(fileSize) {
    const totalSteps = 100;
    const stepDelay = 50;
    const startTime = Date.now();
    
    for (let i = 0; i <= totalSteps; i++) {
        const percentage = i;
        const loaded = (fileSize * i) / 100;
        
        // 進捗バーを更新
        document.getElementById('narratorProgressBar').style.width = percentage + '%';
        document.getElementById('narratorProgressPercentage').textContent = percentage + '%';
        
        // ステータスを更新
        if (i < 30) {
            document.getElementById('narratorProgressStatus').textContent = 'アップロード中...';
        } else if (i < 80) {
            document.getElementById('narratorProgressStatus').textContent = '処理中...';
        } else if (i < 100) {
            document.getElementById('narratorProgressStatus').textContent = '完了しています...';
        } else {
            document.getElementById('narratorProgressStatus').textContent = '完了！';
        }
        
        // 予想時間を計算
        if (i > 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = (elapsed / i) * (100 - i);
            document.getElementById('narratorProgressTime').textContent = `予想時間: ${Math.ceil(remaining)}秒`;
        }
        
        await new Promise(resolve => setTimeout(resolve, stepDelay));
    }
}

// アップロード進捗をシミュレート
async function simulateUploadProgress(fileSize) {
    const totalSteps = 100;
    const stepDelay = 50; // ミリ秒
    const startTime = Date.now();
    
    for (let i = 0; i <= totalSteps; i++) {
        const percentage = i;
        const loaded = (fileSize * i) / 100;
        
        // 進捗バーを更新
        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progressPercentage').textContent = percentage + '%';
        
        // ステータスメッセージを更新
        if (percentage < 30) {
            document.getElementById('progressStatus').textContent = 'アップロード開始...';
        } else if (percentage < 70) {
            document.getElementById('progressStatus').textContent = 'アップロード中...';
        } else if (percentage < 95) {
            document.getElementById('progressStatus').textContent = '処理中...';
        } else {
            document.getElementById('progressStatus').textContent = '完了間近...';
        }
        
        // 予想残り時間を計算
        if (i > 0) {
            const elapsedTime = (Date.now() - startTime) / 1000; // 秒
            const remainingPercentage = 100 - i;
            const timePerPercent = elapsedTime / i;
            const remainingTime = Math.ceil(timePerPercent * remainingPercentage);
            
            if (remainingTime > 60) {
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;
                document.getElementById('progressTime').textContent = `予想残り時間: ${minutes}分${seconds}秒`;
            } else {
                document.getElementById('progressTime').textContent = `予想残り時間: ${remainingTime}秒`;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, stepDelay));
    }
}

// ドラッグ＆ドロップ対応
function initUploadDragDrop() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = 'var(--primary-blue)';
            uploadArea.style.background = 'rgba(0, 66, 123, 0.15)';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = 'rgba(79, 172, 254, 0.3)';
            uploadArea.style.background = 'rgba(0, 66, 123, 0.05)';
        }, false);
    });
    
    uploadArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            document.getElementById('audioFile').files = files;
            handleFileSelect({ target: { files } });
        }
    }, false);
}

// 音声リストを読み込む
async function loadVoiceList() {
    const voiceList = document.getElementById('voiceList');
    if (!voiceList) return;
    
    try {
        const response = await fetch('/api/audio/list');
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'リスト取得に失敗しました');
        }
        
        const voices = result.data || [];
        
        if (voices.length === 0) {
            voiceList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-microphone-slash"></i>
                    <p>まだ音声がアップロードされていません</p>
                </div>
            `;
        } else {
            voiceList.innerHTML = voices.map(voice => `
                <div class="voice-item">
                    <div class="voice-header">
                        <div class="voice-info">
                            <h4>${voice.title}</h4>
                            <div class="voice-meta">
                                <span><i class="fas fa-tag"></i> ${getCategoryName(voice.category)}</span>
                                <span><i class="fas fa-calendar"></i> ${formatDate(voice.created_at)}</span>
                                <span><i class="fas fa-${voice.is_public ? 'eye' : 'eye-slash'}"></i> ${voice.is_public ? '公開' : '非公開'}</span>
                            </div>
                        </div>
                        <div class="voice-actions">
                            <button class="btn-icon" onclick="editVoice('${voice.id}')" title="編集">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="deleteVoice('${voice.id}')" title="削除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${voice.description ? `<p class="voice-description">${voice.description}</p>` : ''}
                    <div class="voice-player">
                        <audio controls>
                            <source src="${voice.url}" type="audio/mpeg">
                            お使いのブラウザは音声再生に対応していません。
                        </audio>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('❌ 音声リスト読み込みエラー:', error);
    }
}

function getCategoryName(category) {
    const categories = {
        'sample': 'サンプルボイス',
        'delivered': '納品済み作品',
        'profile': 'プロフィールボイス',
        'other': 'その他'
    };
    return categories[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
}

function editVoice(id) {
    console.log('編集:', id);
    // TODO: 編集機能の実装
}

async function deleteVoice(id) {
    if (!confirm('この音声ファイルを削除しますか？')) return;
    
    try {
        const response = await fetch(`/api/audio/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '削除に失敗しました');
        }
        
        alert('削除しました');
        loadVoiceList();
    } catch (error) {
        console.error('❌ 削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', function() {
    // 既存の初期化処理...
    
    // アップロード機能を初期化
    initUploadDragDrop();
});

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
        // エラーが発生してもフォールバックを表示
        console.warn('⚠️ エラー発生のため、フォールバック表示を使用します');
        alert(`アカウント情報の取得でエラーが発生しました。\n\nエラー: ${error.message}\n\nコンソールログ(F12)を確認してください。`);
        useFallbackDisplay('creator', 'streamerfunch');
        useFallbackDisplay('idol', 'idolfunch');
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
        
        // データ構造の検証
        if (!data.accountData || typeof data.accountData !== 'object') {
            console.warn(`⚠️ キャッシュデータの構造が不正: ${username}`);
            localStorage.removeItem(cacheKey); // 壊れたキャッシュを削除
            return null;
        }
        
        // キャッシュの有効期限をチェック
        if (!allowExpired && Date.now() - data.timestamp > CACHE_DURATION) {
            console.log(`⏰ キャッシュ期限切れ: ${username}`);
            return null;
        }
        
        // accountDataが正しいプロパティを持っているか確認
        const accountData = data.accountData;
        if (!accountData.id && !accountData.username && !accountData.name) {
            console.warn(`⚠️ キャッシュデータが不完全: ${username}`, accountData);
            localStorage.removeItem(cacheKey); // 不完全なキャッシュを削除
            return null;
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
    console.log(`🎨 ${type}アカウント表示を更新中...`);
    console.log(`📦 受信したaccountData:`, accountData);
    console.log(`📦 accountDataのキー:`, Object.keys(accountData || {}));
    
    const avatarId = type === 'creator' ? 'creatorAvatar' : 'idolAvatar';
    const avatarElement = document.getElementById(avatarId);
    console.log(`🔍 アバターID: ${avatarId}`);
    console.log(`🔍 アバター要素:`, avatarElement);
    console.log(`🔍 profile_image_url:`, accountData?.profile_image_url);
    console.log(`🔍 name:`, accountData?.name);
    console.log(`🔍 username:`, accountData?.username);
    
    if (avatarElement && accountData.profile_image_url) {
        // Twitter APIから取得した画像URLを使用（高解像度版を試す）
        const highResImageUrl = accountData.profile_image_url.replace('_normal', '_400x400');
        console.log(`🖼️ 画像URL更新: ${highResImageUrl}`);
        
        // 画像読み込みエラー時のフォールバック処理
        avatarElement.onerror = function() {
            console.warn(`⚠️ ${type}: 400x400が存在しないため、元のURLを使用`);
            this.onerror = null; // 無限ループ防止
            this.src = accountData.profile_image_url; // 元のURL（_normal）を使用
        };
        
        // 画像を設定
        avatarElement.src = highResImageUrl;
        avatarElement.alt = accountData.name || 'アカウント';
        console.log(`✅ ${type}アバター更新完了: ${highResImageUrl}`);
        
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
        
        console.log('🔍 要素確認:', {
            publicPage: !!publicPage,
            dashboard: !!dashboard
        });
        
        if (!publicPage || !dashboard) {
            console.error('❌ publicPageまたはdashboard要素が見つかりません');
            alert('エラー: ダッシュボード要素が見つかりません。ページをリロードしてください。');
            return;
        }
        
        console.log('📝 display変更前:', {
            publicPage: publicPage.style.display,
            dashboard: dashboard.style.display
        });
        
        publicPage.style.display = 'none';
        dashboard.style.display = 'block';
        
        console.log('📝 display変更後:', {
            publicPage: publicPage.style.display,
            dashboard: dashboard.style.display
        });
        
        console.log('✅ publicPageを非表示、dashboardを表示に切り替えました');
        
        // ユーザー情報を表示
        if (currentUser) {
            try {
                // ヘッダー
                const userAvatar = document.getElementById('userAvatar');
                const userName = document.getElementById('userName');
                if (userAvatar) userAvatar.src = currentUser.avatar || '';
                if (userName) userName.textContent = currentUser.displayName || currentUser.name || '';
                
                // プロフィールカード（Twitterライク）
                const profileHeaderImage = document.getElementById('profileHeaderImage');
                const profileAvatar = document.getElementById('profileAvatar');
                const profileName = document.getElementById('profileName');
                const profileHandle = document.getElementById('profileHandle');
                const profileBio = document.getElementById('profileBio');
                const profileWebsite = document.getElementById('profileWebsite');
                const profileJoinDate = document.getElementById('profileJoinDate');
                const followerCount = document.getElementById('followerCount');
                const followingCount = document.getElementById('followingCount');
                
                // ヘッダー画像を設定（ユーザーIDからURLを構築）
                if (profileHeaderImage && currentUser.id) {
                    const bannerUrl = `https://pbs.twimg.com/profile_banners/${currentUser.id}/1500x500`;
                    
                    // 画像が存在するか確認
                    const img = new Image();
                    img.onload = function() {
                        profileHeaderImage.style.backgroundImage = `url('${bannerUrl}')`;
                        profileHeaderImage.style.backgroundSize = 'cover';
                        profileHeaderImage.style.backgroundPosition = 'center';
                    };
                    img.onerror = function() {
                        // 画像が存在しない場合はグラデーションのまま
                        console.log('ℹ️ ヘッダー画像が見つかりません。グラデーションを使用します。');
                    };
                    img.src = bannerUrl;
                }
                
                if (profileAvatar) profileAvatar.src = currentUser.avatar || '';
                if (profileName) profileName.textContent = currentUser.displayName || currentUser.name || '';
                if (profileHandle) profileHandle.textContent = '@' + (currentUser.username || '');
                
                // プロフィール説明をリンク化
                if (profileBio) {
                    const description = currentUser.description || currentUser.profile_description || 'プロフィール説明がありません';
                    profileBio.innerHTML = linkifyText(description);
                }
                if (profileWebsite) {
                    profileWebsite.textContent = 'kimito-link-voice.com';
                    profileWebsite.href = 'https://kimito-link-voice.com';
                }
                if (profileJoinDate) profileJoinDate.textContent = '2025年5月からXを利用しています';
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
    // フォロー確認をスキップしても画像は取得する（表示のため）
    try {
        console.log('🖼️ フォロー状態セクションのサムネイル画像を取得');
        loadRequiredAccountsAvatars();
    } catch (error) {
        console.error('❌ アカウント画像読み込みエラー:', error);
    }
    
    // Twitter タイムラインを読み込み
    try {
        loadTwitterTimeline();
    } catch (error) {
        console.error('❌ タイムライン読み込みエラー:', error);
    }
}

// 必須フォローアカウントの画像と名前を取得
async function loadRequiredAccountsAvatars() {
    try {
        console.log('🔍 loadRequiredAccountsAvatars() 開始');
        
        // クリエイター応援アカウント
        const creatorResponse = await fetch('/api/user/profile/' + REQUIRED_ACCOUNTS.creator.id);
        console.log('📡 クリエイターレスポンス status:', creatorResponse.status);
        
        if (creatorResponse.ok) {
            const creatorData = await creatorResponse.json();
            console.log('📦 クリエイター生データ:', creatorData);
            
            // APIレスポンスの構造を確認（dataプロパティがある場合）
            const userData = creatorData.data || creatorData;
            console.log('📦 クリエイター処理後データ:', userData);
            console.log('🖼️ profile_image_url:', userData.profile_image_url);
            
            // 画像を更新
            const creatorAvatar = document.getElementById('creatorAvatar');
            console.log('🔍 creatorAvatar要素:', creatorAvatar);
            
            if (creatorAvatar && userData.profile_image_url) {
                // 高解像度画像を使用（_200x200 = 200x200）でピンボケ防止
                const imageUrl = userData.profile_image_url.replace('_normal', '_200x200');
                console.log('✅ クリエイター画像を更新:', imageUrl);
                
                // 画像の読み込みエラーハンドリング
                creatorAvatar.onerror = function() {
                    console.warn('⚠️ _200x200が存在しないため、元のURLを使用');
                    this.onerror = null; // 無限ループ防止
                    this.src = userData.profile_image_url;
                };
                creatorAvatar.src = imageUrl;
            } else {
                console.warn('⚠️ クリエイター画像更新失敗:', {
                    hasElement: !!creatorAvatar,
                    hasUrl: !!userData.profile_image_url,
                    url: userData.profile_image_url
                });
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
        console.log('📡 アイドルレスポンス status:', idolResponse.status);
        
        if (idolResponse.ok) {
            const idolData = await idolResponse.json();
            console.log('📦 アイドル生データ:', idolData);
            
            // APIレスポンスの構造を確認（dataプロパティがある場合）
            const userData = idolData.data || idolData;
            console.log('📦 アイドル処理後データ:', userData);
            console.log('🖼️ profile_image_url:', userData.profile_image_url);
            
            // 画像を更新
            const idolAvatar = document.getElementById('idolAvatar');
            console.log('🔍 idolAvatar要素:', idolAvatar);
            
            if (idolAvatar && userData.profile_image_url) {
                // 高解像度画像を使用（_200x200 = 200x200）でピンボケ防止
                const imageUrl = userData.profile_image_url.replace('_normal', '_200x200');
                console.log('✅ アイドル画像を更新:', imageUrl);
                
                // 画像の読み込みエラーハンドリング
                idolAvatar.onerror = function() {
                    console.warn('⚠️ _200x200が存在しないため、元のURLを使用');
                    this.onerror = null; // 無限ループ防止
                    this.src = userData.profile_image_url;
                };
                idolAvatar.src = imageUrl;
            } else {
                console.warn('⚠️ アイドル画像更新失敗:', {
                    hasElement: !!idolAvatar,
                    hasUrl: !!userData.profile_image_url,
                    url: userData.profile_image_url
                });
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
            showLoading('ログアウト中...');
            
            // サーバーのセッションを破棄
            await fetch('/auth/logout', { method: 'POST' });
            
            // クライアント側の状態をクリア
            currentUser = null;
            followedAccounts = { creator: false, idol: false };
            
            hideLoading();
            
            // ログアウト成功ページにリダイレクト
            window.location.href = '/logout-success.html';
        } catch (error) {
            hideLoading();
            console.error('ログアウトエラー:', error);
            showToast('ログアウトに失敗しました。', 'error');
        }
    }
}

// ===== アカウント切り替え =====
function showSwitchAccountModal() {
    const modal = document.getElementById('switchAccountModal');
    modal.style.display = 'flex';
    
    // 現在のアカウント情報を表示
    updateSwitchModalAccountInfo();
    
    // bodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
}

function hideSwitchAccountModal() {
    const modal = document.getElementById('switchAccountModal');
    modal.style.display = 'none';
    
    // bodyのスクロールを有効化
    document.body.style.overflow = '';
}

function updateSwitchModalAccountInfo() {
    // 現在のアカウント情報を表示
    if (currentUser) {
        const avatarEl = document.getElementById('switchModalAvatar');
        const nameEl = document.getElementById('switchModalName');
        const usernameEl = document.getElementById('switchModalUsername');
        
        if (avatarEl) avatarEl.src = currentUser.avatar || '';
        if (nameEl) nameEl.textContent = currentUser.name || currentUser.displayName || 'ユーザー';
        if (usernameEl) usernameEl.textContent = '@' + (currentUser.username || '');
    }
    
    // アカウント履歴を表示
    const history = getAccountHistory();
    const historySection = document.getElementById('accountHistorySection');
    const historyList = document.getElementById('accountHistoryList');
    
    if (!historyList) return;
    
    // 現在のアカウント以外の履歴を取得
    const otherAccounts = history.filter(acc => acc.id !== currentUser?.id);
    
    if (otherAccounts.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    historyList.innerHTML = '';
    
    otherAccounts.forEach(account => {
        const item = document.createElement('div');
        item.className = 'history-account-item';
        
        // 最終ログイン時刻を表示
        const lastLogin = new Date(account.lastLogin);
        const timeAgo = getTimeAgo(lastLogin);
        
        item.innerHTML = `
            <img src="${account.avatar || ''}" alt="${account.displayName}" class="history-avatar">
            <div class="history-info">
                <span class="history-name">${account.displayName}</span>
                <span class="history-username">@${account.username}</span>
                <span class="history-time">${timeAgo}</span>
            </div>
            <button class="btn-switch-to-account" onclick="switchToAccount('${account.id}')">
                <i class="fas fa-sign-in-alt"></i> 切り替え
            </button>
            <button class="btn-remove-history" onclick="removeFromHistory('${account.id}')" title="履歴から削除">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        historyList.appendChild(item);
    });
}

// 時間経過を表示
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
}

// アカウント切り替え（履歴から）
function switchToAccount(accountId) {
    console.log('📝 アカウント切り替え:', accountId);
    // ログアウトして再ログインを促す
    logoutAndSwitch();
}

// 履歴から削除
function removeFromHistory(accountId) {
    if (confirm('このアカウントを履歴から削除しますか？')) {
        removeAccountFromHistory(accountId);
        updateSwitchModalAccountInfo();
        showToast('アカウントを履歴から削除しました', 'info');
        console.log('✅ アカウント履歴から削除しました');
    }
}

async function logoutAndSwitch() {
    try {
        showLoading('ログアウト中...');
        
        // サーバーのセッションを破棄
        await fetch('/auth/logout', { method: 'POST' });
        
        // クライアント側の状態をクリア
        currentUser = null;
        followedAccounts = { creator: false, idol: false };
        
        // モーダルを閉じる
        hideSwitchAccountModal();
        hideUserMenu();
        hideLoading();
        
        // UIをリセット
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('publicPage').style.display = 'block';
        
        // トースト通知
        showToast('ログアウトしました。別のアカウントでログインできます。', 'success');
        
        // ログインモーダルを表示
        setTimeout(() => showLoginModal(), 500);
        
        console.log('✅ アカウント切り替えのためログアウトしました');
    } catch (error) {
        hideLoading();
        console.error('ログアウトエラー:', error);
        showToast('ログアウトに失敗しました。', 'error');
    }
}

// ===== ユーザードロップダウンメニュー =====
function toggleUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    const arrow = document.querySelector('.user-menu-arrow');
    
    if (menu.classList.contains('show')) {
        hideUserMenu();
    } else {
        showUserMenu();
    }
}

function showUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    const arrow = document.querySelector('.user-menu-arrow');
    
    menu.classList.add('show');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    
    // アカウント情報を更新
    updateUserDropdown();
    
    // 外側クリックで閉じる
    setTimeout(() => {
        document.addEventListener('click', closeUserMenuOnOutsideClick);
    }, 100);
}

function hideUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    const arrow = document.querySelector('.user-menu-arrow');
    
    menu.classList.remove('show');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    
    document.removeEventListener('click', closeUserMenuOnOutsideClick);
}

function closeUserMenuOnOutsideClick(event) {
    const menu = document.getElementById('userDropdownMenu');
    const trigger = document.querySelector('.user-menu-trigger');
    
    if (!menu.contains(event.target) && !trigger.contains(event.target)) {
        hideUserMenu();
    }
}

function updateUserDropdown() {
    if (!currentUser) return;
    
    // ヘッダーのユーザー情報を更新
    const headerName = document.getElementById('headerUserName');
    const headerHandle = document.getElementById('headerUserHandle');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownName = document.getElementById('dropdownName');
    const dropdownUsername = document.getElementById('dropdownUsername');
    
    if (headerName) headerName.textContent = currentUser.displayName || currentUser.name || 'ユーザー';
    if (headerHandle) headerHandle.textContent = '@' + (currentUser.username || '');
    if (dropdownAvatar) dropdownAvatar.src = currentUser.avatar || '';
    if (dropdownName) dropdownName.textContent = currentUser.displayName || currentUser.name || 'ユーザー';
    if (dropdownUsername) dropdownUsername.textContent = '@' + (currentUser.username || '');
    
    // アカウント履歴を表示
    const history = getAccountHistory();
    const historySection = document.getElementById('dropdownHistorySection');
    const historyList = document.getElementById('dropdownHistoryList');
    
    if (!historyList) return;
    
    // 現在のアカウント以外の履歴を取得
    const otherAccounts = history.filter(acc => acc.id !== currentUser.id).slice(0, 3); // 最大3件
    
    if (otherAccounts.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    historyList.innerHTML = '';
    
    otherAccounts.forEach(account => {
        const item = document.createElement('div');
        item.className = 'dropdown-history-item';
        item.onclick = () => {
            hideUserMenu();
            switchToAccount(account.id);
        };
        
        const timeAgo = getTimeAgo(new Date(account.lastLogin));
        
        item.innerHTML = `
            <img src="${account.avatar || ''}" alt="${account.displayName}" class="dropdown-history-avatar">
            <div class="dropdown-history-info">
                <span class="dropdown-history-name">${account.displayName}</span>
                <span class="dropdown-history-username">@${account.username} · ${timeAgo}</span>
            </div>
        `;
        
        historyList.appendChild(item);
    });
}

// ===== トースト通知システム =====
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // アイコンを選択
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // アニメーション開始
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自動削除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ローディングオーバーレイ
function showLoading(message = '読み込み中...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = overlay.querySelector('.loading-text');
    if (text) text.textContent = message;
    overlay.classList.add('show');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('show');
}

// ===== アカウント情報モーダル =====
function showAccountInfoModal() {
    hideUserMenu();
    const modal = document.getElementById('accountInfoModal');
    if (modal) {
        modal.style.display = 'flex';
        // プロフィール情報を読み込む
        loadModalAccountInfo();
    }
}

function hideAccountInfoModal() {
    const modal = document.getElementById('accountInfoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function loadModalAccountInfo() {
    if (!currentUser || !currentUser.username) return;
    
    try {
        const response = await fetch(`/api/twitter/user-info/${currentUser.username}`);
        
        if (!response.ok) {
            console.error('❌ アカウント情報取得エラー:', response.status);
            return;
        }
        
        const userData = await response.json();
        console.log('✅ アカウント情報取得成功:', userData);
        
        // ヘッダー画像
        const headerImage = document.getElementById('modalProfileHeaderImage');
        if (headerImage && userData.banner_url) {
            headerImage.style.backgroundImage = `url(${userData.banner_url})`;
        }
        
        // アバター画像
        const avatar = document.getElementById('modalProfileAvatar');
        if (avatar) {
            let avatarUrl = userData.profile_image_url || currentUser.avatar || '';
            if (avatarUrl.includes('_normal')) {
                avatarUrl = avatarUrl.replace('_normal', '_200x200');
            }
            avatar.src = avatarUrl;
        }
        
        // プロフィール情報
        const nameEl = document.getElementById('modalProfileName');
        if (nameEl) nameEl.textContent = userData.name || currentUser.name;
        
        const handleEl = document.getElementById('modalProfileHandle');
        if (handleEl) handleEl.textContent = `@${userData.username || currentUser.username}`;
        
        const bioEl = document.getElementById('modalProfileBio');
        if (bioEl && userData.description) {
            bioEl.textContent = userData.description;
        }
        
        // ウェブサイト
        if (userData.url) {
            const websiteContainer = document.getElementById('modalProfileWebsiteContainer');
            const websiteLink = document.getElementById('modalProfileWebsite');
            if (websiteContainer && websiteLink) {
                websiteContainer.style.display = 'flex';
                websiteLink.href = userData.url;
                websiteLink.textContent = userData.url.replace(/^https?:\/\//,'');
            }
        }
        
        // 登録日
        const joinDate = document.getElementById('modalProfileJoinDate');
        if (joinDate && userData.created_at) {
            const date = new Date(userData.created_at);
            joinDate.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月から利用しています`;
        }
        
        // フォロー統計
        const followingCount = document.getElementById('modalFollowingCount');
        if (followingCount) {
            followingCount.textContent = userData.following_count !== undefined ? 
                userData.following_count.toLocaleString() : '--';
        }
        
        const followerCount = document.getElementById('modalFollowerCount');
        if (followerCount) {
            followerCount.textContent = userData.followers_count !== undefined ? 
                userData.followers_count.toLocaleString() : '--';
        }
        
        // フォロー状態
        loadModalFollowStatus();
        
    } catch (error) {
        console.error('❌ アカウント情報取得エラー:', error);
    }
}

async function loadModalFollowStatus() {
    // クリエイターアカウント
    const creatorData = CORRECT_ACCOUNT_DATA['creator'];
    if (creatorData) {
        const creatorAvatar = document.getElementById('modalCreatorAvatar');
        const creatorName = document.getElementById('modalCreatorName');
        const creatorHandle = document.getElementById('modalCreatorHandle');
        
        if (creatorAvatar) creatorAvatar.src = creatorData.avatar;
        if (creatorName) creatorName.textContent = creatorData.name;
        if (creatorHandle) creatorHandle.textContent = creatorData.username;
    }
    
    // アイドルアカウント
    const idolData = CORRECT_ACCOUNT_DATA['idol'];
    if (idolData) {
        const idolAvatar = document.getElementById('modalIdolAvatar');
        const idolName = document.getElementById('modalIdolName');
        const idolHandle = document.getElementById('modalIdolHandle');
        
        if (idolAvatar) idolAvatar.src = idolData.avatar;
        if (idolName) idolName.textContent = idolData.name;
        if (idolHandle) idolHandle.textContent = idolData.username;
    }
}

// ===== 複数アカウント同時利用ガイド =====
function showMultiAccountGuide() {
    hideUserMenu();
    const modal = document.getElementById('multiAccountGuideModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // デフォルトでChromeタブを表示
        showGuideTab('chrome');
    }
}

function hideMultiAccountGuide() {
    const modal = document.getElementById('multiAccountGuideModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function showGuideTab(browser) {
    // すべてのタブとコンテンツを非表示
    const tabs = document.querySelectorAll('.guide-tab');
    const contents = document.querySelectorAll('.guide-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.style.display = 'none');
    
    // 選択されたタブとコンテンツを表示
    const selectedTab = document.querySelector(`.guide-tab[onclick*="${browser}"]`);
    const selectedContent = document.getElementById(`guide${browser.charAt(0).toUpperCase() + browser.slice(1)}`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.style.display = 'block';
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

// ===== ダッシュボードタブ切り替え =====
document.addEventListener('DOMContentLoaded', function() {
    // タブボタンの初期化
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // すべてのタブとコンテンツから active クラスを削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // クリックされたタブとコンテンツに active クラスを追加
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // タブごとのデータ読み込み
            if (targetTab === 'my-requests') {
                loadMyRequests(); // 依頼履歴を読み込む
            } else if (targetTab === 'orders') {
                loadOrders(); // 受注案件を読み込む（後で実装）
            }
        });
    });
    
    // 感謝のメッセージのプレビュー更新
    const thanksMessageInput = document.getElementById('thanksMessage');
    if (thanksMessageInput) {
        thanksMessageInput.addEventListener('input', updateThanksPreview);
    }
    
    // TOPページの感謝のメッセージを読み込む
    loadThanksMessagesForTopPage();
    
    // ダッシュボードの感謝のメッセージ一覧を読み込む
    loadThanksMessagesForDashboard();
    
    // 声優ページの感謝のメッセージを読み込む
    // 新着感謝のメッセージをチェック
    checkNewThanksMessages();
});

/**
 * 新着感謝のメッセージをチェック
 */
async function checkNewThanksMessages() {
    if (!supabaseClient) return;
    
    try {
        // 最後のログイン時刻を取得（localStorage）
        const lastLogin = localStorage.getItem('lastLoginTime') || new Date(0).toISOString();
        
        // 最後のログイン以降の新着メッセージを取得
        const { data, error } = await supabaseClient
            .from('thanks_messages')
            .select('*')
            .gte('created_at', lastLogin)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ 新着メッセージチェックエラー:', error);
            return;
        }
        
        if (data && data.length > 0) {
            // 新着通知を表示
            const notificationCard = document.getElementById('newThanksNotification');
            const countElement = document.getElementById('newThanksCount');
            
            if (notificationCard && countElement) {
                countElement.textContent = data.length;
                notificationCard.style.display = 'block';
                console.log(`✨ 新着感謝メッセージ: ${data.length}件`);
            }
        }
        
        // 現在の時刻をlastLoginTimeとして保存
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
    } catch (err) {
        console.error('❌ エラー:', err);
    }
}

/**
 * 新着メッセージを見るボタン
 */
function viewNewThanksMessages() {
    // みんなの感謝タブに移動
    const tabButton = document.querySelector('[data-tab="all-thanks"]');
    if (tabButton) {
        tabButton.click();
    }
    
    // 通知カードを非表示
    const notificationCard = document.getElementById('newThanksNotification');
    if (notificationCard) {
        notificationCard.style.display = 'none';
    }
}

// ===== 感謝のメッセージ機能 =====

/**
 * プレビューを更新
 */
function updateThanksPreview() {
    const messageInput = document.getElementById('thanksMessage');
    const previewMessage = document.getElementById('previewMessage');
    
    if (messageInput && previewMessage) {
        const message = messageInput.value || '素敵なボイスありがとうございました！\n台本のよさを3倍にも4倍にもしてくれたね！';
        previewMessage.innerHTML = message.replace(/\n/g, '<br>');
    }
    
    // ユーザー情報をプレビューに反映
    updateTwitterPreviewUser();
}

/**
 * Twitter風プレビューのユーザー情報を更新
 */
function updateTwitterPreviewUser() {
    const previewAvatar = document.getElementById('previewAvatar');
    const previewUserName = document.getElementById('previewUserName');
    const previewUserHandle = document.getElementById('previewUserHandle');
    
    if (currentUser) {
        if (previewAvatar) previewAvatar.src = currentUser.avatar || 'https://via.placeholder.com/48';
        if (previewUserName) previewUserName.textContent = currentUser.name || currentUser.displayName || 'あなたの名前';
        if (previewUserHandle) previewUserHandle.textContent = `@${currentUser.username}` || '@your_handle';
    }
}

// 現在のメッセージを保存（拡散用）
let currentThanksMessage = null;
let uploadedMediaFiles = [];

/**
 * メディアファイルのプレビュー
 */
document.addEventListener('DOMContentLoaded', function() {
    const mediaInput = document.getElementById('thanksMedia');
    if (mediaInput) {
        mediaInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            uploadedMediaFiles = files;
            displayMediaPreview(files);
            updateTwitterMediaPreview(files); // Twitter風プレビューにも反映
        });
    }
});

function displayMediaPreview(files) {
    const previewContainer = document.getElementById('mediaPreview');
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-preview-item';
            
            if (file.type.startsWith('image/')) {
                mediaElement.innerHTML = `
                    <img src="${e.target.result}" alt="プレビュー">
                    <button class="remove-media" onclick="removeMedia(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else if (file.type.startsWith('video/')) {
                mediaElement.innerHTML = `
                    <video src="${e.target.result}" controls></video>
                    <button class="remove-media" onclick="removeMedia(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            previewContainer.appendChild(mediaElement);
        };
        reader.readAsDataURL(file);
    });
}

function removeMedia(index) {
    uploadedMediaFiles.splice(index, 1);
    displayMediaPreview(uploadedMediaFiles);
    updateTwitterMediaPreview(uploadedMediaFiles);
}

/**
 * Twitter風プレビューにメディアを表示
 */
function updateTwitterMediaPreview(files) {
    const previewContainer = document.getElementById('previewMediaContainer');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    if (files.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'grid';
    
    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'twitter-media-item';
            
            if (file.type.startsWith('image/')) {
                mediaElement.innerHTML = `<img src="${e.target.result}" alt="添付画像">`;
            } else if (file.type.startsWith('video/')) {
                mediaElement.innerHTML = `<video src="${e.target.result}" controls></video>`;
            }
            
            previewContainer.appendChild(mediaElement);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 感謝のメッセージ投稿前の確認
 */
function submitThanksMessage() {
    const messageInput = document.getElementById('thanksMessage');
    
    if (!messageInput) {
        showToast('エラー', 'メッセージ入力欄が見つかりません', 'error');
        return;
    }
    
    const message = messageInput.value.trim();
    
    if (!message) {
        showToast('エラー', 'メッセージを入力してください', 'error');
        return;
    }
    
    // 確認モーダルを表示
    showConfirmModal(message);
}

/**
 * 確認モーダルを表示
 */
function showConfirmModal(message) {
    const modal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmPreviewMessage');
    const confirmMedia = document.getElementById('confirmPreviewMedia');
    
    // メッセージをプレビュー
    confirmMessage.innerHTML = message.replace(/\n/g, '<br>');
    
    // メディアをプレビュー
    confirmMedia.innerHTML = '';
    uploadedMediaFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'confirm-media-item';
            
            if (file.type.startsWith('image/')) {
                mediaElement.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
            } else if (file.type.startsWith('video/')) {
                mediaElement.innerHTML = `<video src="${e.target.result}" controls></video>`;
            }
            
            confirmMedia.appendChild(mediaElement);
        };
        reader.readAsDataURL(file);
    });
    
    // モーダル表示
    modal.style.display = 'flex';
}

/**
 * 確認モーダルを閉じる
 */
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
}

/**
 * 確認後、実際に投稿
 */
async function confirmAndSubmit() {
    const messageInput = document.getElementById('thanksMessage');
    const message = messageInput.value.trim();
    
    // 現在のユーザー情報を取得（担当声優を判定）
    const voiceActorMention = '@streamerfunch'; // デフォルトは君斗りんく
    
    // Supabaseクライアントチェック
    if (!supabaseClient) {
        console.error('❌ Supabaseクライアントが初期化されていません');
        showToast('エラー', 'データベース接続エラー', 'error');
        return;
    }
    
    // Supabaseに投稿
    try {
        const { data, error } = await supabaseClient
            .from('thanks_messages')
            .insert([
                {
                    user_id: 'test_user_' + Date.now(),
                    user_name: currentUser?.name || '匿名ユーザー',
                    user_handle: currentUser?.username || '@anonymous',
                    user_avatar: currentUser?.avatar || 'https://via.placeholder.com/50',
                    followers_count: currentUser?.followers || 0,
                    message: message,
                    target_voice_actor: voiceActorMention
                }
            ])
            .select();
        
        if (error) {
            console.error('❌ メッセージ投稿エラー:', error);
            showToast('エラー', 'メッセージの投稿に失敗しました', 'error');
            return;
        }
        
        console.log('✅ メッセージ投稿成功:', data);
        
        // 確認モーダルを閉じる
        closeConfirmModal();
        
        showToast('成功', 'メッセージを投稿しました', 'success');
        
        // メッセージを保存（拡散用）
        currentThanksMessage = {
            message: message,
            voiceActorMention: voiceActorMention
        };
        
        // 拡散セクションを表示
        const spreadSection = document.getElementById('spreadSection');
        if (spreadSection) {
            spreadSection.style.display = 'block';
        }
        
        // メッセージ一覧を再読み込み
        loadThanksMessagesForDashboard();
        loadThanksMessagesForTopPage();
        
        // フォームをリセット
        messageInput.value = '';
        uploadedMediaFiles = [];
        displayMediaPreview([]);
        
    } catch (err) {
        console.error('❌ エラー:', err);
        showToast('エラー', 'メッセージの投稿に失敗しました', 'error');
    }
}

/**
 * Twitterで拡散する
 */
function spreadToTwitter() {
    if (!currentThanksMessage) {
        showToast('エラー', 'メッセージが見つかりません', 'error');
        return;
    }
    
    const tweetText = `${currentThanksMessage.message}\n\n#KimitoLinkVoice ${currentThanksMessage.voiceActorMention}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    showToast('成功', 'Twitter投稿画面を開きました', 'success');
}

/**
 * 感謝のメッセージをTwitterに拡散
 */
async function shareThanksMessageOnTwitter() {
    const messageInput = document.getElementById('thanksMessage');
    
    if (!messageInput) {
        showToast('エラー', 'メッセージ入力欄が見つかりません', 'error');
        return;
    }
    
    const message = messageInput.value.trim();
    
    if (!message) {
        showToast('エラー', 'メッセージを入力してください', 'error');
        return;
    }
    
    // 現在のユーザー情報を取得（担当声優を判定）
    const voiceActorMention = '@streamerfunch'; // デフォルトは君斗りんく
    
    // Twitter投稿用のテキストを構築
    const tweetText = `${message}\n\n#KimitoLinkVoice ${voiceActorMention}`;
    
    // Twitter Web Intentで投稿画面を開く
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    // 新しいウィンドウで開く
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    
    showToast('成功', 'Twitterの投稿画面を開きました', 'success');
    
    // 投稿後、メッセージをリセット（オプション）
    // messageInput.value = '';
}

/**
 * TOPページの感謝のメッセージを読み込む
 */
async function loadThanksMessagesForTopPage() {
    if (!supabaseClient) return;
    
    const archiveGrid = document.querySelector('.thanks-archive-grid');
    if (!archiveGrid) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('thanks_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
        
        if (error) {
            console.error('❌ メッセージ取得エラー:', error);
            return;
        }
        
        if (data && data.length > 0) {
            archiveGrid.innerHTML = '';
            data.forEach(message => {
                const card = createThanksArchiveCard(message);
                archiveGrid.appendChild(card);
            });
            console.log(`✅ TOPページ: ${data.length}件表示`);
        }
    } catch (err) {
        console.error('❌ エラー:', err);
    }
}

/**
 * 感謝のメッセージカードを生成
 */
function createThanksArchiveCard(message) {
    const card = document.createElement('div');
    card.className = 'thanks-archive-card';
    
    const createdDate = new Date(message.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="archive-user-info">
            <img src="${message.user_avatar || 'https://via.placeholder.com/50'}" alt="${message.user_name}" class="archive-avatar">
            <div class="archive-user-details">
                <h4>${message.user_name}</h4>
                <p class="archive-handle">${message.user_handle}</p>
                <p class="archive-followers"><i class="fas fa-users"></i> ${message.followers_count.toLocaleString()} フォロワー</p>
            </div>
        </div>
        <div class="archive-message">
            <p>${message.message.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="archive-meta">
            <span class="archive-date"><i class="far fa-clock"></i> ${createdDate}</span>
            <span class="archive-voice-actor"><i class="fas fa-microphone"></i> ${message.target_voice_actor}</span>
        </div>
    `;
    
    return card;
}

/**
 * ダッシュボードの感謝のメッセージ一覧を読み込む
 */
async function loadThanksMessagesForDashboard() {
    if (!supabaseClient) return;
    
    try {
        // 全てのメッセージを取得
        const { data, error } = await supabaseClient
            .from('thanks_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) {
            console.error('❌ ダッシュボードメッセージ取得エラー:', error);
            return;
        }
        
        if (data && data.length > 0) {
            // 自分の投稿とみんなの投稿を分ける
            const myMessages = data.filter(msg => msg.user_id === currentUser?.id);
            const allMessages = data.filter(msg => msg.user_id !== currentUser?.id);
            
            // 自分の投稿を表示
            const myMessagesList = document.getElementById('myThanksMessages');
            if (myMessagesList) {
                const emptyState = myMessagesList.querySelector('.empty-state');
                if (emptyState) emptyState.remove();
                
                const existingCards = myMessagesList.querySelectorAll('.thanks-message-card');
                existingCards.forEach(card => card.remove());
                
                if (myMessages.length > 0) {
                    myMessages.forEach(message => {
                        const card = createDashboardMessageCard(message, true);
                        myMessagesList.appendChild(card);
                    });
                    console.log(`✅ 自分の投稿: ${myMessages.length}件`);
                } else {
                    myMessagesList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>まだ感謝のメッセージを投稿していません</p>
                        </div>
                    `;
                }
            }
            
            // みんなの投稿を表示
            const allMessagesList = document.getElementById('allThanksMessages');
            if (allMessagesList) {
                const existingCards = allMessagesList.querySelectorAll('.thanks-message-card');
                existingCards.forEach(card => card.remove());
                
                if (allMessages.length > 0) {
                    allMessages.forEach(message => {
                        const card = createDashboardMessageCard(message, false);
                        allMessagesList.appendChild(card);
                    });
                    console.log(`✅ みんなの投稿: ${allMessages.length}件`);
                } else {
                    allMessagesList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-heart"></i>
                            <p>まだ感謝のメッセージはありません</p>
                        </div>
                    `;
                }
            }
        }
    } catch (err) {
        console.error('❌ エラー:', err);
    }
}

/**
 * ダッシュボード用メッセージカードを生成
 */
function createDashboardMessageCard(message, isMyMessage = false) {
    const card = document.createElement('div');
    card.className = 'thanks-message-card';
    
    const createdDate = new Date(message.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const actionsHtml = isMyMessage ? `
        <div class="message-actions">
            <button class="btn-edit-message" onclick="editThanksMessage('${message.id}')">
                <i class="fas fa-edit"></i> 編集
            </button>
            <button class="btn-delete-message" onclick="deleteThanksMessage('${message.id}')">
                <i class="fas fa-trash"></i> 削除
            </button>
        </div>
    ` : '';
    
    card.innerHTML = `
        <div class="message-user-info">
            <img src="${message.user_avatar || 'https://via.placeholder.com/60'}" alt="${message.user_name}" class="message-avatar">
            <div class="message-user-details">
                <h4>${message.user_name}</h4>
                <p class="message-handle">${message.user_handle}</p>
                <p class="message-followers"><i class="fas fa-users"></i> ${message.followers_count.toLocaleString()} フォロワー</p>
            </div>
            <span class="message-date">${createdDate}</span>
        </div>
        <div class="message-content">
            <p>${message.message.replace(/\n/g, '<br>')}</p>
        </div>
        ${actionsHtml}
    `;
    
    return card;
}

/**
 * 感謝のメッセージを編集
 */
async function editThanksMessage(messageId) {
    if (!supabaseClient) {
        showToast('エラー', 'データベース接続エラー', 'error');
        return;
    }
    
    try {
        // メッセージを取得
        const { data, error } = await supabaseClient
            .from('thanks_messages')
            .select('*')
            .eq('id', messageId)
            .single();
        
        if (error) {
            console.error('❌ メッセージ取得エラー:', error);
            showToast('エラー', 'メッセージの取得に失敗しました', 'error');
            return;
        }
        
        // 編集フォームに内容を設定
        const messageInput = document.getElementById('thanksMessage');
        if (messageInput) {
            messageInput.value = data.message;
            
            // あなたの感謝タブに移動
            const tabButton = document.querySelector('[data-tab="my-thanks"]');
            if (tabButton) {
                tabButton.click();
            }
            
            // スクロールしてフォームを表示
            messageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageInput.focus();
            
            showToast('編集モード', 'メッセージを編集してください', 'info');
            
            // 編集中のIDを保存
            window.editingMessageId = messageId;
        }
        
    } catch (err) {
        console.error('❌ エラー:', err);
        showToast('エラー', '予期しないエラーが発生しました', 'error');
    }
}

/**
 * 感謝のメッセージを削除
 */
async function deleteThanksMessage(messageId) {
    if (!supabaseClient) {
        showToast('エラー', 'データベース接続エラー', 'error');
        return;
    }
    
    // 確認ダイアログ
    if (!confirm('このメッセージを削除してもよろしいですか？\n削除すると元に戻せません。')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('thanks_messages')
            .delete()
            .eq('id', messageId);
        
        if (error) {
            console.error('❌ 削除エラー:', error);
            showToast('エラー', 'メッセージの削除に失敗しました', 'error');
            return;
        }
        
        showToast('削除完了', 'メッセージを削除しました', 'success');
        
        // 一覧を再読み込み
        loadThanksMessagesForDashboard();
        loadThanksMessagesForTopPage();
        loadThanksMessagesForVoiceActor();
        
        console.log('✅ メッセージを削除しました:', messageId);
        
    } catch (err) {
        console.error('❌ エラー:', err);
        showToast('エラー', '予期しないエラーが発生しました', 'error');
    }
}

/**
 * ダッシュボードのプロフィール情報をXから取得して表示
 */
async function loadUserProfileFromTwitter() {
    if (!currentUser || !currentUser.username) return;
    
    try {
        const response = await fetch(`/api/twitter/user-info/${currentUser.username}`);
        
        if (!response.ok) {
            console.error('❌ プロフィール取得エラー:', response.status);
            return;
        }
        
        const userData = await response.json();
        console.log('✅ プロフィール取得成功:', userData);
        
        // ヘッダー画像を設定
        const headerImage = document.getElementById('profileHeaderImage');
        if (headerImage) {
            if (userData.profile_banner_url) {
                headerImage.style.backgroundImage = `url(${userData.profile_banner_url})`;
                headerImage.style.backgroundSize = 'cover';
                headerImage.style.backgroundPosition = 'center';
                console.log('🖼️ ヘッダー画像URL:', userData.profile_banner_url);
            } else {
                console.log('⚠️ ヘッダー画像が設定されていません');
            }
        }
        
        // アバター画像を設定（高解像度版）
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            // _normal を _200x200 に置き換えて高解像度画像を取得（60px表示なのでフォロー状態と同じ）
            let avatarUrl = userData.profile_image_url || currentUser.avatar || '';
            if (avatarUrl.includes('_normal')) {
                avatarUrl = avatarUrl.replace('_normal', '_200x200');
            }
            profileAvatar.src = avatarUrl;
            console.log('📸 アバター画像URL:', avatarUrl);
        }
        
        // プロフィール情報を設定
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = userData.name || currentUser.name;
        }
        
        const profileHandle = document.getElementById('profileHandle');
        if (profileHandle) {
            profileHandle.textContent = `@${userData.username || currentUser.username}`;
        }
        
        const profileBio = document.getElementById('profileBio');
        if (profileBio && userData.description) {
            profileBio.textContent = userData.description;
        }
        
        const profileWebsiteContainer = document.getElementById('profileWebsiteContainer');
        const profileWebsite = document.getElementById('profileWebsite');
        if (profileWebsite && userData.url) {
            profileWebsite.textContent = userData.url;
            profileWebsite.href = userData.url;
            if (profileWebsiteContainer) {
                profileWebsiteContainer.style.display = 'flex';
            }
        }
        
        const followingCount = document.getElementById('followingCount');
        if (followingCount && userData.public_metrics) {
            followingCount.textContent = userData.public_metrics.following_count.toLocaleString();
        }
        
        const followerCount = document.getElementById('followerCount');
        if (followerCount && userData.public_metrics) {
            followerCount.textContent = userData.public_metrics.followers_count.toLocaleString();
        }
        
        const profileJoinDate = document.getElementById('profileJoinDate');
        if (profileJoinDate && userData.created_at) {
            const joinDate = new Date(userData.created_at);
            profileJoinDate.textContent = `${joinDate.getFullYear()}年${joinDate.getMonth() + 1}月から利用しています`;
        }
        
    } catch (err) {
        console.error('❌ プロフィール取得エラー:', err);
    }
}

/**
 * 声優用プロフィール情報を読み込む
 */
async function loadNarratorProfileInfo() {
    if (!currentUser || !currentUser.username) return;
    
    try {
        const response = await fetch(`/api/twitter/user-info/${currentUser.username}`);
        
        if (!response.ok) {
            console.error('❌ 声優プロフィール取得エラー:', response.status);
            return;
        }
        
        const userData = await response.json();
        console.log('✅ 声優プロフィール取得成功:', userData);
        
        // アバター画像を設定
        const narratorAvatar = document.getElementById('narratorAvatar');
        if (narratorAvatar) {
            let avatarUrl = userData.profile_image_url || currentUser.avatar || '';
            if (avatarUrl.includes('_normal')) {
                avatarUrl = avatarUrl.replace('_normal', '_200x200');
            }
            narratorAvatar.src = avatarUrl;
        }
        
        // プロフィール情報を設定
        const narratorName = document.getElementById('narratorName');
        if (narratorName) {
            narratorName.textContent = userData.name || currentUser.name;
        }
        
        const narratorHandle = document.getElementById('narratorHandle');
        if (narratorHandle) {
            narratorHandle.textContent = `@${userData.username || currentUser.username}`;
        }
        
        const narratorBio = document.getElementById('narratorBio');
        if (narratorBio && userData.description) {
            narratorBio.textContent = userData.description;
        }
        
    } catch (err) {
        console.error('❌ 声優プロフィール取得エラー:', err);
    }
}

/**
 * 声優ページの感謝のメッセージを読み込む
 */
async function loadThanksMessagesForVoiceActor() {
    if (!supabaseClient) return;
    
    const actorThanksList = document.querySelector('.actor-thanks-list');
    if (!actorThanksList) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('thanks_messages')
            .select('*')
            .eq('target_voice_actor', '@streamerfunch')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('❌ 声優ページメッセージ取得エラー:', error);
            return;
        }
        
        if (data && data.length > 0) {
            const existingCards = actorThanksList.querySelectorAll('.thanks-message-card');
            existingCards.forEach(card => card.remove());
            
            data.forEach(message => {
                const card = createDashboardMessageCard(message);
                actorThanksList.appendChild(card);
            });
            
            console.log(`✅ 声優ページ: ${data.length}件表示`);
        }
    } catch (err) {
        console.error('❌ エラー:', err);
    }
}

/**
 * コラボを依頼（既存の関数を拡張）
 */
function requestCollab() {
    const message = 'こんにちは！コラボをお願いしたいです。';
    const mention = '@c0tanpoTeshi1a';
    const hashtag = '#KimitoLinkVoice';
    
    const tweetText = `${mention} ${message}\n\n${hashtag}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    showToast('成功', 'コラボ依頼画面を開きました', 'success');
}

// ===== エクスポート =====
// モジュール化が必要な場合
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loginWithTwitter,
        checkFollowStatus,
        logout,
        tweetReview,
        requestCollab,
        postThanksToTwitter,
        updateThanksPreview,
        loadVoiceActorCard,
        loadCollabMemberCard
    };
}

// ===== 声優カード・コラボメンバーカードのAPI取得 =====

/**
 * 声優カードの情報を取得して表示
 */
async function loadVoiceActorCard() {
    const username = 'streamerfunch'; // 君斗りんく
    console.log('🎤 声優カード情報取得中...', username);
    
    try {
        const response = await fetch(`/api/user/profile/${username}`);
        if (!response.ok) {
            console.error('❌ 声優情報取得エラー:', response.status);
            return;
        }
        
        const data = await response.json();
        const userData = data.data || data;
        console.log('✅ 声優情報取得成功:', userData);
        
        // アバター画像を更新
        const avatarEl = document.getElementById('voiceActorAvatar');
        if (avatarEl && userData.profile_image_url) {
            const imageUrl = userData.profile_image_url.replace('_normal', '_200x200');
            avatarEl.src = imageUrl;
            avatarEl.onerror = function() {
                this.onerror = null;
                this.src = userData.profile_image_url;
            };
        }
        
        // 名前を更新
        const nameEl = document.getElementById('voiceActorName');
        if (nameEl && userData.name) {
            nameEl.textContent = userData.name;
        }
        
        // ハンドル(@username)を更新
        const handleEl = document.getElementById('voiceActorHandle');
        if (handleEl && userData.username) {
            handleEl.textContent = `@${userData.username}`;
        }
        
        // プロフィールを更新
        const bioEl = document.getElementById('voiceActorBio');
        if (bioEl && userData.description) {
            bioEl.textContent = userData.description;
        }
        
        // フォロワー数を更新
        const followersEl = document.getElementById('voiceActorFollowers');
        if (followersEl && userData.public_metrics?.followers_count) {
            const count = userData.public_metrics.followers_count.toLocaleString();
            followersEl.innerHTML = `<i class="fas fa-users"></i> ${count} フォロワー`;
        }
        
        console.log('✅ 声優カード更新完了');
        
    } catch (error) {
        console.error('❌ 声優カード取得エラー:', error);
    }
}

/**
 * コラボメンバーカードの情報を取得して表示
 */
async function loadCollabMemberCard() {
    const username = 'c0tanpoTesh1ta'; // コタのAI紀行 @c0tanpoTesh1ta（正しいスペル）
    console.log('🤝 コラボメンバー情報取得中...', username);
    
    try {
        const response = await fetch(`/api/user/profile/${username}`);
        if (!response.ok) {
            console.error('❌ コラボメンバー情報取得エラー:', response.status);
            return;
        }
        
        const data = await response.json();
        const userData = data.data || data;
        console.log('✅ コラボメンバー情報取得成功:', userData);
        console.log('📊 コラボメンバー詳細:', {
            name: userData.name,
            username: userData.username,
            description: userData.description,
            followers: userData.public_metrics?.followers_count,
            profile_image_url: userData.profile_image_url
        });
        
        // アバター画像を更新
        const avatarEl = document.getElementById('collabAvatar');
        if (avatarEl && userData.profile_image_url) {
            const imageUrl = userData.profile_image_url.replace('_normal', '_200x200');
            console.log('🖼️ コラボメンバー画像URL:', imageUrl);
            console.log('🖼️ 画像要素を発見:', avatarEl);
            avatarEl.src = imageUrl;
            avatarEl.onerror = function() {
                console.error('❌ 画像読み込みエラー:', imageUrl);
                console.log('🔄 元のURLにフォールバック:', userData.profile_image_url);
                this.onerror = null;
                this.src = userData.profile_image_url;
            };
            avatarEl.onload = function() {
                console.log('✅ 画像読み込み成功:', imageUrl);
            };
        } else {
            console.warn('⚠️ 画像要素またはprofile_image_urlが存在しません');
            console.warn('⚠️ avatarEl:', avatarEl);
            console.warn('⚠️ profile_image_url:', userData.profile_image_url);
        }
        
        // 名前を更新
        const nameEl = document.getElementById('collabName');
        if (nameEl && userData.name) {
            nameEl.textContent = userData.name + 'さん';
        }
        
        // ハンドル(@username)を更新
        const handleEl = document.getElementById('collabHandle');
        if (handleEl && userData.username) {
            handleEl.textContent = `@${userData.username}`;
        }
        
        // プロフィールを更新
        const bioEl = document.getElementById('collabBio');
        if (bioEl) {
            if (userData.description) {
                bioEl.textContent = userData.description;
                console.log('✅ プロフィール文章を設定:', userData.description);
            } else {
                console.warn('⚠️ プロフィール文章(description)が存在しません');
            }
        }
        
        // フォロワー数を更新
        const followersEl = document.getElementById('collabFollowers');
        if (followersEl) {
            if (userData.public_metrics?.followers_count) {
                const count = userData.public_metrics.followers_count.toLocaleString();
                followersEl.innerHTML = `<i class="fas fa-users"></i> ${count} フォロワー`;
                console.log('✅ フォロワー数を設定:', count);
            } else {
                console.warn('⚠️ フォロワー数(public_metrics.followers_count)が存在しません');
                console.warn('⚠️ public_metrics全体:', userData.public_metrics);
            }
        }
        
        console.log('✅ コラボメンバーカード更新完了');
        
    } catch (error) {
        console.error('❌ コラボメンバーカード取得エラー:', error);
    }
}

/**
 * TOPページの声優カード1を取得して表示（@streamerfunch）
 */
async function loadNarratorCard1() {
    const username = 'streamerfunch'; // 君斗りんく@クリエイター応援
    console.log('🎤 声優カード1情報取得中...', username);
    
    try {
        const response = await fetch(`/api/user/profile/${username}`);
        if (!response.ok) {
            console.error('❌ 声優カード1取得エラー:', response.status);
            return;
        }
        
        const data = await response.json();
        const userData = data.data || data;
        console.log('✅ 声優カード1取得成功:', userData);
        console.log('📊 声優カード1詳細:', {
            name: userData.name,
            username: userData.username,
            description: userData.description,
            followers: userData.public_metrics?.followers_count,
            profile_image_url: userData.profile_image_url
        });
        
        // アバター画像を更新
        const avatarEl = document.getElementById('narrator1Avatar');
        if (avatarEl && userData.profile_image_url) {
            const imageUrl = userData.profile_image_url.replace('_normal', '_200x200');
            console.log('🖼️ 声優カード1画像URL:', imageUrl);
            avatarEl.src = imageUrl;
            avatarEl.onerror = function() {
                this.onerror = null;
                this.src = userData.profile_image_url;
            };
        }
        
        // 名前を更新
        const nameEl = document.getElementById('narrator1Name');
        if (nameEl && userData.name) {
            nameEl.textContent = userData.name;
        }
        
        // ハンドルを更新
        const handleEl = document.getElementById('narrator1Handle');
        if (handleEl && userData.username) {
            handleEl.textContent = `@${userData.username}`;
        }
        
        // フォロワー数を更新
        const followersEl = document.getElementById('narrator1Followers');
        if (followersEl && userData.public_metrics?.followers_count) {
            const count = userData.public_metrics.followers_count.toLocaleString();
            followersEl.innerHTML = `<i class="fas fa-users"></i> ${count} フォロワー`;
        }
        
        // プロフィール文を更新
        const bioEl = document.getElementById('narrator1Bio');
        if (bioEl && userData.description) {
            bioEl.textContent = userData.description;
        }
        
        console.log('✅ 声優カード1更新完了');
        
    } catch (error) {
        console.error('❌ 声優カード1取得エラー:', error);
    }
}

/**
 * TOPページの声優カード2を取得して表示（@idolfunch）
 */
async function loadNarratorCard2() {
    const username = 'idolfunch'; // 君斗りんく@アイドル応援
    console.log('🎤 声優カード2情報取得中...', username);
    
    try {
        const response = await fetch(`/api/user/profile/${username}`);
        if (!response.ok) {
            console.error('❌ 声優カード2取得エラー:', response.status);
            return;
        }
        
        const data = await response.json();
        const userData = data.data || data;
        console.log('✅ 声優カード2取得成功:', userData);
        
        // アバター画像を更新
        const avatarEl = document.getElementById('narrator2Avatar');
        if (avatarEl && userData.profile_image_url) {
            const imageUrl = userData.profile_image_url.replace('_normal', '_200x200');
            avatarEl.src = imageUrl;
            avatarEl.onerror = function() {
                this.onerror = null;
                this.src = userData.profile_image_url;
            };
        }
        
        // 名前を更新
        const nameEl = document.getElementById('narrator2Name');
        if (nameEl && userData.name) {
            nameEl.textContent = userData.name;
        }
        
        // ハンドルを更新
        const handleEl = document.getElementById('narrator2Handle');
        if (handleEl && userData.username) {
            handleEl.textContent = `@${userData.username}`;
        }
        
        // フォロワー数を更新
        const followersEl = document.getElementById('narrator2Followers');
        if (followersEl && userData.public_metrics?.followers_count) {
            const count = userData.public_metrics.followers_count.toLocaleString();
            followersEl.innerHTML = `<i class="fas fa-users"></i> ${count} フォロワー`;
        }
        
        // プロフィール文を更新
        const bioEl = document.getElementById('narrator2Bio');
        if (bioEl && userData.description) {
            bioEl.textContent = userData.description;
        }
        
        console.log('✅ 声優カード2更新完了');
        
    } catch (error) {
        console.error('❌ 声優カード2取得エラー:', error);
    }
}

// ページ読み込み時に自動的に取得
window.addEventListener('DOMContentLoaded', function() {
    // 全てのカードを読み込み
    loadNarratorCard1();      // TOPページ声優カード1 (@streamerfunch)
    loadNarratorCard2();      // TOPページ声優カード2 (@idolfunch)
    // 声優カード3はダミーデータのまま
    loadVoiceActorCard();     // 声優プロフィールタブ
    loadCollabMemberCard();   // コラボメンバー (@c0tanpoTesh1ta)
    
    // 依頼フォームの初期化
    initializeRequestForm();
    
    // 役割切り替えの初期化
    initializeRoleSwitch();
});

// ===== 役割切り替え機能 =====

let currentRole = 'client'; // 'client' or 'narrator'

function initializeRoleSwitch() {
    // localStorageから前回の役割を取得
    const savedRole = localStorage.getItem('dashboardRole') || 'client';
    currentRole = savedRole;
    
    // 初期表示を設定
    updateRoleDisplay();
}

function switchRole(role) {
    if (role === currentRole) return;
    
    currentRole = role;
    localStorage.setItem('dashboardRole', role);
    
    console.log(`🔄 役割切り替え: ${role === 'client' ? '依頼者モード' : '声優モード'}`);
    
    // 表示を更新
    updateRoleDisplay();
    
    // トースト通知
    const message = role === 'client' ? '依頼者モードに切り替えました' : '声優モードに切り替えました';
    showToast(message, 'info');
}

// ===== 上部ナビゲーション切り替え =====
function showDashboardSection(section) {
    console.log('🔄 タブ切り替え:', section);
    
    // ナビリンクのactive状態を更新
    document.querySelectorAll('.dashboard-nav .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });
    
    // 全てのタブコンテンツを強制的に非表示
    const allTabs = document.querySelectorAll('.tab-content');
    console.log('📋 全タブ数:', allTabs.length);
    allTabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
        console.log('❌ 非表示:', tab.id);
    });
    
    // 選択されたセクションを表示
    switch(section) {
        case 'dashboard':
            // dashboard-contentのpadding-topを元に戻す
            const dashboardContentRestore = document.querySelector('.dashboard-content');
            if (dashboardContentRestore) {
                dashboardContentRestore.style.paddingTop = '';
            }
            
            const overviewTab = document.getElementById('overview-tab');
            if (overviewTab) {
                overviewTab.style.display = 'block';
                overviewTab.classList.add('active');
                console.log('✅ 表示: overview-tab');
                
                // ダッシュボードのコンテンツを表示
                const clientContent = document.getElementById('clientDashboardContent');
                const narratorContent = document.getElementById('narratorDashboardContent');
                if (currentRole === 'client' && clientContent) {
                    clientContent.style.display = 'grid';
                } else if (currentRole === 'narrator' && narratorContent) {
                    narratorContent.style.display = 'grid';
                }
            }
            break;
        case 'history':
            // dashboard-contentのpadding-topを元に戻す
            const dashboardContentHistory = document.querySelector('.dashboard-content');
            if (dashboardContentHistory) {
                dashboardContentHistory.style.paddingTop = '';
            }
            
            const historyTab = document.getElementById('my-requests-tab');
            if (historyTab) {
                historyTab.style.display = 'block';
                historyTab.classList.add('active');
                console.log('✅ 表示: my-requests-tab');
                // 履歴を読み込む
                if (currentRole === 'client') {
                    loadMyRequests();
                } else {
                    loadOrders();
                }
            }
            break;
        case 'thanks':
            // ダッシュボードのコンテンツを非表示
            const clientContent = document.getElementById('clientDashboardContent');
            const narratorContent = document.getElementById('narratorDashboardContent');
            if (clientContent) clientContent.style.display = 'none';
            if (narratorContent) narratorContent.style.display = 'none';
            
            // dashboard-contentのpadding-topを0に
            const dashboardContent = document.querySelector('.dashboard-content');
            if (dashboardContent) {
                dashboardContent.style.paddingTop = '0';
            }
            
            const thanksTab = document.getElementById('thanks-tab');
            if (thanksTab) {
                thanksTab.style.display = 'block';
                thanksTab.classList.add('active');
                console.log('✅ 表示: thanks-tab');
                // ロールに応じてデフォルトタブを切り替え
                if (currentRole === 'narrator') {
                    switchThanksTab('received'); // 声優：感謝された投稿
                } else {
                    switchThanksTab('given'); // 依頼者：感謝した投稿
                }
            }
            break;
        case 'achievements':
            // dashboard-contentのpadding-topを元に戻す
            const dashboardContentAchievements = document.querySelector('.dashboard-content');
            if (dashboardContentAchievements) {
                dashboardContentAchievements.style.paddingTop = '';
            }
            
            // 実績タブ（後で実装）
            showToast('実績機能は準備中です', 'info');
            break;
    }
    
    return false; // リンクのデフォルト動作を防ぐ
}

// ===== 感謝タブの切り替え =====
function switchThanksTab(type) {
    // サブタブボタンのactive状態を更新
    document.querySelectorAll('.thanks-sub-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-thanks-type') === type) {
            tab.classList.add('active');
        }
    });
    
    // コンテンツの表示切り替え
    document.querySelectorAll('.thanks-sub-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // 選択されたコンテンツを表示
    const targetContent = document.getElementById(`thanks-${type}`);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
    }
}

// 感謝した投稿の送信
function submitGivenThanks() {
    const voiceActor = document.getElementById('thanksVoiceActor').value;
    const message = document.getElementById('thanksMessageGiven').value.trim();
    
    if (!voiceActor) {
        showToast('声優を選択してください', 'error');
        return;
    }
    
    if (!message) {
        showToast('感謝のメッセージを入力してください', 'error');
        return;
    }
    
    // Twitter投稿用のテキストを作成
    const twitterText = `${message}\n\n#KimitoLinkVoice ${voiceActor}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    
    // Twitterで投稿
    window.open(twitterUrl, '_blank');
    
    showToast('感謝のメッセージを投稿しました！', 'success');
    
    // フォームをリセット
    document.getElementById('thanksVoiceActor').value = '';
    document.getElementById('thanksMessageGiven').value = '';
}

function updateRoleDisplay() {
    console.log('🔄 updateRoleDisplay() 呼び出し - currentRole:', currentRole);
    
    // 役割切り替えボタンの状態を更新
    document.querySelectorAll('.header-role-btn, .nav-role-btn').forEach(btn => {
        const btnRole = btn.getAttribute('data-role');
        if (btnRole === currentRole) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // ナビゲーションのactive状態をリセット
    document.querySelectorAll('.dashboard-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 全てのタブを非表示にして、ダッシュボードタブのみ表示
    console.log('📋 全タブを非表示にしてダッシュボードのみ表示');
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // ダッシュボードタブを表示
    const overviewTab = document.getElementById('overview-tab');
    if (overviewTab) {
        overviewTab.style.display = 'block';
        overviewTab.classList.add('active');
        console.log('✅ overview-tab を表示');
    }
    
    // ダッシュボードの表示を更新
    if (currentRole === 'client') {
        showClientDashboard();
    } else {
        showNarratorDashboard();
    }
}

function showClientDashboard() {
    // ダッシュボード内のコンテンツを切り替え
    const clientContent = document.getElementById('clientDashboardContent');
    const narratorContent = document.getElementById('narratorDashboardContent');
    if (clientContent) clientContent.style.display = 'grid';
    if (narratorContent) narratorContent.style.display = 'none';
    
    // タブボタンの状態をリセット
    document.querySelectorAll('#clientTabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('#clientTabs .tab-button[data-tab="overview"]')?.classList.add('active');
}

function showNarratorDashboard() {
    // ダッシュボード内のコンテンツを切り替え
    const clientContent = document.getElementById('clientDashboardContent');
    const narratorContent = document.getElementById('narratorDashboardContent');
    if (clientContent) clientContent.style.display = 'none';
    if (narratorContent) narratorContent.style.display = 'grid';
    
    // タブボタンの状態をリセット
    document.querySelectorAll('#narratorTabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('#narratorTabs .tab-button[data-tab="overview"]')?.classList.add('active');
}

// ===== 依頼フォーム機能 =====

// 依頼フォームの初期化
function initializeRequestForm() {
    // 台本入力時の文字数カウント・料金計算
    const scriptInput = document.getElementById('requestScript');
    if (scriptInput) {
        scriptInput.addEventListener('input', updateEstimate);
    }
    
    // 依頼フォーム送信
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
    }
    
    // 希望納期の最小日を設定（今日から）
    const deadlineInput = document.getElementById('requestDeadline');
    if (deadlineInput) {
        const today = new Date().toISOString().split('T')[0];
        deadlineInput.min = today;
    }
}

// 依頼モーダルを開く
let currentActorData = null; // 現在選択中の声優データ

function openRequestModal(actorData) {
    currentActorData = actorData;
    
    // 声優情報を設定
    const avatar = document.getElementById('requestActorAvatar');
    const name = document.getElementById('requestActorName');
    const handle = document.getElementById('requestActorHandle');
    const price = document.getElementById('requestActorPrice');
    
    if (avatar) avatar.src = actorData.avatar || 'images/icon/yukkuri-link-nikoniko-kuchiake.png';
    if (name) name.textContent = actorData.name || '声優名';
    if (handle) handle.textContent = actorData.handle || '@username';
    if (price) price.textContent = actorData.price || '¥1/文字〜';
    
    // フォームをリセット
    const form = document.getElementById('requestForm');
    if (form) form.reset();
    
    // 見積もりをリセット
    updateEstimate();
    
    // モーダルを表示
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    console.log('✅ 依頼モーダルを開きました:', actorData);
}

// 依頼モーダルを閉じる
function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    currentActorData = null;
}

// 文字数カウントと料金見積もりを更新
function updateEstimate() {
    const scriptInput = document.getElementById('requestScript');
    const charCountEl = document.getElementById('charCount');
    const estimatedPriceEl = document.getElementById('estimatedPrice');
    
    if (!scriptInput || !charCountEl || !estimatedPriceEl) return;
    
    // 文字数をカウント（空白除く）
    const text = scriptInput.value;
    const charCount = text.replace(/\s/g, '').length;
    
    // 基本料金（デフォルト¥1/文字）
    const pricePerChar = currentActorData?.pricePerChar || 1;
    const minPrice = currentActorData?.minPrice || 500;
    
    // 料金計算
    let estimatedPrice = charCount * pricePerChar;
    if (estimatedPrice > 0 && estimatedPrice < minPrice) {
        estimatedPrice = minPrice;
    }
    
    // 表示を更新
    charCountEl.textContent = charCount.toLocaleString();
    estimatedPriceEl.textContent = `¥${estimatedPrice.toLocaleString()}`;
}

// 依頼フォーム送信処理
async function handleRequestSubmit(e) {
    e.preventDefault();
    
    // ログインチェック
    if (!supabaseClient) {
        showToast('Supabaseが初期化されていません', 'error');
        return;
    }
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        showToast('依頼するにはログインが必要です', 'warning');
        openLoginModal();
        return;
    }
    
    // フォームデータを取得
    const script = document.getElementById('requestScript').value;
    const category = document.getElementById('requestCategory').value;
    const notes = document.getElementById('requestNotes').value;
    const deadline = document.getElementById('requestDeadline').value;
    
    // 文字数と料金を計算
    const charCount = script.replace(/\s/g, '').length;
    const pricePerChar = currentActorData?.pricePerChar || 1;
    const minPrice = currentActorData?.minPrice || 500;
    let totalPrice = charCount * pricePerChar;
    if (totalPrice > 0 && totalPrice < minPrice) {
        totalPrice = minPrice;
    }
    
    // タイトルを生成（カテゴリ + 文字数）
    const categoryName = {
        'youtube': 'YouTube動画',
        'stream': '配信',
        'vtuber': 'VTuber活動',
        'game': 'ゲーム実況',
        'commercial': 'CM・広告',
        'narration': 'ナレーション',
        'other': 'その他'
    }[category] || 'ボイス依頼';
    const title = `${categoryName}（${charCount}文字）`;
    
    // narrator_idを取得（現在はnullだが、将来的にはTwitter IDから取得）
    const narratorId = currentActorData?.narratorId || null;
    
    // ローディング表示
    showLoading();
    
    try {
        // まず、現在のユーザーのprofile IDを取得
        // profilesテーブルのidはauth.usersのidと一致するはず
        let profileData;
        const { data: existingProfile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
        
        if (profileError || !existingProfile) {
            console.error('❌ プロフィール取得エラー:', profileError);
            console.warn('📌 プロフィールが見つかりません。新規作成を試みます。');
            
            // プロフィールが存在しない場合は作成を試みる
            const { data: newProfile, error: createError } = await supabaseClient
                .from('profiles')
                .insert([{
                    id: session.user.id,
                    twitter_id: session.user.user_metadata?.provider_id || '',
                    twitter_username: session.user.user_metadata?.user_name || '',
                    display_name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'ユーザー',
                    avatar_url: session.user.user_metadata?.avatar_url || ''
                }])
                .select()
                .single();
            
            if (createError) {
                console.error('❌ プロフィール作成エラー:', createError);
                hideLoading();
                showToast('ユーザー情報の作成に失敗しました', 'error');
                return;
            }
            
            profileData = newProfile;
        } else {
            profileData = existingProfile;
        }
        
        // Supabaseに依頼を保存
        const { data, error } = await supabaseClient
            .from('voice_requests')
            .insert([
                {
                    client_id: profileData.id,
                    narrator_id: narratorId,
                    title: title,
                    script: script,
                    char_count: charCount,
                    price_per_char: pricePerChar,
                    total_price: totalPrice,
                    status: 'pending'
                }
            ])
            .select();
        
        hideLoading();
        
        if (error) {
            console.error('❌ 依頼保存エラー:', error);
            showToast('依頼の送信に失敗しました', 'error');
            return;
        }
        
        console.log('✅ 依頼を保存しました:', data);
        
        // 成功メッセージ
        showToast('依頼を送信しました！声優から連絡をお待ちください。', 'success');
        
        // モーダルを閉じる
        closeRequestModal();
        
    } catch (error) {
        hideLoading();
        console.error('❌ 依頼送信エラー:', error);
        showToast('依頼の送信中にエラーが発生しました', 'error');
    }
}

// ===== 依頼履歴表示機能 =====

// 依頼履歴を読み込む
async function loadMyRequests() {
    const requestsList = document.getElementById('requestsList');
    if (!requestsList) return;
    
    // ローディング表示
    requestsList.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-blue); margin-bottom: 20px;"></i>
            <p>読み込み中...</p>
        </div>
    `;
    
    try {
        if (!supabaseClient) {
            throw new Error('Supabaseが初期化されていません');
        }
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            requestsList.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <p>ログインが必要です</p>
                </div>
            `;
            return;
        }
        
        // 現在のユーザーのプロフィールIDを取得
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
        
        if (!profile) {
            console.error('❌ プロフィールが見つかりません');
            requestsList.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <p>プロフィールが見つかりません</p>
                </div>
            `;
            return;
        }
        
        // 依頼履歴を取得（最終更新日時順で新しいものが上）
        const { data: requests, error } = await supabaseClient
            .from('voice_requests')
            .select('*')
            .eq('client_id', profile.id)
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error('❌ 依頼履歴取得エラー:', error);
            throw error;
        }
        
        console.log('✅ 依頼履歴を取得:', requests);
        
        // 依頼がない場合
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px; display: block; opacity: 0.3;"></i>
                    まだ依頼がありません
                </div>
            `;
            return;
        }
        
        // 依頼カードを生成
        requestsList.innerHTML = requests.map(request => createRequestCard(request)).join('');
        
    } catch (error) {
        console.error('❌ 依頼履歴読み込みエラー:', error);
        requestsList.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px; color: #f44336;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>エラーが発生しました</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// 依頼カードを生成
function createRequestCard(request) {
    const statusBadge = {
        'pending': '<span class="status-badge status-pending">未対応</span>',
        'accepted': '<span class="status-badge status-accepted">受注済み</span>',
        'in_progress': '<span class="status-badge status-progress">進行中</span>',
        'completed': '<span class="status-badge status-completed">完了</span>',
        'cancelled': '<span class="status-badge status-cancelled">キャンセル</span>'
    };
    
    const createdDate = new Date(request.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div class="card request-card">
            <div class="request-header">
                <h3>${request.title}</h3>
                ${statusBadge[request.status] || statusBadge.pending}
            </div>
            <div class="request-body">
                <div class="request-info">
                    <p class="request-script">${request.script.substring(0, 100)}${request.script.length > 100 ? '...' : ''}</p>
                    <div class="request-meta">
                        <span><i class="fas fa-text-width"></i> ${request.char_count.toLocaleString()}文字</span>
                        <span><i class="fas fa-yen-sign"></i> ${request.total_price.toLocaleString()}円</span>
                        <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                    </div>
                </div>
            </div>
            <div class="request-actions">
                <button class="btn-secondary" onclick="viewRequestDetail('${request.id}')">
                    <i class="fas fa-eye"></i> 詳細を見る
                </button>
            </div>
        </div>
    `;
}

// 依頼詳細を表示（後で実装）
function viewRequestDetail(requestId) {
    console.log('依頼詳細:', requestId);
    showToast('依頼詳細機能は実装中です', 'info');
}

// ===== 受注案件表示機能（声優モード） =====

// 受注案件を読み込む
async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    // ローディング表示
    ordersList.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-blue); margin-bottom: 20px;"></i>
            <p>読み込み中...</p>
        </div>
    `;
    
    try {
        if (!supabaseClient) {
            throw new Error('Supabaseが初期化されていません');
        }
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            ordersList.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <p>ログインが必要です</p>
                </div>
            `;
            return;
        }
        
        // 現在のユーザーのプロフィールIDを取得
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
        
        if (!profile) {
            console.error('❌ プロフィールが見つかりません');
            ordersList.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <p>プロフィールが見つかりません</p>
                </div>
            `;
            return;
        }
        
        // 受注案件を取得（narrator_idが自分のもの、または全体から選択可能）
        // 現在はnarrator_idがnullなので、全ての依頼を表示（後で改善）
        const { data: orders, error } = await supabaseClient
            .from('voice_requests')
            .select('*')
            .is('narrator_id', null) // narrator_idがnullの依頼（誰でも受注可能）
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error('❌ 受注案件取得エラー:', error);
            throw error;
        }
        
        console.log('✅ 受注案件を取得:', orders);
        
        // 案件がない場合
        if (!orders || orders.length === 0) {
            ordersList.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px; display: block; opacity: 0.3;"></i>
                    まだ受注可能な案件がありません
                </div>
            `;
            return;
        }
        
        // 案件カードを生成
        ordersList.innerHTML = orders.map(order => createOrderCard(order)).join('');
        
    } catch (error) {
        console.error('❌ 受注案件読み込みエラー:', error);
        ordersList.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px; color: #f44336;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>エラーが発生しました</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// 案件カードを生成
function createOrderCard(order) {
    const createdDate = new Date(order.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div class="card request-card">
            <div class="request-header">
                <h3>${order.title}</h3>
                <span class="status-badge status-pending">未受注</span>
            </div>
            <div class="request-body">
                <div class="request-info">
                    <p class="request-script">${order.script.substring(0, 150)}${order.script.length > 150 ? '...' : ''}</p>
                    <div class="request-meta">
                        <span><i class="fas fa-text-width"></i> ${order.char_count.toLocaleString()}文字</span>
                        <span><i class="fas fa-yen-sign"></i> ${order.total_price.toLocaleString()}円</span>
                        <span><i class="fas fa-coins"></i> 単価: ¥${order.price_per_char}/文字</span>
                        <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                    </div>
                </div>
            </div>
            <div class="request-actions">
                <button class="btn-secondary" onclick="viewOrderDetail('${order.id}')">
                    <i class="fas fa-eye"></i> 詳細を見る
                </button>
                <button class="btn-primary" onclick="acceptOrder('${order.id}')">
                    <i class="fas fa-check"></i> 受注する
                </button>
            </div>
        </div>
    `;
}

// 案件詳細を表示（後で実装）
function viewOrderDetail(orderId) {
    console.log('案件詳細:', orderId);
    showToast('案件詳細機能は実装中です', 'info');
}

// 案件を受注する
async function acceptOrder(orderId) {
    if (!confirm('この案件を受注しますか？')) return;
    
    showLoading();
    
    try {
        if (!supabaseClient) {
            throw new Error('Supabaseが初期化されていません');
        }
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            hideLoading();
            showToast('ログインが必要です', 'warning');
            return;
        }
        
        // プロフィールIDを取得
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
        
        if (!profile) {
            hideLoading();
            showToast('プロフィールが見つかりません', 'error');
            return;
        }
        
        // 案件を受注（narrator_idを更新、ステータスをacceptedに）
        const { error } = await supabaseClient
            .from('voice_requests')
            .update({
                narrator_id: profile.id,
                status: 'accepted',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
        
        hideLoading();
        
        if (error) {
            console.error('❌ 受注エラー:', error);
            showToast('受注に失敗しました', 'error');
            return;
        }
        
        console.log('✅ 案件を受注しました:', orderId);
        showToast('案件を受注しました！', 'success');
        
        // 受注案件リストを再読み込み
        loadOrders();
        
    } catch (error) {
        hideLoading();
        console.error('❌ 受注エラー:', error);
        showToast('受注中にエラーが発生しました', 'error');
    }
}

// ===== デバッグ関数（Chrome開発者ツール用） =====
/**
 * 感謝タブの状態をデバッグするための関数
 * Chrome開発者ツールのConsoleで実行: debugThanksTab()
 */
window.debugThanksTab = function() {
    const thanksTab = document.getElementById('thanks-tab');
    const clientContent = document.getElementById('clientDashboardContent');
    const narratorContent = document.getElementById('narratorDashboardContent');
    const dashboardContent = document.querySelector('.dashboard-content');
    const overviewTab = document.getElementById('overview-tab');
    
    console.log('%c=== 感謝タブの状態 ===', 'color: #4FACFE; font-size: 16px; font-weight: bold;');
    console.log('%c🎯 基本情報', 'color: #00D9FF; font-weight: bold;');
    console.log('  現在のロール:', currentRole);
    console.log('  thanksTab 存在:', !!thanksTab);
    console.log('  clientContent 存在:', !!clientContent);
    console.log('  narratorContent 存在:', !!narratorContent);
    
    if (thanksTab) {
        console.log('%c📊 #thanks-tab の状態', 'color: #00D9FF; font-weight: bold;');
        console.log('  display (inline):', thanksTab.style.display);
        console.log('  display (computed):', window.getComputedStyle(thanksTab).display);
        console.log('  top (inline):', thanksTab.style.top);
        console.log('  top (computed):', window.getComputedStyle(thanksTab).top);
        console.log('  padding-top (computed):', window.getComputedStyle(thanksTab).paddingTop);
        console.log('  margin-top (computed):', window.getComputedStyle(thanksTab).marginTop);
        console.log('  classList:', Array.from(thanksTab.classList));
    }
    
    if (dashboardContent) {
        console.log('%c📐 .dashboard-content の状態', 'color: #00D9FF; font-weight: bold;');
        console.log('  padding-top (inline):', dashboardContent.style.paddingTop);
        console.log('  padding-top (computed):', window.getComputedStyle(dashboardContent).paddingTop);
    }
    
    if (overviewTab) {
        console.log('%c📋 #overview-tab の状態', 'color: #00D9FF; font-weight: bold;');
        console.log('  display (inline):', overviewTab.style.display);
        console.log('  display (computed):', window.getComputedStyle(overviewTab).display);
    }
    
    if (clientContent) {
        console.log('%c👤 #clientDashboardContent の状態', 'color: #00D9FF; font-weight: bold;');
        console.log('  display (inline):', clientContent.style.display);
        console.log('  display (computed):', window.getComputedStyle(clientContent).display);
        console.log('  親要素:', clientContent.parentElement?.id || clientContent.parentElement?.className);
    }
    
    if (narratorContent) {
        console.log('%c🎤 #narratorDashboardContent の状態', 'color: #00D9FF; font-weight: bold;');
        console.log('  display (inline):', narratorContent.style.display);
        console.log('  display (computed):', window.getComputedStyle(narratorContent).display);
        console.log('  親要素:', narratorContent.parentElement?.id || narratorContent.parentElement?.className);
    }
    
    console.log('%c✅ デバッグ完了', 'color: #4FACFE; font-size: 14px; font-weight: bold;');
    console.log('%c💡 ヒント: 感謝タブをクリックした直後に実行してください', 'color: #FFD700;');
};

console.log('%c🔧 デバッグ関数が利用可能です: debugThanksTab()', 'color: #4FACFE; font-weight: bold;');

// ===== ダッシュボード機能 =====

/**
 * ダッシュボード表示時にユーザー名を更新
 */
function updateDashboardWelcome() {
    const userName = currentUser?.displayName || currentUser?.name || 'ゲスト';
    
    // 依頼者ダッシュボード
    const clientWelcomeName = document.getElementById('clientWelcomeName');
    if (clientWelcomeName) {
        clientWelcomeName.textContent = userName;
    }
    
    // 声優ダッシュボード
    const narratorWelcomeName = document.getElementById('narratorWelcomeName');
    if (narratorWelcomeName) {
        narratorWelcomeName.textContent = userName;
    }
}

/**
 * 依頼作成モーダルを表示（仮実装）
 */
function showRequestCreationModal() {
    showToast('依頼作成機能は準備中です', 'info');
    console.log('📝 依頼作成モーダルを表示');
}

/**
 * 全通知を表示（仮実装）
 */
function showAllNotifications() {
    showToast('通知機能は準備中です', 'info');
    console.log('🔔 全通知を表示');
}

/**
 * 音声アップロードモーダルを表示（仮実装）
 */
function showUploadModal() {
    showToast('音声アップロード機能は準備中です', 'info');
    console.log('🎤 音声アップロードモーダルを表示');
}

/**
 * ポートフォリオ管理画面を表示（仮実装）
 */
function managePortfolio() {
    showToast('ポートフォリオ管理機能は準備中です', 'info');
    console.log('📁 ポートフォリオ管理画面を表示');
}

// ===== ポートフォリオ追加モーダル機能 =====

let currentDeliveryData = null;

/**
 * 納品完了時にポートフォリオ追加モーダルを表示
 * @param {Object} deliveryData - 納品データ（orderId, audioUrl, titleなど）
 */
function showPortfolioAddModal(deliveryData) {
    currentDeliveryData = deliveryData;
    const modal = document.getElementById('portfolioAddModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('📦 ポートフォリオ追加モーダルを表示', deliveryData);
    }
}

/**
 * ポートフォリオ追加モーダルを閉じる
 */
function closePortfolioModal() {
    const modal = document.getElementById('portfolioAddModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        currentDeliveryData = null;
        console.log('📦 ポートフォリオ追加モーダルを閉じる');
    }
}

/**
 * ポートフォリオ追加の選択を送信
 */
async function submitPortfolioChoice() {
    const choice = document.querySelector('input[name="portfolioChoice"]:checked')?.value;
    
    if (!choice) {
        showToast('選択肢を選んでください', 'warning');
        return;
    }
    
    if (!currentDeliveryData) {
        showToast('納品データが見つかりません', 'error');
        return;
    }
    
    try {
        showLoading();
        
        console.log('📦 ポートフォリオ追加の選択:', choice, currentDeliveryData);
        
        if (choice === 'public') {
            // 公開ポートフォリオに追加
            await addToPortfolio(currentDeliveryData, true);
            showToast('公開ポートフォリオに追加しました！', 'success');
        } else if (choice === 'private') {
            // 非公開ポートフォリオに追加
            await addToPortfolio(currentDeliveryData, false);
            showToast('非公開ポートフォリオに追加しました', 'success');
        } else {
            // 追加しない
            showToast('ポートフォリオには追加されませんでした', 'info');
        }
        
        closePortfolioModal();
        
    } catch (error) {
        console.error('❌ ポートフォリオ追加エラー:', error);
        showToast('ポートフォリオ追加中にエラーが発生しました', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * ポートフォリオに音声を追加
 * @param {Object} deliveryData - 納品データ
 * @param {Boolean} isPublic - 公開するかどうか
 */
async function addToPortfolio(deliveryData, isPublic) {
    if (!supabaseClient) {
        throw new Error('Supabaseクライアントが初期化されていません');
    }
    
    // TODO: Supabaseにポートフォリオデータを保存
    const portfolioData = {
        user_id: currentUser?.id,
        order_id: deliveryData.orderId,
        audio_url: deliveryData.audioUrl,
        title: deliveryData.title,
        description: deliveryData.description,
        is_public: isPublic,
        created_at: new Date().toISOString()
    };
    
    console.log('💾 ポートフォリオデータを保存:', portfolioData);
    
    // Supabase保存処理（後で実装）
    // const { data, error } = await supabaseClient
    //     .from('portfolio')
    //     .insert([portfolioData]);
    
    // if (error) throw error;
    
    return portfolioData;
}

/**
 * 今日のタスクを読み込み（声優用）
 */
async function loadTodayTasks() {
    const tasksList = document.getElementById('todayTasksList');
    if (!tasksList) return;
    
    // TODO: Supabaseから今日の納品期限の案件を取得
    const tasks = [];
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>今日のタスクはありません</p>
            </div>
        `;
    } else {
        // タスクを表示
        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item">
                <div class="task-icon ${task.priority}">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="task-details">
                    <h4>${task.title}</h4>
                    <p>${task.deadline}</p>
                </div>
            </div>
        `).join('');
    }
}

/**
 * 今月の実績を読み込み（声優用）
 */
async function loadMonthlyStats() {
    // TODO: Supabaseから今月の実績を取得
    const stats = {
        revenue: 0,
        completedOrders: 0,
        newRequests: 0
    };
    
    // UIを更新
    const revenueEl = document.getElementById('monthlyRevenue');
    if (revenueEl) revenueEl.textContent = `¥${stats.revenue.toLocaleString()}`;
    
    const completedEl = document.getElementById('completedOrders');
    if (completedEl) completedEl.textContent = `${stats.completedOrders}件`;
    
    const requestsEl = document.getElementById('newRequests');
    if (requestsEl) requestsEl.textContent = `${stats.newRequests}件`;
}

/**
 * ダッシュボード表示時の初期化処理を追加
 */
const originalShowPlatform = window.showPlatform || function() {};
window.showPlatform = async function() {
    await originalShowPlatform();
    
    // ウェルカムメッセージを更新
    updateDashboardWelcome();
    
    // 声優モードの場合、追加データを読み込み
    if (currentRole === 'narrator') {
        await loadTodayTasks();
        await loadMonthlyStats();
    }
};

/**
 * FAQアコーディオンのトグル機能
 * @param {HTMLElement} button - クリックされた質問ボタン
 */
function toggleFAQ(button) {
    const faqItem = button.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // 他の開いているFAQを閉じる
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
    
    // クリックされたFAQをトグル
    faqItem.classList.toggle('active');
    
    // アイコンの変更
    const icon = button.querySelector('.faq-icon i');
    if (!isActive) {
        // 開く場合、スムーズにスクロール
        setTimeout(() => {
            faqItem.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }
}

console.log('✅ ダッシュボード機能が読み込まれました');
