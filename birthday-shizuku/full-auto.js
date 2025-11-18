// 🎉 蒼凪しずく 生誕祭 - 完全自動スクリプト
// このスクリプトを1回実行するだけで、全シーンが自動で流れます！

(async function() {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    console.log(`
🎬 蒼凪しずく 生誕祭 - 完全自動録画開始！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 注意: 
- 画面録画を開始してください（Win+G）
- このスクリプトは約1分間自動で実行されます
- 途中で中断しないでください

準備ができたら、3秒後に開始します...
    `);
    
    await sleep(3000);
    
    // ==========================================
    // シーン1: オープニング（3秒）
    // ==========================================
    console.log('🎬 シーン1: オープニング');
    window.location.href = "about:blank";
    await sleep(1000);
    
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            text-align: center;
        ">
            <div>
                <h1 style="font-size: 4rem; color: white; animation: fadeIn 1s;">🎉</h1>
                <h2 style="font-size: 3rem; color: white; margin: 2rem 0; animation: fadeIn 1s 0.5s both;">
                    これから始まります...
                </h2>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    `;
    
    await sleep(3000);
    
    // ==========================================
    // シーン2: Twitter検索（10秒）
    // ==========================================
    console.log('🔍 シーン2: Twitter検索');
    window.location.href = "https://x.com/search";
    await sleep(3000);
    
    const searchBox = document.querySelector('input[data-testid="SearchBox_Search_Input"]') || 
                     document.querySelector('input[placeholder*="検索"]') ||
                     document.querySelector('input[aria-label*="検索"]');
    
    if (searchBox) {
        searchBox.click();
        searchBox.focus();
        await sleep(1000);
        
        const text = "蒼凪しずく 生誕祭 楽しみ";
        for (const char of text) {
            searchBox.value += char;
            searchBox.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(200);
        }
        
        await sleep(1000);
        searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    }
    
    await sleep(3000);
    
    // ==========================================
    // シーン3: メイド服ツイート（8秒）
    // ==========================================
    console.log('📸 シーン3: メイド服ツイート');
    window.location.href = "https://x.com/flap_shizuku/status/1988950811075125652";
    await sleep(3000);
    
    window.scrollTo({ top: 300, behavior: 'smooth' });
    await sleep(2000);
    
    let likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton && !likeButton.querySelector('svg[data-testid="unlike"]')) {
        likeButton.style.transform = 'scale(1.2)';
        likeButton.style.transition = 'transform 0.3s';
        await sleep(500);
        
        likeButton.click();
        await sleep(1000);
        
        likeButton.style.transform = 'scale(1)';
    }
    
    await sleep(2000);
    
    // ==========================================
    // シーン4: JR大塚駅広告（10秒）
    // ==========================================
    console.log('🚉 シーン4: JR大塚駅広告');
    window.location.href = "https://x.com/flap_up_idol/status/1988510278448017445";
    await sleep(3000);
    
    window.scrollTo({ top: 200, behavior: 'smooth' });
    await sleep(2000);
    
    const images = document.querySelectorAll('img[alt*="Image"]');
    if (images.length > 0) {
        images[0].style.border = '5px solid #ff6b9d';
        images[0].style.transition = 'all 0.5s';
        images[0].style.boxShadow = '0 0 20px rgba(255, 107, 157, 0.6)';
        await sleep(2500);
        
        images[0].style.border = 'none';
        images[0].style.boxShadow = 'none';
    }
    
    likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) {
        likeButton.click();
        await sleep(1000);
    }
    
    await sleep(1500);
    
    // ==========================================
    // シーン5: TikTok動画（10秒）
    // ==========================================
    console.log('🎵 シーン5: TikTok動画');
    window.location.href = "https://www.tiktok.com/@idolfunch/video/7509897290023177489";
    await sleep(4000);
    
    let video = document.querySelector('video');
    if (video) {
        video.style.border = '5px solid #ff6b9d';
        video.style.boxShadow = '0 0 30px rgba(255, 107, 157, 0.8)';
        video.style.transition = 'all 0.5s';
        
        if (video.paused) video.play();
        
        await sleep(5000);
        
        video.style.border = 'none';
        video.style.boxShadow = 'none';
    }
    
    await sleep(1000);
    
    // ==========================================
    // シーン6: idolfunchツイート（8秒）
    // ==========================================
    console.log('🎤 シーン6: idolfunchツイート');
    window.location.href = "https://x.com/idolfunch/status/1942732395515633764";
    await sleep(3000);
    
    video = document.querySelector('video');
    if (video) {
        video.style.border = '5px solid #6bcf7f';
        video.style.transition = 'all 0.5s';
        
        if (video.paused) video.click();
        
        await sleep(4000);
        
        video.style.border = 'none';
    }
    
    likeButton = document.querySelector('[data-testid="like"]');
    if (likeButton) likeButton.click();
    
    await sleep(1000);
    
    // ==========================================
    // シーン7: フィナーレ（5秒）
    // ==========================================
    console.log('🎉 シーン7: フィナーレ');
    window.location.href = "about:blank";
    await sleep(1000);
    
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            text-align: center;
            overflow: hidden;
        ">
            <div class="content">
                <div class="emoji" style="font-size: 8rem; animation: bounce 1s infinite;">🎉</div>
                <h1 class="title" style="
                    font-size: 5rem;
                    background: linear-gradient(45deg, #ff6b9d, #ffd93d, #6bcf7f, #4d9fff);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradientShift 3s ease infinite, fadeInScale 1s ease-out;
                    margin: 2rem 0;
                ">蒼凪しずく</h1>
                <h2 style="
                    font-size: 3.5rem;
                    color: white;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    animation: fadeIn 1s ease-out 0.5s both;
                ">生誕祭 楽しみ！</h2>
                <div style="
                    font-size: 4rem;
                    margin-top: 2rem;
                    animation: fadeIn 1s ease-out 1s both;
                ">✨</div>
                <p style="
                    font-size: 2rem;
                    color: white;
                    margin-top: 2rem;
                    animation: fadeIn 1s ease-out 1.5s both;
                ">おめでとう！</p>
            </div>
            <div class="confetti-container"></div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeInScale {
                from { 
                    opacity: 0;
                    transform: scale(0.5);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-30px); }
            }
            
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            
            .confetti {
                position: absolute;
                font-size: 2rem;
                animation: fall 5s linear infinite;
            }
        </style>
        <script>
            const container = document.querySelector('.confetti-container');
            const emojis = ['🎉', '🎊', '✨', '💕', '🎂', '🎈', '⭐', '💖', '🌟', '🎁'];
            
            function createConfetti() {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 3 + 3) + 's';
                container.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 8000);
            }
            
            setInterval(createConfetti, 300);
            
            // 5秒後にメッセージ
            setTimeout(() => {
                console.log('✅ 完了！録画を停止してください！');
            }, 5000);
        </script>
    `;
    
    await sleep(5000);
    
    // ==========================================
    // 完了
    // ==========================================
    console.log(`
✅ 完了！！！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 録画を停止してください
📁 動画を保存してください

合計時間: 約54秒

おつかれさまでした！ 🎉
    `);
    
})();
