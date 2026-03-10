"use client";

import { useEffect, useState, useRef } from "react";
import { Camera, SwitchCamera, X, Check, RefreshCw, Images } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Filter presets
interface FilterPreset {
  id: string;
  name: string;
  filter: string;
  preview: string; // Background color for preview thumbnail
}

const FILTER_PRESETS: FilterPreset[] = [
  // Standard filters
  {
    id: "normal",
    name: "Normal",
    filter: "none",
    preview: "#666",
  },
  {
    id: "bw",
    name: "B&W",
    filter: "grayscale(100%)",
    preview: "#888",
  },
  {
    id: "vivid",
    name: "Vivid",
    filter: "saturate(150%) contrast(110%)",
    preview: "#e91e63",
  },
  // Disposable camera / Vintage theme
  {
    id: "disposable",
    name: "Disposable",
    filter: "sepia(20%) brightness(110%) contrast(90%) saturate(85%)",
    preview: "#d4a574",
  },
  {
    id: "losttape",
    name: "Lost Tape",
    filter: "saturate(70%) contrast(110%) brightness(105%) sepia(15%) hue-rotate(-5deg)",
    preview: "#7a8b8c",
  },
  {
    id: "90sflash",
    name: "90s Flash",
    filter: "contrast(115%) brightness(108%) saturate(110%) sepia(10%)",
    preview: "#ffcc66",
  },
  {
    id: "fadedfilm",
    name: "Faded Film",
    filter: "saturate(60%) sepia(25%) brightness(110%) contrast(85%)",
    preview: "#c9b896",
  },
  {
    id: "vhs",
    name: "VHS",
    filter: "saturate(120%) contrast(95%) brightness(105%) hue-rotate(5deg) sepia(10%)",
    preview: "#8b7bb5",
  },
  {
    id: "goldenhour",
    name: "Golden Hour",
    filter: "sepia(35%) brightness(108%) saturate(130%) contrast(95%)",
    preview: "#e6a64c",
  },
  {
    id: "noir",
    name: "Noir",
    filter: "grayscale(100%) contrast(130%) brightness(95%)",
    preview: "#333",
  },
  {
    id: "midnight",
    name: "Midnight",
    filter: "brightness(90%) contrast(120%) saturate(80%) hue-rotate(200deg) sepia(20%)",
    preview: "#2d4a6f",
  },
  {
    id: "polaroid",
    name: "Polaroid",
    filter: "sepia(15%) contrast(90%) brightness(110%) saturate(90%)",
    preview: "#f5e6d3",
  },
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
    focusCapabilities,
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
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Zoom slider state and refs - must be declared before any conditional returns
  const zoomSliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = async () => {
    // If using CSS zoom (not native), we need to crop the center portion
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
      // Restart camera after confirming
      startCamera();
    }
  };

  const handleRetake = () => {
    clearPreview();
    // Restart camera after retaking
    startCamera();
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setCapturedBlob(null);
  };

  // Handle tap to focus
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

    // Calculate position relative to container
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Show focus indicator at tap position
    setFocusPoint({ x, y });

    // Calculate normalized coordinates (0-1) for the camera API
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    // Attempt to focus (works on supported devices)
    await focusAt(normalizedX, normalizedY);

    // Hide focus indicator after animation
    setTimeout(() => {
      setFocusPoint(null);
    }, 1000);
  };

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-black p-4 text-center text-white">
        <Camera className="mb-4 h-16 w-16 opacity-50" />
        <h2 className="mb-2 text-xl font-semibold">Camera Access Required</h2>
        <p className="mb-6 text-sm text-gray-400">
          {error === "Permission denied"
            ? "Please allow camera access to take photos."
            : error}
        </p>
        <Button
          onClick={() => startCamera()}
          variant="outline"
          className="border-white text-white hover:bg-white/10"
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

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8 bg-gradient-to-t from-black/80 to-transparent p-8">
          <Button
            onClick={handleRetake}
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full border-2 border-white bg-transparent text-white hover:bg-white/10"
            disabled={disabled}
          >
            <X className="h-8 w-8" />
          </Button>

          <Button
            onClick={handleConfirm}
            size="lg"
            className="h-20 w-20 rounded-full"
            style={{ backgroundColor: primaryColor }}
            disabled={disabled}
          >
            <Check className="h-10 w-10" />
          </Button>
        </div>

        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
    );
  }

  const handleZoomDrag = (clientX: number) => {
    if (!zoomSliderRef.current || !zoomCapabilities.supported) return;

    const rect = zoomSliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newZoom = zoomCapabilities.min + percentage * (zoomCapabilities.max - zoomCapabilities.min);
    setZoom(newZoom);
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
  }, [isDragging]);

  // Camera mode
  return (
    <div className="relative h-[100dvh] w-full bg-black overflow-hidden flex flex-col">
      {/* Video feed container - takes remaining space */}
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
            // Apply CSS transform zoom when native zoom is not supported
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

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Focus indicator */}
        {focusPoint && (
          <div
            className="pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ left: focusPoint.x, top: focusPoint.y }}
          >
            <div className="h-full w-full rounded-lg border-2 border-yellow-400 animate-[ping_0.5s_ease-out]" />
            <div className="absolute inset-0 rounded-lg border-2 border-yellow-400" />
          </div>
        )}

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          </div>
        )}

        {/* Close button */}
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Bottom controls section - fixed height */}
      <div className="flex-shrink-0 bg-black">
        {/* Zoom slider - draggable */}
        {zoomCapabilities.supported && isReady && (
          <div className="px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/70 w-8">{zoomCapabilities.min.toFixed(1)}x</span>
              <div
                ref={zoomSliderRef}
                className="relative flex-1 h-8 flex items-center cursor-pointer touch-none"
                onMouseDown={handleZoomMouseDown}
                onTouchStart={handleZoomTouchStart}
                onTouchMove={handleZoomTouchMove}
                onTouchEnd={handleZoomTouchEnd}
              >
                {/* Track background */}
                <div className="absolute inset-x-0 h-1 bg-white/30 rounded-full" />
                {/* Track fill */}
                <div
                  className="absolute left-0 h-1 bg-white rounded-full"
                  style={{
                    width: `${((zoomLevel - zoomCapabilities.min) / (zoomCapabilities.max - zoomCapabilities.min)) * 100}%`,
                  }}
                />
                {/* Thumb */}
                <div
                  className={cn(
                    "absolute h-6 w-6 bg-white rounded-full shadow-lg -translate-x-1/2 transition-transform",
                    isDragging && "scale-110"
                  )}
                  style={{
                    left: `${((zoomLevel - zoomCapabilities.min) / (zoomCapabilities.max - zoomCapabilities.min)) * 100}%`,
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-black">
                    {zoomLevel.toFixed(1)}
                  </span>
                </div>
              </div>
              <span className="text-xs text-white/70 w-8 text-right">{zoomCapabilities.max.toFixed(1)}x</span>
            </div>
          </div>
        )}

        {/* Filter selector */}
        {isReady && (
          <div className="px-2 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {FILTER_PRESETS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter)}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-shrink-0 transition-transform",
                    selectedFilter.id === filter.id && "scale-105"
                  )}
                  disabled={disabled}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-lg border-2 transition-all",
                      selectedFilter.id === filter.id
                        ? "border-white shadow-lg"
                        : "border-transparent opacity-70"
                    )}
                    style={{
                      backgroundColor: filter.preview,
                      filter: filter.filter,
                    }}
                  />
                  <span
                    className={cn(
                      "text-[10px] text-white transition-opacity",
                      selectedFilter.id === filter.id ? "opacity-100" : "opacity-60"
                    )}
                  >
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 px-6 pb-6 pt-2">
          {/* Gallery button (left side) */}
          {onGalleryClick ? (
            <Button
              onClick={onGalleryClick}
              size="lg"
              className="relative h-14 w-14 rounded-full border-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
              disabled={disabled}
            >
              <Images className="h-6 w-6" />
              {galleryBadgeCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {galleryBadgeCount}
                </span>
              )}
            </Button>
          ) : (
            <div className="h-14 w-14" />
          )}

          {/* Capture button */}
          <Button
            onClick={handleCapture}
            size="lg"
            className={cn(
              "h-20 w-20 rounded-full border-4 border-white transition-transform",
              isCapturing && "scale-95"
            )}
            style={{ backgroundColor: primaryColor }}
            disabled={!isReady || isCapturing || disabled}
          >
            <Camera className="h-8 w-8" />
          </Button>

          {/* Switch camera button (right side) */}
          {hasMultipleCameras ? (
            <Button
              onClick={switchCamera}
              size="lg"
              className="h-14 w-14 rounded-full border-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
              disabled={!isReady || isCapturing || disabled}
            >
              <SwitchCamera className="h-6 w-6" />
            </Button>
          ) : (
            <div className="h-14 w-14" />
          )}
        </div>
      </div>
    </div>
  );
}
