"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Camera, Images, AlertCircle, Loader2, Sparkles, ChevronRight, Aperture } from "lucide-react";
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
      <div className="flex h-[100dvh] items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-pink-500/30" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 p-3">
              <Aperture className="h-full w-full animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-400 animate-pulse">Loading event...</p>
        </div>
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
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Oops!</h1>
        <p className="mb-8 max-w-xs text-gray-400">{errorMessage || "Event not found"}</p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-full bg-white/10 px-6 text-white backdrop-blur-sm hover:bg-white/20"
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
  const progressPercentage = (event.photoCount / event.photoLimit) * 100;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 h-64 w-64 rounded-full opacity-30 blur-3xl animate-pulse"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: primaryColor, animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 32px ${primaryColor}40`
              }}
            >
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{event.name}</h1>
              {event.welcomeMessage && (
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{event.welcomeMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="rounded-3xl bg-white/5 p-6 backdrop-blur-xl border border-white/10">
            {/* Circular Progress */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative h-36 w-36">
                {/* Background circle */}
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={shotsRemaining > 0 ? primaryColor : "#ef4444"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 2.64} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: shotsRemaining > 0 ? primaryColor : "#ef4444" }}
                  >
                    {shotsRemaining}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">remaining</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex justify-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold">{event.photoCount}</p>
                <p className="text-xs text-gray-400">Uploaded</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold">{event.photoLimit}</p>
                <p className="text-xs text-gray-400">Total Limit</p>
              </div>
            </div>

            {/* Status messages */}
            {localPhotos.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-yellow-500/10 py-2 px-4">
                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-sm text-yellow-400">
                  {localPhotos.length} photo{localPhotos.length !== 1 ? "s" : ""} pending upload
                </span>
              </div>
            )}
            {hasReachedLimit && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-red-500/10 py-2 px-4">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-sm text-red-400">Photo limit reached</span>
              </div>
            )}
            {!isEventActive && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gray-500/10 py-2 px-4">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-400">
                  {event.status === "EXPIRED"
                    ? "This event has ended"
                    : event.status === "DRAFT"
                    ? "This event hasn't started yet"
                    : "This event is currently paused"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {/* Capture button */}
          <button
            onClick={() => router.push(`/c/${slug}/capture`)}
            disabled={!isEventActive || hasReachedLimit}
            className="group relative w-full overflow-hidden rounded-2xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: primaryColor,
              boxShadow: isEventActive && !hasReachedLimit ? `0 8px 32px ${primaryColor}50` : "none"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Camera className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-semibold">Start Capturing</p>
                <p className="text-sm text-white/70">Take photos for this event</p>
              </div>
              <ChevronRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Gallery button */}
          <button
            onClick={() => router.push(`/c/${slug}/gallery`)}
            className="group relative w-full overflow-hidden rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Images className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-semibold">View Gallery</p>
                <p className="text-sm text-gray-400">Browse all event photos</p>
              </div>
              {localPhotos.length > 0 && (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {localPhotos.length}
                </span>
              )}
              <ChevronRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-xs text-gray-500">
            Powered by <span className="font-medium text-gray-400">Kodayak</span>
          </p>
        </div>
      </div>
    </div>
  );
}
