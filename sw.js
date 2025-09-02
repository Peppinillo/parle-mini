// Parle+ Mini service worker
const CACHE = 'parle-mini-v1-20250902084240';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // Opportunistic cache (ignore cross-origin and opaque)
      try {
        const copy = res.clone();
        const url = new URL(req.url);
        if (url.origin === self.location.origin) {
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
      } catch (e) { /* ignore */ }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
