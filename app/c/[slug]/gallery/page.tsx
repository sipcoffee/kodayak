"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Camera, Download, ArrowLeft, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/swr";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  guestName: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

interface EventData {
  id: string;
  name: string;
  slug: string;
  primaryColor: string | null;
  isGalleryPublic: boolean;
}

interface PhotosResponse {
  photos: Photo[];
}

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Fetch event data
  const {
    data: event,
    error: eventError,
    isLoading: eventLoading,
  } = useSWR<EventData>(`/api/c/${slug}`, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Fetch photos (only when event is loaded and gallery is public)
  const {
    data: photosData,
    isLoading: photosLoading,
  } = useSWR<PhotosResponse>(
    event?.isGalleryPublic ? `/api/photos?eventId=${event.id}` : null,
    fetcher,
    {
      refreshInterval: 10000, // Poll every 10 seconds for real-time updates
      revalidateOnFocus: true,
    }
  );

  const photos = photosData?.photos ?? [];
  const isLoading = eventLoading || (event?.isGalleryPublic && photosLoading);

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kodayak-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      console.error("Download failed");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Error state
  const errorMessage = eventError
    ? (eventError as Error & { status?: number }).status === 404
      ? "Event not found"
      : "Failed to load event"
    : event && !event.isGalleryPublic
    ? "This gallery is private"
    : null;

  if (errorMessage || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center text-white">
        <AlertCircle className="mb-4 h-16 w-16 text-red-400" />
        <h1 className="mb-2 text-2xl font-bold">Oops!</h1>
        <p className="mb-6 text-gray-400">{errorMessage || "Something went wrong"}</p>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="border-white text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const primaryColor = event.primaryColor || "#E91E63";

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push(`/c/${slug}`)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">{event.name}</h1>
              <p className="text-sm text-gray-400">{photos.length} photos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Empty state */}
      {photos.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
          <Camera className="mb-4 h-16 w-16 text-gray-600" />
          <h2 className="mb-2 text-xl font-semibold text-white">No photos yet</h2>
          <p className="mb-6 text-gray-400">Be the first to capture a moment!</p>
          <Button
            onClick={() => router.push(`/c/${slug}`)}
            style={{ backgroundColor: primaryColor }}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take a Photo
          </Button>
        </div>
      ) : (
        <>
          {/* Photo grid */}
          <div className="mx-auto max-w-7xl p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-gray-900"
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                </button>
              ))}
            </div>
          </div>

          {/* Photo modal */}
          {selectedPhoto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <Button
                onClick={() => setSelectedPhoto(null)}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </Button>

              <div
                className="relative max-h-[90vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedPhoto.url}
                  alt=""
                  className="max-h-[85vh] max-w-full rounded-lg object-contain"
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {selectedPhoto.guestName && (
                      <span>By {selectedPhoto.guestName}</span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDownload(selectedPhoto)}
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating camera button */}
      <Button
        onClick={() => router.push(`/c/${slug}`)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <Camera className="h-6 w-6" />
      </Button>
    </div>
  );
}
