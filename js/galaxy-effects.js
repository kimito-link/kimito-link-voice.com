// 宇宙エフェクトの初期化
function initGalaxyEffects() {
    const starField = document.getElementById('star-field');
    if (!starField) return;

    // 星を生成
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 5;
        
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.animationDelay = `${delay}s`;
        
        starField.appendChild(star);
    }

    // 流れ星を定期的に生成
    setInterval(createShootingStar, 3000);
}

// 流れ星を生成
function createShootingStar() {
    const starField = document.getElementById('star-field');
    if (!starField) return;

    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    
    const x = Math.random() * 80;
    const y = Math.random() * 80;
    
    shootingStar.style.left = `${x}%`;
    shootingStar.style.top = `${y}%`;
    shootingStar.style.animation = 'shoot 1.5s ease-out forwards';
    
    starField.appendChild(shootingStar);
    
    setTimeout(() => {
        shootingStar.remove();
    }, 1500);
}

// 初期化
document.addEventListener('DOMContentLoaded', initGalaxyEffects);