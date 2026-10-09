const CACHE_VERSION = 'monomod-v9.0.0';

const ASSETS = [
  './', './index.html', './monomod.html', './monomode.js',
  './modules.json', './manifest.json',
  './core/graph.js', './core/archive.js', './core/memory.js',
  './core/bus.js', './core/monomode.js', './core/conveyer.js',
  './modules/psi/state.js', './modules/psi/spiral.js',
  './modules/lambda/viz.js',
  './modules/omega/pack.js', './modules/omega/canon.js',
  './renderers/sphere.js', './renderers/input.js',
  './styles/monomod.css', './styles/index.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});