import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { uploadToR2 } from "@/lib/r2";

// POST - Upload a photo (public - no auth required, uses guestId)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const photo = formData.get("photo") as File | null;
    const eventId = formData.get("eventId") as string;
    const guestId = formData.get("guestId") as string;
    const guestName = formData.get("guestName") as string | null;
    const width = parseInt(formData.get("width") as string) || null;
    const height = parseInt(formData.get("height") as string) || null;

    // Validate required fields
    if (!photo || !eventId || !guestId) {
      return NextResponse.json(
        { error: "Missing required fields: photo, eventId, guestId" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (photo.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Verify event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { photos: true } },
      },
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

    // Check photo limit
    if (event._count.photos >= event.photoLimit) {
      return NextResponse.json(
        { error: "Event has reached its photo limit" },
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

    // Generate unique filename
    const extension = photo.name.split(".").pop() || "jpg";
    const filename = `${nanoid()}.${extension}`;

    // Upload to R2
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { url } = await uploadToR2(buffer, filename, photo.type);

    const savedPhoto = await prisma.photo.create({
      data: {
        eventId,
        url,
        thumbnailUrl: url, // For now, use same URL - can generate actual thumbnails later
        guestId,
        guestName,
        width,
        height,
        size: photo.size,
      },
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
