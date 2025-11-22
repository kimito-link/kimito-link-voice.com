/**
 * 依頼モーダル機能
 * v1.0
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

/**
 * モーダルを開く
 */
async function openRequestModal() {
    const modal = document.getElementById('requestModal');
    if (!modal) return;
    
    // URLから声優情報を取得
    const pathParts = window.location.pathname.split('/');
    currentNarratorData.username = pathParts[1];
    
    // ページ内の情報から声優データを取得
    currentNarratorData.name = document.querySelector('.profile-name')?.textContent || '';
    currentNarratorData.pricePerChar = parseInt(document.getElementById('pricePerChar')?.textContent) || 0;
    currentNarratorData.minPrice = parseInt(document.getElementById('minimumPrice')?.textContent) || 0;
    
    // モーダルを表示
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 背景スクロール防止
    
    // Twitterアカウント情報を取得
    await loadRequesterInfo();
    
    // 料金情報を設定
    calculatePrice();
    
    console.log('📄 依頼モーダルを開きました:', currentNarratorData);
}

/**
 * 依頼者のTwitterアカウント情報を読み込む
 */
async function loadRequesterInfo() {
    try {
        const response = await fetch('/api/user/me');
        
        if (response.ok) {
            const userData = await response.json();
            currentUserData = {
                twitter_id: userData.id,
                username: userData.username,
                display_name: userData.name,
                avatar_url: userData.profile_image_url
            };
            
            // Twitterアカウント情報を表示
            document.getElementById('requesterAvatar').src = userData.profile_image_url;
            document.getElementById('requesterDisplayName').textContent = userData.name;
            document.getElementById('requesterTwitterHandle').textContent = '@' + userData.username;
            
            document.getElementById('twitterAccountInfo').style.display = 'block';
            document.getElementById('loginRequired').style.display = 'none';
            
            console.log('✅ ログインユーザー情報取得:', userData.username);
        } else {
            // ログインしていない
            document.getElementById('twitterAccountInfo').style.display = 'none';
            document.getElementById('loginRequired').style.display = 'block';
            
            console.log('⚠️ ログインしていません');
        }
    } catch (error) {
        console.error('❌ ユーザー情報取得エラー:', error);
        document.getElementById('twitterAccountInfo').style.display = 'none';
        document.getElementById('loginRequired').style.display = 'block';
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
    
    // フォームをリセット
    document.getElementById('requesterName').value = '';
    document.getElementById('requesterEmail').value = '';
    document.getElementById('requestScript').value = '';
    document.getElementById('requestPurpose').value = '';
    document.getElementById('requestDeadline').value = '';
    document.getElementById('requestNotes').value = '';
    
    calculatePrice();
    
    console.log('✅ 依頼モーダルを閉じました');
}

/**
 * 料金を計算
 */
function calculatePrice() {
    const script = document.getElementById('requestScript').value;
    const charCount = script.length;
    
    // 文字数を表示
    document.getElementById('charCount').textContent = charCount;
    document.getElementById('priceCharCount').textContent = charCount;
    
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
    const requesterName = document.getElementById('requesterName').value.trim();
    const requesterEmail = document.getElementById('requesterEmail').value.trim();
    const script = document.getElementById('requestScript').value.trim();
    const purpose = document.getElementById('requestPurpose').value;
    const deadline = document.getElementById('requestDeadline').value;
    const notes = document.getElementById('requestNotes').value.trim();
    
    // バリデーション
    if (!requesterName) {
        alert('お名前を入力してください');
        document.getElementById('requesterName').focus();
        return;
    }
    
    if (!requesterEmail) {
        alert('メールアドレスを入力してください');
        document.getElementById('requesterEmail').focus();
        return;
    }
    
    if (!script) {
        alert('スクリプトを入力してください');
        document.getElementById('requestScript').focus();
        return;
    }
    
    // メールアドレスの形式チェック
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(requesterEmail)) {
        alert('正しいメールアドレスを入力してください');
        document.getElementById('requesterEmail').focus();
        return;
    }
    
    // 料金を計算
    const charCount = script.length;
    const subtotal = charCount * currentNarratorData.pricePerChar;
    let totalPrice = subtotal;
    
    if (subtotal > 0 && subtotal < currentNarratorData.minPrice) {
        totalPrice = currentNarratorData.minPrice;
    }
    
    // 依頼データを作成
    const requestData = {
        narrator_username: currentNarratorData.username,
        narrator_name: currentNarratorData.name,
        requester_name: requesterName,
        requester_email: requesterEmail,
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
        alert(`依頼を受け付けました！\n\n依頼ID: ${result.request_id || 'N/A'}\n合計金額: ¥${totalPrice.toLocaleString()}\n\nご登録いただいたメールアドレスに確認メールを送信しました。`);
        
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
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI生成中...';
    
    try {
        const response = await fetch('/api/ai/generate-cheer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                narrator_name: currentNarratorData.name,
                requester_name: currentUserData.display_name
            })
        });
        
        if (!response.ok) throw new Error('AI生成に失敗しました');
        
        const data = await response.json();
        aiSuggestionText = data.suggestion;
        
        // 提案を表示
        document.getElementById('suggestionContent').textContent = aiSuggestionText;
        document.getElementById('aiSuggestion').style.display = 'block';
        
        console.log('✅ AI提案生成成功');
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
    
    const btn = event.target.closest('.btn-ai-assist');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI生成中...';
    
    try {
        const response = await fetch('/api/ai/expand-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rough_idea: script,
                narrator_name: currentNarratorData.name,
                requester_name: currentUserData.display_name
            })
        });
        
        if (!response.ok) throw new Error('AI生成に失敗しました');
        
        const data = await response.json();
        aiSuggestionText = data.suggestion;
        
        // 提案を表示
        document.getElementById('suggestionContent').textContent = aiSuggestionText;
        document.getElementById('aiSuggestion').style.display = 'block';
        
        console.log('✅ AI提案生成成功');
    } catch (error) {
        console.error('❌ AI生成エラー:', error);
        alert('AI提案の生成に失敗しました。もう一度お試しください。');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

/**
 * AI提案を使用
 */
function useSuggestion() {
    document.getElementById('requestScript').value = aiSuggestionText;
    calculatePrice();
    document.getElementById('aiSuggestion').style.display = 'none';
    
    // テキストエリアにフォーカス
    document.getElementById('requestScript').focus();
    
    console.log('✅ AI提案を採用');
}

console.log('✅ 依頼モーダル機能が読み込まれました');
