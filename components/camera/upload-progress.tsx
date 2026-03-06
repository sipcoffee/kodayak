"use client";

import { Check, Loader2, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "queued";

interface UploadProgressProps {
  status: UploadStatus;
  progress?: number;
  message?: string;
  className?: string;
}

export function UploadProgress({
  status,
  progress = 0,
  message,
  className,
}: UploadProgressProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 text-white">
        {status === "uploading" && (
          <>
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-20"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${progress * 2.26} 226`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold">{Math.round(progress)}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-300">{message || "Uploading..."}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
              <Check className="h-10 w-10" />
            </div>
            <p className="text-sm text-gray-300">{message || "Photo uploaded!"}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <p className="text-sm text-gray-300">{message || "Upload failed"}</p>
          </>
        )}

        {status === "queued" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500">
              <Cloud className="h-10 w-10" />
            </div>
            <p className="text-sm text-gray-300">{message || "Queued for upload"}</p>
            <p className="text-xs text-gray-400">Will upload when online</p>
          </>
        )}
      </div>
    </div>
  );
}
