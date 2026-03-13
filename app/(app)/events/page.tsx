"use client";

import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Camera, Images, Loader2, Plus } from "lucide-react";
import { fetcher } from "@/lib/swr";

interface Event {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "COMPLETED";
  guestPhotoLimit: number;
  expiresAt: string;
  createdAt: string;
  _count: {
    photos: number;
  };
}

export default function EventsPage() {
  const { data: events, isLoading } = useSWR<Event[]>("/api/events", fetcher);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage your events and view galleries.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">No events yet</h3>
              <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                Create your first event to start capturing moments from every
                angle.
              </p>
              <Button asChild>
                <Link href="/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold line-clamp-1">{event.name}</h3>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {event.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Images className="h-4 w-4" />
                      <span>
                        {event._count.photos} photos ({event.guestPhotoLimit}/guest)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
