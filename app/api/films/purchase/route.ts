import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { planId, quantity = 1 } = body;

  if (!planId) {
    return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
  }

  if (quantity < 1 || quantity > 10) {
    return NextResponse.json({ error: "Quantity must be between 1 and 10" }, { status: 400 });
  }

  // Verify the plan exists and is active
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  if (!plan.isActive) {
    return NextResponse.json({ error: "Plan is not available" }, { status: 400 });
  }

  // Mock purchase: Create films instantly without payment
  // In production, this would integrate with PayMongo
  const films = await prisma.userFilm.createMany({
    data: Array.from({ length: quantity }, () => ({
      userId: session.user.id,
      planId: plan.id,
      status: "AVAILABLE",
    })),
  });

  // Fetch the created films
  const createdFilms = await prisma.userFilm.findMany({
    where: {
      userId: session.user.id,
      planId: plan.id,
    },
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
    take: quantity,
  });

  return NextResponse.json({
    message: `Successfully purchased ${quantity} film(s)`,
    films: createdFilms,
  }, { status: 201 });
}
