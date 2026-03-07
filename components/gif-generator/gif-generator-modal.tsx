"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGifGenerator } from "@/hooks/use-gif-generator";
import { GifPhoto, MIN_PHOTOS, MAX_PHOTOS } from "@/lib/gif-generator/types";
import { GifPreviewStrip } from "./gif-preview-strip";
import { GifOptionsForm } from "./gif-options-form";
import { GifProgress } from "./gif-progress";
import { GifResult } from "./gif-result";

interface GifGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: GifPhoto[];
  eventSlug: string;
}

export function GifGeneratorModal({
  open,
  onOpenChange,
  photos: initialPhotos,
  eventSlug,
}: GifGeneratorModalProps) {
  const [photos, setPhotos] = useState<GifPhoto[]>(initialPhotos);
  const {
    state,
    options,
    setOptions,
    generate,
    cancel,
    reset,
    download,
    getPreviewUrl,
  } = useGifGenerator();

  // Reset state when modal opens with new photos
  useEffect(() => {
    if (open) {
      setPhotos(initialPhotos.slice(0, MAX_PHOTOS));
      reset();
    }
  }, [open, initialPhotos, reset]);

  const handleReorder = useCallback((newPhotos: GifPhoto[]) => {
    setPhotos(newPhotos);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleGenerate = useCallback(() => {
    generate(photos);
  }, [generate, photos]);

  const handleDownload = useCallback(() => {
    const timestamp = new Date().toISOString().slice(0, 10);
    download(`${eventSlug}-gif-${timestamp}.gif`);
  }, [download, eventSlug]);

  const handleClose = useCallback(() => {
    if (state.status === "processing" || state.status === "loading") {
      cancel();
    }
    onOpenChange(false);
  }, [state.status, cancel, onOpenChange]);

  const isProcessing = state.status === "loading" || state.status === "processing";
  const isComplete = state.status === "complete";
  const hasError = state.status === "error";
  const canGenerate = photos.length >= MIN_PHOTOS && !isProcessing;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create GIF</DialogTitle>
          <DialogDescription>
            Create an animated GIF from your selected photos.
          </DialogDescription>
        </DialogHeader>

        {isComplete ? (
          <GifResult
            previewUrl={getPreviewUrl()}
            onDownload={handleDownload}
            onReset={() => {
              reset();
              setPhotos(initialPhotos.slice(0, MAX_PHOTOS));
            }}
          />
        ) : isProcessing ? (
          <GifProgress progress={state.progress} onCancel={cancel} />
        ) : (
          <>
            {/* Photo Preview Strip */}
            <GifPreviewStrip
              photos={photos}
              onReorder={handleReorder}
              onRemove={handleRemove}
              disabled={isProcessing}
            />

            {photos.length < MIN_PHOTOS && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  At least {MIN_PHOTOS} photos are required to create a GIF.
                </span>
              </div>
            )}

            {photos.length >= MAX_PHOTOS && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Maximum {MAX_PHOTOS} photos allowed. Some photos were removed.
                </span>
              </div>
            )}

            <Separator />

            {/* Options */}
            <GifOptionsForm
              options={options}
              onChange={setOptions}
              disabled={isProcessing}
            />

            {hasError && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{state.error || "Failed to generate GIF"}</span>
              </div>
            )}
          </>
        )}

        {!isComplete && !isProcessing && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!canGenerate}>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate GIF
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
