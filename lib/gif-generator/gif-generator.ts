import GIF from "gif.js";
import { GifOptions, GifPhoto } from "./types";

export interface ProgressCallback {
  (phase: "fetching" | "encoding", current: number, total: number): void;
}

/**
 * Fetch an image from URL and return as HTMLImageElement
 */
async function fetchImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Resize an image to fit within the target size while maintaining aspect ratio
 */
function resizeImage(
  img: HTMLImageElement,
  targetWidth: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const aspectRatio = img.height / img.width;
  const width = targetWidth;
  const height = Math.round(targetWidth * aspectRatio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

/**
 * Generate a GIF from an array of photos
 */
export async function generateGif(
  photos: GifPhoto[],
  options: GifOptions,
  onProgress?: ProgressCallback,
  abortSignal?: AbortSignal
): Promise<Blob> {
  const { frameDelay, outputSize, loop } = options;

  // Fetch and process all images
  const processedImages: HTMLCanvasElement[] = [];
  let targetWidth = outputSize;
  let targetHeight = 0;

  for (let i = 0; i < photos.length; i++) {
    if (abortSignal?.aborted) {
      throw new Error("GIF generation cancelled");
    }

    onProgress?.("fetching", i + 1, photos.length);

    const photo = photos[i];
    const img = await fetchImage(photo.url);
    const { canvas, height } = resizeImage(img, targetWidth);

    // Use the height of the first image as the target height for all frames
    if (i === 0) {
      targetHeight = height;
    }

    processedImages.push(canvas);
  }

  // Create GIF
  return new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new Error("GIF generation cancelled"));
      return;
    }

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: targetWidth,
      height: targetHeight,
      workerScript: "/gif.worker.js",
      repeat: loop ? 0 : -1, // 0 = infinite loop, -1 = no loop
    });

    // Handle abort
    const abortHandler = () => {
      gif.abort();
      reject(new Error("GIF generation cancelled"));
    };
    abortSignal?.addEventListener("abort", abortHandler);

    // Add frames
    processedImages.forEach((canvas) => {
      gif.addFrame(canvas, { delay: frameDelay });
    });

    // Track encoding progress
    gif.on("progress", (p: number) => {
      const frame = Math.round(p * photos.length);
      onProgress?.("encoding", frame, photos.length);
    });

    gif.on("finished", (blob: Blob) => {
      abortSignal?.removeEventListener("abort", abortHandler);
      resolve(blob);
    });

    // Note: gif.js doesn't have an error event, errors are thrown synchronously
    try {
      gif.render();
    } catch (error) {
      abortSignal?.removeEventListener("abort", abortHandler);
      reject(error);
    }
  });
}
