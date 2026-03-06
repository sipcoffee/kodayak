"use client";

import { useState, useEffect, useCallback } from "react";

const DB_NAME = "kodayak-photos";
const STORE_NAME = "pending-photos";
const DB_VERSION = 1;

export interface LocalPhoto {
  id: string;
  eventId: string;
  blob: Blob;
  dataUrl: string;
  guestId: string;
  guestName?: string;
  width: number;
  height: number;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("eventId", "eventId", { unique: false });
      }
    };
  });
}

export function useLocalPhotos(eventId: string) {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load photos from IndexedDB
  const loadPhotos = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("eventId");
      const request = index.getAll(eventId);

      request.onsuccess = () => {
        const photos = request.result as LocalPhoto[];
        // Sort by createdAt descending
        photos.sort((a, b) => b.createdAt - a.createdAt);
        setPhotos(photos);
        setIsLoading(false);
      };

      request.onerror = () => {
        console.error("Failed to load photos:", request.error);
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Failed to open DB:", error);
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Add a photo to local storage
  const addPhoto = useCallback(async (photo: Omit<LocalPhoto, "id" | "createdAt">) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const newPhoto: LocalPhoto = {
        ...photo,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };

      store.add(newPhoto);

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      setPhotos((prev) => [newPhoto, ...prev]);
      return newPhoto;
    } catch (error) {
      console.error("Failed to add photo:", error);
      throw error;
    }
  }, []);

  // Remove a photo from local storage
  const removePhoto = useCallback(async (id: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      store.delete(id);

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to remove photo:", error);
      throw error;
    }
  }, []);

  // Clear all photos for this event
  const clearPhotos = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      for (const photo of photos) {
        store.delete(photo.id);
      }

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      setPhotos([]);
    } catch (error) {
      console.error("Failed to clear photos:", error);
      throw error;
    }
  }, [photos]);

  return {
    photos,
    isLoading,
    addPhoto,
    removePhoto,
    clearPhotos,
    reload: loadPhotos,
  };
}
