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
  const { filmId, name, description, isGalleryPublic, primaryColor, welcomeMessage } = body;

  if (!filmId || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify the film exists, belongs to user, and is available
  const film = await prisma.userFilm.findUnique({
    where: { id: filmId },
    include: { plan: true },
  });

  if (!film) {
    return NextResponse.json({ error: "Film not found" }, { status: 404 });
  }

  if (film.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (film.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Film is not available" }, { status: 400 });
  }

  // Check if film has expired
  if (film.expiresAt && film.expiresAt < new Date()) {
    return NextResponse.json({ error: "Film has expired" }, { status: 400 });
  }

  // Calculate expiry date from plan's event duration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + film.plan.eventDuration);

  // Generate a unique slug
  const slug = nanoid(10);

  // Create event and consume film in a transaction
  const event = await prisma.$transaction(async (tx) => {
    // Create the event
    const newEvent = await tx.event.create({
      data: {
        userId: session.user.id,
        userFilmId: filmId,
        name,
        description,
        slug,
        photoLimit: film.plan.photoLimit,
        expiresAt,
        isGalleryPublic: isGalleryPublic ?? false,
        primaryColor: primaryColor || "#E91E63",
        welcomeMessage,
        status: "DRAFT",
      },
    });

    // Mark the film as used
    await tx.userFilm.update({
      where: { id: filmId },
      data: {
        status: "USED",
        usedAt: new Date(),
      },
    });

    return newEvent;
  });

  return NextResponse.json(event, { status: 201 });
}
