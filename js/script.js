// ===== グローバル変数 =====
// 開発モード（本番環境では false に設定）
const DEVELOPMENT_MODE = true;

// フォロー確認をスキップ（開発中のみ）
const SKIP_FOLLOW_CHECK = true; // 開発中はAPIレート制限回避のためスキップ

let currentUser = null;
let followedAccounts = {
    creator: false,
    idol: false
};

// 必須フォローアカウント
const REQUIRED_ACCOUNTS = {
    creator: {
        id: 'streamerfunch',
        name: '君斗りんく@クリエイター応援'
    },
    idol: {
        id: 'idolfunch',
        name: '君斗りんく@アイドル応援'
    }
};

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
        await checkAuthStatus();
        // URLをクリーンアップ
        window.history.replaceState({}, document.title, '/');
    } else if (loginStatus === 'error') {
        alert('ログインに失敗しました。もう一度お試しください。');
        window.history.replaceState({}, document.title, '/');
    } else {
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
    document.getElementById('publicPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // ユーザー情報を表示
    if (currentUser) {
        // ヘッダー
        document.getElementById('userAvatar').src = currentUser.avatar;
        document.getElementById('userName').textContent = currentUser.displayName;
        
        // プロフィールカード
        document.getElementById('profileAvatar').src = currentUser.avatar;
        document.getElementById('profileName').textContent = currentUser.displayName;
        document.getElementById('profileHandle').textContent = '@' + currentUser.username;
        document.getElementById('followerCount').textContent = currentUser.followers;
        document.getElementById('followingCount').textContent = currentUser.following;
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
