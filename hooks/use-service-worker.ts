"use client";

import { useEffect, useState, useCallback } from "react";

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  offlineQueueCount: number;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    offlineQueueCount: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isSupported = "serviceWorker" in navigator;
    setState((prev) => ({ ...prev, isSupported }));

    if (!isSupported) return;

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        setState((prev) => ({ ...prev, isRegistered: true }));

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content available
                console.log("New content available, please refresh.");
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data.type === "SYNC_COMPLETE") {
        updateQueueCount();
      }
    });

    // Online/offline handlers
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      triggerSync();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial queue count
    updateQueueCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updateQueueCount = useCallback(async () => {
    if (!navigator.serviceWorker.controller) return;

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      setState((prev) => ({ ...prev, offlineQueueCount: event.data.count || 0 }));
    };

    navigator.serviceWorker.controller.postMessage(
      { type: "GET_QUEUE_COUNT" },
      [messageChannel.port2]
    );
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.serviceWorker.controller) return;

    // Try Background Sync API first
    if ("sync" in (navigator.serviceWorker as unknown as { sync?: unknown })) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-photos");
        return;
      } catch {
        // Fall back to manual sync
      }
    }

    // Manual sync via message
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = () => {
      updateQueueCount();
    };

    navigator.serviceWorker.controller.postMessage(
      { type: "SYNC_UPLOADS" },
      [messageChannel.port2]
    );
  }, [updateQueueCount]);

  return {
    ...state,
    triggerSync,
    updateQueueCount,
  };
}
