"use client";

import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GifResultProps {
  previewUrl: string | null;
  onDownload: () => void;
  onReset: () => void;
}

export function GifResult({ previewUrl, onDownload, onReset }: GifResultProps) {
  if (!previewUrl) return null;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative rounded-lg overflow-hidden border bg-muted">
        <img
          src={previewUrl}
          alt="Generated GIF preview"
          className="max-w-full max-h-[400px] object-contain"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download GIF
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Create Another
        </Button>
      </div>
    </div>
  );
}
