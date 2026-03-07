"use client";

import { Loader2 } from "lucide-react";
import { GifGeneratorState } from "@/lib/gif-generator/types";

interface GifProgressProps {
  progress: GifGeneratorState["progress"];
  onCancel?: () => void;
}

export function GifProgress({ progress, onCancel }: GifProgressProps) {
  if (!progress) return null;

  const percentage = Math.round((progress.current / progress.total) * 100);
  const phaseLabel = progress.phase === "fetching" ? "Loading images" : "Encoding GIF";

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <p className="font-medium">{phaseLabel}...</p>
        <p className="text-sm text-muted-foreground">
          {progress.current} of {progress.total} frames
        </p>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-1">
          {percentage}%
        </p>
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
