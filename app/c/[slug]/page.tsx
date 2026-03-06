"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Camera, Images, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CameraCapture } from "@/components/camera/camera-capture";
import { UploadProgress, UploadStatus } from "@/components/camera/upload-progress";
import { OfflineIndicator } from "@/components/camera/offline-indicator";
import { Button } from "@/components/ui/button";
import { compressImage, getOrCreateGuestId, getImageDimensions } from "@/lib/image-utils";
import { useServiceWorker } from "@/hooks/use-service-worker";
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

export default function CameraPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { isOnline } = useServiceWorker();

  const { data: event, error, isLoading, mutate } = useSWR<EventData>(
    `/api/c/${slug}`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photosTaken, setPhotosTaken] = useState(0);

  const handleCapture = useCallback(async (blob: Blob) => {
    if (!event) return;

    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Compress the image
      setUploadProgress(10);
      const compressedBlob = await compressImage(blob, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeKB: 800,
      });

      setUploadProgress(30);

      // Get image dimensions
      const dimensions = await getImageDimensions(compressedBlob);

      setUploadProgress(40);

      // Prepare form data
      const formData = new FormData();
      formData.append("photo", compressedBlob, `photo-${Date.now()}.jpg`);
      formData.append("eventId", event.id);
      formData.append("guestId", getOrCreateGuestId());
      formData.append("width", dimensions.width.toString());
      formData.append("height", dimensions.height.toString());

      // Upload
      setUploadProgress(50);

      const response = await fetch(`/api/photos`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!response.ok) {
        const data = await response.json();

        // Check if queued for offline
        if (data.queued) {
          setUploadStatus("queued");
          setPhotosTaken((prev) => prev + 1);
          setTimeout(() => setUploadStatus("idle"), 2000);
          return;
        }

        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress(100);
      setUploadStatus("success");
      setPhotosTaken((prev) => prev + 1);

      // Revalidate event data to update photo count
      mutate();

      toast.success("Photo uploaded!");

      setTimeout(() => setUploadStatus("idle"), 1500);
    } catch (error) {
      console.error("Upload error:", error);

      // If offline, the service worker will queue it
      if (!isOnline) {
        setUploadStatus("queued");
        setPhotosTaken((prev) => prev + 1);
        toast.info("Photo queued for upload when online");
        setTimeout(() => setUploadStatus("idle"), 2000);
        return;
      }

      setUploadStatus("error");
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
      setTimeout(() => setUploadStatus("idle"), 2000);
    }
  }, [event, isOnline, mutate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
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
      <div className="flex h-screen flex-col items-center justify-center bg-black p-4 text-center text-white">
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

  // Event not active
  if (event.status !== "ACTIVE") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black p-4 text-center text-white">
        <Camera className="mb-4 h-16 w-16 opacity-50" />
        <h1 className="mb-2 text-2xl font-bold">{event.name}</h1>
        <p className="mb-6 text-gray-400">
          {event.status === "EXPIRED"
            ? "This event has ended"
            : event.status === "DRAFT"
            ? "This event hasn't started yet"
            : "This event is currently paused"}
        </p>
        {event.isGalleryPublic && (
          <Button
            onClick={() => router.push(`/c/${slug}/gallery`)}
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            <Images className="mr-2 h-4 w-4" />
            View Gallery
          </Button>
        )}
      </div>
    );
  }

  // Event at photo limit
  if (event.photoCount >= event.photoLimit) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black p-4 text-center text-white">
        <Camera className="mb-4 h-16 w-16 opacity-50" />
        <h1 className="mb-2 text-2xl font-bold">{event.name}</h1>
        <p className="mb-6 text-gray-400">
          This event has reached its photo limit.
        </p>
        {event.isGalleryPublic && (
          <Button
            onClick={() => router.push(`/c/${slug}/gallery`)}
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            <Images className="mr-2 h-4 w-4" />
            View Gallery
          </Button>
        )}
      </div>
    );
  }

  const primaryColor = event.primaryColor || "#E91E63";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">{event.name}</h1>
            {event.welcomeMessage && (
              <p className="text-sm text-gray-300">{event.welcomeMessage}</p>
            )}
          </div>
          <OfflineIndicator />
        </div>

        {/* Photo counter */}
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
          <Camera className="h-4 w-4" />
          <span>
            {event.photoCount + photosTaken} / {event.photoLimit} photos
          </span>
        </div>
      </div>

      {/* Camera */}
      <CameraCapture
        onCapture={handleCapture}
        primaryColor={primaryColor}
        disabled={uploadStatus !== "idle"}
      />

      {/* Gallery button */}
      {event.isGalleryPublic && (
        <Button
          onClick={() => router.push(`/c/${slug}/gallery`)}
          variant="outline"
          size="icon"
          className="absolute bottom-8 left-4 z-10 h-14 w-14 rounded-full border-2 border-white bg-black/50 text-white hover:bg-white/10"
        >
          <Images className="h-6 w-6" />
        </Button>
      )}

      {/* Upload progress overlay */}
      <UploadProgress
        status={uploadStatus}
        progress={uploadProgress}
      />
    </div>
  );
}
