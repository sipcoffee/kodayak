"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Camera, Images, AlertCircle, Aperture, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CameraCapture } from "@/components/camera/camera-capture";
import { Button } from "@/components/ui/button";
import { compressImage, getOrCreateGuestId, getImageDimensions, blobToDataURL } from "@/lib/image-utils";
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

export default function CapturePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: event, error, isLoading } = useSWR<EventData>(
    `/api/c/${slug}`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const { photos: localPhotos, addPhoto } = useLocalPhotos(event?.id || "");

  const handleCapture = useCallback(async (blob: Blob) => {
    if (!event) return;

    try {
      // Compress the image
      const compressedBlob = await compressImage(blob, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeKB: 800,
      });

      // Get image dimensions
      const dimensions = await getImageDimensions(compressedBlob);

      // Convert to data URL for preview
      const dataUrl = await blobToDataURL(compressedBlob);

      // Store locally
      await addPhoto({
        eventId: event.id,
        blob: compressedBlob,
        dataUrl,
        guestId: getOrCreateGuestId(),
        width: dimensions.width,
        height: dimensions.height,
      });

      toast.success("Photo saved! Go to gallery to upload.");
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Failed to save photo");
    }
  }, [event, addPhoto]);

  const primaryColor = event?.primaryColor || "#E91E63";

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-pink-500/30" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 p-3">
              <Aperture className="h-full w-full animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-400 animate-pulse">Loading camera...</p>
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
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-center">
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

  // Event not active
  if (event.status !== "ACTIVE") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-center">
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-30"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <Camera className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">{event.name}</h1>
        <p className="mb-8 max-w-xs text-gray-400">
          {event.status === "EXPIRED"
            ? "This event has ended"
            : event.status === "DRAFT"
            ? "This event hasn't started yet"
            : "This event is currently paused"}
        </p>
        <Button
          onClick={() => router.push(`/c/${slug}/gallery`)}
          className="rounded-full px-6"
          style={{ backgroundColor: primaryColor }}
        >
          <Images className="mr-2 h-4 w-4" />
          View Gallery
        </Button>
      </div>
    );
  }

  // Event at photo limit
  if (event.photoCount >= event.photoLimit) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-sm">
            <Sparkles className="h-10 w-10 text-amber-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">{event.name}</h1>
        <p className="mb-8 max-w-xs text-gray-400">
          This event has reached its photo limit. Check out all the amazing photos in the gallery!
        </p>
        <Button
          onClick={() => router.push(`/c/${slug}/gallery`)}
          className="rounded-full px-6"
          style={{ backgroundColor: primaryColor }}
        >
          <Images className="mr-2 h-4 w-4" />
          View Gallery
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Header overlay */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 pb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/c/${slug}`)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">{event.name}</h1>
            {event.welcomeMessage && (
              <p className="text-sm text-gray-300 truncate">{event.welcomeMessage}</p>
            )}
          </div>
        </div>

        {/* Photo counter pill */}
        <div className="mt-3 ml-13 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 text-sm">
            <Camera className="h-3.5 w-3.5 text-white/70" />
            <span className="text-white">
              <span className="font-semibold">{event.photoCount}</span>
              <span className="text-white/60"> / {event.photoLimit}</span>
            </span>
          </div>
          {localPhotos.length > 0 && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              {localPhotos.length} pending
            </div>
          )}
        </div>
      </div>

      {/* Camera */}
      <CameraCapture
        onCapture={handleCapture}
        onGalleryClick={() => router.push(`/c/${slug}/gallery`)}
        galleryBadgeCount={localPhotos.length}
        primaryColor={primaryColor}
      />
    </div>
  );
}
