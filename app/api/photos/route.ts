import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { uploadToR2 } from "@/lib/r2";

// POST - Upload a photo (public - no auth required, uses guestId)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const photoFile = formData.get("photo") as File | null;
    const eventId = formData.get("eventId") as string;
    const guestId = formData.get("guestId") as string;
    const guestName = formData.get("guestName") as string | null;
    const width = parseInt(formData.get("width") as string) || null;
    const height = parseInt(formData.get("height") as string) || null;

    // Validate required fields
    if (!photoFile || !eventId || !guestId) {
      return NextResponse.json(
        { error: "Missing required fields: photo, eventId, guestId" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photoFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (photoFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Verify event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Event is not active" },
        { status: 400 }
      );
    }

    // Check if event expired
    if (new Date(event.expiresAt) < new Date()) {
      // Auto-expire the event
      await prisma.event.update({
        where: { id: event.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Event has expired" },
        { status: 400 }
      );
    }

    // Get or create guest upload record
    let guestUpload = await prisma.guestUpload.findUnique({
      where: {
        eventId_guestId: { eventId, guestId },
      },
    });

    if (!guestUpload) {
      guestUpload = await prisma.guestUpload.create({
        data: {
          eventId,
          guestId,
          guestName,
          count: 0,
        },
      });
    }

    // Check guest photo limit
    if (guestUpload.count >= event.guestPhotoLimit) {
      return NextResponse.json(
        { error: `You have reached your upload limit of ${event.guestPhotoLimit} photos` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const extension = photoFile.name.split(".").pop() || "jpg";
    const filename = `${nanoid()}.${extension}`;

    // Upload to R2
    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { url } = await uploadToR2(buffer, filename, photoFile.type);

    // Create photo and increment guest upload count in transaction
    const savedPhoto = await prisma.$transaction(async (tx) => {
      const newPhoto = await tx.photo.create({
        data: {
          eventId,
          url,
          thumbnailUrl: url, // For now, use same URL - can generate actual thumbnails later
          guestId,
          guestName,
          width,
          height,
          size: photoFile.size,
        },
      });

      // Increment guest upload count
      await tx.guestUpload.update({
        where: {
          eventId_guestId: { eventId, guestId },
        },
        data: {
          count: { increment: 1 },
          guestName: guestName || undefined, // Update name if provided
        },
      });

      return newPhoto;
    });

    return NextResponse.json({
      id: savedPhoto.id,
      url: savedPhoto.url,
      createdAt: savedPhoto.createdAt,
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

// GET - Get photos for an event (requires eventId query param)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    // Check if event exists and gallery is public
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        isGalleryPublic: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get photos
    const photos = await prisma.photo.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
        guestName: true,
        width: true,
        height: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
