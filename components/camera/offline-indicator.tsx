"use client";

import { WifiOff, Cloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, offlineQueueCount, triggerSync } = useServiceWorker();

  if (isOnline && offlineQueueCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
        !isOnline
          ? "bg-yellow-500/20 text-yellow-400"
          : "bg-blue-500/20 text-blue-400",
        className
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
          {offlineQueueCount > 0 && (
            <span className="rounded-full bg-yellow-500/30 px-2 py-0.5 text-xs">
              {offlineQueueCount} queued
            </span>
          )}
        </>
      ) : (
        <>
          <Cloud className="h-4 w-4" />
          <span>{offlineQueueCount} pending</span>
          <Button
            onClick={triggerSync}
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-blue-500/20"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}
