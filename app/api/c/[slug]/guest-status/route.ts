import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET guest upload status for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const guestId = request.nextUrl.searchParams.get("guestId");

    if (!guestId) {
      return NextResponse.json(
        { error: "guestId is required" },
        { status: 400 }
      );
    }

    // Get event
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        guestPhotoLimit: true,
        status: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get guest upload record
    const guestUpload = await prisma.guestUpload.findUnique({
      where: {
        eventId_guestId: {
          eventId: event.id,
          guestId,
        },
      },
    });

    const uploadedCount = guestUpload?.count ?? 0;
    const remaining = Math.max(0, event.guestPhotoLimit - uploadedCount);
    const hasReachedLimit = uploadedCount >= event.guestPhotoLimit;

    return NextResponse.json({
      guestId,
      uploadedCount,
      limit: event.guestPhotoLimit,
      remaining,
      hasReachedLimit,
      guestName: guestUpload?.guestName ?? null,
      eventStatus: event.status,
    });
  } catch (error) {
    console.error("Error fetching guest status:", error);
    return NextResponse.json(
      { error: "Failed to fetch guest status" },
      { status: 500 }
    );
  }
}
