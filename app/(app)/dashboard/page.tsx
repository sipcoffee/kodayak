"use client";

import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Calendar,
  HardDrive,
  Images,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
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

const statusConfig = {
  DRAFT: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  ACTIVE: {
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  PAUSED: {
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  EXPIRED: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  COMPLETED: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  const { data: stats, isLoading } = useSWR<DashboardStats>(
    !isPending ? "/api/dashboard/stats" : null,
    fetcher
  );

  if (isPending || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Events",
      value: stats?.totalEvents || 0,
      subtitle: "events created",
      icon: Calendar,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/10",
      hideGrowth: true,
    },
    {
      title: "Active Events",
      value: stats?.activeEvents || 0,
      subtitle: "currently live",
      icon: Zap,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-600/10",
    },
    {
      title: "Total Photos",
      value: stats?.totalPhotos || 0,
      subtitle: "memories captured",
      icon: Images,
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-500/10 to-rose-600/10",
    },
    {
      title: "Storage Used",
      value: formatBytes(stats?.storageUsed || 0),
      subtitle: "of your plan",
      icon: HardDrive,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/10",
      isText: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-pink-500 to-rose-500 p-6 md:p-8 text-white">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium text-white/80">Welcome back</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {session?.user?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="mt-1 text-white/80">
              Ready to capture more amazing moments today?
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg group"
            asChild
          >
            <Link href="/events/new">
              <Plus className="mr-2 h-5 w-5" />
              Create Event
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              {!stat.isText && !stat.hideGrowth && Number(stat.value) > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Growing</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
          <div>
            <CardTitle className="text-xl">Recent Events</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your latest event activity
            </p>
          </div>
          {stats && stats.recentEvents.length > 0 && (
            <Button variant="outline" size="sm" className="group" asChild>
              <Link href="/events">
                View all
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {!stats || stats.recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500">
                  <Camera className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">No events yet</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Create your first event and start capturing moments from every angle. It only takes a minute!
              </p>
              <Button className="group" asChild>
                <Link href="/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                  <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {stats.recentEvents.map((event, index) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center justify-between p-4 md:p-5 transition-colors hover:bg-muted/50 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-pink-500/10 group-hover:from-primary/20 group-hover:to-pink-500/20 transition-colors">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">
                        {event.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Images className="h-3.5 w-3.5" />
                          {event._count.photos} photos
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Expires {new Date(event.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusConfig[event.status].color} border-0`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusConfig[event.status].dot}`} />
                      {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: "📸",
            title: "Share QR Code",
            description: "Print or display your event's QR code for guests to scan",
          },
          {
            icon: "⚡",
            title: "Real-time Gallery",
            description: "Watch photos appear instantly as guests capture moments",
          },
          {
            icon: "📥",
            title: "Download Anytime",
            description: "Export all photos in high quality whenever you're ready",
          },
        ].map((tip, index) => (
          <Card key={index} className="border-0 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-start gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <h4 className="font-medium text-sm">{tip.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
