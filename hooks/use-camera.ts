"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type CameraFacing = "user" | "environment";

interface UseCameraOptions {
  initialFacing?: CameraFacing;
}

interface CameraState {
  isReady: boolean;
  isCapturing: boolean;
  error: string | null;
  facing: CameraFacing;
  hasMultipleCameras: boolean;
  stream: MediaStream | null;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { initialFacing = "environment" } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<CameraState>({
    isReady: false,
    isCapturing: false,
    error: null,
    facing: initialFacing,
    hasMultipleCameras: false,
    stream: null,
  });

  const stopStream = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
  }, [state.stream]);

  const startCamera = useCallback(async (facing: CameraFacing = state.facing) => {
    setState((prev) => ({ ...prev, isReady: false, error: null }));

    try {
      // Check for camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }

      // Stop existing stream
      stopStream();

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      // Check for multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const hasMultipleCameras = videoDevices.length > 1;

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState((prev) => ({
        ...prev,
        isReady: true,
        facing,
        hasMultipleCameras,
        stream,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to access camera";
      setState((prev) => ({
        ...prev,
        isReady: false,
        error: message,
      }));
    }
  }, [state.facing, stopStream]);

  const switchCamera = useCallback(async () => {
    const newFacing: CameraFacing = state.facing === "user" ? "environment" : "user";
    await startCamera(newFacing);
  }, [state.facing, startCamera]);

  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    setState((prev) => ({ ...prev, isCapturing: true }));

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          0.92
        );
      });

      setState((prev) => ({ ...prev, isCapturing: false }));
      return blob;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isCapturing: false,
        error: error instanceof Error ? error.message : "Failed to capture photo",
      }));
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    canvasRef,
    ...state,
    startCamera,
    switchCamera,
    capturePhoto,
    stopStream,
  };
}
