"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Images, CreditCard, Loader2, ArrowRight } from "lucide-react";
import { fetcher } from "@/lib/swr";

interface RecentClient {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  createdAt: string;
  _count: { events: number };
}

interface RecentPayment {
  id: string;
  amount: string;
  status: string;
  paidAt: string;
  user: { name: string | null; email: string };
  plan: { name: string };
}

interface AdminStats {
  totalClients: number;
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
  totalRevenue: number;
  recentClients: RecentClient[];
  recentPayments: RecentPayment[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useSWR<AdminStats>(
    "/api/admin/stats",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">registered users</p>
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
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeEvents || 0} active
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
            <div className="text-2xl font-bold">{stats?.totalPhotos || 0}</div>
            <p className="text-xs text-muted-foreground">photos uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(stats?.totalRevenue) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Clients</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/clients">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!stats || stats.recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients yet.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{client.name || "—"}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{client._count.events} events</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/analytics">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!stats || stats.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {payment.user.name || payment.user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.plan.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(Number(payment.amount))}
                      </p>
                      <Badge variant="default" className="bg-green-500">
                        Paid
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
