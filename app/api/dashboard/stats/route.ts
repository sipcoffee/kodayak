import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [events, activeEvents, photos, recentEvents] = await Promise.all([
    // Total events count
    prisma.event.count({
      where: { userId: session.user.id },
    }),
    // Active events count
    prisma.event.count({
      where: { userId: session.user.id, status: "ACTIVE" },
    }),
    // Total photos count and size
    prisma.photo.aggregate({
      where: { event: { userId: session.user.id } },
      _count: true,
      _sum: { size: true },
    }),
    // Recent events
    prisma.event.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { photos: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    totalEvents: events,
    activeEvents,
    totalPhotos: photos._count,
    storageUsed: photos._sum.size || 0,
    recentEvents,
  });
}
