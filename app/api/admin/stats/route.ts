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

  const [
    totalClients,
    totalEvents,
    activeEvents,
    totalPhotos,
    totalRevenue,
    recentClients,
    recentPayments,
  ] = await Promise.all([
    // Total clients (excluding admins)
    prisma.user.count({
      where: { role: "CLIENT" },
    }),
    // Total events
    prisma.event.count(),
    // Active events
    prisma.event.count({
      where: { status: "ACTIVE" },
    }),
    // Total photos
    prisma.photo.count(),
    // Total revenue from paid payments
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    // Recent 5 clients
    prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        createdAt: true,
        _count: { select: { events: true } },
      },
    }),
    // Recent 5 payments
    prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalClients,
    totalEvents,
    activeEvents,
    totalPhotos,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentClients,
    recentPayments,
  });
}
