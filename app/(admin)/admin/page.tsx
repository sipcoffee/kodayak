"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Images,
  CreditCard,
  Loader2,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign,
  UserPlus,
  BarChart3,
  Shield,
} from "lucide-react";
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
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Clients",
      value: stats?.totalClients || 0,
      subtitle: "registered users",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/10 to-indigo-600/10",
    },
    {
      title: "Total Events",
      value: stats?.totalEvents || 0,
      subtitle: `${stats?.activeEvents || 0} active`,
      icon: Calendar,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/10",
    },
    {
      title: "Total Photos",
      value: stats?.totalPhotos || 0,
      subtitle: "photos uploaded",
      icon: Images,
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-500/10 to-rose-600/10",
    },
    {
      title: "Revenue",
      value: formatCurrency(Number(stats?.totalRevenue) || 0),
      subtitle: "total earnings",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-600/10",
      isText: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 md:p-8 text-white">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 -mb-12 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-white/70">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Platform Overview
            </h1>
            <p className="mt-1 text-white/70">
              Monitor your platform metrics and activity
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/20  text-black"
              asChild
            >
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/admin/clients">
                <Users className="mr-2 h-4 w-4" />
                Manage Clients
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}
            />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
              {!stat.isText && Number(stat.value) > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Growing</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                Recent Clients
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Newly registered users
              </p>
            </div>
            <Button variant="ghost" size="sm" className="group" asChild>
              <Link href="/admin/clients">
                View all
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {!stats || stats.recentClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <Users className="h-7 w-7 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">No clients yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {stats.recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium text-sm">
                        {(client.name || client.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{client.name || "—"}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {client._count.events} events
                      </Badge>
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

        {/* Recent Payments */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Recent Payments
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Latest transactions
              </p>
            </div>
            <Button variant="ghost" size="sm" className="group" asChild>
              <Link href="/admin/analytics">
                View all
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {!stats || stats.recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                  <CreditCard className="h-7 w-7 text-emerald-500" />
                </div>
                <p className="text-sm text-muted-foreground">No payments yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {stats.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {payment.user.name || payment.user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.plan.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(payment.amount))}
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            icon: Users,
            title: "Manage Clients",
            description: "View and manage all users",
            href: "/admin/clients",
            gradient: "from-blue-500 to-indigo-600",
          },
          {
            icon: Calendar,
            title: "View Events",
            description: "Browse all platform events",
            href: "/admin/events",
            gradient: "from-violet-500 to-purple-600",
          },
          {
            icon: BarChart3,
            title: "Analytics",
            description: "Platform insights & reports",
            href: "/admin/analytics",
            gradient: "from-pink-500 to-rose-600",
          },
          {
            icon: CreditCard,
            title: "Manage Plans",
            description: "Configure pricing plans",
            href: "/admin/plans",
            gradient: "from-emerald-500 to-teal-600",
          },
        ].map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
