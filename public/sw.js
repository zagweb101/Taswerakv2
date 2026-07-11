// ====================================================================
// Service Worker — PWA offline support
// v3: bypasses all dashboard routes to prevent stale/503 issues
// ====================================================================

const CACHE_NAME = "taswerak-v3";
const STATIC_ASSETS = [
  "/logo.webp",
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

  // Skip ALL API requests
  if (url.pathname.startsWith("/api/")) return;

  // Skip RSC (React Server Component) requests
  if (url.searchParams.has("_rsc")) return;

  // Skip non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Skip ALL dashboard routes — they should never be served from cache
  // This prevents stale dashboard pages + 503 offline errors
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/instructor") ||
    url.pathname.startsWith("/student") ||
    url.pathname.startsWith("/guardian")
  ) {
    return; // Let the browser handle it normally (network only)
  }

  // For navigation requests (public pages only): network-first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          // Network failed — try cache, then fallback to "/"
          return caches.match(request)
            .then((cached) => cached || caches.match("/"))
            .catch(() => new Response("", { status: 503, statusText: "Offline" }));
        })
    );
    return;
  }

  // For static assets: cache-first
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
        .catch(() => new Response("", { status: 503, statusText: "Offline" }));
    })
  );
});
