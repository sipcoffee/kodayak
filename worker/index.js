const CACHE_NAME = 'kodayak-v1';
const OFFLINE_QUEUE_NAME = 'kodayak-offline-uploads';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('kodayak-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests except for photo uploads which we handle specially
  if (request.method !== 'GET') {
    // Handle photo upload failures for offline queue
    if (url.pathname.includes('/api/photos') && request.method === 'POST') {
      event.respondWith(
        fetch(request.clone()).catch(async () => {
          // Store failed upload in IndexedDB for retry
          const formData = await request.formData();
          await storeOfflineUpload(formData, url.pathname);
          return new Response(
            JSON.stringify({
              queued: true,
              message: 'Photo queued for upload when online'
            }),
            {
              status: 202,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
      );
    }
    return;
  }

  // For camera pages, use network first
  if (url.pathname.startsWith('/c/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // For API requests, network only
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // For static assets, cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and fetch in background
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }
        });
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Background sync for offline uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-photos') {
    event.waitUntil(syncOfflineUploads());
  }
});

// Message handler for manual sync trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_UPLOADS') {
    syncOfflineUploads().then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }

  if (event.data && event.data.type === 'GET_QUEUE_COUNT') {
    getOfflineQueueCount().then((count) => {
      event.ports[0].postMessage({ count });
    });
  }
});

// IndexedDB helper functions
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kodayak-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('uploads')) {
        db.createObjectStore('uploads', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function storeOfflineUpload(formData, endpoint) {
  const db = await openDB();
  const tx = db.transaction('uploads', 'readwrite');
  const store = tx.objectStore('uploads');

  // Convert FormData to storable format
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof Blob) {
      data[key] = {
        type: 'blob',
        data: await blobToBase64(value),
        mimeType: value.type,
        name: value.name || 'photo.jpg'
      };
    } else {
      data[key] = value;
    }
  }

  store.add({
    endpoint,
    data,
    timestamp: Date.now()
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function syncOfflineUploads() {
  const db = await openDB();
  const tx = db.transaction('uploads', 'readonly');
  const store = tx.objectStore('uploads');
  const uploads = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const successfulIds = [];

  for (const upload of uploads) {
    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(upload.data)) {
        if (value && value.type === 'blob') {
          const blob = base64ToBlob(value.data, value.mimeType);
          formData.append(key, blob, value.name);
        } else {
          formData.append(key, value);
        }
      }

      const response = await fetch(upload.endpoint, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        successfulIds.push(upload.id);
      }
    } catch (error) {
      console.error('Failed to sync upload:', error);
    }
  }

  // Remove successful uploads
  if (successfulIds.length > 0) {
    const deleteTx = db.transaction('uploads', 'readwrite');
    const deleteStore = deleteTx.objectStore('uploads');
    for (const id of successfulIds) {
      deleteStore.delete(id);
    }
  }

  // Notify clients
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      synced: successfulIds.length,
      remaining: uploads.length - successfulIds.length
    });
  });
}

async function getOfflineQueueCount() {
  const db = await openDB();
  const tx = db.transaction('uploads', 'readonly');
  const store = tx.objectStore('uploads');
  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64, mimeType) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}
