// ===== グローバル変数 =====
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
document.addEventListener('DOMContentLoaded', function() {
    // ローカルストレージからユーザー情報を取得
    const savedUser = localStorage.getItem('kimitolink_user');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // フォロー状態を確認
        checkFollowStatusOnLoad();
    }
    // ログインボタンをクリックしたときのみモーダルを表示
    
    // ナビゲーションのイベントリスナー
    setupNavigation();
    
    // モックデータで統計を更新
    updateMockStats();
});

// ===== ログイン処理 =====
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showFollowModal() {
    document.getElementById('followModal').style.display = 'flex';
}

function hideFollowModal() {
    document.getElementById('followModal').style.display = 'none';
}

async function loginWithTwitter() {
    // 実際の実装ではTwitter OAuth 2.0を使用
    // ここではデモ用のモック実装
    
    try {
        // モックユーザーデータ
        const mockUser = {
            id: 'user_' + Date.now(),
            username: 'demo_user',
            displayName: 'デモユーザー',
            avatar: 'https://via.placeholder.com/100',
            followers: 150,
            following: 200,
            createdAt: new Date().toISOString()
        };
        
        currentUser = mockUser;
        localStorage.setItem('kimitolink_user', JSON.stringify(mockUser));
        
        // ログインモーダルを閉じてフォローモーダルを表示
        hideLoginModal();
        showFollowModal();
        
        // フォロー状態をチェック
        setTimeout(() => {
            checkFollowStatus();
        }, 1000);
        
    } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました。もう一度お試しください。');
    }
}

// ===== フォロー確認 =====
async function checkFollowStatus() {
    // 実際の実装ではTwitter APIを使用してフォロー状態を確認
    // ここではデモ用にランダムに判定
    
    try {
        // モック: ランダムにフォロー状態を設定
        followedAccounts.creator = Math.random() > 0.3;
        followedAccounts.idol = Math.random() > 0.3;
        
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
    // ページ読み込み時のフォロー状態確認
    followedAccounts.creator = true;
    followedAccounts.idol = true;
    
    if (followedAccounts.creator && followedAccounts.idol) {
        showPlatform();
    } else {
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
    
    // Twitter タイムラインを読み込み
    loadTwitterTimeline();
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
function logout() {
    if (confirm('ログアウトしますか?')) {
        localStorage.removeItem('kimitolink_user');
        currentUser = null;
        followedAccounts = { creator: false, idol: false };
        
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('publicPage').style.display = 'block';
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

// ===== モック統計データ更新 =====
function updateMockStats() {
    // ランダムな統計データを生成
    const stats = {
        voiceCount: Math.floor(Math.random() * 50) + 10,
        reviewCount: Math.floor(Math.random() * 100) + 20,
        reachCount: Math.floor(Math.random() * 1000) + 500,
        likesCount: Math.floor(Math.random() * 500) + 100,
        retweetCount: Math.floor(Math.random() * 200) + 50,
        replyCount: Math.floor(Math.random() * 150) + 30
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
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
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
