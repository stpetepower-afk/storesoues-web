/* Hallelujah ONE — service worker for offline capability ("work from anywhere").
 * Strategy: cache the app shell + data on install; serve cache-first with a
 * background network refresh so the dashboard opens instantly and works with
 * no connection. Bump CACHE when shipping changes to invalidate old caches. */
const CACHE = "hallelujah-one-v1";
const SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/dashboard.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/src/lib/chatWidget.js",
  "/data/org.json",
  "/data/metrics.json",
  "/data/residents.json",
  "/data/funding.json",
  "/data/partners.json",
  "/data/deadlines.json",
  "/data/h3o.json",
  "/data/skills.json",
  "/data/loops.json",
  "/data/career.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Never cache the chat API — it needs the network.
  if (new URL(req.url).pathname === "/api/chat") return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached); // offline: fall back to cache
      return cached || network;
    })
  );
});
