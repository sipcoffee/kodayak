"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { fetcher } from "@/lib/swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  QrCode,
  Images,
  Clock,
  Camera,
  Share2,
  ExternalLink,
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "COMPLETED";
  guestPhotoLimit: number;
  expiresAt: string;
  isGalleryPublic: boolean;
  primaryColor: string | null;
  createdAt: string;
  _count: { photos: number };
}

const statusConfig = {
  DRAFT: {
    color: "bg-slate-100 text-slate-700",
    label: "Draft",
  },
  ACTIVE: {
    color: "bg-emerald-100 text-emerald-700",
    label: "Live",
  },
  PAUSED: {
    color: "bg-amber-100 text-amber-700",
    label: "Paused",
  },
  EXPIRED: {
    color: "bg-red-100 text-red-700",
    label: "Expired",
  },
  COMPLETED: {
    color: "bg-blue-100 text-blue-700",
    label: "Completed",
  },
};

export default function MobileEventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirect=/m/events/${eventId}`);
    }
  }, [isPending, session, router, eventId]);

  const { data: event, isLoading } = useSWR<Event>(
    session?.user ? `/api/events/${eventId}` : null,
    fetcher
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/c/${event?.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: `Capture moments at ${event?.name}!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session || !event) {
    return null;
  }

  // Note: With Camera Flow V2, there's no total event limit
  // We show total photos and the per-guest limit
  const totalPhotos = event._count.photos;

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{event.name}</h1>
          </div>
          <Badge className={`${statusConfig[event.status].color} border-0`}>
            {statusConfig[event.status].label}
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Total Photos Card */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary via-pink-500 to-rose-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-5 w-5" />
              <span className="text-sm font-medium text-white/80">
                Total Photos
              </span>
            </div>
            <p className="text-5xl font-bold">{totalPhotos}</p>
            <p className="text-sm text-white/70 mt-1">
              captured by all guests
            </p>

            {/* Guest limit info */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-white/80">
                Each guest can upload up to <span className="font-bold">{event.guestPhotoLimit}</span> photos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Event Info */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={`${statusConfig[event.status].color} border-0`}>
                {statusConfig[event.status].label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Photos</span>
              <span className="font-medium">{event._count.photos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Per Guest Limit</span>
              <span className="font-medium">{event.guestPhotoLimit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Expires
              </span>
              <span className="font-medium">
                {new Date(event.expiresAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Public Gallery
              </span>
              <span className="font-medium">
                {event.isGalleryPublic ? "Yes" : "No"}
              </span>
            </div>
            {event.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/events/${event.id}/qr`}>
            <Button variant="outline" className="w-full h-auto py-4">
              <div className="flex flex-col items-center gap-1">
                <QrCode className="h-6 w-6" />
                <span className="text-xs">QR Code</span>
              </div>
            </Button>
          </Link>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" className="w-full h-auto py-4">
              <div className="flex flex-col items-center gap-1">
                <Images className="h-6 w-6" />
                <span className="text-xs">Gallery</span>
              </div>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-auto py-4"
            onClick={handleShare}
          >
            <div className="flex flex-col items-center gap-1">
              <Share2 className="h-6 w-6" />
              <span className="text-xs">Share</span>
            </div>
          </Button>
          <Link href={`/c/${event.slug}`} target="_blank">
            <Button variant="outline" className="w-full h-auto py-4">
              <div className="flex flex-col items-center gap-1">
                <ExternalLink className="h-6 w-6" />
                <span className="text-xs">Camera</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Camera Link */}
        <Card className="border-0 shadow-sm bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Camera Link</p>
            <code className="text-sm break-all">
              {typeof window !== "undefined" && window.location.origin}/c/
              {event.slug}
            </code>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
