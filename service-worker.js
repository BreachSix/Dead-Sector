const CACHE_VERSION = 'v1';
const CACHE_NAME = 'deadsector-' + CACHE_VERSION;
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sound-assault.mp3',
  './sound-heavy.mp3',
  './sound-light.mp3',
  './sound-night.mp3',
  './sound-explosion.mp3',
  './brief-desert-research.jpg',
  './op-desert.png',
  './op-desert-fortune.png',
  './op-desert-camouflage.png',
  './op-desert-blindage.png',
  './op-desert-macabre.png',
  './op-desert-patine.png',
  './op-desert-dore.png',
  './op-heavy-desert.png',
  './op-light-desert.png',
  './op-shadow.png',
  './enemy-desert.png',
  './faction-logo.jpg',
  './skin-fortune.jpg',
  './skin-camouflage.jpg',
  './skin-blindage.jpg',
  './skin-macabre.jpg',
  './skin-patine.jpg',
  './skin-dore.jpg',
  './knife-tier1.jpg',
  './knife-tier2.jpg',
  './knife-tier3.jpg',
  './knife-tier4.jpg',
  './knife-tier5.jpg',
  './knife-tier6.jpg',
  './knife-tier7.jpg',
  './knife-tier8.jpg',
  './knife-tier9.jpg',
  './knife-tier10.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHtml = req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Réseau d'abord : charge toujours la version la plus récente du jeu si
    // une connexion est disponible. En cas d'échec (hors ligne), se rabat
    // sur la dernière version mise en cache.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Cache d'abord pour le reste (icônes, manifest) — ces fichiers changent
  // rarement, autant les servir instantanément depuis le cache.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});
