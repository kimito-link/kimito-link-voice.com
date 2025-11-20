// ===== グローバル変数 =====
// 開発モード（本番環境では false に設定）
const DEVELOPMENT_MODE = true; // 一時的にtrue: キャッシュをクリアしてAPI再取得

// フォロー確認をスキップ（開発中のみ）
const SKIP_FOLLOW_CHECK = true; // 開発中はAPIレート制限回避のためスキップ

// 認証をスキップ（開発中のみ）
const SKIP_AUTHENTICATION = false; // 本番環境では必ずfalse

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
                
                // 進捗バーを更新
                document.getElementById('progressBar').style.width = percentComplete + '%';
                document.getElementById('progressPercentage').textContent = percentComplete + '%';
                
                // ステータスメッセージを更新
                if (percentComplete < 30) {
                    document.getElementById('progressStatus').textContent = 'アップロード開始...';
                } else if (percentComplete < 70) {
                    document.getElementById('progressStatus').textContent = 'アップロード中...';
                } else if (percentComplete < 95) {
                    document.getElementById('progressStatus').textContent = '処理中...';
                } else {
                    document.getElementById('progressStatus').textContent = '完了間近...';
                }
                
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
                
                setTimeout(() => {
                    alert('音声ファイルがアップロードされました！');
                    progressDiv.style.display = 'none';
                    cancelUpload();
                    loadVoiceList();
                }, 500);
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
                // 高解像度版を試す（存在しない場合はフォールバック）
                const imageUrl = userData.profile_image_url.replace('_normal', '_400x400');
                console.log('✅ クリエイター画像を更新:', imageUrl);
                
                // 画像の読み込みエラーハンドリング
                creatorAvatar.onerror = function() {
                    console.warn('⚠️ 400x400が存在しないため、元のURLを使用');
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
                // 高解像度版を試す（存在しない場合はフォールバック）
                const imageUrl = userData.profile_image_url.replace('_normal', '_400x400');
                console.log('✅ アイドル画像を更新:', imageUrl);
                
                // 画像の読み込みエラーハンドリング
                idolAvatar.onerror = function() {
                    console.warn('⚠️ 400x400が存在しないため、元のURLを使用');
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
