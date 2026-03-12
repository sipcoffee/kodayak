"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Camera, SwitchCamera, X, Check, RefreshCw, Images, Sparkles, Loader } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Filter presets
interface FilterPreset {
  id: string;
  name: string;
  filter: string;
  preview: string;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: "normal", name: "Normal", filter: "none", preview: "#666" },
  { id: "bw", name: "B&W", filter: "grayscale(100%)", preview: "#888" },
  { id: "vivid", name: "Vivid", filter: "saturate(150%) contrast(110%)", preview: "#e91e63" },
  { id: "disposable", name: "Disposable", filter: "sepia(20%) brightness(110%) contrast(90%) saturate(85%)", preview: "#d4a574" },
  { id: "losttape", name: "Lost Tape", filter: "saturate(70%) contrast(110%) brightness(105%) sepia(15%) hue-rotate(-5deg)", preview: "#7a8b8c" },
  { id: "90sflash", name: "90s Flash", filter: "contrast(115%) brightness(108%) saturate(110%) sepia(10%)", preview: "#ffcc66" },
  { id: "fadedfilm", name: "Faded Film", filter: "saturate(60%) sepia(25%) brightness(110%) contrast(85%)", preview: "#c9b896" },
  { id: "vhs", name: "VHS", filter: "saturate(120%) contrast(95%) brightness(105%) hue-rotate(5deg) sepia(10%)", preview: "#8b7bb5" },
  { id: "goldenhour", name: "Golden Hour", filter: "sepia(35%) brightness(108%) saturate(130%) contrast(95%)", preview: "#e6a64c" },
  { id: "noir", name: "Noir", filter: "grayscale(100%) contrast(130%) brightness(95%)", preview: "#333" },
  { id: "midnight", name: "Midnight", filter: "brightness(90%) contrast(120%) saturate(80%) hue-rotate(200deg) sepia(20%)", preview: "#2d4a6f" },
  { id: "polaroid", name: "Polaroid", filter: "sepia(15%) contrast(90%) brightness(110%) saturate(90%)", preview: "#f5e6d3" },
];

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel?: () => void;
  onGalleryClick?: () => void;
  galleryBadgeCount?: number;
  disabled?: boolean;
  primaryColor?: string;
}

export function CameraCapture({
  onCapture,
  onCancel,
  onGalleryClick,
  galleryBadgeCount = 0,
  disabled = false,
  primaryColor = "#E91E63",
}: CameraCaptureProps) {
  const {
    videoRef,
    canvasRef,
    isReady,
    isCapturing,
    error,
    hasMultipleCameras,
    zoomLevel,
    zoomCapabilities,
    startCamera,
    switchCamera,
    capturePhoto,
    setZoom,
    focusAt,
  } = useCamera();

  const [preview, setPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const zoomSliderRef = useRef<HTMLDivElement>(null);

  // Start camera on mount
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Handle zoom drag - defined with useCallback before useEffect that uses it
  const handleZoomDrag = useCallback((clientX: number) => {
    if (!zoomSliderRef.current || !zoomCapabilities.supported) return;
    const rect = zoomSliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newZoom = zoomCapabilities.min + percentage * (zoomCapabilities.max - zoomCapabilities.min);
    setZoom(newZoom);
  }, [zoomCapabilities.supported, zoomCapabilities.min, zoomCapabilities.max, setZoom]);

  // Mouse drag effect - MUST be before any conditional returns
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleZoomDrag(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleZoomDrag]);

  const handleCapture = async () => {
    const useCssZoom = !zoomCapabilities.nativeSupport && zoomLevel > 1;
    const blob = await capturePhoto(selectedFilter.filter, useCssZoom ? zoomLevel : undefined);
    if (blob) {
      setCapturedBlob(blob);
      setPreview(URL.createObjectURL(blob));
    }
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
      clearPreview();
      startCamera();
    }
  };

  const handleRetake = () => {
    clearPreview();
    startCamera();
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setCapturedBlob(null);
  };

  const handleFocusTap = async (e: React.MouseEvent | React.TouchEvent) => {
    if (!videoContainerRef.current || !isReady || disabled) return;

    const rect = videoContainerRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setFocusPoint({ x, y });

    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    await focusAt(normalizedX, normalizedY);

    setTimeout(() => {
      setFocusPoint(null);
    }, 1000);
  };

  const handleZoomTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleZoomDrag(e.touches[0].clientX);
  };

  const handleZoomTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleZoomDrag(e.touches[0].clientX);
    }
  };

  const handleZoomTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleZoomDrag(e.clientX);
  };

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <Camera className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Camera Access Required</h2>
        <p className="mb-8 max-w-xs text-sm text-gray-400">
          {error === "Permission denied"
            ? "Please allow camera access in your browser settings to take photos."
            : error}
        </p>
        <Button
          onClick={() => startCamera()}
          className="rounded-full px-6"
          style={{ backgroundColor: primaryColor }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Preview mode
  if (preview) {
    return (
      <div className="relative h-full w-full bg-black">
        <img
          src={preview}
          alt="Captured photo"
          className="h-full w-full object-contain"
        />

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <p className="text-center text-sm text-gray-400 mb-6">
            <Sparkles className="inline h-4 w-4 mr-1" />
            Looking good! Save this photo?
          </p>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleRetake}
              disabled={disabled}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <X className="h-7 w-7 text-white" />
            </button>

            <button
              onClick={handleConfirm}
              disabled={disabled}
              className="flex h-20 w-20 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 32px ${primaryColor}50`
              }}
            >
              <Check className="h-9 w-9 text-white" />
            </button>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
    );
  }

  // Camera mode
  return (
    <div className="relative h-[100dvh] w-full bg-black overflow-hidden flex flex-col">
      <div
        ref={videoContainerRef}
        className="relative flex-1 min-h-0 overflow-hidden"
        onClick={handleFocusTap}
        onTouchStart={handleFocusTap}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            filter: selectedFilter.filter,
            ...(!zoomCapabilities.nativeSupport && zoomLevel > 1 ? {
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            } : {}),
          }}
          className={cn(
            "h-full w-full object-cover transition-transform duration-100",
            !isReady && "opacity-0"
          )}
        />

        <canvas ref={canvasRef} className="hidden" />

        {focusPoint && (
          <div
            className="pointer-events-none absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: focusPoint.x, top: focusPoint.y }}
          >
            <div className="h-full w-full rounded-xl border-2 border-yellow-400/80 animate-[ping_0.5s_ease-out]" />
            <div className="absolute inset-2 rounded-lg border border-yellow-400/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-yellow-400" />
            </div>
          </div>
        )}

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      <div className="flex-shrink-0 bg-gradient-to-t from-black via-black to-black/80">
        {zoomCapabilities.supported && isReady && (
          <div className="px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-8 font-medium">{zoomCapabilities.min.toFixed(1)}x</span>
              <div
                ref={zoomSliderRef}
                className="relative flex-1 h-10 flex items-center cursor-pointer touch-none"
                onMouseDown={handleZoomMouseDown}
                onTouchStart={handleZoomTouchStart}
                onTouchMove={handleZoomTouchMove}
                onTouchEnd={handleZoomTouchEnd}
              >
                <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full" />
                <div
                  className="absolute left-0 h-1 rounded-full transition-all"
                  style={{
                    width: `${((zoomLevel - zoomCapabilities.min) / (zoomCapabilities.max - zoomCapabilities.min)) * 100}%`,
                    backgroundColor: primaryColor,
                  }}
                />
                <div
                  className={cn(
                    "absolute h-7 w-7 rounded-full shadow-lg -translate-x-1/2 transition-all border-2",
                    isDragging && "scale-110"
                  )}
                  style={{
                    left: `${((zoomLevel - zoomCapabilities.min) / (zoomCapabilities.max - zoomCapabilities.min)) * 100}%`,
                    backgroundColor: primaryColor,
                    borderColor: 'white',
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                    {zoomLevel.toFixed(1)}
                  </span>
                </div>
              </div>
              <span className="text-xs text-white/50 w-8 text-right font-medium">{zoomCapabilities.max.toFixed(1)}x</span>
            </div>
          </div>
        )}

        {isReady && (
          <div className="px-2 pb-3">
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide px-2">
              {FILTER_PRESETS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 flex-shrink-0 transition-all duration-200",
                    selectedFilter.id === filter.id ? "scale-105" : "opacity-70"
                  )}
                  disabled={disabled}
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl border-2 transition-all shadow-lg",
                      selectedFilter.id === filter.id
                        ? "border-white shadow-white/20"
                        : "border-transparent"
                    )}
                    style={{
                      backgroundColor: filter.preview,
                      filter: filter.filter,
                    }}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all",
                      selectedFilter.id === filter.id ? "text-white" : "text-white/50"
                    )}
                  >
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-8 px-6 pb-8 pt-2">
          {onGalleryClick ? (
            <button
              onClick={onGalleryClick}
              disabled={disabled}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <Images className="h-6 w-6 text-white" />
              {galleryBadgeCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-black"
                  style={{ backgroundColor: primaryColor }}
                >
                  {galleryBadgeCount}
                </span>
              )}
            </button>
          ) : (
            <div className="h-14 w-14" />
          )}

          <button
            onClick={handleCapture}
            disabled={!isReady || isCapturing || disabled}
            className={cn(
              "relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white transition-all hover:scale-105 active:scale-95",
              isCapturing && "scale-95"
            )}
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 0 40px ${primaryColor}60`
            }}
          >
            <div className="absolute inset-1.5 rounded-full border-2 border-white/30" />
            <Camera className="h-8 w-8 text-white" />
          </button>

          {hasMultipleCameras ? (
            <button
              onClick={switchCamera}
              disabled={!isReady || isCapturing || disabled}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <SwitchCamera className="h-6 w-6 text-white" />
            </button>
          ) : (
            <div className="h-14 w-14" />
          )}
        </div>
      </div>
    </div>
  );
}
