"use client";

import useSWR, { mutate } from "swr";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Film,
  Plus,
  ArrowRight,
  Sparkles,
  Camera,
  Clock,
  Images,
  ChevronDown,
  ChevronUp,
  Ticket,
  Loader2,
  Info,
  Check,
} from "lucide-react";
import Link from "next/link";
import { fetcher } from "@/lib/swr";
import { useState } from "react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  type: "BASIC" | "STANDARD" | "PREMIUM";
  guestPhotoLimit: number;
  eventDuration: number;
  features: string[];
}

interface UserFilm {
  id: string;
  status: "AVAILABLE" | "USED" | "EXPIRED" | "REFUNDED";
  purchasedAt: string;
  usedAt: string | null;
  expiresAt: string | null;
  plan: Plan;
  event?: {
    id: string;
    name: string;
    slug: string;
  };
}

const statusConfig = {
  AVAILABLE: {
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Available",
  },
  USED: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
    label: "Used",
  },
  EXPIRED: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
    label: "Expired",
  },
  REFUNDED: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-500",
    label: "Refunded",
  },
};

const planTypeConfig = {
  BASIC: {
    gradient: "from-slate-500 to-slate-600",
    bgGradient: "from-slate-500/10 to-slate-600/10",
  },
  STANDARD: {
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-600/10",
  },
  PREMIUM: {
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 to-orange-600/10",
  },
};

export default function FilmsPage() {
  const { isPending } = authClient.useSession();
  const [showUsedFilms, setShowUsedFilms] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const { data: films, isLoading, mutate: mutateFilms } = useSWR<UserFilm[]>(
    !isPending ? "/api/films" : null,
    fetcher
  );

  if (isPending || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your films...</p>
        </div>
      </div>
    );
  }

  const availableFilms = films?.filter((f) => f.status === "AVAILABLE") || [];
  const usedFilms = films?.filter((f) => f.status !== "AVAILABLE") || [];

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) {
      toast.error("Please enter a code");
      return;
    }

    setRedeeming(true);
    try {
      const response = await fetch("/api/films/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to redeem code");
      }

      toast.success(result.message);
      setRedeemCode("");
      mutateFilms();
      mutate("/api/films/available");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to redeem code");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Film className="h-5 w-5" />
              <span className="text-sm font-medium text-white/80">Film Inventory</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Your Films
            </h1>
            <p className="mt-1 text-white/80">
              {availableFilms.length} film{availableFilms.length !== 1 ? "s" : ""} ready to use
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg group"
            asChild
          >
            <Link href="/films/purchase">
              <Plus className="mr-2 h-5 w-5" />
              Buy Films
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Redeem Code Section */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 to-pink-500/5">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Ticket className="h-5 w-5" />
              <span className="font-medium">Have a code?</span>
            </div>
            <div className="flex flex-1 gap-2 w-full sm:w-auto">
              <Input
                placeholder="KODAYAK-XXXX-XXXX"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                className="flex-1 font-mono uppercase"
                disabled={redeeming}
              />
              <Button type="submit" disabled={redeeming || !redeemCode.trim()}>
                {redeeming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  "Redeem"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Available Films */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Films</h2>
        {availableFilms.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500">
                  <Film className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">No films available</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Purchase films to create events. Each film gives you the capacity to capture amazing moments!
              </p>
              <Button className="group" asChild>
                <Link href="/films/purchase">
                  <Plus className="mr-2 h-4 w-4" />
                  Buy Your First Film
                  <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableFilms.map((film) => {
              const config = planTypeConfig[film.plan.type];
              return (
                <Card
                  key={film.id}
                  className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50`} />
                  <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                        <Film className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{film.plan.name}</CardTitle>
                        <Badge className={`mt-1 ${statusConfig.AVAILABLE.color} border-0`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusConfig.AVAILABLE.dot}`} />
                          {statusConfig.AVAILABLE.label}
                        </Badge>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                              <Film className="h-5 w-5 text-white" />
                            </div>
                            {film.plan.name} Plan
                          </DialogTitle>
                          <DialogDescription>
                            Plan details and included features
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Images className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{film.plan.guestPhotoLimit}</p>
                                <p className="text-xs text-muted-foreground">Per Guest</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{film.plan.eventDuration} days</p>
                                <p className="text-xs text-muted-foreground">Duration</p>
                              </div>
                            </div>
                          </div>
                          {film.plan.features.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Included Features</p>
                              <ul className="space-y-2">
                                {film.plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Images className="h-4 w-4" />
                        {film.plan.guestPhotoLimit}/guest
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {film.plan.eventDuration} days
                      </span>
                    </div>
                    <Button className="w-full group" asChild>
                      <Link href={`/events/new?filmId=${film.id}`}>
                        <Camera className="mr-2 h-4 w-4" />
                        Use Film
                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Used/Other Films */}
      {usedFilms.length > 0 && (
        <div>
          <button
            onClick={() => setShowUsedFilms(!showUsedFilms)}
            className="flex items-center gap-2 text-lg font-semibold mb-4 hover:text-primary transition-colors"
          >
            Used & Expired Films ({usedFilms.length})
            {showUsedFilms ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {showUsedFilms && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {usedFilms.map((film) => {
                const config = planTypeConfig[film.plan.type];
                const status = statusConfig[film.status];
                return (
                  <Card
                    key={film.id}
                    className="relative overflow-hidden border-0 shadow-md opacity-75"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-30`} />
                    <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg opacity-50`}>
                          <Film className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-muted-foreground">{film.plan.name}</CardTitle>
                          <Badge className={`mt-1 ${status.color} border-0`}>
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-2">
                      {film.event && (
                        <Link
                          href={`/events/${film.event.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Event: {film.event.name}
                        </Link>
                      )}
                      {film.usedAt && (
                        <p className="text-sm text-muted-foreground">
                          Used on {new Date(film.usedAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
