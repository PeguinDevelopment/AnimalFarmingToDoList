// Offline-Cache. Bei Änderungen an der App die Versionsnummer erhöhen, damit das iPhone die neue Version lädt.
const VERSION = 'plan-v15';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'animals.js', 'world.js', 'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  // Feen-Edition (gleicher Code, eigene Startseite unter feen/)
  'edition-feen.js', 'feen.css', 'feen/', 'feen/index.html', 'feen/manifest.webmanifest',
  'feen/icons/icon-180.png', 'feen/icons/icon-192.png', 'feen/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Erst aus dem Netz (damit Updates ankommen), sonst aus dem Cache (offline).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match(new URL(e.request.url).pathname.includes('/feen/') ? 'feen/index.html' : 'index.html')))
  );
});
