"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Camera, Images, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalPhotos } from "@/hooks/use-local-photos";
import { fetcher } from "@/lib/swr";

interface EventData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  welcomeMessage: string | null;
  primaryColor: string | null;
  status: string;
  photoLimit: number;
  photoCount: number;
  isGalleryPublic: boolean;
  expiresAt: string;
}

export default function EventDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: event, error, isLoading } = useSWR<EventData>(
    `/api/c/${slug}`,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  const { photos: localPhotos } = useLocalPhotos(event?.id || "");

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Error state
  const errorMessage = error
    ? (error as Error & { status?: number }).status === 404
      ? "Event not found"
      : "Failed to load event"
    : null;

  if (errorMessage || !event) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-black p-4 text-center text-white">
        <AlertCircle className="mb-4 h-16 w-16 text-red-400" />
        <h1 className="mb-2 text-2xl font-bold">Oops!</h1>
        <p className="mb-6 text-gray-400">{errorMessage || "Event not found"}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-white text-white hover:bg-white/10"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const primaryColor = event.primaryColor || "#E91E63";
  const shotsRemaining = Math.max(0, event.photoLimit - event.photoCount);
  const isEventActive = event.status === "ACTIVE";
  const hasReachedLimit = event.photoCount >= event.photoLimit;

  return (
    <div className="flex h-[100dvh] flex-col bg-black text-white">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{event.name}</h1>
            {event.welcomeMessage && (
              <p className="text-sm text-gray-400">{event.welcomeMessage}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Shots remaining card */}
        <div className="mb-8 w-full max-w-sm rounded-2xl bg-white/5 p-6 text-center backdrop-blur-sm">
          <p className="mb-2 text-sm uppercase tracking-wider text-gray-400">
            Shots Remaining
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className="text-6xl font-bold"
              style={{ color: shotsRemaining > 0 ? primaryColor : "#ef4444" }}
            >
              {shotsRemaining}
            </span>
            <span className="text-2xl text-gray-500">/ {event.photoLimit}</span>
          </div>
          {localPhotos.length > 0 && (
            <p className="mt-3 text-sm text-yellow-400">
              {localPhotos.length} photo{localPhotos.length !== 1 ? "s" : ""} pending upload
            </p>
          )}
          {hasReachedLimit && (
            <p className="mt-3 text-sm text-red-400">
              Photo limit reached
            </p>
          )}
          {!isEventActive && (
            <p className="mt-3 text-sm text-gray-400">
              {event.status === "EXPIRED"
                ? "This event has ended"
                : event.status === "DRAFT"
                ? "This event hasn't started yet"
                : "This event is currently paused"}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex w-full max-w-sm flex-col gap-3">
          {/* Capture button */}
          <Button
            onClick={() => router.push(`/c/${slug}/capture`)}
            size="lg"
            className="h-14 text-lg font-semibold"
            style={{ backgroundColor: primaryColor }}
            disabled={!isEventActive || hasReachedLimit}
          >
            <Camera className="mr-2 h-5 w-5" />
            Start Capturing
          </Button>

          {/* Gallery button */}
          <Button
            onClick={() => router.push(`/c/${slug}/gallery`)}
            variant="outline"
            size="lg"
            className="h-14 border-white/20 text-lg font-semibold text-white hover:bg-white/10"
          >
            <Images className="mr-2 h-5 w-5" />
            View Gallery
            {localPhotos.length > 0 && (
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-sm font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {localPhotos.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 pt-4 text-center">
        <p className="text-xs text-gray-500">
          {event.photoCount} photo{event.photoCount !== 1 ? "s" : ""} uploaded
        </p>
      </div>
    </div>
  );
}
