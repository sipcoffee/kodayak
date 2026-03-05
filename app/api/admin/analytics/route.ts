import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    revenueByPlan,
    eventsByStatus,
    newClientsThisMonth,
    newEventsThisMonth,
    photosThisMonth,
    revenueThisMonth,
    dailyStats,
  ] = await Promise.all([
    // Revenue breakdown by plan
    prisma.payment.groupBy({
      by: ["planId"],
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }).then(async (results) => {
      const plans = await prisma.plan.findMany();
      return results.map((r) => ({
        ...r,
        plan: plans.find((p) => p.id === r.planId),
      }));
    }),

    // Events by status
    prisma.event.groupBy({
      by: ["status"],
      _count: true,
    }),

    // New clients this month
    prisma.user.count({
      where: {
        role: "CLIENT",
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // New events this month
    prisma.event.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Photos this month
    prisma.photo.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Revenue this month
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),

    // Daily stats for the last 30 days
    prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*)::int as count
      FROM "Event"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  // Get all-time totals
  const [totalRevenue, totalClients, totalEvents, totalPhotos] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.event.count(),
    prisma.photo.count(),
  ]);

  return NextResponse.json({
    overview: {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalClients,
      totalEvents,
      totalPhotos,
      revenueThisMonth: revenueThisMonth._sum.amount || 0,
      newClientsThisMonth,
      newEventsThisMonth,
      photosThisMonth,
    },
    revenueByPlan,
    eventsByStatus,
    dailyStats,
  });
}
