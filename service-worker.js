// Service Worker for KimiLink Voice
// PWA (Progressive Web App) support

const CACHE_NAME = 'kimitolink-voice-v3-fixed';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';

// 重要な静的リソース（前キャッシュ）
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/script.js',
    '/js/galaxy-effects.js',
    '/images/webp/logo_funlink_RGB_color.webp',
    '/images/webp/logo_funlink_RGB_maru_blue.webp',
    '/images/webp/yukkuri-link-nikoniko-kuchiake.webp',
    '/images/webp/kewXCUOt_400x400.webp'
];

// 動的にキャッシュするリソースのパターン
const CACHE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:css|js)$/,
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/cdnjs\.cloudflare\.com/
];

// インストールイベント
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(error => {
                console.error('[Service Worker] Cache installation failed:', error);
            })
    );
});

// アクティベーションイベント
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
                        })
                        .map(cacheName => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// フェッチイベント - Cache First with Network Fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // APIリクエストはNetwork First
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // 静的リソースはCache First
    event.respondWith(cacheFirst(request));
});

// Cache First 戦略
async function cacheFirst(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        
        // キャッシュすべきリソースかチェック
        if (response.ok && shouldCache(request)) {
            const dynamicCache = await caches.open(DYNAMIC_CACHE);
            dynamicCache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        // オフライン時のフォールバック
        const fallback = await caches.match('/index.html');
        return fallback || new Response('Offline', { status: 503 });
    }
}

// Network First 戦略
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 503 });
    }
}

// キャッシュすべきか判定
function shouldCache(request) {
    const url = new URL(request.url);
    return CACHE_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.href));
}

// プッシュ通知
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'KimiLink Voice';
    const options = {
        body: data.body || '新しい通知があります',
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 通知クリック
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
