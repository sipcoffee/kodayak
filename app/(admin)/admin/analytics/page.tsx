"use client";

import useSWR from "swr";
import {
  BarChart3,
  Calendar,
  CreditCard,
  Images,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/swr";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalClients: number;
    totalEvents: number;
    totalPhotos: number;
    revenueThisMonth: number;
    newClientsThisMonth: number;
    newEventsThisMonth: number;
    photosThisMonth: number;
  };
  revenueByPlan: Array<{
    planId: string;
    _sum: { amount: number | null };
    _count: number;
    plan?: { name: string; type: string };
  }>;
  eventsByStatus: Array<{
    status: string;
    _count: number;
  }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useSWR<AnalyticsData>(
    "/api/admin/analytics",
    fetcher
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-500",
      ACTIVE: "bg-green-500",
      PAUSED: "bg-yellow-500",
      EXPIRED: "bg-red-500",
      COMPLETED: "bg-blue-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Platform metrics and performance insights.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(data.overview.totalRevenue))}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(Number(data.overview.revenueThisMonth))} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{data.overview.newClientsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              +{data.overview.newEventsThisMonth} this month
            </p>
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
            <div className="text-2xl font-bold">{data.overview.totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              +{data.overview.photosThisMonth} this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueByPlan.length === 0 ? (
              <p className="text-sm text-muted-foreground">No revenue data yet</p>
            ) : (
              <div className="space-y-4">
                {data.revenueByPlan.map((item) => {
                  const amount = Number(item._sum.amount) || 0;
                  const totalRevenue = Number(data.overview.totalRevenue) || 1;
                  const percentage = (amount / totalRevenue) * 100;

                  return (
                    <div key={item.planId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.plan?.name || "Unknown Plan"}
                          </span>
                          <Badge variant="secondary">{item._count} sales</Badge>
                        </div>
                        <span className="font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Events by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.eventsByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet</p>
            ) : (
              <div className="space-y-4">
                {data.eventsByStatus.map((item) => {
                  const percentage =
                    (item._count / data.overview.totalEvents) * 100;

                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <span className="font-bold">{item._count} events</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${getStatusColor(item.status)} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Revenue Growth</p>
              <p className="mt-1 text-2xl font-bold">
                {data.overview.totalRevenue > 0
                  ? `${((Number(data.overview.revenueThisMonth) / Number(data.overview.totalRevenue)) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-xs text-muted-foreground">of total revenue</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Client Growth</p>
              <p className="mt-1 text-2xl font-bold">
                {data.overview.totalClients > 0
                  ? `${((data.overview.newClientsThisMonth / data.overview.totalClients) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-xs text-muted-foreground">new this month</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Event Growth</p>
              <p className="mt-1 text-2xl font-bold">
                {data.overview.totalEvents > 0
                  ? `${((data.overview.newEventsThisMonth / data.overview.totalEvents) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-xs text-muted-foreground">new this month</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Avg Photos/Event</p>
              <p className="mt-1 text-2xl font-bold">
                {data.overview.totalEvents > 0
                  ? Math.round(data.overview.totalPhotos / data.overview.totalEvents)
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">photos per event</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
