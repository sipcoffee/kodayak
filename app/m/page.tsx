"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { fetcher } from "@/lib/swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Camera,
  Plus,
  QrCode,
  Images,
  Clock,
  LogOut,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "COMPLETED";
  guestPhotoLimit: number;
  expiresAt: string;
  _count: { photos: number };
}

interface AvailableFilm {
  id: string;
  plan: {
    name: string;
    guestPhotoLimit: number;
  };
}

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
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
    label: "Done",
  },
};

export default function MobileDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login?redirect=/m");
    }
  }, [isPending, session, router]);

  const { data: films, mutate: mutateFilms } = useSWR<AvailableFilm[]>(
    session?.user ? "/api/films/available" : null,
    fetcher
  );

  const { data: stats } = useSWR<DashboardStats>(
    session?.user ? "/api/dashboard/stats" : null,
    fetcher
  );

  const { data: events, mutate: mutateEvents } = useSWR<Event[]>(
    session?.user ? "/api/events" : null,
    fetcher
  );

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const handleRefresh = () => {
    mutateFilms();
    mutateEvents();
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeEvents = events?.filter((e) => e.status === "ACTIVE") || [];
  const totalGuestLimit = films?.reduce((acc, f) => acc + f.plan.guestPhotoLimit, 0) || 0;

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/hires-logo.png"
              alt="Kodayak"
              width={36}
              height={36}
              className="rounded"
            />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              Kodayak
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-9 w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-9 w-9 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Welcome */}
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold">
            {session.user?.name?.split(" ")[0] || "there"}!
          </h1>
        </div>

        {/* Films Card - Hero */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary via-pink-500 to-rose-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Film className="h-5 w-5" />
                  <span className="text-sm font-medium text-white/80">
                    Available Films
                  </span>
                </div>
                <p className="text-4xl font-bold">{films?.length || 0}</p>
                <p className="text-sm text-white/70 mt-1">
                  {totalGuestLimit} photos/guest each
                </p>
              </div>
              <Link href="/films/purchase">
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Buy More
                </Button>
              </Link>
            </div>

            {/* Film breakdown */}
            {films && films.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    films.reduce(
                      (acc, film) => {
                        acc[film.plan.name] = (acc[film.plan.name] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  ).map(([planName, count]) => (
                    <Badge
                      key={planName}
                      className="bg-white/20 text-white border-0"
                    >
                      {count}x {planName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Camera className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold">{stats?.totalEvents || 0}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Sparkles className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-xl font-bold">{stats?.activeEvents || 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Images className="h-5 w-5 mx-auto text-pink-500 mb-1" />
              <p className="text-xl font-bold">{stats?.totalPhotos || 0}</p>
              <p className="text-xs text-muted-foreground">Photos</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/events/new" className="block">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium text-sm">New Event</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/films" className="block">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center mb-2">
                  <Film className="h-6 w-6 text-pink-500" />
                </div>
                <p className="font-medium text-sm">My Films</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Active Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Active Events</h2>
            <Link
              href="/events"
              className="text-sm text-primary flex items-center"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {activeEvents.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No active events yet
                </p>
                <Link href="/events/new">
                  <Button size="sm" className="mt-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeEvents.slice(0, 5).map((event) => (
                <Card key={event.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{event.name}</h3>
                          <Badge
                            className={`${statusConfig[event.status].color} border-0 text-xs`}
                          >
                            {statusConfig[event.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Images className="h-3 w-3" />
                            {event._count.photos} photos
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground">
                        {event.guestPhotoLimit} photos per guest limit
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}/qr`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          QR Code
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Images className="h-4 w-4 mr-1" />
                          Gallery
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom safe area padding for PWA */}
      <div className="h-6" />
    </div>
  );
}
