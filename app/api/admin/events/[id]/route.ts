import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2, getKeyFromUrl } from "@/lib/r2";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, company: true },
      },
      photos: {
        orderBy: { createdAt: "desc" },
      },
      payment: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: { photos: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

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

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      status: body.status,
      photoLimit: body.photoLimit ? parseInt(body.photoLimit) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      isGalleryPublic: body.isGalleryPublic,
    },
  });

  return NextResponse.json(updatedEvent);
}

export async function DELETE(
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

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      photos: { select: { url: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Delete photos from R2
  await Promise.all(
    event.photos.map(async (photo) => {
      const key = getKeyFromUrl(photo.url);
      if (key) {
        try {
          await deleteFromR2(key);
        } catch (error) {
          console.error(`Failed to delete photo from R2: ${key}`, error);
        }
      }
    })
  );

  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
