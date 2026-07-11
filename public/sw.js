// ====================================================================
// Service Worker — PWA offline support
// Robust version: does not break on network errors, does not cache
// API or RSC requests.
// ====================================================================

const CACHE_NAME = "taswerak-v1";
const STATIC_ASSETS = [
  "/logo.svg",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ).catch(() => {})
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip ALL API requests — always go to network
  if (url.pathname.startsWith("/api/")) return;

  // Skip RSC (React Server Component) requests — always go to network
  if (url.searchParams.has("_rsc")) return;

  // Skip non-http(s) requests (e.g., chrome-extension://)
  if (!url.protocol.startsWith("http")) return;

  // For navigation requests (pages): network-first, fallback to cache, then to "/"
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          // Network failed — try cache, then fallback to "/"
          return caches.match(request).then((cached) => cached || caches.match("/")).catch(() => new Response("", { status: 503 }));
        })
    );
    return;
  }

  // For static assets (images, CSS, JS, fonts): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          // Return empty response for failed asset loads (don't crash)
          return new Response("", { status: 503, statusText: "Offline" });
        });
    })
  );
});
