import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, photoLimit, expiresAt, isGalleryPublic, primaryColor, welcomeMessage } = body;

  if (!name || !photoLimit || !expiresAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Generate a unique slug
  const slug = nanoid(10);

  const event = await prisma.event.create({
    data: {
      userId: session.user.id,
      name,
      description,
      slug,
      photoLimit: parseInt(photoLimit),
      expiresAt: new Date(expiresAt),
      isGalleryPublic: isGalleryPublic ?? false,
      primaryColor: primaryColor || "#E91E63",
      welcomeMessage,
      status: "DRAFT",
    },
  });

  return NextResponse.json(event, { status: 201 });
}
