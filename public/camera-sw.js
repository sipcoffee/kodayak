// Camera PWA Service Worker
// Scope: /c/*

const CACHE_NAME = "kodayak-camera-v1";
const OFFLINE_QUEUE_NAME = "kodayak-offline-uploads";

// Assets to cache for camera functionality
const STATIC_ASSETS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("kodayak-camera-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache for camera routes
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle requests within /c/ scope
  if (!url.pathname.startsWith("/c/") && !url.pathname.startsWith("/api/")) {
    return;
  }

  // Handle API requests for photo uploads
  if (url.pathname === "/api/photos" && event.request.method === "POST") {
    event.respondWith(handlePhotoUpload(event.request));
    return;
  }

  // For other requests, network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (event.request.method === "GET" && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle photo uploads with offline queue
async function handlePhotoUpload(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Network failed, queue for later
    await queueUpload(request);
    return new Response(
      JSON.stringify({ queued: true, message: "Photo queued for upload" }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Queue upload for later sync
async function queueUpload(request) {
  const db = await openDatabase();
  const formData = await request.formData();

  // Convert FormData to serializable format
  const data = {
    url: request.url,
    timestamp: Date.now(),
    formData: {},
  };

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const arrayBuffer = await value.arrayBuffer();
      data.formData[key] = {
        type: "file",
        name: value.name,
        mimeType: value.type,
        data: Array.from(new Uint8Array(arrayBuffer)),
      };
    } else {
      data.formData[key] = { type: "string", value };
    }
  }

  const tx = db.transaction("uploads", "readwrite");
  const store = tx.objectStore("uploads");
  await store.add(data);
}

// Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_QUEUE_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("uploads")) {
        db.createObjectStore("uploads", { keyPath: "timestamp" });
      }
    };
  });
}

// Process queued uploads
async function processQueue() {
  const db = await openDatabase();
  const tx = db.transaction("uploads", "readonly");
  const store = tx.objectStore("uploads");
  const uploads = await new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });

  for (const upload of uploads) {
    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(upload.formData)) {
        if (value.type === "file") {
          const blob = new Blob([new Uint8Array(value.data)], { type: value.mimeType });
          formData.append(key, blob, value.name);
        } else {
          formData.append(key, value.value);
        }
      }

      const response = await fetch(upload.url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Remove from queue
        const deleteTx = db.transaction("uploads", "readwrite");
        const deleteStore = deleteTx.objectStore("uploads");
        await deleteStore.delete(upload.timestamp);
      }
    } catch (error) {
      console.error("Failed to sync upload:", error);
    }
  }

  // Notify clients
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_COMPLETE" });
  });
}

// Background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-photos") {
    event.waitUntil(processQueue());
  }
});

// Message handler
self.addEventListener("message", async (event) => {
  if (event.data.type === "GET_QUEUE_COUNT") {
    const db = await openDatabase();
    const tx = db.transaction("uploads", "readonly");
    const store = tx.objectStore("uploads");
    const count = await new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
    });
    event.ports[0].postMessage({ count });
  }

  if (event.data.type === "SYNC_UPLOADS") {
    await processQueue();
    event.ports[0].postMessage({ done: true });
  }
});
