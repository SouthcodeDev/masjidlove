// Installability only. No caching strategy by design — a caching service
// worker during active development serves stale bundles. See SETUP.md §6.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // A fetch handler is required for installability; it deliberately does nothing.
});
