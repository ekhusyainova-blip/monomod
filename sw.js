/* ============================================================================
   MONOMOD — Service Worker
   Кэширует всё ядро + модули. Работает офлайн.
   ============================================================================ */

const CACHE = 'monomod-v4';
const URLS = [
  './', './index.html', './monomode.js',
  './mm-id.js', './mm-core.js', './mm-learn.js', './mm-query.js',
  './mm-links.js', './mm-fragments.js', './mm-spheres.js',
  './mm-auth.js', './mm-ui.js', './mm-viz.js', './mm-input.js',
  './mm-export.js', './mm-autopilot.js', './mm-pwa.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});