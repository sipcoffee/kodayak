export interface GifPhoto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
}

export interface GifOptions {
  frameDelay: number; // milliseconds between frames (100-2000)
  outputSize: 320 | 480 | 640; // output width in pixels
  loop: boolean; // true = infinite loop, false = play once
}

export interface GifGeneratorState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: {
    phase: "fetching" | "encoding";
    current: number;
    total: number;
  } | null;
  result: Blob | null;
  error: string | null;
}

export interface GifWorkerMessage {
  type: "start";
  images: ImageData[];
  options: GifOptions;
}

export interface GifWorkerResponse {
  type: "progress" | "complete" | "error";
  frame?: number;
  total?: number;
  blob?: Blob;
  error?: string;
}

export const DEFAULT_GIF_OPTIONS: GifOptions = {
  frameDelay: 500,
  outputSize: 480,
  loop: true,
};

export const MAX_PHOTOS = 20;
export const MIN_PHOTOS = 2;
