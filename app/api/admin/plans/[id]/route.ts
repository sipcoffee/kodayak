import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const updatedPlan = await prisma.plan.update({
    where: { id },
    data: {
      name: body.name,
      price: body.price ? parseFloat(body.price) : undefined,
      guestPhotoLimit: body.guestPhotoLimit ? parseInt(body.guestPhotoLimit) : undefined,
      eventDuration: body.eventDuration ? parseInt(body.eventDuration) : undefined,
      features: body.features,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(updatedPlan);
}
