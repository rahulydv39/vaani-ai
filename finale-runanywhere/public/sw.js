// Vaani AI — Service Worker (Offline-first for production)
const CACHE_NAME = 'vaani-ai-v3'

// Pre-cache critical shell on install
const PRECACHE = ['/', '/index.html']

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
    )
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)

    // Skip non-GET requests
    if (event.request.method !== 'GET') return

    // Skip cross-origin requests (HuggingFace model downloads are cached by RunAnywhere in IndexedDB)
    if (url.origin !== self.location.origin) return

    // Navigation requests: serve cached index.html as offline fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
                    return response
                })
                .catch(() => caches.match('/index.html'))
        )
        return
    }

    // All same-origin assets: cache-first (JS, CSS, WASM, fonts, images)
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached

            return fetch(event.request).then((response) => {
                // Cache successful responses for offline use
                if (response.ok && !url.pathname.includes('hot-update')) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
                }
                return response
            }).catch(() => {
                // Offline and not in cache — return a basic offline response
                return new Response('Offline', { status: 503, statusText: 'Offline' })
            })
        })
    )
})
