// Service Worker for WebGIS Jepara
// Provides offline functionality and caching

const CACHE_NAME = "webgis-jepara-v1.0.0";
const STATIC_CACHE = "webgis-static-v1";
const DYNAMIC_CACHE = "webgis-dynamic-v1";

// Files to cache for offline functionality
const STATIC_FILES = [
  "/",
  "/home.html",
  "/app.html",
  "/css/landing.css",
  "/css/style.css",
  "/css/responsive.css",
  "/js/app.js",
  "/js/peta.js",
  "/js/crud.js",
  "/js/pencarian.js",
  "/js/ui.js",
  "/js/utilitas.js",
  "/js/export-peta.js",
  "/js/error-handler.js",
  "/data/kategori.json",
  "/manifest.json",
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js",
  "https://unpkg.com/lucide@latest",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static files...");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("[SW] Static files cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static files:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("[SW] Serving from cache:", request.url);
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Don't cache if not a valid response
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone the response
          const responseToCache = networkResponse.clone();

          // Determine which cache to use
          const cacheName = STATIC_FILES.includes(url.pathname)
            ? STATIC_CACHE
            : DYNAMIC_CACHE;

          // Cache the response
          caches.open(cacheName).then((cache) => {
            console.log("[SW] Caching new resource:", request.url);
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch((error) => {
          console.log("[SW] Network fetch failed:", error);

          // Return offline fallback for HTML pages
          if (request.headers.get("accept").includes("text/html")) {
            return caches.match("/home.html");
          }

          // Return empty response for other resources
          return new Response("", {
            status: 408,
            statusText: "Request Timeout",
          });
        });
    })
  );
});

// Background sync for data synchronization
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "sync-facilities-data") {
    event.waitUntil(syncFacilitiesData());
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: event.data ? event.data.text() : "WebGIS Jepara notification",
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🗺️</text></svg>',
    badge:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🗺️</text></svg>',
    vibrate: [200, 100, 200],
    data: {
      url: "/app.html",
    },
    actions: [
      {
        action: "open-app",
        title: "Buka Aplikasi",
      },
      {
        action: "dismiss",
        title: "Tutup",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("WebGIS Jepara", options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "open-app") {
    event.waitUntil(clients.openWindow("/app.html"));
  }
});

// Helper function to sync facilities data
async function syncFacilitiesData() {
  try {
    console.log("[SW] Syncing facilities data...");

    // Get stored data from IndexedDB or localStorage
    const storedData = await getStoredFacilitiesData();

    if (storedData && storedData.length > 0) {
      // Send data to server (if server endpoint exists)
      // This is a placeholder for future server integration
      console.log("[SW] Data sync completed");
    }
  } catch (error) {
    console.error("[SW] Data sync failed:", error);
  }
}

// Helper function to get stored facilities data
async function getStoredFacilitiesData() {
  // This would integrate with the app's localStorage data
  // For now, return empty array
  return [];
}

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log("[SW] Service Worker script loaded");
