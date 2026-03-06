"use client";

import { useEffect, useState } from "react";
import { Camera, SwitchCamera, X, Check, RefreshCw } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    startCamera,
    switchCamera,
    capturePhoto,
  } = useCamera();

  const [preview, setPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = async () => {
    const blob = await capturePhoto();
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
