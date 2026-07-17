const CACHE_NAME = "lumikids-parent-hud-v17-1";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./style-maths.css",
  "./style-ms.css",
  "./style-ps.css",
  "./style-early-years-v17.css",
  "./style-game-ui.css",
  "./style-game-responsive.css",
  "./positions.css",
  "./script.js",
  "./script-maths.js",
  "./script-navigation.js",
  "./script-game-ui.js",
  "./script-ms.js",
  "./script-ps.js",
  "./script-early-years-v17.js",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
