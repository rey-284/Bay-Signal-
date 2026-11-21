const CACHE = "baysignal-offline-v2";
const ROOT = self.registration.scope;
const ASSETS = ["./", "./index.html", "./form.css", "./app.js"].map(
  (path) => new URL(path, ROOT).href,
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("baysignal-offline-") && key !== CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  url.search = "";

  if (event.request.method !== "GET" || !ASSETS.includes(url.href)) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(url.href);
      return cached || fetch(event.request);
    }),
  );
});