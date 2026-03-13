"use client";

import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Film,
  ArrowLeft,
  Check,
  ShoppingCart,
  Sparkles,
  Images,
  Clock,
  Info,
} from "lucide-react";
import Link from "next/link";
import { fetcher } from "@/lib/swr";

interface Plan {
  id: string;
  name: string;
  type: "BASIC" | "STANDARD" | "PREMIUM";
  price: string;
  guestPhotoLimit: number;
  eventDuration: number;
  features: string[];
  isActive: boolean;
}

const planTypeConfig = {
  BASIC: {
    gradient: "from-slate-500 to-slate-600",
    bgGradient: "from-slate-500/10 to-slate-600/10",
    borderColor: "border-slate-200 dark:border-slate-700",
    popular: false,
  },
  STANDARD: {
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-600/10",
    borderColor: "border-violet-300 dark:border-violet-700",
    popular: true,
  },
  PREMIUM: {
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 to-orange-600/10",
    borderColor: "border-amber-200 dark:border-amber-700",
    popular: false,
  },
};

export default function FilmPurchasePage() {
  const { isPending } = authClient.useSession();

  const { data: plans, isLoading } = useSWR<Plan[]>(
    !isPending ? "/api/plans" : null,
    fetcher
  );

  if (isPending || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/films">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buy Films</h1>
          <p className="text-muted-foreground">
            Choose a plan and quantity to purchase films
          </p>
        </div>
      </div>

      {/* Coming Soon Alert */}
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Coming Soon</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Online film purchases are not available yet. Please contact us directly or use a
          redemption code on the <Link href="/films" className="font-medium underline">Films page</Link> to get your films.
        </AlertDescription>
      </Alert>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => {
          const config = planTypeConfig[plan.type];

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden border-2 ${config.borderColor} ${
                config.popular ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            >
              {config.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-tl-none rounded-br-none bg-primary text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-30`} />

              <CardHeader className="relative text-center pb-2">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} shadow-lg mb-4`}>
                  <Film className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Images className="h-4 w-4" />
                    {plan.guestPhotoLimit} photos/guest
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {plan.eventDuration} days
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Price */}
                <div className="text-center">
                  <span className="text-4xl font-bold">
                    ₱{parseFloat(plan.price).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/film</span>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="relative">
                <Button
                  className="w-full"
                  size="lg"
                  disabled
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">How Films Work</h3>
              <p className="text-sm text-muted-foreground">
                Each film you purchase can be used to create one event. The photo limit and duration
                are determined by the plan type. Films don&apos;t expire, so you can use them whenever you&apos;re ready!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
