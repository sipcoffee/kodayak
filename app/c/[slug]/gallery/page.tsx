"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Camera, Download, ArrowLeft, Loader2, AlertCircle, X, Upload, Trash2, CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLocalPhotos, LocalPhoto } from "@/hooks/use-local-photos";
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

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | LocalPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // Fetch event data
  const {
    data: event,
    error: eventError,
    isLoading: eventLoading,
  } = useSWR<EventData>(`/api/c/${slug}`, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Local photos hook
  const {
    photos: localPhotos,
    removePhoto,
    clearPhotos,
    isLoading: localPhotosLoading,
  } = useLocalPhotos(event?.id || "");

  // Fetch uploaded photos
  const {
    data: photosData,
    isLoading: photosLoading,
    mutate: mutatePhotos,
  } = useSWR<PhotosResponse>(
    event?.isGalleryPublic ? `/api/photos?eventId=${event.id}` : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const uploadedPhotos = photosData?.photos ?? [];
  const isLoading = eventLoading || localPhotosLoading || (event?.isGalleryPublic && photosLoading);

  const handleUploadAll = async () => {
    if (localPhotos.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: localPhotos.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < localPhotos.length; i++) {
      const photo = localPhotos[i];
      setUploadProgress({ current: i + 1, total: localPhotos.length });

      try {
        const formData = new FormData();
        formData.append("photo", photo.blob, `photo-${Date.now()}.jpg`);
        formData.append("eventId", photo.eventId);
        formData.append("guestId", photo.guestId);
        if (photo.guestName) formData.append("guestName", photo.guestName);
        formData.append("width", photo.width.toString());
        formData.append("height", photo.height.toString());

        const response = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          await removePhoto(photo.id);
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setIsUploading(false);
    mutatePhotos();

    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} photo${successCount > 1 ? "s" : ""}`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} photo${errorCount > 1 ? "s" : ""}`);
    }
  };

  const handleDeleteLocal = async (photo: LocalPhoto) => {
    try {
      await removePhoto(photo.id);
      setSelectedPhoto(null);
      toast.success("Photo deleted");
    } catch {
      toast.error("Failed to delete photo");
    }
  };

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

  const isLocalPhoto = (photo: Photo | LocalPhoto): photo is LocalPhoto => {
    return "dataUrl" in photo;
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
  const allPhotos = [...localPhotos, ...uploadedPhotos];

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
              <p className="text-sm text-gray-400">
                {uploadedPhotos.length} uploaded
                {localPhotos.length > 0 && `, ${localPhotos.length} pending`}
              </p>
            </div>
          </div>

          {/* Upload button */}
          {localPhotos.length > 0 && (
            <Button
              onClick={handleUploadAll}
              disabled={isUploading}
              style={{ backgroundColor: primaryColor }}
              className="text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress.current}/{uploadProgress.total}
                </>
              ) : (
                <>
                  <CloudUpload className="mr-2 h-4 w-4" />
                  Upload All ({localPhotos.length})
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Empty state */}
      {allPhotos.length === 0 ? (
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
          {/* Pending photos section */}
          {localPhotos.length > 0 && (
            <div className="mx-auto max-w-7xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium text-yellow-500">
                  Pending Upload ({localPhotos.length})
                </h2>
                <Button
                  onClick={() => clearPhotos()}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {localPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-900 ring-2 ring-yellow-500"
                  >
                    <img
                      src={photo.dataUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    <div className="absolute right-1 top-1 rounded-full bg-yellow-500 p-1">
                      <Upload className="h-3 w-3 text-black" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded photos section */}
          {uploadedPhotos.length > 0 && (
            <div className="mx-auto max-w-7xl p-4">
              {localPhotos.length > 0 && (
                <h2 className="mb-2 text-sm font-medium text-gray-400">
                  Uploaded ({uploadedPhotos.length})
                </h2>
              )}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {uploadedPhotos.map((photo) => (
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
          )}

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
                  src={isLocalPhoto(selectedPhoto) ? selectedPhoto.dataUrl : selectedPhoto.url}
                  alt=""
                  className="max-h-[85vh] max-w-full rounded-lg object-contain"
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {isLocalPhoto(selectedPhoto) ? (
                      <span className="text-yellow-500">Pending upload</span>
                    ) : (
                      selectedPhoto.guestName && <span>By {selectedPhoto.guestName}</span>
                    )}
                  </div>
                  {isLocalPhoto(selectedPhoto) ? (
                    <Button
                      onClick={() => handleDeleteLocal(selectedPhoto)}
                      variant="outline"
                      size="sm"
                      className="border-red-400 text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleDownload(selectedPhoto)}
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white/10"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
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
