"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type CameraFacing = "user" | "environment";

interface UseCameraOptions {
  initialFacing?: CameraFacing;
}

interface ZoomCapabilities {
  supported: boolean;
  min: number;
  max: number;
  step: number;
}

interface CameraState {
  isReady: boolean;
  isCapturing: boolean;
  error: string | null;
  facing: CameraFacing;
  hasMultipleCameras: boolean;
  zoomLevel: number;
  zoomCapabilities: ZoomCapabilities;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { initialFacing = "environment" } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingRef = useRef<CameraFacing>(initialFacing);

  const [state, setState] = useState<CameraState>({
    isReady: false,
    isCapturing: false,
    error: null,
    facing: initialFacing,
    hasMultipleCameras: false,
    zoomLevel: 1,
    zoomCapabilities: { supported: false, min: 1, max: 1, step: 0.1 },
  });

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facing?: CameraFacing) => {
    const targetFacing = facing ?? facingRef.current;
    facingRef.current = targetFacing;
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
          facingMode: targetFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      // Check for multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const hasMultipleCameras = videoDevices.length > 1;

      // Check for zoom capabilities
      const videoTrack = stream.getVideoTracks()[0];
      let zoomCapabilities: ZoomCapabilities = { supported: false, min: 1, max: 1, step: 0.1 };

      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
          zoom?: { min: number; max: number; step: number };
        };

        if (capabilities.zoom) {
          zoomCapabilities = {
            supported: true,
            min: capabilities.zoom.min,
            max: capabilities.zoom.max,
            step: capabilities.zoom.step,
          };
        }
      }

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState((prev) => ({
        ...prev,
        isReady: true,
        facing: targetFacing,
        hasMultipleCameras,
        zoomLevel: 1,
        zoomCapabilities,
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
  }, [stopStream]);

  const switchCamera = useCallback(async () => {
    const newFacing: CameraFacing = facingRef.current === "user" ? "environment" : "user";
    await startCamera(newFacing);
  }, [startCamera]);

  const setZoom = useCallback(async (level: number) => {
    if (!streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
      zoom?: { min: number; max: number; step: number };
    };

    if (!capabilities.zoom) return;

    // Clamp zoom level to valid range
    const clampedLevel = Math.min(Math.max(level, capabilities.zoom.min), capabilities.zoom.max);

    try {
      await videoTrack.applyConstraints({
        advanced: [{ zoom: clampedLevel } as MediaTrackConstraintSet],
      });
      setState((prev) => ({ ...prev, zoomLevel: clampedLevel }));
    } catch (error) {
      console.error("Failed to set zoom level:", error);
    }
  }, []);

  const capturePhoto = useCallback(async (filter?: string): Promise<Blob | null> => {
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

      // Apply filter if provided
      if (filter) {
        ctx.filter = filter;
      }

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Reset filter
      ctx.filter = "none";

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
    setZoom,
  };
}
