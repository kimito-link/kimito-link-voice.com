// Service Worker for KimiLink Voice
// PWA (Progressive Web App) support

const CACHE_NAME = 'kimitolink-voice-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/images/logo.png',
    '/images/icon-creator.png',
    '/images/icon-idol.png',
    '/images/kota-ai-icon.png'
];

// インストールイベント
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('キャッシュのインストールに失敗しました:', error);
            })
    );
});

// アクティベーションイベント
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除しています:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチイベント
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュにある場合はそれを返す
                if (response) {
                    return response;
                }
                
                // キャッシュにない場合はネットワークから取得
                return fetch(event.request)
                    .then(response => {
                        // レスポンスが有効かチェック
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // レスポンスをキャッシュに保存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('フェッチエラー:', error);
                        // オフライン時のフォールバック
                        return caches.match('/index.html');
                    });
            })
    );
});

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
