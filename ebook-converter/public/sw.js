/**
 * BookConv Service Worker — Step 4: Cache Strategy
 * Implements stale-while-revalidate for API calls, cache-first for static assets.
 */

const CACHE_NAME = 'bookconv-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'
const API_CACHE = 'api-v1'

// Assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/pricing',
  '/blog',
  '/privacy',
  '/terms',
  '/icon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/robots.txt',
  '/manifest.json',
  '/og-image.svg',
]

// Install: precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  )
  // Take control of all clients immediately
  return self.clients.claim()
})

// Fetch: smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Static assets from /_next — cache-first with stale-while-revalidate
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // API routes — network-first with fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // HTML pages — network-first with fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }

  // Images and other resources — cache-first
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|ico)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Default: go straight to network
})

/**
 * Cache-first strategy: try cache, fall back to network
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

/**
 * Network-first strategy: try network, fall back to cache
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response('Offline', { status: 503 })
  }
}

// Background sync for failed conversions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-conversion') {
    event.waitUntil(syncConversionData())
  }
})

async function syncConversionData() {
  // Placeholder for background sync logic
}

// Push notifications (for future premium features)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'BookConv', body: 'Your conversion is ready!' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
    }),
  )
})