"use client";

import { useEffect, useState } from "react";
import { Camera, SwitchCamera, X, Check, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
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
  disabled?: boolean;
  primaryColor?: string;
}

export function CameraCapture({
  onCapture,
  onCancel,
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
  } = useCamera();

  const [preview, setPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = async () => {
    const blob = await capturePhoto(selectedFilter.filter);
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

  // Camera mode
  return (
    <div className="relative h-full w-full bg-black">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ filter: selectedFilter.filter }}
        className={cn(
          "h-full w-full object-cover",
          !isReady && "opacity-0"
        )}
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      )}

      {/* Zoom controls - only shown when device supports zoom */}
      {zoomCapabilities.supported && isReady && (
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
          <Button
            onClick={() => setZoom(zoomLevel + zoomCapabilities.step)}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-white/70 bg-black/30 text-white hover:bg-white/20"
            disabled={zoomLevel >= zoomCapabilities.max || disabled}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>

          <div className="rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
            {zoomLevel.toFixed(1)}x
          </div>

          <Button
            onClick={() => setZoom(zoomLevel - zoomCapabilities.step)}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-white/70 bg-black/30 text-white hover:bg-white/20"
            disabled={zoomLevel <= zoomCapabilities.min || disabled}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Filter selector */}
      {isReady && (
        <div className="absolute bottom-32 left-0 right-0 px-2">
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
                    "h-14 w-14 rounded-lg border-2 transition-all",
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
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8 bg-gradient-to-t from-black/80 to-transparent p-8">
        {/* Switch camera button */}
        {hasMultipleCameras && (
          <Button
            onClick={switchCamera}
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full border-2 border-white bg-transparent text-white hover:bg-white/10"
            disabled={!isReady || isCapturing || disabled}
          >
            <SwitchCamera className="h-6 w-6" />
          </Button>
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

        {/* Spacer for alignment when switch button is shown */}
        {hasMultipleCameras && <div className="h-14 w-14" />}
      </div>

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
  );
}
