"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type CameraFacing = "user" | "environment";

interface UseCameraOptions {
  initialFacing?: CameraFacing;
}

interface ZoomCapabilities {
  supported: boolean;
  nativeSupport: boolean; // true if device supports native zoom API
  min: number;
  max: number;
  step: number;
}

interface FocusCapabilities {
  supported: boolean;
  modes: string[];
}

interface CameraState {
  isReady: boolean;
  isCapturing: boolean;
  error: string | null;
  facing: CameraFacing;
  hasMultipleCameras: boolean;
  zoomLevel: number;
  zoomCapabilities: ZoomCapabilities;
  focusCapabilities: FocusCapabilities;
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
    zoomCapabilities: { supported: false, nativeSupport: false, min: 1, max: 1, step: 0.1 },
    focusCapabilities: { supported: false, modes: [] },
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

      // Check for zoom and focus capabilities
      const videoTrack = stream.getVideoTracks()[0];
      let zoomCapabilities: ZoomCapabilities = {
        supported: true, // Always enable zoom with CSS fallback
        nativeSupport: false,
        min: 1,
        max: 5, // CSS fallback max zoom
        step: 0.1
      };
      let focusCapabilities: FocusCapabilities = { supported: false, modes: [] };

      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
          zoom?: { min: number; max: number; step: number };
          focusMode?: string[];
        };

        if (capabilities.zoom) {
          // Native zoom supported (Android Chrome, etc.)
          zoomCapabilities = {
            supported: true,
            nativeSupport: true,
            min: capabilities.zoom.min,
            max: capabilities.zoom.max,
            step: capabilities.zoom.step,
          };
        }

        // Check for focus capabilities
        if (capabilities.focusMode && capabilities.focusMode.length > 0) {
          focusCapabilities = {
            supported: true,
            modes: capabilities.focusMode,
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
        focusCapabilities,
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
    setState((prev) => {
      const { zoomCapabilities } = prev;
      // Clamp zoom level to valid range
      const clampedLevel = Math.min(Math.max(level, zoomCapabilities.min), zoomCapabilities.max);

      // Try native zoom if supported
      if (zoomCapabilities.nativeSupport && streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.applyConstraints({
            advanced: [{ zoom: clampedLevel } as MediaTrackConstraintSet],
          }).catch((error) => {
            console.error("Failed to set native zoom level:", error);
          });
        }
      }
      // CSS zoom fallback is handled by the component via zoomLevel state

      return { ...prev, zoomLevel: clampedLevel };
    });
  }, []);

  // Focus at a specific point (x, y are normalized 0-1 coordinates)
  const focusAt = useCallback(async (x: number, y: number): Promise<boolean> => {
    if (!streamRef.current) return false;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return false;

    const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
      focusMode?: string[];
    };

    // Check if manual or single-shot focus is supported
    if (!capabilities.focusMode) return false;

    const supportsSingleShot = capabilities.focusMode.includes("single-shot");
    const supportsManual = capabilities.focusMode.includes("manual");

    if (!supportsSingleShot && !supportsManual) return false;

    try {
      // Apply focus constraints with point of interest
      const constraints: MediaTrackConstraintSet & {
        focusMode?: string;
        pointsOfInterest?: { x: number; y: number }[];
      } = {
        focusMode: supportsSingleShot ? "single-shot" : "manual",
      };

      // Add point of interest if we can (normalized coordinates)
      constraints.pointsOfInterest = [{ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }];

      await videoTrack.applyConstraints({
        advanced: [constraints as MediaTrackConstraintSet],
      });

      return true;
    } catch (error) {
      console.error("Failed to focus:", error);
      return false;
    }
  }, []);

  const capturePhoto = useCallback(async (filter?: string, cssZoomLevel?: number): Promise<Blob | null> => {
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

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // If CSS zoom is being used, we need to crop the center portion
      if (cssZoomLevel && cssZoomLevel > 1) {
        // Calculate the cropped dimensions
        const cropWidth = videoWidth / cssZoomLevel;
        const cropHeight = videoHeight / cssZoomLevel;
        const cropX = (videoWidth - cropWidth) / 2;
        const cropY = (videoHeight - cropHeight) / 2;

        // Set canvas to cropped size (but scaled back up to original for quality)
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        // Apply filter if provided
        if (filter) {
          ctx.filter = filter;
        }

        // Draw cropped and scaled portion
        ctx.drawImage(
          video,
          cropX, cropY, cropWidth, cropHeight, // Source (cropped center)
          0, 0, videoWidth, videoHeight // Destination (full canvas)
        );
      } else {
        // Set canvas dimensions to match video
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        // Apply filter if provided
        if (filter) {
          ctx.filter = filter;
        }

        // Draw the current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

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
    focusAt,
  };
}
