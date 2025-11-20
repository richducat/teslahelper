const CACHE_NAME = 'teslahelper-v2';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/main.js',
  '/marketing.js',
  '/logo.svg',
  '/tesla_howto_library.json',
  '/tesla_helper_base64_1280.json',
  '/config/affiliates.json',
  '/config/offers.json',
  '/start/index.html',
  '/kit/index.html',
  '/upsell/index.html',
  '/chargers/index.html',
  '/insurance/index.html',
  '/disclosure/index.html',
  '/thank-you/index.html',
  '/accessories/model-y/index.html',
  '/accessories/model-3/index.html',
  '/accessories/model-s/index.html',
  '/accessories/model-x/index.html',
  '/accessories/cybertruck/index.html',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => {
        if (request.mode === 'navigate') return caches.match('/index.html');
        return caches.match(request, { ignoreSearch: true }) || caches.match(OFFLINE_URL);
      })
  );
});
