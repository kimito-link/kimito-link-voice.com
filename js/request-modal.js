/**
 * 依頼モーダル機能
 * v2.1 - AI生成時のユーザー情報読み込みチェック追加
 */

// グローバル変数
let currentNarratorData = {
    username: '',
    name: '',
    pricePerChar: 0,
    minPrice: 0
};

let currentUserData = {
    twitter_id: '',
    username: '',
    display_name: '',
    avatar_url: ''
};

let aiSuggestionText = '';
let lastAIRequestType = ''; // 'cheer' or 'expand'
let lastAIRequestData = {};

// AIキャッシュ設定
const AI_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間
const AI_CACHE_PREFIX = 'ai_suggestion_';

/**
 * キャッシュキーを生成（入力内容を含む）
 */
function generateCacheKey(type, data) {
    // データを正規化してソート
    const normalizedData = JSON.stringify(data, Object.keys(data).sort());
    
    // 簡易的なハッシュ生成
    let hash = 0;
    for (let i = 0; i < normalizedData.length; i++) {
        const char = normalizedData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const hashValue = Math.abs(hash);
    console.log(`🔑 キャッシュキー生成: ${type}_${hashValue}`, data);
    
    return `${AI_CACHE_PREFIX}${type}_${hashValue}`;
}

/**
 * キャッシュから取得
 */
function getFromCache(cacheKey) {
    try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        
        const { timestamp, data } = JSON.parse(cached);
        
        // 有効期限チェック
        if (Date.now() - timestamp > AI_CACHE_DURATION) {
            localStorage.removeItem(cacheKey);
            return null;
        }
        
        console.log('💾 キャッシュから取得:', cacheKey);
        return data;
    } catch (error) {
        console.error('キャッシュ取得エラー:', error);
        return null;
    }
}

/**
 * キャッシュに保存
 */
function saveToCache(cacheKey, data) {
    try {
        const cacheData = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('💾 キャッシュに保存:', cacheKey);
    } catch (error) {
        console.error('キャッシュ保存エラー:', error);
    }
}

/**
 * モーダルを開く（ログイン必須）
 */
async function openRequestModal() {
    // まずログイン状態を確認
    const loginCheckResponse = await fetch('/api/user/me');
    
    if (!loginCheckResponse.ok) {
        // ログインしていない場合、ログインモーダルを表示
        // 現在のページURLを保存してログイン後に依頼モーダルを開く
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
        sessionStorage.setItem('open_request_modal_after_login', 'true');
        showLoginModal();
        return;
    }
    
    // フォローチェック
    try {
        const followResponse = await fetch('/api/user/check-follow');
        if (followResponse.ok) {
            const followData = await followResponse.json();
            
            if (!followData.isFollowingCreator || !followData.isFollowingIdol) {
                alert('依頼するには以下のアカウントをフォローする必要があります：\n\n@streamerfunch (クリエイター応援)\n@idolfunch (アイドル応援)\n\nフォロー後、再度お試しください。');
                
                // フォローページに誘導
                window.open('https://twitter.com/streamerfunch', '_blank');
                window.open('https://twitter.com/idolfunch', '_blank');
                return;
            }
        }
    } catch (followError) {
        console.error('フォローチェックエラー:', followError);
        // エラーの場合は続行（API制限などを考慮）
    }
    
    const modal = document.getElementById('requestModal');
    if (!modal) return;
    
    // URLから声優情報を取得
    const pathParts = window.location.pathname.split('/');
    currentNarratorData.username = pathParts[1];
    
    // ページ内の情報から声優データを取得
    currentNarratorData.name = document.querySelector('.profile-name')?.textContent || '';
    currentNarratorData.pricePerChar = parseInt(document.getElementById('pricePerChar')?.textContent) || 0;
    currentNarratorData.minPrice = parseInt(document.getElementById('minimumPrice')?.textContent) || 0;
    
    // 最低金額を表示エリアにも設定
    const displayMinPriceEl = document.getElementById('displayMinPrice');
    if (displayMinPriceEl) {
        displayMinPriceEl.textContent = currentNarratorData.minPrice.toLocaleString();
    }
    
    // モーダルを表示（先に表示してから要素を更新）
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 背景スクロール防止
    
    // モーダルが表示された後にTwitterアカウント情報を取得
    // setTimeoutで次のイベントループまで待つ
    setTimeout(async () => {
        await loadRequesterInfo();
    }, 100);
    
    // 料金情報を設定
    calculatePrice();
    
    console.log('📄 依頼モーダルを開きました:', currentNarratorData);
}

/**
 * 依頼者のTwitterアカウント情報を読み込む
 */
async function loadRequesterInfo() {
    console.log('🔄 ユーザー情報取得開始...');
    
    try {
        const response = await fetch('/api/user/me');
        console.log('📡 API応答:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ ユーザーデータ:', userData);
            
            currentUserData = {
                twitter_id: userData.id,
                username: userData.username,
                display_name: userData.name,
                avatar_url: userData.profile_image_url
            };
            
            // Twitterアカウント情報を表示
            const avatarEl = document.getElementById('requesterAvatar');
            const nameEl = document.getElementById('requesterDisplayName');
            const handleEl = document.getElementById('requesterTwitterHandle');
            
            if (avatarEl) avatarEl.src = userData.profile_image_url;
            if (nameEl) nameEl.textContent = userData.name;
            if (handleEl) handleEl.textContent = '@' + userData.username;
            
            console.log('✅ UI更新完了');
        } else {
            // ログインしていない場合はここには来ない（openRequestModalで弾かれる）
            console.error('❌ ログインエラー');
            closeRequestModal();
            alert('セッションが切れました。再度ログインしてください。');
            window.location.href = '/auth/twitter';
        }
    } catch (error) {
        console.error('❌ ユーザー情報取得エラー:', error);
        closeRequestModal();
        alert('ユーザー情報の取得に失敗しました。');
    }
}

/**
 * モーダルを閉じる
 */
function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = ''; // 背景スクロール復元
    
    // フォームをリセット（存在するフィールドのみ）
    const scriptField = document.getElementById('requestScript');
    const purposeField = document.getElementById('requestPurpose');
    const deadlineField = document.getElementById('requestDeadline');
    const notesField = document.getElementById('requestNotes');
    
    if (scriptField) scriptField.value = '';
    if (purposeField) purposeField.value = '';
    if (deadlineField) deadlineField.value = '';
    if (notesField) notesField.value = '';
    
    calculatePrice();
    
    console.log('✅ 依頼モーダルを閉じました');
}

/**
 * 料金を計算
 */
function calculatePrice() {
    const script = document.getElementById('requestScript')?.value || '';
    const charCount = script.length;
    
    // 文字数を表示（両方の場所）
    const charCountElement = document.getElementById('charCount');
    const priceCharCountElement = document.getElementById('priceCharCount');
    
    if (charCountElement) {
        charCountElement.textContent = charCount;
    }
    if (priceCharCountElement) {
        priceCharCountElement.textContent = charCount;
    }
    
    // 小計を計算
    const subtotal = charCount * currentNarratorData.pricePerChar;
    document.getElementById('priceSubtotal').textContent = subtotal.toLocaleString();
    
    // 最低料金を適用
    let total = subtotal;
    const minimumPriceRow = document.getElementById('minimumPriceRow');
    
    if (subtotal > 0 && subtotal < currentNarratorData.minPrice) {
        total = currentNarratorData.minPrice;
        minimumPriceRow.style.display = 'flex';
    } else {
        minimumPriceRow.style.display = 'none';
    }
    
    // 合計金額を表示
    document.getElementById('priceTotal').textContent = total.toLocaleString();
}

/**
 * 依頼を送信
 */
async function submitRequest() {
    // フォームデータを取得
    const script = document.getElementById('requestScript').value.trim();
    const purpose = document.getElementById('requestPurpose').value;
    const deadline = document.getElementById('requestDeadline').value;
    const notes = document.getElementById('requestNotes').value.trim();
    
    // バリデーション
    if (!script) {
        alert('スクリプトを入力してください');
        document.getElementById('requestScript').focus();
        return;
    }
    
    // Twitterアカウント情報をチェック
    if (!currentUserData.twitter_id || !currentUserData.username) {
        alert('ユーザー情報の取得に失敗しました。ページを再読み込みしてください。');
        return;
    }
    
    // 料金を計算
    const charCount = script.length;
    const subtotal = charCount * currentNarratorData.pricePerChar;
    let totalPrice = subtotal;
    
    if (subtotal > 0 && subtotal < currentNarratorData.minPrice) {
        totalPrice = currentNarratorData.minPrice;
    }
    
    // 依頼データを作成（Twitterアカウント情報を使用）
    const requestData = {
        narrator_username: currentNarratorData.username,
        narrator_name: currentNarratorData.name,
        requester_twitter_id: currentUserData.twitter_id,
        requester_twitter_username: currentUserData.username,
        requester_name: currentUserData.display_name,
        requester_avatar: currentUserData.avatar_url,
        script: script,
        char_count: charCount,
        purpose: purpose,
        deadline: deadline || null,
        notes: notes || null,
        price_per_char: currentNarratorData.pricePerChar,
        subtotal: subtotal,
        min_price_applied: (subtotal > 0 && subtotal < currentNarratorData.minPrice),
        total_price: totalPrice,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    console.log('📤 依頼データ:', requestData);
    
    // 送信ボタンを無効化
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
    
    try {
        // APIに送信
        const response = await fetch('/api/requests/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error('依頼の送信に失敗しました');
        }
        
        const result = await response.json();
        console.log('✅ 依頼送信成功:', result);
        
        // 成功メッセージを表示
        alert(`依頼を受け付けました！\n\n依頼ID: ${result.request_id || 'N/A'}\n合計金額: ¥${totalPrice.toLocaleString()}\n\n声優さんからの連絡をお待ちください。`);
        
        // モーダルを閉じる
        closeRequestModal();
        
        // 声優さんへの「ありがとう」音声を再生（あれば）
        if (typeof playThanksVoice === 'function') {
            playThanksVoice(currentNarratorData.username);
        }
        
    } catch (error) {
        console.error('❌ 依頼送信エラー:', error);
        alert('依頼の送信に失敗しました。\nしばらく経ってから再度お試しください。');
    } finally {
        // ボタンを復元
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(e) {
    const modal = document.getElementById('requestModal');
    if (modal && e.target === modal) {
        closeRequestModal();
    }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('requestModal');
        if (modal && modal.classList.contains('active')) {
            closeRequestModal();
        }
    }
});

/**
 * 応援ボイスのパターンを提案（AI）
 */
async function generateCheerPattern() {
    const btn = event.target.closest('.btn-ai-assist');
    const originalHTML = btn.innerHTML;
    
    // ユーザー情報が読み込まれていない場合は待つ
    if (!currentUserData.display_name) {
        alert('ユーザー情報を読み込み中です。少しお待ちください。');
        return;
    }
    
    // 再生成用にリクエストデータを保存
    lastAIRequestType = 'cheer';
    lastAIRequestData = {
        narrator_name: currentNarratorData.name || '声優',
        requester_name: currentUserData.display_name || 'あなた'
    };
    
    // キャッシュキーを生成
    const cacheKey = generateCacheKey('cheer', lastAIRequestData);
    
    // キャッシュをチェック
    const cachedSuggestion = getFromCache(cacheKey);
    if (cachedSuggestion) {
        // キャッシュからでも一瞬「読み込み中」を表示
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> キャッシュから読み込み中...';
        
        // 0.5秒後に表示（ユーザーに処理を認識させる）
        await new Promise(resolve => setTimeout(resolve, 500));
        
        aiSuggestionText = cachedSuggestion;
        document.getElementById('suggestionContentEditable').value = aiSuggestionText;
        document.getElementById('aiSuggestion').style.display = 'block';
        
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        
        console.log('✅ キャッシュから応援ボイスを取得（OpenRouter API節約）');
        return;
    }
    
    // キャッシュにない場合はAPI呼び出し
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI生成中...';
    
    try {
        const response = await fetch('/api/ai/generate-cheer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastAIRequestData)
        });
        
        if (!response.ok) throw new Error('AI生成に失敗しました');
        
        const data = await response.json();
        aiSuggestionText = data.suggestion;
        
        // キャッシュに保存
        saveToCache(cacheKey, aiSuggestionText);
        
        // 提案を表示
        document.getElementById('suggestionContentEditable').value = aiSuggestionText;
        document.getElementById('aiSuggestion').style.display = 'block';
        
        console.log('✅ AI提案生成成功（OpenRouter API使用）');
    } catch (error) {
        console.error('❌ AI生成エラー:', error);
        alert('AI提案の生成に失敗しました。もう一度お試しください。');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

/**
 * 台本のイメージを膨らませる（AI）
 */
async function expandScriptIdea() {
    const script = document.getElementById('requestScript').value.trim();
    
    if (!script) {
        alert('まず、ふわっとしたイメージを入力してください\n\n例：「頑張ってる配信者を応援したい」');
        document.getElementById('requestScript').focus();
        return;
    }
    
    // ユーザー情報が読み込まれていない場合は待つ
    if (!currentUserData.display_name) {
        alert('ユーザー情報を読み込み中です。少しお待ちください。');
        return;
    }
    
    const btn = event.target.closest('.btn-ai-assist');
    const originalHTML = btn.innerHTML;
    
    // 再生成用にリクエストデータを保存
    lastAIRequestType = 'expand';
    lastAIRequestData = {
        rough_idea: script,
        narrator_name: currentNarratorData.name || '声優',
        requester_name: currentUserData.display_name || 'あなた'
    };
    
    // キャッシュキーを生成
    const cacheKey = generateCacheKey('expand', lastAIRequestData);
    
    // キャッシュをチェック
    const cachedSuggestion = getFromCache(cacheKey);
    if (cachedSuggestion) {
        // キャッシュからでも一瞬「読み込み中」を表示
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> キャッシュから読み込み中...';
        
        // 0.5秒後に表示（ユーザーに処理を認識させる）
        await new Promise(resolve => setTimeout(resolve, 500));
        
        aiSuggestionText = cachedSuggestion;
        document.getElementById('suggestionContentEditable').value = aiSuggestionText;
        document.getElementById('aiSuggestion').style.display = 'block';
        
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        
        console.log('✅ キャッシュから台本を取得（OpenRouter API節約）');
        return;
    }
    
    // キャッシュにない場合はAPI呼び出し
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI生成中...';
    
    try {
        const response = await fetch('/api/ai/expand-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastAIRequestData)
        });
        
        if (!response.ok) throw new Error('AI生成に失敗しました');
        
        const data = await response.json();
        aiSuggestionText = data.suggestion;
        
        // キャッシュに保存
        saveToCache(cacheKey, aiSuggestionText);
        
        // 提案を表示
        document.getElementById('suggestionContentEditable').value = aiSuggestionText;
        document.getElementById('aiSuggestion').style.display = 'block';
        
        console.log('✅ AI提案生成成功（OpenRouter API使用）');
    } catch (error) {
        console.error('❌ AI生成エラー:', error);
        alert('AI提案の生成に失敗しました。もう一度お試しください。');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

/**
 * AI提案をやり直す（キャッシュを無視）
 */
async function regenerateSuggestion() {
    if (!lastAIRequestType) {
        alert('やり直すAI提案がありません');
        return;
    }
    
    const btn = event.target.closest('.btn-regenerate');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 再生成中...';
    
    try {
        const endpoint = lastAIRequestType === 'cheer' 
            ? '/api/ai/generate-cheer' 
            : '/api/ai/expand-script';
        
        // キャッシュを削除（強制再生成）
        const cacheKey = generateCacheKey(lastAIRequestType, lastAIRequestData);
        localStorage.removeItem(cacheKey);
        console.log('🗑️ キャッシュを削除:', cacheKey);
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastAIRequestData)
        });
        
        if (!response.ok) throw new Error('AI再生成に失敗しました');
        
        const data = await response.json();
        aiSuggestionText = data.suggestion;
        
        // キャッシュに保存
        saveToCache(cacheKey, aiSuggestionText);
        
        // 新しい提案を表示
        document.getElementById('suggestionContentEditable').value = aiSuggestionText;
        
        console.log('✅ AI提案再生成成功（OpenRouter API使用）');
    } catch (error) {
        console.error('❌ AI再生成エラー:', error);
        alert('AI提案の再生成に失敗しました。もう一度お試しください。');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

/**
 * AI提案を編集する（ユーザーが直接編集）
 */
function editSuggestion() {
    const textarea = document.getElementById('suggestionContentEditable');
    textarea.focus();
    textarea.setSelectionRange(0, 0);
    
    alert('提案を自由に編集できます！\n編集が終わったら「この提案を使う」ボタンを押してください。');
}

/**
 * AI提案を使用
 */
function useSuggestion() {
    // 編集された内容を取得
    const editedText = document.getElementById('suggestionContentEditable').value.trim();
    
    if (!editedText) {
        alert('提案が空です');
        return;
    }
    
    document.getElementById('requestScript').value = editedText;
    calculatePrice();
    document.getElementById('aiSuggestion').style.display = 'none';
    
    // テキストエリアにフォーカス
    document.getElementById('requestScript').focus();
    
    console.log('✅ AI提案を採用');
}

/**
 * AIキャッシュをクリア
 */
function clearAICache() {
    const confirmed = confirm('AIキャッシュをクリアしますか？\n次回のAI生成時に新しい提案を取得します。');
    
    if (!confirmed) return;
    
    // すべてのAIキャッシュを削除
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    
    keys.forEach(key => {
        if (key.startsWith(AI_CACHE_PREFIX)) {
            localStorage.removeItem(key);
            clearedCount++;
        }
    });
    
    alert(`${clearedCount}件のAIキャッシュをクリアしました！\n次回のAI生成時は新しい提案が生成されます。`);
    console.log(`🗑️ ${clearedCount}件のAIキャッシュをクリア`);
}

/**
 * ダッシュボードに移動（ログインチェック付き）
 */
async function checkLoginAndGoToDashboard() {
    try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
            // ログインしている場合、ダッシュボードに移動
            window.location.href = '/?dashboard=true';
        } else {
            // ログインしていない場合
            sessionStorage.setItem('redirect_after_login', '/');
            alert('ダッシュボードを表示するにはログインが必要です。\nログイン後、ダッシュボードを表示します。');
            window.location.href = '/auth/twitter';
        }
    } catch (error) {
        console.error('ログインチェックエラー:', error);
        alert('エラーが発生しました。もう一度お試しください。');
    }
}

/**
 * ログインモーダルを表示
 */
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ ログインモーダルを表示');
    }
}

/**
 * ログインモーダルを閉じる
 */
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('✅ ログインモーダルを閉じる');
    }
}

/**
 * プロフィールページからTwitterログイン
 */
function loginWithTwitterFromProfile() {
    // 現在のページURLを保存
    sessionStorage.setItem('redirect_after_login', window.location.pathname);
    sessionStorage.setItem('open_request_modal_after_login', 'true');
    
    console.log('🔐 Twitterログインへリダイレクト');
    window.location.href = '/auth/twitter';
}

/**
 * ページ読み込み時にログイン後の処理をチェック
 */
window.addEventListener('DOMContentLoaded', () => {
    // ログイン後に依頼モーダルを開く必要があるかチェック
    const shouldOpenRequestModal = sessionStorage.getItem('open_request_modal_after_login');
    
    if (shouldOpenRequestModal === 'true') {
        sessionStorage.removeItem('open_request_modal_after_login');
        
        // 少し待ってから依頼モーダルを開く
        setTimeout(() => {
            openRequestModal();
        }, 500);
        
        console.log('✅ ログイン後、依頼モーダルを自動的に開きます');
    }
});

console.log('✅ 依頼モーダル機能が読み込まれました');
