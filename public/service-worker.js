const CACHE_NAME = 'tplk004-offline-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    '/favicon.ico',
    // We can add generic offline assets here like basic CSS/JS 
    // but the offline page will use inline styles to be completely self-contained.
];

self.addEventListener('install', (event) => {
    // Force immediate activation
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    // Claim clients immediately
    event.waitUntil(self.clients.claim());

    // Clean up old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only intercept navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If network fails, serve the offline page
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    // For APIs or other assets, try network first, fallback to basic cache if exists
    // Note: API requests (/api/*) should fail so our frontend logic (AutoSync/OfflineStorage) can catch them!
    if (event.request.url.includes('/api/') || event.request.method === 'POST') {
        return; // Let the browser handle it naturally, so axios catches the Network Error
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // If it's an image and network fails, return an offline SVG or empty
                if (event.request.destination === 'image') {
                    return new Response(
                        '<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,sans-serif" font-size="24" text-anchor="middle" x="200" y="160">Offline Image</text></g></svg>',
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                }
            });
        })
    );
});
