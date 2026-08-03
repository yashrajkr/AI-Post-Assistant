// Minimal service worker — required by Chrome/Edge for PWA installability
// (the `beforeinstallprompt` event only fires once a fetch-handling SW is registered).
// No caching strategy yet; every request just passes through to the network.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
