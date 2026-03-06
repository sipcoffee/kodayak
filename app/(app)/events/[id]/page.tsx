"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Download,
  ExternalLink,
  Images,
  Loader2,
  QrCode,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/swr";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  guestName: string | null;
  createdAt: string;
}

interface Event {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "COMPLETED";
  photoLimit: number;
  expiresAt: string;
  isGalleryPublic: boolean;
  primaryColor: string;
  welcomeMessage: string | null;
  createdAt: string;
  photos: Photo[];
  _count: {
    photos: number;
  };
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: event, isLoading, mutate } = useSWR<Event>(
    `/api/events/${params.id}`,
    fetcher
  );

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  const selectAllPhotos = () => {
    if (event) {
      setSelectedPhotos(new Set(event.photos.map((p) => p.id)));
    }
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };

  const handleBulkDownload = async () => {
    if (!event || selectedPhotos.size === 0) return;

    const photosToDownload = event.photos.filter((p) => selectedPhotos.has(p.id));

    for (const photo of photosToDownload) {
      const link = document.createElement("a");
      link.href = photo.url;
      link.download = `${event.slug}-${photo.id}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const handleBulkDelete = async () => {
    if (!event || selectedPhotos.size === 0) return;

    const count = selectedPhotos.size;
    if (!confirm(`Are you sure you want to delete ${count} photo${count > 1 ? "s" : ""}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const photoId of selectedPhotos) {
      try {
        const response = await fetch(`/api/photos/${photoId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setIsDeleting(false);
    setSelectedPhotos(new Set());
    mutate();

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} photo${successCount > 1 ? "s" : ""}`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} photo${errorCount > 1 ? "s" : ""}`);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");
      router.push("/events");
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: Event["status"]) => {
    const colors = {
      DRAFT: "bg-gray-500",
      ACTIVE: "bg-green-500",
      PAUSED: "bg-yellow-500",
      EXPIRED: "bg-red-500",
      COMPLETED: "bg-blue-500",
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
        <Button asChild className="mt-4">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const cameraUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${event.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
            </div>
            <p className="text-muted-foreground">{event.description || "No description"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/events/${event.id}/qr`}>
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/events/${event.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={cameraUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Camera
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Photos
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event._count.photos} / {event.photoLimit}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
            <div className={`h-3 w-3 rounded-full ${getStatusColor(event.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{event.status.toLowerCase()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expires
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(event.expiresAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gallery
            </CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.isGalleryPublic ? "Public" : "Private"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gallery */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gallery</CardTitle>
          {event.photos.length > 0 && (
            <div className="flex gap-2">
              {selectedPhotos.size > 0 ? (
                <>
                  <Button variant="outline" size="sm" onClick={deselectAllPhotos}>
                    Deselect All
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete ({selectedPhotos.size})
                  </Button>
                  <Button size="sm" onClick={handleBulkDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download ({selectedPhotos.size})
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={selectAllPhotos}>
                  Select All
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {event.photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">No photos yet</h3>
              <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                Share the QR code with your guests to start capturing moments.
              </p>
              <Button asChild>
                <Link href={`/events/${event.id}/qr`}>
                  <QrCode className="mr-2 h-4 w-4" />
                  View QR Code
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {event.photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                    selectedPhotos.has(photo.id)
                      ? "border-primary ring-2 ring-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                  onClick={() => togglePhotoSelection(photo.id)}
                >
                  <Image
                    src={photo.thumbnailUrl || photo.url}
                    alt={`Photo by ${photo.guestName || "Guest"}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
                  <div
                    className={`absolute left-2 top-2 h-5 w-5 rounded-full border-2 bg-white transition-all ${
                      selectedPhotos.has(photo.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/50"
                    }`}
                  >
                    {selectedPhotos.has(photo.id) && (
                      <svg
                        className="h-full w-full text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  {photo.guestName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white truncate">{photo.guestName}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Event</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this event and all its photos
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
