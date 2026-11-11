/**
 * NeuroCare Service Worker (Basic Offline Static Shell Cache)
 * Caches local HTML, CSS, JavaScript, icons, and illustrations so offline
 * personal tools (localStorage tasks, journal, timers, flashcards, AAC) stay
 * accessible. External resource links require an internet connection.
 */

const CACHE_NAME = 'neurocare-shell-v2';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/accessibility.js',
  './js/adhd.js',
  './js/dyslexia.js',
  './js/learning.js',
  './js/wellness.js',
  './js/sensory.js',
  './js/assistant.js',
  './js/app.js',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/brain-infinity.svg',
  './assets/icons/neurocare-logo.svg',
  './assets/icons/plant-sprout.svg',
  './assets/images/hero-illustration.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((networkRes) => {
        if (!networkRes || networkRes.status !== 200 || networkRes.type !== 'basic') {
          return networkRes;
        }
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return networkRes;
      });
    })
  );
});
