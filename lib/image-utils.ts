/**
 * Compress an image blob for upload
 */
export async function compressImage(
  blob: Blob,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeKB?: number;
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeKB = 500,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Create canvas and draw
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try to compress to target size
      let currentQuality = quality;
      const compress = () => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // If still too large and quality can be reduced
            if (result.size > maxSizeKB * 1024 && currentQuality > 0.3) {
              currentQuality -= 0.1;
              compress();
            } else {
              resolve(result);
            }
          },
          "image/jpeg",
          currentQuality
        );
      };

      compress();
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Generate a thumbnail from an image blob
 */
export async function generateThumbnail(
  blob: Blob,
  maxSize: number = 200
): Promise<Blob> {
  return compressImage(blob, {
    maxWidth: maxSize,
    maxHeight: maxSize,
    quality: 0.7,
    maxSizeKB: 50,
  });
}

/**
 * Get image dimensions from a blob
 */
export async function getImageDimensions(
  blob: Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Convert a blob to base64 data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate a guest ID for anonymous photo uploads
 */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") {
    return "server-" + Math.random().toString(36).substring(2, 15);
  }

  const storageKey = "kodayak-guest-id";
  let guestId = localStorage.getItem(storageKey);

  if (!guestId) {
    guestId = "guest-" + Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem(storageKey, guestId);
  }

  return guestId;
}
