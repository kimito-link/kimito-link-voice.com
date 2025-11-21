/**
 * ゆっくりローディングアニメーション
 * KimiLink Voice用のローディング表示ヘルパー
 */

// ローディングオーバーレイを表示
function showLoading(message = 'ゆっくり読み込み中...', bubbleText = 'しばらくお待ちください') {
    // 既存のローディングを削除
    hideLoading();

    const loadingHTML = `
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-container">
                <div class="loading-yukkuri">
                    <img src="images/yukkuri/yukkuri-link-nikoniko-kuchiake.webp" 
                         alt="ゆっくりりんく"
                         onerror="this.src='images/icon/kewXCUOt_400x400.jpg'">
                </div>
                <div class="loading-text">${message}</div>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                ${bubbleText ? `
                    <div class="loading-bubble">
                        ${bubbleText}
                    </div>
                ` : ''}
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

// ローディングオーバーレイを非表示
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// 成功メッセージを表示
function showSuccess(message = '完了しました！', duration = 2000) {
    hideLoading();

    const successHTML = `
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-container loading-success">
                <div class="loading-success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="loading-text" style="margin-top: 20px;">${message}</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', successHTML);

    setTimeout(() => {
        hideLoading();
    }, duration);
}

// インラインローディングを表示（要素内）
function showInlineLoading(element, text = '読み込み中...') {
    if (!element) return;

    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;

    element.innerHTML = `
        <div class="loading-inline">
            <div class="loading-spinner-small"></div>
            <span>${text}</span>
        </div>
    `;
}

// インラインローディングを非表示
function hideInlineLoading(element) {
    if (!element) return;

    const originalContent = element.dataset.originalContent;
    if (originalContent) {
        element.innerHTML = originalContent;
        delete element.dataset.originalContent;
    }
}

// プログレス付きローディング
function showProgressLoading(message = 'アップロード中...', progress = 0) {
    // 既存のローディングがあれば更新
    let overlay = document.getElementById('loadingOverlay');
    
    if (!overlay) {
        showLoading(message);
        overlay = document.getElementById('loadingOverlay');
    }

    // プログレスバーを更新
    const progressBar = overlay.querySelector('.loading-progress-bar');
    const loadingText = overlay.querySelector('.loading-text');
    
    if (progressBar) {
        progressBar.style.animation = 'none';
        progressBar.style.width = `${progress}%`;
        progressBar.style.background = `linear-gradient(90deg, 
            var(--primary-blue, #4A90E2) 0%, 
            var(--secondary-pink, #FFB6D9) 100%
        )`;
    }

    if (loadingText) {
        loadingText.textContent = `${message} ${Math.round(progress)}%`;
    }
}

// 使用例を出力
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('%cゆっくりローディングアニメーション', 'color: #4A90E2; font-size: 1.2rem; font-weight: bold;');
    console.log('使用可能な関数:');
    console.log('- showLoading(message, bubbleText)');
    console.log('- hideLoading()');
    console.log('- showSuccess(message, duration)');
    console.log('- showInlineLoading(element, text)');
    console.log('- hideInlineLoading(element)');
    console.log('- showProgressLoading(message, progress)');
    console.log('\n例: showLoading("データ取得中...", "しばらくお待ちください")');
}

// fadeOutアニメーションを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
