import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET event data by slug (public - no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        welcomeMessage: true,
        primaryColor: true,
        status: true,
        guestPhotoLimit: true,
        isGalleryPublic: true,
        expiresAt: true,
        _count: {
          select: { photos: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event has expired
    if (new Date(event.expiresAt) < new Date() && event.status === "ACTIVE") {
      // Auto-expire the event
      await prisma.event.update({
        where: { id: event.id },
        data: { status: "EXPIRED" },
      });
      event.status = "EXPIRED";
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      welcomeMessage: event.welcomeMessage,
      primaryColor: event.primaryColor,
      status: event.status,
      guestPhotoLimit: event.guestPhotoLimit,
      totalPhotoCount: event._count.photos,
      isGalleryPublic: event.isGalleryPublic,
      expiresAt: event.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
