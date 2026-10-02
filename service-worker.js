const CACHE_VERSION = 'v7';
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
  './sound-bomb-tick.mp3',
  './sound-click.mp3',
  './sound-mission-stinger.mp3',
  './sound-night-vision.mp3',
  './sound-shadow-blade.mp3',
  './sound-unlock.mp3',
  './sound-trap.mp3',
  './sound-infected-attack.mp3',
  './music-menu.mp3',
  './brief-banlieue.jpg',
  './brief-ferme.jpg',
  './brief-recherche.jpg',
  './brief-mall.jpg',
  './brief-arctique.jpg',
  './brief-quarantaine.jpg',
  './brief-labo.jpg',
  './brief-ecole.jpg',
  './brief-metro.jpg',
  './brief-prison.jpg',
  './brief-port.jpg',
  './brief-siege.jpg',
  './op-assault.png',
  './op-assault-jaune.png',
  './op-assault-camouflage.png',
  './op-assault-blindage.png',
  './op-assault-trophees.png',
  './op-assault-patine.png',
  './op-assault-dore.png',
  './op-heavy.png',
  './op-light.png',
  './op-shadow.png',
  './enemy-securite.png',
  './enemy-hazmat.png',
  './enemy-bureau.png',
  './enemy-arctique.png',
  './faction-logo.jpg',
  './unit-logo.jpg',
  './skin-jaune.jpg',
  './skin-camouflage.jpg',
  './skin-blindage.jpg',
  './skin-trophees.jpg',
  './skin-patine.jpg',
  './skin-dore.jpg',
  './milestone-tier0-standard.jpg',
  './milestone-tier1-tissu-fortune.jpg',
  './milestone-tier2-urbain-raye.jpg',
  './milestone-tier3-fil-de-fer-et-clous.jpg',
  './milestone-tier4-tactique-numerique.jpg',
  './milestone-tier5-sang-seche.jpg',
  './milestone-tier6-peau-de-predateur.jpg',
  './milestone-tier7-damas-post-apo.jpg',
  './milestone-tier8-gardien-des-cendres.jpg',
  './milestone-tier9-or-de-recuperation.jpg',
  './milestone-tier10-obsidienne-infectee.jpg',
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

  // Cache d'abord pour le reste (icônes, manifest, assets) — ces fichiers
  // changent rarement, autant les servir instantanément depuis le cache.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});
