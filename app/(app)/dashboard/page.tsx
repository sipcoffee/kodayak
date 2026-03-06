"use client";

import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, HardDrive, Images, Plus } from "lucide-react";
import Link from "next/link";
import { fetcher } from "@/lib/swr";

interface Event {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "COMPLETED";
  expiresAt: string;
  _count: { photos: number };
}

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
  storageUsed: number;
  recentEvents: Event[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  const { data: stats, isLoading } = useSWR<DashboardStats>(
    !isPending ? "/api/dashboard/stats" : null,
    fetcher
  );

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

  if (isPending || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your events and photos.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">events created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Events
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeEvents || 0}</div>
            <p className="text-xs text-muted-foreground">currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Photos
            </CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPhotos || 0}</div>
            <p className="text-xs text-muted-foreground">photos captured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Used
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats?.storageUsed || 0)}</div>
            <p className="text-xs text-muted-foreground">of your plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Events</CardTitle>
          {stats && stats.recentEvents.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/events">View all</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!stats || stats.recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
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
          ) : (
            <div className="space-y-4">
              {stats.recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Camera className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event._count.photos} photos • Expires{" "}
                        {new Date(event.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
